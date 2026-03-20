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
  type: 'ads' | 'lp' | 'form' | 'checkout' | 'success';
  stats?: {
    views: number;
    conversions: number;
  };
}

interface FunnelState {
  nodes: Node<FunnelNodeData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: FunnelNodeData['type'], label: string) => void;
}

export const useStore = create<FunnelState>((set, get) => ({
  nodes: [
    { 
      id: '1', 
      type: 'default', 
      data: { label: 'Início do Funil', type: 'ads', stats: { views: 1000, conversions: 50 } }, 
      position: { x: 250, y: 5 } 
    },
  ],
  edges: [],
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  addNode: (type, label) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNode: Node<FunnelNodeData> = {
      id,
      type: 'default', // Depois vamos mudar para custom nodes
      data: { label, type, stats: { views: 0, conversions: 0 } },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };
    set({ nodes: [...get().nodes, newNode] });
  },
}));