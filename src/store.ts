import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from 'reactflow';

export interface DrawingStroke {
  id: string;
  path: string;
  color: string;
}

export interface FunnelNodeData {
  label: string;
  type: 'ads' | 'lp' | 'form' | 'checkout' | 'upsell' | 'success';
  stats: {
    views: number;
    conversions: number;
  };
}

interface FunnelState {
  nodes: Node<FunnelNodeData>[];
  edges: Edge[];
  pendingNode: { type: FunnelNodeData['type']; label: string } | null;
  mode: 'hand' | 'pen' | 'eraser';
  brushColor: string;
  drawings: DrawingStroke[];
  theme: 'dark' | 'light';
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setPendingNode: (node: { type: FunnelNodeData['type']; label: string } | null) => void;
  addNode: (funnelType: FunnelNodeData['type'], label: string, position: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;
  updateNodeData: (id: string, label: string, conversions: number) => void;
  setMode: (mode: 'hand' | 'pen' | 'eraser') => void;
  setBrushColor: (color: string) => void;
  addDrawing: (stroke: DrawingStroke) => void;
  deleteDrawing: (id: string) => void;
  clearDrawings: () => void;
  toggleTheme: () => void;
  calculateFlow: () => void;
  saveToLocal: () => void;
  loadFromLocal: () => void;
}

export const useStore = create<FunnelState>((set, get) => ({
  nodes: [],
  edges: [],
  pendingNode: null,
  mode: 'hand',
  brushColor: '#aa3bff',
  drawings: [],
  theme: 'dark',

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
    get().saveToLocal();
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
    get().calculateFlow();
    get().saveToLocal();
  },
  onConnect: (connection) => {
    const newEdge = { 
      ...connection, 
      animated: true, 
      style: { stroke: '#3b82f6', strokeWidth: 2 } 
    };
    set({ edges: addEdge(newEdge, get().edges) });
    get().calculateFlow();
    get().saveToLocal();
  },
  setPendingNode: (node) => {
    const currentPending = get().pendingNode;
    if (currentPending && node && currentPending.type === node.type) {
      set({ pendingNode: null });
    } else {
      set({ pendingNode: node });
    }
  },
  addNode: (funnelType, label, position) => {
    const id = Math.random().toString(36).substring(2, 9);
    const randomConv = Math.floor(Math.random() * (20 - 8 + 1)) + 8;
    const newNode: Node<FunnelNodeData> = {
      id,
      type: 'funnelNode',
      data: { 
        label, 
        type: funnelType, 
        stats: { 
          views: funnelType === 'ads' ? 5000 : 0, 
          conversions: randomConv 
        } 
      },
      position,
    };
    set({ nodes: [...get().nodes, newNode], pendingNode: null });
    get().calculateFlow();
    get().saveToLocal();
  },
  deleteNode: (id) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
    });
    get().calculateFlow();
    get().saveToLocal();
  },
  updateNodeData: (id, label, conversions) => {
    set({
      nodes: get().nodes.map((n) => 
        n.id === id ? { ...n, data: { ...n.data, label, stats: { ...n.data.stats, conversions } } } : n
      ),
    });
    get().calculateFlow();
    get().saveToLocal();
  },
  setMode: (mode) => set({ mode }),
  setBrushColor: (brushColor) => set({ brushColor }),
  addDrawing: (stroke) => {
    set({ drawings: [...get().drawings, stroke] });
    get().saveToLocal();
  },
  deleteDrawing: (id) => {
    set({ drawings: get().drawings.filter((d) => d.id !== id) });
    get().saveToLocal();
  },
  clearDrawings: () => {
    set({ drawings: [] });
    get().saveToLocal();
  },
  toggleTheme: () => {
    set({ theme: get().theme === 'dark' ? 'light' : 'dark' });
    get().saveToLocal();
  },
  calculateFlow: () => {
    const { nodes, edges } = get();
    const nodeMap = new Map(nodes.map(node => [
      node.id, 
      { ...node, data: { ...node.data, stats: { ...node.data.stats } } }
    ]));

    nodeMap.forEach((node) => {
      if (node.data.type !== 'ads') {
        node.data.stats.views = 0;
      }
    });

    const queue = Array.from(nodeMap.values())
      .filter(n => n.data.type === 'ads')
      .map(n => n.id);

    while (queue.length > 0) {
      const sourceId = queue.shift()!;
      const sourceNode = nodeMap.get(sourceId);
      if (!sourceNode) continue;

      const outgoingEdges = edges.filter(e => e.source === sourceId);
      
      outgoingEdges.forEach(edge => {
        const targetNode = nodeMap.get(edge.target);
        if (targetNode) {
          const traffic = Math.floor(sourceNode.data.stats.views * (sourceNode.data.stats.conversions / 100));
          targetNode.data.stats.views += traffic;
          queue.push(targetNode.id);
        }
      });
    }

    set({ nodes: Array.from(nodeMap.values()) });
  },
  saveToLocal: () => {
    const data = {
      nodes: get().nodes,
      edges: get().edges,
      drawings: get().drawings,
      theme: get().theme
    };
    localStorage.setItem('funnel-builder-data', JSON.stringify(data));
  },
  loadFromLocal: () => {
    const saved = localStorage.getItem('funnel-builder-data');
    if (saved) {
      const { nodes, edges, drawings, theme } = JSON.parse(saved);
      set({ 
        nodes: nodes || [], 
        edges: edges || [], 
        drawings: drawings || [],
        theme: theme || 'dark'
      });
      get().calculateFlow();
    }
  }
}));