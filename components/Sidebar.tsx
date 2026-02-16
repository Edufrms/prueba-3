
import React from 'react';

interface SidebarProps {
  activeTab: 'fairs' | 'calendar' | 'contacts';
  setActiveTab: (tab: 'fairs' | 'calendar' | 'contacts') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'fairs', label: 'Ferias', icon: '🏢' },
    { id: 'calendar', label: 'Calendario', icon: '📅' },
    { id: 'contacts', label: 'Contactos', icon: '👥' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 hidden md:flex">
      <div className="p-6">
        <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
          <span className="text-2xl">⚡</span> FairConnect AI
        </h1>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === item.id
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-lg p-3">
          <p className="text-xs text-slate-500 font-medium mb-1">Status de IA</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-slate-700">Gemini 3 Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
