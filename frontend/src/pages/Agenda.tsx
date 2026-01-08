import React, { useState, useEffect } from 'react';
import { Search, Calendar, CheckCircle, XCircle, Clock, FileText, DollarSign, Filter, AlertCircle, UserPlus, User, Check, Trash2, Printer, Plus } from 'lucide-react';
// Importa o Modal que criamos
import ModalNovoPaciente from '../components/ModalNovoPaciente';

// Aceita a prop de navegação do App.tsx
export default function Agenda({ onNavigate }: any) {
  const [agendas, setAgendas] = useState<any[]>([]);
  const [convenios, setConvenios] = useState<any[]>([]);
  const [servicos, setServicos] = useState<any[]>([]);
  const [pacientesCache, setPacientesCache] = useState<any[]>([]);
  
  // Estado para armazenar médicos solicitantes
  const [listaSolicitantes, setListaSolicitantes] = useState<any[]>([]);

  // Filtros
  const [agendaSelecionada, setAgendaSelecionada] = useState<string>('');
  const [dataSelecionada, setDataSelecionada] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modais
  const [modalAgendarAberto, setModalAgendarAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [modalPacienteAberto, setModalPacienteAberto] = useState(false); // <--- ESTADO DO MODAL DE PACIENTE
  
  const [slotFocado, setSlotFocado] = useState('');
  const [agendamentoFocado, setAgendamentoFocado] = useState<any>(null);
  
  // Forms
  const [termoBusca, setTermoBusca] = useState('');
  const [pacienteSelecionado, setPacienteSelecionado] = useState<any>(null);
  
  const [formNovo, setFormNovo] = useState({ 
    convenioId: '', 
    servicoId: '', 
    medicoSolicitanteId: '' 
  });

  const [formConfirmar, setFormConfirmar] = useState({
    numeroCarteirinha: '',
    numeroGuia: '',
    senhaAutorizacao: '',
    valorFinal: 0, 
    formaPagamento: 'DINHEIRO',
    pago: false,
    convenioId: ''
  });

  const API_URL = '/api'; // Caminho relativo para funcionar com o proxy

  useEffect(() => { carregarDadosIniciais(); }, []);
  useEffect(() => { if (agendaSelecionada) carregarSlots(); }, [agendaSelecionada, dataSelecionada]);

  const carregarDadosIniciais = async () => {
    try {
      const [resAgendas, resConv, resServ, resPac, resMed] = await Promise.all([
        fetch(`${API_URL}/Agendas`), 
        fetch(`${API_URL}/Convenios`), 
        fetch(`${API_URL}/Servicos`), 
        fetch(`${API_URL}/Pacientes`),
        fetch(`${API_URL}/Medicos`)
      ]);

      if (resAgendas.ok) {
        const data = await resAgendas.json();
        setAgendas(data);
        if (data.length > 0) setAgendaSelecionada(data[0].id.toString());
      }
      if (resConv.ok) setConvenios(await resConv.json());
      if (resServ.ok) setServicos(await resServ.json());
      if (resPac.ok) setPacientesCache(await resPac.json());

      if (resMed.ok) {
        const todosMedicos = await resMed.json();
        setListaSolicitantes(todosMedicos.filter((m: any) => m.ehSolicitante === true));
      }

    } catch (e) { console.error(e); }
  };

  const carregarSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/Agendamentos/slots?agendaId=${agendaSelecionada}&data=${dataSelecionada}`);
      if (res.ok) setSlots(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  // --- LÓGICA DO NOVO PACIENTE (MODAL) ---
  const handlePacienteCriado = (novoPaciente: any) => {
    // 1. Adiciona na lista local (cache) para aparecer nas buscas futuras
    setPacientesCache((prev) => [...prev, novoPaciente]);
    
    // 2. Já seleciona ele automaticamente
    setPacienteSelecionado(novoPaciente);
    setTermoBusca(novoPaciente.nome); // Preenche o campo de busca visualmente

    // 3. Se o paciente já tem convênio padrão, tenta selecionar no agendamento também
    if (novoPaciente.convenioId) {
        setFormNovo(prev => ({ ...prev, convenioId: novoPaciente.convenioId.toString() }));
    }
  };

  // --- NOVO AGENDAMENTO ---
  const abrirModalAgendar = (hora: string) => {
    setSlotFocado(hora);
    setTermoBusca('');
    setPacienteSelecionado(null);
    setFormNovo({ convenioId: '', servicoId: '', medicoSolicitanteId: '' });
    setModalAgendarAberto(true);
  };

  const resultadosBusca = pacientesCache.filter(p => {
    if (!termoBusca) return false;
    const t = termoBusca.toLowerCase();
    return p.nome.toLowerCase().includes(t) || p.cpf.includes(t);
  });

  const salvarAgendamento = async () => {
    if (!pacienteSelecionado) return alert("Selecione um paciente");
    
    const payload = {
      agendaConfigId: parseInt(agendaSelecionada),
      cpfPaciente: pacienteSelecionado.cpf,
      dataHoraInicio: `${dataSelecionada}T${slotFocado}:00`,
      convenioId: formNovo.convenioId ? parseInt(formNovo.convenioId) : null,
      servicoId: formNovo.servicoId ? parseInt(formNovo.servicoId) : null,
      medicoSolicitanteId: formNovo.medicoSolicitanteId ? parseInt(formNovo.medicoSolicitanteId) : null,
      status: "Agendado"
    };

    try {
      const res = await fetch(`${API_URL}/Agendamentos`, {
        method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
      });
      if (res.ok) { setModalAgendarAberto(false); carregarSlots(); }
    } catch (e) { console.error(e); }
  };

  // --- CHECK-IN / CONFIRMAÇÃO ---
  const abrirModalDetalhes = async (slot: any) => {
    try {
        const id = slot.agendamentoId || slot.AgendamentoId;
        const res = await fetch(`${API_URL}/Agendamentos/${id}`);
        if(res.ok) {
            const dados = await res.json();
            setAgendamentoFocado(dados);
            setFormConfirmar({
                numeroCarteirinha: dados.numeroCarteirinha || '',
                numeroGuia: dados.numeroGuia || '',
                senhaAutorizacao: dados.senhaAutorizacao || '',
                valorFinal: dados.valorFinal || 0,
                formaPagamento: dados.formaPagamento || 'DINHEIRO',
                pago: dados.pago || false,
                convenioId: dados.convenioId || ''
            });
            setModalDetalhesAberto(true);
        }
    } catch (e) { console.error(e); }
  };

  const confirmarAtendimento = async () => {
    if(!agendamentoFocado) return;

    let valorSeguro = parseFloat(formConfirmar.valorFinal.toString());
    if (isNaN(valorSeguro)) valorSeguro = 0;

    const payload = {
        ...agendamentoFocado,
        ...formConfirmar,
        valorFinal: valorSeguro,
        convenioId: formConfirmar.convenioId ? parseInt(formConfirmar.convenioId.toString()) : null
    };

    try {
        const res = await fetch(`${API_URL}/Agendamentos/${agendamentoFocado.id}/confirmar`, {
            method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
        });
        if(res.ok) {
            alert("Confirmado!");
            setModalDetalhesAberto(false);
            carregarSlots();
        } else { alert("Erro ao confirmar"); }
    } catch (e) { console.error(e); }
  };

  const cancelarAgendamento = async () => {
      if(!confirm("Cancelar?")) return;
      await fetch(`${API_URL}/Agendamentos/${agendamentoFocado.id}/cancelar`, { method: 'PUT' });
      setModalDetalhesAberto(false);
      carregarSlots();
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">DATA</label>
          <input type="date" className="border p-2 rounded-lg" value={dataSelecionada} onChange={e => setDataSelecionada(e.target.value)} />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-500 mb-1">AGENDA</label>
          <select className="w-full border p-2 rounded-lg" value={agendaSelecionada} onChange={e => setAgendaSelecionada(e.target.value)}>
            {agendas.map((a: any) => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
        </div>
        <button onClick={carregarSlots} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex gap-2"><Filter size={18}/> Atualizar</button>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-auto">
        <table className="w-full text-left">
            <thead className="bg-slate-100 sticky top-0">
                <tr><th className="p-4">Horário</th><th className="p-4">Paciente</th><th className="p-4 text-center">Ação</th></tr>
            </thead>
            <tbody className="divide-y">
                {slots.map((s: any, i) => (
                    <tr key={i} className={`hover:bg-slate-50 ${!s.disponivel ? 'bg-indigo-50/40' : ''}`}>
                        <td className="p-4 font-bold font-mono text-slate-600">{s.hora}</td>
                        <td className="p-4">
                            {s.disponivel ? <span className="text-slate-400 italic text-sm">Disponível</span> : 
                            <div><span className="font-bold">{s.pacienteNome}</span> <span className="text-xs bg-slate-200 px-1 rounded">{s.status}</span></div>}
                        </td>
                        <td className="p-4 text-center">
                            {s.disponivel ? 
                                <button onClick={() => abrirModalAgendar(s.hora)} className="text-indigo-600 hover:bg-indigo-100 p-2 rounded"><UserPlus/></button> : 
                                <button onClick={() => abrirModalDetalhes(s)} className="text-slate-500 hover:text-indigo-600 p-2 rounded"><CheckCircle/></button>
                            }
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* MODAL NOVO AGENDAMENTO */}
      {modalAgendarAberto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-lg p-6">
                <h3 className="font-bold text-lg mb-4">Novo Agendamento ({slotFocado})</h3>
                <div className="flex gap-2 mb-2">
                    <input autoFocus className="flex-1 border p-2 rounded" placeholder="Buscar Paciente..." value={termoBusca} onChange={e => setTermoBusca(e.target.value)} />
                    
                    {/* Botão que abre o Modal de Cadastro Rápido */}
                    <button 
                        onClick={() => setModalPacienteAberto(true)} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded shadow transition-colors" 
                        title="Cadastrar Novo Paciente Rápido"
                    >
                        <Plus/>
                    </button>
                </div>
                
                <div className="h-32 overflow-y-auto border rounded mb-4">
                    {resultadosBusca.length === 0 && termoBusca.length > 2 && (
                        <div className="p-4 text-center text-sm text-slate-400">Nenhum paciente encontrado. <br/>Clique em + para cadastrar.</div>
                    )}
                    {resultadosBusca.map(p => (
                        <div key={p.id} onClick={() => setPacienteSelecionado(p)} className={`p-2 cursor-pointer hover:bg-slate-100 ${pacienteSelecionado?.id === p.id ? 'bg-indigo-100' : ''}`}>
                            <div className="font-bold">{p.nome}</div><div className="text-xs">{p.cpf}</div>
                        </div>
                    ))}
                </div>

                <div className="space-y-2 mb-4">
                    <select className="w-full border p-2 rounded" value={formNovo.convenioId} onChange={e => setFormNovo({...formNovo, convenioId: e.target.value})}>
                        <option value="">Selecione o Convênio</option>
                        {convenios.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                    
                    <select className="w-full border p-2 rounded" value={formNovo.servicoId} onChange={e => setFormNovo({...formNovo, servicoId: e.target.value})}>
                        <option value="">Selecione o Exame</option>
                        {servicos.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                    </select>

                    <div className="relative">
                        <label className="text-xs font-bold text-slate-500 ml-1 block mb-1">Médico Solicitante (Para Guia)</label>
                        <select 
                            className="w-full border p-2 rounded bg-slate-50 focus:bg-white" 
                            value={formNovo.medicoSolicitanteId} 
                            onChange={e => setFormNovo({...formNovo, medicoSolicitanteId: e.target.value})}
                        >
                            <option value="">Nenhum / Particular</option>
                            {listaSolicitantes.map(m => (
                                <option key={m.id} value={m.id}>
                                    {m.nome} (CRM {m.crm})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button disabled={!pacienteSelecionado} onClick={salvarAgendamento} className="w-full bg-indigo-600 text-white p-2 rounded font-bold disabled:opacity-50">Confirmar</button>
                <button onClick={() => setModalAgendarAberto(false)} className="w-full mt-2 text-slate-500">Cancelar</button>
            </div>
        </div>
      )}

      {/* MODAL DETALHES / CHECK-IN */}
      {modalDetalhesAberto && agendamentoFocado && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-lg p-6">
                <h3 className="font-bold text-lg mb-4">Check-in / Detalhes</h3>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-bold text-slate-500">Convênio</label>
                        <select className="w-full border p-2 rounded" value={formConfirmar.convenioId} onChange={e => setFormConfirmar({...formConfirmar, convenioId: e.target.value})}>
                            <option value="">Particular / Nenhum</option>
                            {convenios.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500">Dados TISS</label>
                        <input className="w-full border p-2 rounded mb-2" placeholder="Carteirinha" value={formConfirmar.numeroCarteirinha} onChange={e => setFormConfirmar({...formConfirmar, numeroCarteirinha: e.target.value})} />
                        <input className="w-full border p-2 rounded" placeholder="Guia" value={formConfirmar.numeroGuia} onChange={e => setFormConfirmar({...formConfirmar, numeroGuia: e.target.value})} />
                    </div>
                    
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <DollarSign size={14} className="absolute left-2 top-3 text-slate-400"/>
                            <input 
                                type="number" 
                                className="w-full pl-6 p-2 border rounded" 
                                placeholder="0.00"
                                value={formConfirmar.valorFinal} 
                                onChange={e => setFormConfirmar({...formConfirmar, valorFinal: e.target.value ? parseFloat(e.target.value) : 0})} 
                            />
                        </div>
                        <select className="border p-2 rounded flex-1" value={formConfirmar.formaPagamento} onChange={e => setFormConfirmar({...formConfirmar, formaPagamento: e.target.value})}>
                            <option value="DINHEIRO">Dinheiro</option>
                            <option value="FATURAMENTO">Faturar (Convênio)</option>
                            <option value="CARTAO_CREDITO">Cartão Crédito</option>
                            <option value="CARTAO_DEBITO">Cartão Débito</option>
                        </select>
                    </div>
                    <label className="flex items-center gap-2 font-bold text-slate-700 bg-slate-100 p-2 rounded">
                        <input type="checkbox" className="w-5 h-5" checked={formConfirmar.pago} onChange={e => setFormConfirmar({...formConfirmar, pago: e.target.checked})} /> 
                        Pagamento Recebido / Autorizado
                    </label>
                </div>
                <div className="flex justify-between mt-6 pt-4 border-t">
                    <button onClick={cancelarAgendamento} className="text-red-500 font-bold"><Trash2 size={18}/> Cancelar</button>
                    <div className="flex gap-2">
                        <button onClick={() => setModalDetalhesAberto(false)} className="px-4 py-2 border rounded">Voltar</button>
                        <button onClick={confirmarAtendimento} className="px-6 py-2 bg-emerald-600 text-white rounded font-bold">Salvar Check-in</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL DE CADASTRO RÁPIDO (COM CONVÊNIOS) --- */}
      <ModalNovoPaciente 
        isOpen={modalPacienteAberto}
        onClose={() => setModalPacienteAberto(false)}
        onPacienteSalvo={handlePacienteCriado}
        convenios={convenios} // <--- AQUI ESTÁ A CORREÇÃO IMPORTANTE
      />

    </div>
  );
}