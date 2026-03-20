import ReactFlow, { Background, Controls, Panel } from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from './store'; 
import { Button } from '@/components/ui/button';
import { Plus, Save } from 'lucide-react';

export default function App() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } = useStore();

  return (
    <div className="flex-1 w-full h-screen relative border-t border-[--color-border]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        
        <Panel position="top-right" className="flex flex-col gap-3 p-4 bg-white border border-[--color-border] rounded-xl shadow-lg z-50 min-w-[200px]">
          <h2 className="text-sm font-bold text-[--text-h] mb-1">Editor de Funil</h2>
          <p className="text-xs text-[--text] mb-3">Adicione etapas ao seu fluxo</p>
          
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={() => addNode('ads', 'Novo Anúncio')} className="justify-start">
              <Plus className="w-4 h-4 mr-2 text-accent" /> Anúncio
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => addNode('lp', 'Nova Landing Page')} className="justify-start">
              <Plus className="w-4 h-4 mr-2 text-accent" /> Landing Page
            </Button>

            <Button variant="outline" size="sm" onClick={() => addNode('checkout', 'Checkout')} className="justify-start">
              <Plus className="w-4 h-4 mr-2 text-accent" /> Checkout
            </Button>
          </div>

          <Button variant="default" size="sm" className="mt-4 bg-[--text-h] text-white hover:opacity-90" onClick={() => alert('Funil salvo!')}>
            <Save className="w-4 h-4 mr-2" /> Salvar Projeto
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}