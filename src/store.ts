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

export interface FunnelNodeData {
  label: string;
  type: 'ads' | 'lp' | 'form' | 'upsell' | 'checkout' | 'success'; 
  stats: {
    views: number;
    conversions: number;
  };
}

interface FunnelState {
  nodes: Node<FunnelNodeData>[];
  edges: Edge[];
  pendingNode: { type: FunnelNodeData['type']; label: string } | null;
  
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setPendingNode: (node: { type: FunnelNodeData['type']; label: string } | null) => void;
  addNode: (funnelType: FunnelNodeData['type'], label: string, position: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;
  calculateFlow: () => void;
  saveToLocal: () => void;
  loadFromLocal: () => void;
}

export const useStore = create<FunnelState>((set, get) => ({
  nodes: [],
  edges: [],
  pendingNode: null,

  setPendingNode: (pendingNode) => set({ pendingNode }),

  onNodesChange: (changes: NodeChange[]) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
    get().saveToLocal();
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
    get().saveToLocal();
  },

  onConnect: (connection: Connection) => {

    const newEdge = { 
      ...connection, 
      animated: true, 
      style: { stroke: '#aa3bff', strokeWidth: 2 } 
    };
    set({ edges: addEdge(newEdge, get().edges) });
  
    get().calculateFlow();
    get().saveToLocal();
  },

  addNode: (funnelType, label, position) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNode: Node<FunnelNodeData> = {
      id,
      type: 'funnelNode',
      data: { 
        label, 
        type: funnelType, 
        stats: { 
          views: funnelType === 'ads' ? 5000 : 0, 
          conversions: Math.floor(Math.random() * 15) + 5
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
      nodes: get().nodes.filter((node) => node.id !== id),
      edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id),
    });
    get().calculateFlow();
    get().saveToLocal();
  },

  calculateFlow: () => {
    const { nodes, edges } = get();
    const nodeMap = new Map(nodes.map(node => [node.id, { ...node }]));

    nodeMap.forEach((node) => {
      if (node.data.type !== 'ads') {
        node.data.stats.views = 0;
      }
    });

    edges.forEach((edge) => {
      const source = nodeMap.get(edge.source);
      const target = nodeMap.get(edge.target);

      if (source && target) {
        const incomingViews = Math.floor(
          source.data.stats.views * (source.data.stats.conversions / 100)
        );
        target.data.stats.views += incomingViews;
      }
    });

    set({ nodes: Array.from(nodeMap.values()) });
  },

  saveToLocal: () => {
    const data = { nodes: get().nodes, edges: get().edges };
    localStorage.setItem('stemis-funnel-data', JSON.stringify(data));
  },

  loadFromLocal: () => {
    const saved = localStorage.getItem('stemis-funnel-data');
    if (saved) {
      const { nodes, edges } = JSON.parse(saved);
      set({ nodes, edges });
    }
  }
}));