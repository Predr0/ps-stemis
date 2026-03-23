import { useEffect, useState } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Panel, 
  MiniMap, 
  useReactFlow, 
  ReactFlowProvider,
  useViewport 
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useStore } from './store';
import { Button } from '@/components/ui/button';
import { 
  Hand, Pencil, Eraser, 
  Megaphone, MousePointer2, ClipboardList, 
  ShoppingCart, TrendingUp, Trophy, Save, Maximize,
  Flashlight
} from 'lucide-react';
import { FunnelNode } from './components/nodes/FunnelNode';

const nodeTypes = { funnelNode: FunnelNode };

function Flow() {
  const { screenToFlowPosition, fitView } = useReactFlow();
  const { x, y, zoom } = useViewport();
  const store = useStore();
  
  const [activePath, setActivePath] = useState<string | null>(null);
  const isDark = store.theme === 'dark';

  useEffect(() => {
    store.loadFromLocal();
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    if (store.mode !== 'pen') return;
    const target = e.target as Element;
    if (!target.classList.contains('react-flow__pane')) return;

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
    store.addDrawing({
      id: Math.random().toString(),
      path: activePath,
      color: store.brushColor
    });
    setActivePath(null);
  };

  return (
    <div 
      className={`w-full h-screen relative transition-colors duration-500 ${isDark ? 'bg-[#16171d]' : 'bg-[#f8fafc]'} ${store.mode === 'pen' ? 'pen-mode' : ''}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <style>{`
        .pen-mode .react-flow__pane { cursor: crosshair !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }
      `}</style>

      <ReactFlow
        nodes={store.nodes}
        edges={store.edges}
        nodeTypes={nodeTypes}
        onNodesChange={store.onNodesChange}
        onEdgesChange={store.onEdgesChange}
        onConnect={store.onConnect}
        panOnDrag={store.mode === 'hand'}
        selectionMode={store.mode === 'hand' ? undefined : (['none'] as any)}
        onPaneClick={(e) => {
          if (store.pendingNode) {
            const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
            store.addNode(store.pendingNode.type, store.pendingNode.label, pos);
          }
        }}
      >
        <Background color={isDark ? '#333' : '#cbd5e1'} gap={20} />
        <Controls />

        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[10] overflow-visible">
          <g transform={`translate(${x},${y}) scale(${zoom})`}>
            {store.drawings.map((d) => (
              <path 
                key={d.id} 
                d={d.path} 
                stroke={d.color} 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                strokeWidth={store.mode === 'eraser' ? 25 / zoom : 3 / zoom} 
                strokeOpacity={store.mode === 'eraser' ? 0.4 : 1}
                className={`transition-all ${store.mode === 'eraser' ? 'pointer-events-auto cursor-pointer hover:stroke-red-500' : 'pointer-events-none'}`}
                onClick={(e) => {
                  if (store.mode === 'eraser') {
                    e.stopPropagation();
                    store.deleteDrawing(d.id);
                  }
                }}
              />
            ))}
            {activePath && (
              <path d={activePath} stroke={store.brushColor} strokeWidth={3 / zoom} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </g>
        </svg>

        <Panel position="top-left" className="m-4">
          <Button 
            variant="outline" size="icon" onClick={store.toggleTheme}
            className={`rounded-full shadow-xl transition-all ${isDark ? 'bg-slate-800 text-yellow-400 border-slate-700' : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-100'}`}
          >
            <Flashlight size={20} className={isDark ? 'rotate-0' : 'rotate-180 transition-transform duration-500'} />
          </Button>
        </Panel>
        
        <MiniMap 
          position="bottom-right" 
          style={{ 
            background: isDark ? '#1f2028' : '#ffffff', 
            border: isDark ? '1px solid #333' : '1px solid #e2e8f0', 
            width: 300, 
            height: 200, 
            borderRadius: '12px' 
          }}
          maskColor={isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.6)'}
          nodeColor={(n) => {
            const colors = { ads: '#a855f7', lp: '#3b82f6', form: '#f59e0b', checkout: '#10b981', upsell: '#1e3a8a', success: '#fb7185' };
            return colors[n.data.type as keyof typeof colors] || '#64748b';
          }}
          pannable zoomable
        />

        <Panel position="top-right" className={`m-4 flex flex-col gap-3 p-4 rounded-xl shadow-2xl w-[260px] border transition-all duration-300 ${isDark ? 'bg-[#1f2028] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <div className={`flex justify-between items-center border-b pb-2 ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <h2 className={`text-sm font-bold uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Editor de Funil</h2>
            <div className={`flex gap-1 p-1 rounded-lg ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
              <button onClick={() => store.setMode('hand')} className={`p-1.5 rounded-md transition-all ${store.mode === 'hand' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><Hand size={16} /></button>
              <div className="relative flex items-center">
                <button onClick={() => store.setMode('pen')} className={`p-1.5 rounded-md transition-all ${store.mode === 'pen' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}><Pencil size={16} /></button>
                <input type="color" value={store.brushColor} onChange={(e) => store.setBrushColor(e.target.value)} className="w-3 h-3 rounded-full absolute -right-1 -top-1 cursor-pointer border-none p-0 bg-transparent" />
              </div>
              <button onClick={() => store.setMode('eraser')} className={`p-1.5 rounded-md transition-all ${store.mode === 'eraser' ? 'bg-red-500 text-white shadow-md' : 'text-gray-400'}`}><Eraser size={16} /></button>
            </div>
          </div>

          <div className="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
            {['ads', 'lp', 'form', 'checkout', 'upsell', 'success'].map((type) => {
              const labels: any = { ads: 'Anúncio', lp: 'Landing Page', form: 'Formulário', checkout: 'Checkout', upsell: 'Upsell', success: 'Sucesso' };
              const icons: any = { ads: Megaphone, lp: MousePointer2, form: ClipboardList, checkout: ShoppingCart, upsell: TrendingUp, success: Trophy };
              const colors: any = { ads: 'text-purple-500', lp: 'text-blue-500', form: 'text-orange-500', checkout: 'text-emerald-500', upsell: 'text-blue-900', success: 'text-rose-500' };
              const glow: any = { ads: 'rgba(168,85,247,0.4)', lp: 'rgba(59,130,246,0.4)', form: 'rgba(249,115,22,0.4)', checkout: 'rgba(16,185,129,0.4)', upsell: 'rgba(30,58,138,0.4)', success: 'rgba(244,63,94,0.4)' };
              const Icon = icons[type];
              const isSelected = store.pendingNode?.type === type;
              
              return (
                <Button 
                  key={type} 
                  variant="outline" 
                  size="sm" 
                  onClick={() => store.setPendingNode({ type: type as any, label: labels[type] })} 
                  className={`justify-start transition-all duration-300 border ${isDark ? 'bg-slate-900/50 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'} ${isSelected ? `border-2 scale-[1.02] ${isDark ? 'bg-white/10' : 'bg-slate-50'}` : ''}`}
                  style={isSelected ? { borderColor: glow[type].replace('0.4', '1'), boxShadow: `0 0 15px ${glow[type]}` } : {}}
                >
                  <Icon className={`w-4 h-4 mr-2 ${isSelected ? colors[type] : isDark ? 'text-slate-500' : 'text-slate-400'}`} /> {labels[type]}
                </Button>
              );
            })}
          </div>

          <div className={`flex flex-col gap-2 mt-2 pt-2 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
            <Button variant="secondary" size="sm" onClick={() => fitView({ padding: 0.2, duration: 800 })} className="bg-blue-600 text-white hover:bg-blue-700 shadow-md"><Maximize className="w-4 h-4 mr-2" /> Centralizar</Button>
            <Button variant="default" size="sm" className={`text-white shadow-md ${isDark ? 'bg-slate-800 hover:bg-black' : 'bg-slate-900 hover:bg-black'}`} onClick={() => { store.saveToLocal(); alert('Salvo! (obviamente é inútil e não funciona de verdade, mas é pra simular o caminho feliz que o usuário pode ter =)'); }}><Save className="w-4 h-4 mr-2" /> Salvar Projeto</Button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default function App() { return (<ReactFlowProvider><Flow /></ReactFlowProvider>); }