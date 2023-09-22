import graphviz from 'graphviz';

type NodeMetadata = {
  name: string;
};

export type Edge = {
  from: NodeMetadata;
  to: NodeMetadata;
};

export const newEdge = (from: string, to: string): Edge => {
  return {
    from: {name: from}, 
    to: {name: to}
  };
};

type NeuronFacNode = {
  metadata: NodeMetadata;
  graphvizNode: unknown;
};

export interface TGraph {
  addNode: (
    node: NodeMetadata,
    fromNodes: NodeMetadata[],
    toNodes: NodeMetadata[],
    nodeProperties?: Record<string, string>
  ) => void;
  addEdge: (from: NodeMetadata, to: NodeMetadata, label?: string) => void;
  includesNode: (n: NodeMetadata) => boolean;
  includesEdge: (edge: Edge) => boolean;
  asText: () => string;
  render: () => void;
}

export const graph = (graphName: string): TGraph => {
  let _edgeCtr = 1;
  let root: NeuronFacNode;

  const nodes: NeuronFacNode[] = [];

  const _edges: Edge[] = [];
  const _graph = graphviz.digraph(graphName);

  const _includesEdge = (edge: Edge): boolean => {
    return _edges.find(
      e => e.from.name === edge.from.name && e.to.name === edge.to.name
    ) as unknown as boolean;
  };

  const _includesNode = (n: NodeMetadata): boolean => {
    return nodes.find(
      node => node.metadata.name === n.name
    ) as unknown as boolean;
  };

  const _toNodes = (graphvizNode: NodeMetadata, toNodes: NodeMetadata[]) => {
    toNodes.forEach(node => {
      const neuronFacNode = nodes.find(
        innerNode => innerNode.metadata.name === node.name
      );
      if (neuronFacNode) {
        const edge = _graph.addEdge(graphvizNode.name, node.name);
        edge.set('color', 'red');
      } else {
        const newNode = _graph.addNode(node.name, {color: 'blue'});
        nodes.push({metadata: node, graphvizNode: newNode});
        const newEdge = _graph.addEdge(graphvizNode.name, node.name);
      }
    });
  };

  return {
    addNode: (
      metadata: NodeMetadata,
      fromNodes: NodeMetadata[],
      toNodes: NodeMetadata[],
      nodeProperties: Record<string, string> = {}
    ) => {
      const graphvizNode = _includesNode(metadata)
        ? nodes.find(n => n.metadata.name === metadata.name).graphvizNode
        : _graph.addNode(metadata.name, nodeProperties);

      fromNodes.forEach(n => {
        const neuronFacNode = nodes.find(
          innerNode => innerNode.metadata.name === n.name
        );
        if (neuronFacNode) {
          const edge = _graph.addEdge(n.name, graphvizNode);
          edge.set('color', 'red');
        }
      });
      nodes.push({
        metadata,
        graphvizNode,
      });
    },
    addEdge: (from: NodeMetadata, to: NodeMetadata, label?: string) => {
      const fromNode = nodes.find(
        innerNode => innerNode.metadata.name === from.name
      );
      const toNode = nodes.find(
        innerNode => innerNode.metadata.name === to.name
      );
      if (fromNode && toNode) {
        const edge = _graph.addEdge(fromNode.graphvizNode, toNode.graphvizNode);
        edge.set('color', 'blue');
        if (label) {
          edge.set('label', label);
        }
        _edges.push({from: fromNode.metadata, to: toNode.metadata});
        _edgeCtr++;
      }
    },
    includesNode: _includesNode,
    includesEdge: _includesEdge,
    asText: () => _graph.to_dot() as string,
    render: () => {
      _graph.setGraphVizPath('/usr/bin');
      _graph.output('png', 'test01.png');
    },
  };
};
