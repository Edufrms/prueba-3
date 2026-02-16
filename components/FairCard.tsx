
import React from 'react';
import { TradeFair } from '../types';

interface FairCardProps {
  fair: TradeFair;
  onClick: () => void;
}

const FairCard: React.FC<FairCardProps> = ({ fair, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold group-hover:text-indigo-600 transition-colors">
            {fair.name}
          </h3>
          <p className="text-sm text-slate-500">{fair.location || 'Ubicación pendiente'}</p>
        </div>
        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold">
          {fair.date || 'Sin fecha'}
        </span>
      </div>
      
      <p className="text-sm text-slate-600 line-clamp-2 mb-4 h-10">
        {fair.description || 'Pulsa para buscar información sobre esta feria...'}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex -space-x-2">
           <span className="text-xs text-slate-400">
             {fair.meetings.length} reuniones agendadas
           </span>
        </div>
        <button className="text-indigo-600 text-sm font-semibold flex items-center gap-1">
          Detalles <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default FairCard;
