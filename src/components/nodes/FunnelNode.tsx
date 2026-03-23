import React, { useState } from 'react'; // Import direto do React para evitar erro
import { Handle, Position, type NodeProps } from 'reactflow';
import { Megaphone, MousePointer2, ClipboardList, ShoppingCart, Trophy, Trash2, TrendingUp } from 'lucide-react';
import { type FunnelNodeData, useStore } from '../../store';

const nodeConfigs = {
  ads: { label: 'Anúncio', icon: Megaphone, color: 'border-purple-500', glow: 'shadow-purple-500/20', bg: 'bg-purple-500/10', text: 'text-purple-500' },
  lp: { label: 'Landing Page', icon: MousePointer2, color: 'border-blue-400', glow: 'shadow-blue-400/20', bg: 'bg-blue-400/10', text: 'text-blue-400' },
  form: { label: 'Formulário', icon: ClipboardList, color: 'border-amber-400', glow: 'shadow-amber-400/20', bg: 'bg-amber-400/10', text: 'text-amber-400' },
  checkout: { label: 'Checkout', icon: ShoppingCart, color: 'border-emerald-400', glow: 'shadow-emerald-400/20', bg: 'bg-emerald-400/10', text: 'text-emerald-400' },
  upsell: { label: 'Upsell', icon: TrendingUp, color: 'border-[#1e3a8a]', glow: 'shadow-blue-900/20', bg: 'bg-blue-900/10', text: 'text-blue-800' },
  success: { label: 'Sucesso', icon: Trophy, color: 'border-rose-400', glow: 'shadow-rose-400/20', bg: 'bg-rose-400/10', text: 'text-rose-400' },
};

export function FunnelNode({ id, data, selected }: NodeProps<FunnelNodeData>) {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const deleteNode = useStore((s) => s.deleteNode);
  
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [conv, setConv] = useState(data.stats.conversions);

  const config = nodeConfigs[data.type] || nodeConfigs.ads;
  const Icon = config.icon;

  const handleSave = () => {
    updateNodeData(id, label, Number(conv));
    setIsEditing(false);
  };

  // Função de Blur corrigida (sem precisar do FocusEvent importado separadamente)
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      handleSave();
    }
  };

  return (
    <div 
      className={`min-w-[180px] bg-[#1f2028] border-2 rounded-xl overflow-hidden transition-all duration-300 ${selected ? `${config.color} ${config.glow} scale-105` : 'border-white/10 shadow-lg'}`}
      onDoubleClick={() => setIsEditing(true)}
      onBlur={handleBlur}
    >
      <div className={`p-2 ${config.bg} border-b border-white/5 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 ${config.text}`} />
          <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{config.label}</span>
        </div>
        {selected && (
          <button onClick={(e) => { e.stopPropagation(); deleteNode(id); }} className="text-white/40 hover:text-red-400 transition-colors">
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <input 
              autoFocus
              value={label} 
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              onPointerDown={(e) => e.stopPropagation()} // Impede o drag ao clicar
              className="nodrag nowheel w-full h-7 px-2 text-[11px] bg-white/5 border border-white/10 rounded outline-none focus:border-blue-500 text-white"
            />
            <div className="relative">
              <input 
                type="number"
                value={conv} 
                onChange={(e) => setConv(Number(e.target.value))}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                onPointerDown={(e) => e.stopPropagation()} // Impede o drag ao clicar
                className="nodrag nowheel w-full h-7 px-2 text-[11px] bg-white/5 border border-white/10 rounded outline-none focus:border-blue-500 text-white"
              />
              <span className="absolute right-6 top-1.5 text-[10px] text-white/40">%</span>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-sm font-medium text-white/90 text-center mb-1">{data.label}</h3>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-end">
                <span className="text-[9px] text-white/30 uppercase font-bold tracking-tighter">Acessos</span>
                <span className="text-base font-mono font-bold text-white leading-none">{data.stats.views.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-end border-t border-white/5 pt-2">
                <span className="text-[9px] text-white/30 uppercase font-bold tracking-tighter">Conversão</span>
                <span className={`text-xs font-bold leading-none ${config.text}`}>{data.stats.conversions}%</span>
              </div>
            </div>
          </>
        )}
      </div>

      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-[#1f2028] !border-gray-600" />
      <Handle type="source" position={Position.Bottom} className={`w-2 h-2 !bg-[#1f2028] ${config.color.replace('border-', '!border-')}`} />
    </div>
  );
}