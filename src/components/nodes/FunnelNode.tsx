import React, { useState } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Megaphone, MousePointer2, ClipboardList, ShoppingCart, Trophy, Trash2, TrendingUp, Check } from 'lucide-react';
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
  const store = useStore();
  const isDark = store.theme === 'dark';
  
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [conv, setConv] = useState(data.stats.conversions);

  const config = nodeConfigs[data.type] || nodeConfigs.ads;
  const Icon = config.icon;

  const handleSave = () => {
    store.updateNodeData(id, label, Number(conv));
    setIsEditing(false);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      handleSave();
    }
  };

  return (
    <div 
      className={`min-w-[180px] border-2 rounded-xl overflow-hidden transition-all duration-300 shadow-lg
        ${isDark ? 'bg-[#1f2028] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}
        ${selected ? `${config.color} ${config.glow} scale-105` : ''}`}
      onDoubleClick={() => setIsEditing(true)}
      onBlur={handleBlur}
    >

      <div className={`p-2 ${config.bg} border-b flex items-center justify-between ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 ${config.text}`} />
          <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            {config.label}
          </span>
        </div>
        {selected && (
          <button onClick={(e) => { e.stopPropagation(); store.deleteNode(id); }} className={`${isDark ? 'text-white/40 hover:text-red-400' : 'text-slate-400 hover:text-red-500'}`}>
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
              onPointerDown={(e) => e.stopPropagation()}
              className={`nodrag nowheel w-full h-7 px-2 text-[11px] rounded outline-none border focus:border-blue-500 
                ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
            />
            <div className="relative">
              <input 
                type="number"
                value={conv} 
                onChange={(e) => setConv(Number(e.target.value))}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                onPointerDown={(e) => e.stopPropagation()}
                className={`nodrag nowheel w-full h-7 px-2 text-[11px] rounded outline-none border focus:border-blue-500 
                  ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
              />
              <span className={`absolute right-6 top-1.5 text-[10px] ${isDark ? 'text-white/40' : 'text-slate-400'}`}>%</span>
            </div>
          </div>
        ) : (
          <>
            <h3 className={`text-sm font-bold text-center mb-1 ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
              {data.label}
            </h3>
            
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-end">
                <span className={`text-[9px] uppercase font-bold tracking-tighter ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Acessos</span>
                <span className={`text-base font-mono font-bold leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {data.stats.views.toLocaleString()}
                </span>
              </div>
              <div className={`flex justify-between items-end border-t pt-2 ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <span className={`text-[9px] uppercase font-bold tracking-tighter ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Conversão</span>
                <span className={`text-xs font-bold leading-none ${config.text}`}>{data.stats.conversions}%</span>
              </div>
            </div>
          </>
        )}
      </div>

      <Handle type="target" position={Position.Top} className={`w-2 h-2 border-none !bg-slate-400`} />
      <Handle type="source" position={Position.Bottom} className={`w-2 h-2 border-none ${config.color.replace('border-', '!bg-')}`} />
    </div>
  );
}