import dagre from '@dagrejs/dagre'
import { Position, useVueFlow, type Edge, type Node } from '@vue-flow/core'

// Picked from https://vueflow.dev/examples/layout/animated.html
export function useNodeLayout() {
  const { findNode } = useVueFlow()

  function layout(nodes: Node[], edges: Edge[]) {
    // we create a new graph instance, in case some nodes/edges were removed, otherwise dagre would act as if they were still there
    const dagreGraph = new dagre.graphlib.Graph()

    dagreGraph.setDefaultEdgeLabel(() => ({}))

    const isHorizontal = true
    dagreGraph.setGraph({
      rankdir: 'LR',
      // distance between nodes at the same level
      nodesep: 25,
      // distance between levels
      ranksep: 30,
    })

    for (const node of nodes) {
      // if you need width+height of nodes for your layout, you can use the dimensions property of the internal node (`GraphNode` type)
      const graphNode = findNode(node.id)

      if (!graphNode) {
        console.error(`Node with id ${node.id} not found in the graph`)
        continue
      }

      dagreGraph.setNode(node.id, {
        width: graphNode.dimensions.width || 100,
        height: graphNode.dimensions.height || 50,
      })
    }

    for (const edge of edges) {
      dagreGraph.setEdge(edge.source, edge.target)
    }

    dagre.layout(dagreGraph, {
      rankdir: 'LR',
      nodesep: 25,
      ranksep: 30,
    })

    // set nodes with updated positions
    return nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id)

      return {
        ...node,
        targetPosition: isHorizontal ? Position.Left : Position.Top,
        sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
        position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
      }
    })
  }

  return { layout }
}
