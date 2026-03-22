import { useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Panel, 
  useReactFlow, 
  ReactFlowProvider 
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useStore } from './store';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Save, 
  Trash2, 
  Megaphone, 
  MousePointer2, 
  ClipboardList, 
  ShoppingCart, 
  TrendingUp, 
  Trophy 
} from 'lucide-react';
import { FunnelNode } from './components/nodes/FunnelNode';

const nodeTypes = { funnelNode: FunnelNode };

function Flow() {
  const { screenToFlowPosition } = useReactFlow();
  
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    addNode, 
    pendingNode, 
    setPendingNode, 
    deleteNode,
    loadFromLocal
  } = useStore();

  useEffect(() => {
    loadFromLocal();
  }, [loadFromLocal]);

  const selectedNode = nodes.find((n) => n.selected);
  const onPaneClick = (event: React.MouseEvent) => {
    if (pendingNode) {
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addNode(pendingNode.type, pendingNode.label, position);
    }
  };

  return (
    <div className="w-full h-screen bg-[#16171d] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        fitView
      >
        <Background color="#333" gap={20} />
        <Controls />

        <Panel position="top-right" className="m-4 flex flex-col gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 w-[260px]">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <h2 className="text-sm font-bold text-gray-800">Editor de Funil</h2>
            {selectedNode && (
              <button 
                onClick={() => deleteNode(selectedNode.id)} 
                className="text-red-500 hover:bg-red-50 p-1 rounded-md transition-all"
                title="Excluir selecionado"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-1 max-h-[60vh] overflow-y-auto pr-1">
            <Button 
              variant="outline" size="sm" 
              onClick={() => setPendingNode({ type: 'ads', label: 'Campanha de Ads' })}
              className={`justify-start ${pendingNode?.type === 'ads' ? 'border-purple-500 bg-purple-50' : ''}`}
            >
              <Megaphone className="w-4 h-4 mr-2 text-purple-500" /> Anúncio
            </Button>
            
            <Button 
              variant="outline" size="sm" 
              onClick={() => setPendingNode({ type: 'lp', label: 'Página de Vendas' })}
              className={`justify-start ${pendingNode?.type === 'lp' ? 'border-blue-400 bg-blue-50' : ''}`}
            >
              <MousePointer2 className="w-4 h-4 mr-2 text-blue-400" /> Landing Page
            </Button>

            <Button 
              variant="outline" size="sm" 
              onClick={() => setPendingNode({ type: 'form', label: 'Captura de Leads' })}
              className={`justify-start ${pendingNode?.type === 'form' ? 'border-amber-500 bg-amber-50' : ''}`}
            >
              <ClipboardList className="w-4 h-4 mr-2 text-amber-500" /> Formulário
            </Button>

            <Button 
              variant="outline" size="sm" 
              onClick={() => setPendingNode({ type: 'checkout', label: 'Checkout' })}
              className={`justify-start ${pendingNode?.type === 'checkout' ? 'border-emerald-500 bg-emerald-50' : ''}`}
            >
              <ShoppingCart className="w-4 h-4 mr-2 text-emerald-500" /> Checkout
            </Button>

            <Button 
              variant="outline" size="sm" 
              onClick={() => setPendingNode({ type: 'upsell', label: 'Upsell / Order Bump' })}
              className={`justify-start ${pendingNode?.type === 'upsell' ? 'border-indigo-500 bg-indigo-50' : ''}`}
            >
              <TrendingUp className="w-4 h-4 mr-2 text-indigo-500" /> Upsell
            </Button>

            <Button 
              variant="outline" size="sm" 
              onClick={() => setPendingNode({ type: 'success', label: 'Página de Sucesso' })}
              className={`justify-start ${pendingNode?.type === 'success' ? 'border-rose-500 bg-rose-50' : ''}`}
            >
              <Trophy className="w-4 h-4 mr-2 text-rose-500" /> Sucesso
            </Button>
          </div>

          {pendingNode && (
            <div className="mt-2 py-2 px-3 bg-purple-50 rounded-lg border border-purple-100 border-dashed">
              <p className="text-[9px] text-purple-700 font-bold text-center animate-pulse">
                POSICIONE NO MAPA COM UM CLIQUE
              </p>
            </div>
          )}

          <Button 
            variant="default" 
            size="sm" 
            className="mt-2 bg-slate-900 text-white" 
            onClick={() => alert('Seu funil foi salvo no navegador!')}
          >
            <Save className="w-4 h-4 mr-2" /> Salvar Projeto
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}