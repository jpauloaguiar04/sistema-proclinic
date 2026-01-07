import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  FileText, Save, CheckCircle, Search, Activity, Printer, User, Filter, 
  BookOpen, Plus, Trash2, ArrowRight, MessageSquare 
} from 'lucide-react';

const BASE_URL = 'http://172.16.1.207:5000/api';

export default function Laudos() {
  const [abaAtiva, setAbaAtiva] = useState<'EMISSAO' | 'PADROES'>('EMISSAO');

  // --- WORKLIST / EMISSÃO ---
  const [worklist, setWorklist] = useState<any[]>([]);
  const [medicos, setMedicos] = useState<any[]>([]);
  const [mascarasLista, setMascarasLista] = useState<any[]>([]); // Dropdown de padrões
  
  // Editor
  const [selecionado, setSelecionado] = useState<any>(null);
  const [textoLaudo, setTextoLaudo] = useState('');
  const [medicoAssinanteId, setMedicoAssinanteId] = useState('');
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Frases de Atalho (Carregadas ao selecionar um padrão)
  const [frasesAtivas, setFrasesAtivas] = useState<any[]>([]);

  // Filtros
  const [filtroInicio, setFiltroInicio] = useState(new Date().toISOString().split('T')[0]);
  const [filtroFim, setFiltroFim] = useState(new Date().toISOString().split('T')[0]);
  const [filtroTexto, setFiltroTexto] = useState('');

  // --- CONFIGURAÇÃO DE PADRÕES ---
  const [padraoSelecionadoId, setPadraoSelecionadoId] = useState<number | null>(null);
  const [formPadrao, setFormPadrao] = useState({ id: 0, titulo: '', conteudo: '' });
  const [frasesDoPadrao, setFrasesDoPadrao] = useState<any[]>([]);
  const [novaFrase, setNovaFrase] = useState({ titulo: '', texto: '' });

  // INICIALIZAÇÃO
  useEffect(() => { 
    carregarMedicos(); 
    carregarListaMascaras();
    if (abaAtiva === 'EMISSAO') carregarWorklist();
  }, [abaAtiva]);

  // --- API ---
  const carregarMedicos = async () => { const res = await axios.get(`${BASE_URL}/Medicos`); setMedicos(res.data); };
  const carregarListaMascaras = async () => { const res = await axios.get(`${BASE_URL}/Mascaras`); setMascarasLista(res.data); };
  const carregarWorklist = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/Laudos/worklist?inicio=${filtroInicio}&fim=${filtroFim}&modalidade=${filtroTexto}`);
      setWorklist(res.data);
    } catch (e) {}
  };

  // --- EMISSÃO ---
  const abrirExame = async (id: number) => {
    try {
      const res = await axios.get(`${BASE_URL}/Laudos/${id}`);
      setSelecionado(res.data);
      setTextoLaudo(res.data.textoLaudo || '');
      if (res.data.medicoLaudoId) setMedicoAssinanteId(res.data.medicoLaudoId.toString());
      setFrasesAtivas([]); // Limpa frases anteriores
    } catch (e) { alert("Erro."); }
  };

  const carregarPadraoNoEditor = async (idMascara: string) => {
    if (!idMascara) return;
    try {
      const res = await axios.get(`${BASE_URL}/Mascaras/${idMascara}`);
      const { mascara, frases } = res.data;
      
      if (textoLaudo && !confirm("Substituir texto atual pelo padrão?")) return;
      
      setTextoLaudo(mascara.conteudo);
      setFrasesAtivas(frases); // Ativa os botões de atalho na lateral
    } catch (e) { alert("Erro ao carregar padrão."); }
  };

  const inserirFrase = (textoFrase: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    // Insere onde o cursor está
    const newText = text.substring(0, start) + "\n" + textoFrase + text.substring(end);
    
    setTextoLaudo(newText);
    
    // Devolve o foco
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + textoFrase.length + 1, start + textoFrase.length + 1);
    }, 0);
  };

  const salvarLaudo = async (acao: 'SALVAR' | 'ASSINAR') => {
    if (!selecionado) return;
    if (acao === 'ASSINAR') {
        if (!medicoAssinanteId) return alert("Selecione o médico.");
        if (!confirm("Assinar eletronicamente?")) return;
    }
    try {
      await axios.put(`${BASE_URL}/Laudos/${selecionado.id}`, {
        texto: textoLaudo, acao: acao, medicoId: acao === 'ASSINAR' ? Number(medicoAssinanteId) : null
      });
      alert(acao === 'ASSINAR' ? "Assinado!" : "Salvo.");
      if (acao === 'ASSINAR') {
        const m = medicos.find(x => x.id === Number(medicoAssinanteId));
        setSelecionado({ ...selecionado, statusLaudo: 'Assinado', textoLaudo, assinaturaMedico: m?.assinaturaBase64, nomeMedico: m?.nome, crmMedico: m?.crm, ufMedico: m?.uf });
        carregarWorklist();
      }
    } catch (e) { alert("Erro ao salvar."); }
  };

  const imprimirLaudo = () => {
    if (!selecionado) return;
    const w = window.open('', '', 'width=900,height=700');
    if(w) {
        w.document.write(`<html><head><title>${selecionado.nomePaciente}</title><style>body{font-family:serif;padding:40px;}.center{text-align:center;}.ass img{height:60px;}</style></head><body>
        <div class="center"><h1>PROCLINIC DIAGNÓSTICOS</h1><hr/></div>
        <p><strong>PACIENTE:</strong> ${selecionado.nomePaciente}</p><p><strong>EXAME:</strong> ${selecionado.nomeExame}</p>
        <br/><div style="white-space: pre-wrap;">${textoLaudo}</div><br/><br/><br/>
        <div class="center ass">${selecionado.assinaturaMedico ? `<img src="${selecionado.assinaturaMedico}"/><br/>` : ''}_________________________<br/>Dr(a) ${selecionado.nomeMedico || 'Médico'}<br/>CRM ${selecionado.crmMedico || ''}</div>
        <script>window.print()</script></body></html>`);
        w.document.close();
    }
  };

  // --- LÓGICA DE CADASTRO DE PADRÕES ---
  const selecionarPadraoParaEditar = async (id: number) => {
    setPadraoSelecionadoId(id);
    const res = await axios.get(`${BASE_URL}/Mascaras/${id}`);
    setFormPadrao(res.data.mascara);
    setFrasesDoPadrao(res.data.frases);
  };

  const salvarPadraoBase = async () => {
    if (!formPadrao.titulo) return alert("Titulo obrigatório");
    try {
        if (formPadrao.id) await axios.put(`${BASE_URL}/Mascaras/${formPadrao.id}`, formPadrao);
        else {
            const res = await axios.post(`${BASE_URL}/Mascaras`, formPadrao);
            setFormPadrao(res.data);
            setPadraoSelecionadoId(res.data.id);
        }
        alert("Padrão salvo! Agora adicione as frases.");
        carregarListaMascaras();
    } catch (e) { alert("Erro ao salvar."); }
  };

  const adicionarFrase = async () => {
    if (!padraoSelecionadoId) return alert("Salve o padrão primeiro.");
    if (!novaFrase.titulo || !novaFrase.texto) return alert("Preencha título e texto da frase.");
    try {
        await axios.post(`${BASE_URL}/Mascaras/${padraoSelecionadoId}/frases`, novaFrase);
        setNovaFrase({ titulo: '', texto: '' });
        // Recarrega frases
        const res = await axios.get(`${BASE_URL}/Mascaras/${padraoSelecionadoId}`);
        setFrasesDoPadrao(res.data.frases);
    } catch (e) { alert("Erro ao adicionar frase."); }
  };

  const excluirFrase = async (id: number) => {
    if(!confirm("Apagar frase?")) return;
    await axios.delete(`${BASE_URL}/Mascaras/frases/${id}`);
    const res = await axios.get(`${BASE_URL}/Mascaras/${padraoSelecionadoId}`);
    setFrasesDoPadrao(res.data.frases);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 animate-fade-in">
      
      {/* MENU SUPERIOR */}
      <div className="bg-white px-6 pt-4 border-b border-slate-200 shadow-sm flex gap-6">
        <button onClick={() => setAbaAtiva('EMISSAO')} className={`pb-3 px-2 font-bold text-sm border-b-2 transition ${abaAtiva === 'EMISSAO' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
            <Activity className="inline mr-2" size={18}/> EMISSÃO DE LAUDOS
        </button>
        <button onClick={() => setAbaAtiva('PADROES')} className={`pb-3 px-2 font-bold text-sm border-b-2 transition ${abaAtiva === 'PADROES' ? 'text-orange-600 border-orange-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
            <BookOpen className="inline mr-2" size={18}/> CADASTRO DE MODELOS & FRASES
        </button>
      </div>

      {/* --- ABA EMISSÃO --- */}
      {abaAtiva === 'EMISSAO' && (
        <div className="flex flex-1 overflow-hidden">
            {/* 1. WORKLIST */}
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm z-20">
                <div className="p-3 border-b bg-slate-50 space-y-2">
                    <div className="flex gap-2 text-xs"><input type="date" className="border rounded p-1 w-full" value={filtroInicio} onChange={e => setFiltroInicio(e.target.value)}/><input type="date" className="border rounded p-1 w-full" value={filtroFim} onChange={e => setFiltroFim(e.target.value)}/></div>
                    <div className="flex gap-2"><input className="border rounded p-1 flex-1 text-xs" placeholder="Filtro..." value={filtroTexto} onChange={e => setFiltroTexto(e.target.value)}/><button onClick={carregarWorklist} className="bg-indigo-600 text-white p-1 rounded"><Filter size={14}/></button></div>
                </div>
                <div className="flex-1 overflow-auto p-2 space-y-2 bg-slate-50">
                    {worklist.map(item => (
                        <div key={item.id} onClick={() => abrirExame(item.id)} className={`p-3 rounded-lg cursor-pointer border text-sm ${selecionado?.id === item.id ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-slate-100'}`}>
                            <div className="font-bold truncate">{item.nomePaciente}</div>
                            <div className="text-xs opacity-80">{item.nomeExame}</div>
                            <div className="text-[10px] mt-1 opacity-60 flex justify-between"><span>OS: {item.ordemServico}</span><span>{new Date(item.dataHoraInicio).toLocaleDateString()}</span></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. EDITOR */}
            <div className="flex-1 flex flex-col bg-slate-100 h-full overflow-hidden relative">
                {!selecionado ? (
                    <div className="flex-1 flex items-center justify-center text-slate-400"><FileText size={64} className="mb-4 opacity-20"/><p>Selecione um exame.</p></div>
                ) : (
                    <>
                        {/* Toolbar */}
                        <div className="bg-white px-4 py-2 border-b flex justify-between items-center shadow-sm z-10">
                            <div><h1 className="font-bold text-slate-800 text-sm">{selecionado.nomePaciente}</h1><p className="text-xs text-slate-500">{selecionado.nomeExame}</p></div>
                            <div className="flex items-center gap-2">
                                {selecionado.statusLaudo !== 'Assinado' && (
                                    <>
                                        <select className="bg-orange-50 text-xs font-bold p-2 rounded border border-orange-200 text-orange-700" onChange={e => carregarPadraoNoEditor(e.target.value)}>
                                            <option value="">📂 Aplicar Padrão...</option>
                                            {mascarasLista.map(m => <option key={m.id} value={m.id}>{m.titulo}</option>)}
                                        </select>
                                        <div className="h-6 w-px bg-slate-200 mx-1"></div>
                                        <select className="text-xs border p-1 rounded w-32" value={medicoAssinanteId} onChange={e => setMedicoAssinanteId(e.target.value)}><option value="">Assinar como...</option>{medicos.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}</select>
                                        <button onClick={() => salvarLaudo('SALVAR')} className="px-3 py-1 text-xs border rounded font-bold hover:bg-slate-50">Salvar</button>
                                        <button onClick={() => salvarLaudo('ASSINAR')} className="px-3 py-1 bg-emerald-600 text-white text-xs rounded font-bold hover:bg-emerald-700">Assinar</button>
                                    </>
                                )}
                                {selecionado.statusLaudo === 'Assinado' && <button onClick={imprimirLaudo} className="px-3 py-1 bg-slate-800 text-white text-xs rounded font-bold">Imprimir</button>}
                            </div>
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Papel */}
                            <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-200/50">
                                <div className="w-full max-w-[21cm] bg-white shadow-2xl min-h-[29.7cm] p-[2.5cm] flex flex-col relative">
                                    <div className="border-b-2 border-slate-800 pb-4 mb-8 text-center opacity-80 select-none"><h2 className="text-xl font-bold tracking-widest">PROCLINIC</h2><p className="text-xs">DIAGNÓSTICOS</p></div>
                                    <textarea ref={editorRef} className={`flex-1 resize-none outline-none text-slate-900 text-lg leading-relaxed font-serif bg-transparent ${selecionado.statusLaudo === 'Assinado' ? 'cursor-not-allowed text-slate-600' : ''}`} value={textoLaudo} onChange={(e) => setTextoLaudo(e.target.value)} disabled={selecionado.statusLaudo === 'Assinado'} placeholder="Digite..."/>
                                    <div className="mt-10 pt-4 border-t text-center text-xs select-none">{selecionado.statusLaudo === 'Assinado' ? (<div className="flex flex-col items-center">{selecionado.assinaturaMedico && <img src={selecionado.assinaturaMedico} className="h-16 object-contain"/>}<b>Dr(a). {selecionado.nomeMedico}</b></div>) : (<span>Assinatura Digital</span>)}</div>
                                </div>
                            </div>

                            {/* 3. PAINEL DE FRASES (DIREITA) - SÓ APARECE SE TIVER FRASES CARREGADAS */}
                            {frasesAtivas.length > 0 && selecionado.statusLaudo !== 'Assinado' && (
                                <div className="w-64 bg-orange-50 border-l border-orange-200 p-4 overflow-auto shadow-inner">
                                    <h4 className="text-xs font-bold text-orange-800 uppercase mb-3 flex items-center"><MessageSquare size={14} className="mr-1"/> Frases Rápidas</h4>
                                    <div className="space-y-2">
                                        {frasesAtivas.map(f => (
                                            <button key={f.id} onClick={() => inserirFrase(f.texto)} className="w-full text-left p-2 bg-white border border-orange-100 rounded shadow-sm hover:bg-orange-100 hover:border-orange-300 text-xs text-slate-700 transition">
                                                <div className="font-bold text-orange-700 mb-1">{f.titulo}</div>
                                                <div className="truncate opacity-70">{f.texto}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
      )}

      {/* --- ABA PADRÕES (CADASTRO) --- */}
      {abaAtiva === 'PADROES' && (
        <div className="flex flex-1 p-6 gap-6 overflow-hidden">
            {/* LISTA DE MODELOS */}
            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <h3 className="font-bold text-slate-700">Modelos</h3>
                    <button onClick={() => { setPadraoSelecionadoId(null); setFormPadrao({id:0, titulo:'', conteudo:''}); setFrasesDoPadrao([]); }} className="bg-indigo-600 text-white p-1.5 rounded"><Plus size={16}/></button>
                </div>
                <div className="flex-1 overflow-auto p-2 space-y-2">
                    {mascarasLista.map(m => (
                        <div key={m.id} onClick={() => selecionarPadraoParaEditar(m.id)} className={`p-3 border rounded-lg cursor-pointer hover:bg-slate-50 ${padraoSelecionadoId === m.id ? 'border-indigo-500 bg-indigo-50' : ''}`}>
                            <div className="font-bold text-sm text-slate-800">{m.titulo}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* EDITOR DO MODELO */}
            <div className="w-2/3 flex flex-col gap-4">
                {/* DADOS BÁSICOS */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-700 mb-3">{formPadrao.id ? 'Editar Modelo' : 'Novo Modelo'}</h3>
                    <input className="input-premium mb-3" placeholder="Título (ex: RX Tórax Normal)" value={formPadrao.titulo} onChange={e => setFormPadrao({...formPadrao, titulo: e.target.value})}/>
                    <textarea className="input-premium flex-1 resize-none font-serif" placeholder="Texto Base..." value={formPadrao.conteudo} onChange={e => setFormPadrao({...formPadrao, conteudo: e.target.value})}/>
                    <div className="flex justify-end mt-3"><button onClick={salvarPadraoBase} className="bg-emerald-600 text-white px-6 py-2 rounded font-bold shadow">Salvar Texto Base</button></div>
                </div>

                {/* FRASES ASSOCIADAS */}
                {padraoSelecionadoId && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-1/3 flex flex-col">
                        <h3 className="font-bold text-slate-700 mb-2 flex items-center"><MessageSquare size={16} className="mr-2 text-orange-500"/> Frases / Atalhos deste Modelo</h3>
                        <div className="flex gap-2 mb-3">
                            <input className="input-premium w-1/3 text-xs" placeholder="Nome do Botão (ex: Pneumonia)" value={novaFrase.titulo} onChange={e => setNovaFrase({...novaFrase, titulo: e.target.value})}/>
                            <input className="input-premium flex-1 text-xs" placeholder="Texto a inserir..." value={novaFrase.texto} onChange={e => setNovaFrase({...novaFrase, texto: e.target.value})}/>
                            <button onClick={adicionarFrase} className="bg-orange-500 text-white px-4 rounded font-bold text-xs">Add</button>
                        </div>
                        <div className="flex-1 overflow-auto space-y-1 bg-slate-50 p-2 rounded border border-slate-100">
                            {frasesDoPadrao.map(f => (
                                <div key={f.id} className="flex justify-between items-center bg-white p-2 rounded border text-xs">
                                    <div><span className="font-bold text-orange-700">{f.titulo}:</span> {f.texto}</div>
                                    <button onClick={() => excluirFrase(f.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
}