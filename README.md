# graph-cycle-detector
A simple graph cycle detector.

## Install

```
npm install --global @aux4/graph-cycle-detector
```

## Usage

### Simple Graph

#### graph.txt
```
A -> B
B -> C
C -> D
D -> E
D -> A
E -> F
```

```
$ cat graph.txt | graph-cycle-detector

stateDiagram-v2
  C --> D
  D --> A
  B --> C
  A --> B
```

It will automatically open [Mermaid Live Editor](https://mermaid.live/edit#pako:eNpFjstugzAQRX8FzTqEAilJvKiUhC676tabiR_YEmBkxpEixL_Hpoq6O3Pv0cwsIJxUwGAmJNVa7DwO-aPiY5bdsjz_ytqE7YaXhNcNbwkvG15hB4PyA1oZ9yyp4EBGDYoDiyiVxtATBz6uUcVA7vc5CmDkg9pBmOT_5XeopCXnf_5e2z58i99bA0xjP0exdyhVHBeg55Tkzs4UZeFGbbuUB9_H2BBNMyuKVO87Sybc98INxWylQU_mcW6KpmpOWNWqOdb4WddS3MvzSVeHUsvjR1khrOv6AvXhYCs) in your default browser.

#### Without Open Mermaid Live Editor

```
$ cat graph.txt | graph-cycle-detector --no-open
```

### Terraform

```
$ terraform graph | graph-cycle-detector --terraform
```