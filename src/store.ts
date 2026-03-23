import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
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
  calculateFlow: () => void;
  saveToLocal: () => void;
  loadFromLocal: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const useStore = create<FunnelState>((set, get) => ({
  nodes: [],
  edges: [],
  pendingNode: null,
  mode: 'hand',
  brushColor: '#aa3bff',
  drawings: [],

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
    get().saveToLocal();
  },

  theme: 'dark', 
toggleTheme: () => {
  set({ theme: get().theme === 'dark' ? 'light' : 'dark' });
  get().saveToLocal();
},
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
    get().saveToLocal();
  },
  onConnect: (connection) => {
    const newEdge = { ...connection, animated: true, style: { stroke: '#aa3bff', strokeWidth: 2 } };
    set({ edges: addEdge(newEdge, get().edges) });
    get().calculateFlow();
    get().saveToLocal();
  },
  setPendingNode: (pendingNode) => set({ pendingNode }),
  addNode: (funnelType, label, position) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNode: Node<FunnelNodeData> = {
      id,
      type: 'funnelNode',
      data: { 
        label, 
        type: funnelType, 
        stats: { views: funnelType === 'ads' ? 5000 : 0, conversions: 10 } 
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

    edges.forEach((edge) => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);
      if (source && target) {
        const tráfegoConvertido = Math.floor(source.data.stats.views * (source.data.stats.conversions / 100));
        target.data.stats.views += tráfegoConvertido;
      }
    });

    set({ nodes: Array.from(nodeMap.values()) });
  },
  saveToLocal: () => {
    localStorage.setItem('miro-funnel-data', JSON.stringify({ nodes: get().nodes, edges: get().edges, drawings: get().drawings }));
  },
  loadFromLocal: () => {
    const saved = localStorage.getItem('miro-funnel-data');
    if (saved) {
      const { nodes, edges, drawings } = JSON.parse(saved);
      set({ nodes: nodes || [], edges: edges || [], drawings: drawings || [] });
    }
  }
}));