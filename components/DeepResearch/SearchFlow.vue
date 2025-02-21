<script setup lang="ts">
  import '@vue-flow/core/dist/style.css'
  import '@vue-flow/core/dist/theme-default.css'
  import '@vue-flow/controls/dist/style.css'
  import SearchNode from './SearchNode.vue'
  import {
    type Edge,
    type FlowEvents,
    type Node,
    VueFlow,
    useVueFlow,
  } from '@vue-flow/core'
  import { Background } from '@vue-flow/background'
  import { Controls } from '@vue-flow/controls'
  import type { DeepResearchNodeStatus } from './DeepResearch.vue'

  export interface SearchNodeData {
    title: string
    status?: DeepResearchNodeStatus
  }
  export type SearchNode = Node<SearchNodeData>
  export type SearchEdge = Edge<SearchNodeData>

  const emit = defineEmits<{
    (e: 'node-click', nodeId: string): void
  }>()

  defineProps<{
    selectedNodeId?: string
  }>()

  const isLargeScreen = useMediaQuery('(min-width: 768px)')
  const defaultPosition = { x: 0, y: 0 }
  const nodes = ref<SearchNode[]>([defaultRootNode()])
  const edges = ref<SearchEdge[]>([])
  let hasUserInteraction = false

  const {
    addNodes: addFlowNodes,
    addEdges: addFlowEdges,
    updateNodeData: updateFlowNodeData,
    fitView,
  } = useVueFlow()
  const { layout } = useNodeLayout()

  function defaultRootNode(): SearchNode {
    return {
      id: '0',
      data: { title: 'Start' },
      position: { ...defaultPosition },
      type: 'search', // We only have this type
    }
  }

  function handleNodeClick(nodeId: string) {
    emit('node-click', nodeId)
  }

  function layoutGraph() {
    nodes.value = layout(nodes.value, edges.value)
    if (!hasUserInteraction) {
      nextTick(() => {
        fitView({})
      })
    }
  }

  function addNode(nodeId: string, data: SearchNodeData, parentId?: string) {
    addFlowNodes({
      id: nodeId,
      data,
      position: { ...defaultPosition },
      type: 'search',
    })

    if (parentId) {
      addFlowEdges({
        id: `e:${parentId}:${nodeId}`,
        source: parentId,
        target: nodeId,
      })
    }

    layoutGraph()
  }

  function updateNode(nodeId: string, data: Partial<SearchNodeData>) {
    updateFlowNodeData(nodeId, data)
    layoutGraph()
  }

  function clearNodes() {
    nodes.value = [defaultRootNode()]
    edges.value = []
    layoutGraph()
    hasUserInteraction = false
  }

  function handleDrag(e: PointerEvent | FlowEvents['move']) {
    // Triggered by VueFlow internal logic
    if ('event' in e && !e.event.sourceEvent) {
      return
    }

    hasUserInteraction = true
  }

  defineExpose({
    addNode,
    updateNode,
    clearNodes,
  })
</script>

<template>
  <ClientOnly fallback-tag="span" fallback="Loading graph...">
    <div :class="[isLargeScreen ? 'h-100' : 'h-60']">
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :edges-updatable="false"
        :min-zoom="0.5"
        :max-zoom="isLargeScreen ? 2.5 : 1.8"
        :default-edge-options="{ animated: true }"
        @nodes-initialized="layoutGraph"
        @move="handleDrag"
      >
        <template #node-search="props">
          <SearchNode
            :data="props.data"
            :selected="selectedNodeId === props.id"
            @click="handleNodeClick(props.id)"
            @pointerdown="handleDrag"
          />
        </template>
        <Background />
        <Controls @fit-view="hasUserInteraction = false" />
      </VueFlow>
    </div>
  </ClientOnly>
</template>
