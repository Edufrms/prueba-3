
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import FairCard from './components/FairCard';
import MeetingList from './components/MeetingList';
import { TradeFair, Meeting, MeetingStatus } from './types';
import { fetchFairInfoFromWeb, generateMeetingPrep } from './services/geminiService';

const App: React.FC = () => {
  const [fairs, setFairs] = useState<TradeFair[]>([]);
  const [selectedFair, setSelectedFair] = useState<TradeFair | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [activeTab, setActiveTab] = useState<'fairs' | 'calendar' | 'contacts'>('fairs');
  const [isSearching, setIsSearching] = useState(false);
  const [newFairName, setNewFairName] = useState('');
  const [isPrepLoading, setIsPrepLoading] = useState(false);
  const [prepResult, setPrepResult] = useState<{summary: string, questions: string[]} | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fairs_data');
    if (saved) {
      setFairs(JSON.parse(saved));
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('fairs_data', JSON.stringify(fairs));
  }, [fairs]);

  const addNewFair = async () => {
    if (!newFairName) return;
    setIsSearching(true);
    
    try {
      // Use Gemini to enrich the fair info
      const info = await fetchFairInfoFromWeb(newFairName);
      
      const newFair: TradeFair = {
        id: Date.now().toString(),
        name: newFairName,
        url: '',
        date: 'Procesando...',
        location: 'Consultando...',
        description: info.description || '',
        meetings: [],
        groundingSources: info.sources
      };
      
      setFairs([...fairs, newFair]);
      setNewFairName('');
    } catch (err) {
      console.error(err);
      // Fallback
      const newFair: TradeFair = {
        id: Date.now().toString(),
        name: newFairName,
        url: '',
        date: 'TBD',
        location: 'TBD',
        description: '',
        meetings: [],
      };
      setFairs([...fairs, newFair]);
    } finally {
      setIsSearching(false);
    }
  };

  const addMeeting = (fairId: string) => {
    const contact = prompt("Nombre del contacto:");
    if (!contact) return;
    const company = prompt("Empresa:");
    
    const newMeeting: Meeting = {
      id: Date.now().toString(),
      fairId,
      contactName: contact,
      company: company || 'Empresa Desconocida',
      time: '14:00 PM',
      location: 'Hall 4 - Stand B20',
      previousTalks: 'Intercambio inicial por LinkedIn sobre distribución en España.',
      goals: 'Cerrar acuerdo de distribución exclusiva.',
      status: MeetingStatus.SCHEDULED,
    };

    const updatedFairs = fairs.map(f => f.id === fairId ? { ...f, meetings: [...f.meetings, newMeeting] } : f);
    setFairs(updatedFairs);
    if (selectedFair?.id === fairId) {
      setSelectedFair({ ...selectedFair, meetings: [...selectedFair.meetings, newMeeting] });
    }
  };

  const analyzeMeeting = async (meeting: Meeting) => {
    setIsPrepLoading(true);
    setPrepResult(null);
    try {
      const details = `Contacto: ${meeting.contactName}, Empresa: ${meeting.company}. Pasado: ${meeting.previousTalks}. Objetivo: ${meeting.goals}`;
      const result = await generateMeetingPrep(details);
      setPrepResult({
        summary: result.summary,
        questions: result.suggestedQuestions
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsPrepLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {selectedFair ? (
                <button onClick={() => { setSelectedFair(null); setSelectedMeeting(null); setPrepResult(null); }} className="hover:text-indigo-600 flex items-center gap-2">
                   <span>←</span> {selectedFair.name}
                </button>
              ) : "Mis Próximas Ferias"}
            </h2>
            <p className="text-slate-500">
              {selectedFair ? "Gestión de reuniones y agenda" : "Organiza tu participación en eventos comerciales."}
            </p>
          </div>

          {!selectedFair && (
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ej: MWC Barcelona 2025" 
                value={newFairName}
                onChange={(e) => setNewFairName(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
                disabled={isSearching}
              />
              <button 
                onClick={addNewFair}
                disabled={isSearching}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isSearching ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Buscando...</>
                ) : (
                  <><span>+</span> Añadir Feria</>
                )}
              </button>
            </div>
          )}
        </header>

        {selectedFair ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    🗓️ Reuniones Confirmadas
                  </h3>
                  <button 
                    onClick={() => addMeeting(selectedFair.id)}
                    className="text-indigo-600 text-sm font-bold hover:underline"
                  >
                    + Agendar Nueva
                  </button>
                </div>
                <MeetingList 
                  meetings={selectedFair.meetings} 
                  onSelectMeeting={(m) => {
                    setSelectedMeeting(m);
                    analyzeMeeting(m);
                  }} 
                />
              </section>

              {selectedFair.description && (
                <section className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                  <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-2">Información Extraída por IA</h3>
                  <div className="text-slate-700 text-sm leading-relaxed prose prose-indigo">
                    {selectedFair.description}
                  </div>
                  {selectedFair.groundingSources && selectedFair.groundingSources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-indigo-100">
                      <p className="text-xs font-bold text-indigo-600 mb-2">Fuentes consultadas:</p>
                      <ul className="flex flex-wrap gap-2">
                        {selectedFair.groundingSources.map((source, idx) => (
                          <li key={idx}>
                            <a 
                              href={source.uri} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-[10px] bg-white px-2 py-1 rounded border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors"
                            >
                              {source.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                {selectedMeeting ? (
                  <div className="bg-white border border-indigo-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
                    <div className="bg-indigo-600 p-4 text-white">
                      <h4 className="font-bold">{selectedMeeting.contactName}</h4>
                      <p className="text-xs text-indigo-100">{selectedMeeting.company}</p>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Historial Previo</p>
                        <p className="text-sm text-slate-600 mt-1">{selectedMeeting.previousTalks}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Objetivo</p>
                        <p className="text-sm text-slate-700 font-medium mt-1">{selectedMeeting.goals}</p>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                         <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold text-indigo-600">PREPARACIÓN CON IA</p>
                            {isPrepLoading && <span className="w-3 h-3 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></span>}
                         </div>
                         
                         {prepResult ? (
                           <div className="space-y-3">
                              <div className="bg-indigo-50 p-3 rounded-lg text-xs text-slate-700 italic">
                                "{prepResult.summary}"
                              </div>
                              <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-500 mb-1">Preguntas clave para hoy:</p>
                                {prepResult.questions.map((q, i) => (
                                  <div key={i} className="flex gap-2 text-xs text-slate-600">
                                    <span className="text-indigo-500 font-bold">•</span>
                                    {q}
                                  </div>
                                ))}
                              </div>
                           </div>
                         ) : !isPrepLoading && (
                           <button 
                             onClick={() => analyzeMeeting(selectedMeeting)}
                             className="w-full py-2 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                           >
                             Recalcular Insights
                           </button>
                         )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-dashed border-slate-300 p-8 rounded-2xl text-center">
                    <p className="text-slate-400 text-sm">Selecciona una reunión para ver la preparación de la IA.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fairs.map(fair => (
              <FairCard 
                key={fair.id} 
                fair={fair} 
                onClick={() => setSelectedFair(fair)} 
              />
            ))}
            
            {fairs.length === 0 && !isSearching && (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="text-6xl mb-4">🌍</div>
                <h3 className="text-xl font-bold text-slate-400">¿A qué feria vas a ir?</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Introduce el nombre de una feria comercial arriba y usaremos la potencia de Gemini con Google Search para encontrarte los detalles.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
