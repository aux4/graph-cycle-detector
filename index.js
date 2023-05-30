#!/usr/bin/env node

import pako from 'pako';
import open from "open";

const args = process.argv.slice(2);
const isTerraform = args.includes("--terraform");
const noOpen = args.includes("--no-open");

const TEXT_IN_PARENTHESES = /\s\([^)]+\)/;
const ROOT_TAG = "[root] ";
const ARROW = /\s?-?->\s?/;

function readStdIn() {
  return new Promise(resolve => {
    let inputString = "";

    const stdin = process.openStdin();

    stdin.on("data", function (data) {
      inputString += data;
    });

    stdin.on("end", function () {
      resolve(inputString);
    });
  });
}

function createGraph(text) {
  const graph = {};

  text.split("\n").forEach(line => {
    const match = line.split(ARROW);
    if (match.length === 2) {
      const source = getNodeName(match[0]);
      const target = getNodeName(match[1]);

      if (!graph[source]) {
        graph[source] = [];
      }

      graph[source].push(target);
    }
  });

  return graph;
}

function getNodeName(text) {
  const noQuotes = text.trim().replace(/["']/g, "");

  if (!isTerraform) return noQuotes;

  return noQuotes.replace(TEXT_IN_PARENTHESES, "").replace(ROOT_TAG, "");
}

function generateCycleDiagram(graph) {
  const diagram = "stateDiagram-v2";

  const cycle = findGraphCycle(graph);
  return cycle.map(item => `  ${item}`)
    .reduce((acc, item) => `${acc}\n${item}`, diagram);
}

function findGraphCycle(graph) {
  const visited = {};

  for (const node of Object.keys(graph)) {
    if (!visited[node]) {
      const result = findNodeCycle(graph, node, visited, undefined);
      if (result.cycle) {
        const set = new Set(result.ref);
        return [...set];
      }
    }
  }

  return [];
}

function findNodeCycle(graph, source, visited, parent) {
  visited[source] = true;

  for (const target of (graph[source] || [])) {
    if (!visited[target]) {
      const result = findNodeCycle(graph, target, visited, source);
      if (result.cycle) {
        return {cycle: true, ref: result.ref.concat([`${source} --> ${target}`])};
      }
    } else if (parent !== target) {
      return {cycle: true, ref: [`${parent} --> ${source}`, `${source} --> ${target}`]};
    }
  }

  return {cycle: false};
}

function createMermaidDiagramLink(diagram) {
  const mermaid = {
    code: diagram,
    "mermaid": "{\n  \"theme\": \"default\"\n}",
    "autoSync": true,
    "updateDiagram": false,
    "editorMode": "code",
    "updateEditor": false
  };

  const output = pako.deflate(JSON.stringify(mermaid));
  const hex = Buffer.from(output).toString('base64');

  return `https://mermaid.live/edit#pako:${hex}`;
}

(async () => {
  const text = await readStdIn();

  const graph = createGraph(text);
  const diagram = generateCycleDiagram(graph);

  console.log(diagram);

  if (noOpen) return;

  const link = createMermaidDiagramLink(diagram);
  await open(link);
})();