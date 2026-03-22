import { useState } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Megaphone, MousePointer2, ClipboardList, ShoppingCart, Trophy, Trash2, TrendingUp } from 'lucide-react';
import { type FunnelNodeData, useStore } from '../../store';

const nodeConfigs = {
  ads: { label: 'Anúncio', icon: Megaphone, color: 'border-purple-500', glow: 'shadow-purple-500/20', bg: 'bg-purple-500/10' },
  lp: { label: 'Landing Page', icon: MousePointer2, color: 'border-blue-400', glow: 'shadow-blue-400/20', bg: 'bg-blue-400/10' },
  form: { label: 'Formulário', icon: ClipboardList, color: 'border-amber-400', glow: 'shadow-amber-400/20', bg: 'bg-amber-400/10' },
  checkout: { label: 'Checkout', icon: ShoppingCart, color: 'border-emerald-400', glow: 'shadow-emerald-400/20', bg: 'bg-emerald-400/10' },
  upsell: { label: 'Upsell', icon: TrendingUp, color: 'border-indigo-400', glow: 'shadow-indigo-400/20', bg: 'bg-indigo-400/10' },
  success: { label: 'Sucesso', icon: Trophy, color: 'border-rose-400', glow: 'shadow-rose-400/20', bg: 'bg-rose-400/10' },
};

export function FunnelNode({ id, data, selected }: NodeProps<FunnelNodeData>) {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const deleteNode = useStore((s) => s.deleteNode);
  const [isEditing, setIsEditing] = useState(false);
  const [localLabel, setLocalLabel] = useState(data.label);
  const config = nodeConfigs[data.type] || nodeConfigs.ads;
  const Icon = config.icon;
  const hasTraffic = data.stats.views > 0;

  const handleBlur = () => {
    setIsEditing(false);
    updateNodeData(id, localLabel, data.stats.conversions);
  };

  return (
    <div className={`min-w-[180px] bg-[#1f2028] border-2 rounded-xl overflow-hidden transition-all duration-500 ${selected ? `${config.color} ${config.glow} scale-105` : 'border-white/10 shadow-lg'}`}>
      <div className={`p-2 ${config.bg} border-b border-white/5 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Icon className={`w-3.5 h-3.5 ${config.color.replace('border-', 'text-')}`} />
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
          <input 
            autoFocus 
            className="bg-white/5 border border-white/20 text-white text-sm font-medium rounded px-2 py-1 outline-none focus:border-purple-500 w-full" 
            value={localLabel} 
            onChange={(e) => setLocalLabel(e.target.value)} 
            onBlur={handleBlur} 
            onKeyDown={(e) => e.key === 'Enter' && handleBlur()} 
          />
        ) : (
          <h3 
            onDoubleClick={() => setIsEditing(true)} 
            className="text-sm font-medium text-white/90 cursor-text hover:text-white transition-colors"
          >
            {data.label}
          </h3>
        )}

        {hasTraffic && (
          <div className="flex items-center gap-2 mt-1">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Acessos</span>
              <span className="text-xs font-mono text-white">{data.stats.views.toLocaleString()}</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10 mx-1" />
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Conv.</span>
              <span className={`text-xs font-mono font-bold ${config.color.replace('border-', 'text-')}`}>{data.stats.conversions}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="h-1 w-full bg-white/5 mt-auto">
        <div 
          className={`h-full transition-all duration-1000 ${config.color.replace('border-', 'bg-')}`} 
          style={{ width: hasTraffic ? `${Math.min(data.stats.conversions * 2.5, 100)}%` : '0%' }} 
        />
      </div>

      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-[#1f2028] !border-gray-600 hover:!border-white transition-colors" />
      <Handle type="source" position={Position.Bottom} className={`w-2 h-2 !bg-[#1f2028] ${config.color.replace('border-', '!border-')} hover:scale-125 transition-transform`} />
    </div>
  );
}