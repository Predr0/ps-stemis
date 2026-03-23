import { useEffect, useState, useRef } from 'react';
import ReactFlow, { Background, Controls, Panel, MiniMap, useReactFlow, ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from './store';
import { Button } from '@/components/ui/button';
import { Hand, Pencil, Eraser, Trash2, Megaphone, MousePointer2, ClipboardList, ShoppingCart, TrendingUp, Trophy, Save, Maximize } from 'lucide-react';
import { FunnelNode } from './components/nodes/FunnelNode';

const nodeTypes = { funnelNode: FunnelNode };

function Flow() {
  const { screenToFlowPosition, fitView } = useReactFlow();
  const store = useStore();
  const [activePath, setActivePath] = useState<string | null>(null);

  useEffect(() => { store.loadFromLocal(); }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (store.mode !== 'pen') return;
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    setActivePath(`M ${pos.x} ${pos.y}`);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!activePath || store.mode !== 'pen') return;
    const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    setActivePath((prev) => `${prev} L ${pos.x} ${pos.y}`);
  };

  const onMouseUp = () => {
    if (!activePath) return;
    store.addDrawing({ id: Math.random().toString(), path: activePath, color: store.brushColor });
    setActivePath(null);
  };

  return (
    <div className={`w-full h-screen bg-[#16171d] relative ${store.mode === 'pen' ? 'pen-mode' : ''}`}>
      <style>{`
        .pen-mode .react-flow__pane { cursor: crosshair !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
      `}</style>

      <ReactFlow
        nodes={store.nodes} edges={store.edges} nodeTypes={nodeTypes}
        onNodesChange={store.onNodesChange} onEdgesChange={store.onEdgesChange} onConnect={store.onConnect}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}
        panOnDrag={store.mode === 'hand'}
        onPaneClick={(e) => {
          if (store.pendingNode) {
            const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
            store.addNode(store.pendingNode.type, store.pendingNode.label, pos);
          }
        }}
      >
        <Background color="#333" gap={20} />
        <Controls />
        <MiniMap 
          position="bottom-right" style={{ background: '#1f2028', width: 300, height: 200, borderRadius: '12px' }}
          nodeColor={(n) => {
            const colors = { ads: '#a855f7', lp: '#3b82f6', form: '#f59e0b', checkout: '#10b981', upsell: '#1e3a8a', success: '#fb7185' };
            return colors[n.data.type as keyof typeof colors] || '#64748b';
          }}
          pannable zoomable
        />

        <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
          {store.drawings.map((d) => (
            <path 
              key={d.id} d={d.path} stroke={d.color} fill="none" strokeLinecap="round" strokeLinejoin="round"
              strokeWidth={store.mode === 'eraser' ? 15 : 3}
              strokeOpacity={store.mode === 'eraser' ? 0.5 : 1}
              className={`transition-all ${store.mode === 'eraser' ? 'pointer-events-auto cursor-pointer hover:stroke-red-500' : ''}`}
              onClick={(e) => {
                if (store.mode === 'eraser') {
                  e.stopPropagation();
                  store.deleteDrawing(d.id);
                }
              }}
            />
          ))}
          {activePath && <path d={activePath} stroke={store.brushColor} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
        </svg>

        <Panel position="top-right" className="m-4 flex flex-col gap-3 p-4 bg-white rounded-xl shadow-2xl w-[260px] border border-gray-100">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-sm font-bold text-gray-800">Miro Flow</h2>
            <div className="flex gap-1 bg-slate-50 p-1 rounded-lg">
              <button onClick={() => store.setMode('hand')} className={`p-1.5 rounded-md ${store.mode === 'hand' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}><Hand size={16} /></button>
              <div className="relative flex items-center">
                <button onClick={() => store.setMode('pen')} className={`p-1.5 rounded-md ${store.mode === 'pen' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400'}`}><Pencil size={16} /></button>
                <input type="color" value={store.brushColor} onChange={(e) => store.setBrushColor(e.target.value)} className="w-3 h-3 rounded-full absolute -right-1 -top-1 cursor-pointer" />
              </div>
              <button onClick={() => store.setMode('eraser')} className={`p-1.5 rounded-md ${store.mode === 'eraser' ? 'bg-white shadow-sm text-red-600' : 'text-gray-400'}`}><Eraser size={16} /></button>
            </div>
          </div>
          <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
            <Button variant="outline" size="sm" onClick={() => store.setPendingNode({ type: 'ads', label: 'Campanha de Ads' })} className="justify-start"><Megaphone className="w-4 h-4 mr-2 text-purple-500" /> Anúncio</Button>
            <Button variant="outline" size="sm" onClick={() => store.setPendingNode({ type: 'lp', label: 'Landing Page' })} className="justify-start"><MousePointer2 className="w-4 h-4 mr-2 text-blue-500" /> Landing Page</Button>
            <Button variant="outline" size="sm" onClick={() => store.setPendingNode({ type: 'form', label: 'Captação Leads' })} className="justify-start"><ClipboardList className="w-4 h-4 mr-2 text-orange-500" /> Formulário</Button>
            <Button variant="outline" size="sm" onClick={() => store.setPendingNode({ type: 'checkout', label: 'Checkout' })} className="justify-start"><ShoppingCart className="w-4 h-4 mr-2 text-emerald-500" /> Checkout</Button>
            <Button variant="outline" size="sm" onClick={() => store.setPendingNode({ type: 'upsell', label: 'Upsell' })} className="justify-start"><TrendingUp className="w-4 h-4 mr-2 text-blue-900" /> Upsell</Button>
            <Button variant="outline" size="sm" onClick={() => store.setPendingNode({ type: 'success', label: 'Sucesso' })} className="justify-start"><Trophy className="w-4 h-4 mr-2 text-rose-500" /> Sucesso</Button>
          </div>
          <div className="flex flex-col gap-2 mt-2 pt-2 border-t">
            <Button variant="secondary" size="sm" onClick={() => fitView({ padding: 0.2, duration: 800 })} className="bg-blue-600 text-white"><Maximize className="w-4 h-4 mr-2" /> Centralizar</Button>
            <Button variant="default" size="sm" className="bg-slate-900 text-white" onClick={() => alert('Salvo! (é um botão inútil, mas é pra simular o usuário salvando as coisinhas dele =)')}><Save className="w-4 h-4 mr-2" /> Salvar</Button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function App() { return (<ReactFlowProvider><Flow /></ReactFlowProvider>); }