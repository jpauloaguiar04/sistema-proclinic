import React, { useState, useEffect } from 'react';
import { FileText, Download, CheckSquare, Edit, Save, X, Archive, List, Wallet, Calendar, Plus, Trash2, Package } from 'lucide-react';

export default function Faturamento() {
  const [tab, setTab] = useState<'caixa' | 'pendentes' | 'lotes'>('caixa');
  
  const [pendentes, setPendentes] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [caixa, setCaixa] = useState<any>(null);
  const [dataCaixa, setDataCaixa] = useState(new Date().toISOString().split('T')[0]);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal Editor
  const [modalAberto, setModalAberto] = useState(false);
  const [guia, setGuia] = useState<any>(null);
  const [valorProcedimento, setValorProcedimento] = useState<number>(0);
  const [despesas, setDespesas] = useState<any[]>([]);
  
  // Lista de Materiais Pré-Cadastrados
  const [catalogoMateriais, setCatalogoMateriais] = useState<any[]>([]);
  
  // Form Nova Despesa
  const [novaDespesa, setNovaDespesa] = useState({ descricao: '', quantidade: 1, valorUnitario: 0, codigo: 'MAT' });

  const API_URL = '/api';

  useEffect(() => {
    if (tab === 'pendentes') carregarPendentes();
    else if (tab === 'lotes') carregarLotes();
    else carregarCaixa();
  }, [tab, dataCaixa]);

  // Carrega o catálogo de materiais para usar no Select
  useEffect(() => {
      fetch(`${API_URL}/Materiais`).then(r => r.ok ? r.json() : []).then(setCatalogoMateriais);
  }, []);

  const carregarCaixa = async () => { try { const res = await fetch(`${API_URL}/Faturamento/caixa?data=${dataCaixa}`); if(res.ok) setCaixa(await res.json()); } catch (e) {} }
  const carregarPendentes = async () => { try { const res = await fetch(`${API_URL}/Faturamento/pendentes`); if(res.ok) setPendentes(await res.json()); } catch (e) {} }
  const carregarLotes = async () => { try { const res = await fetch(`${API_URL}/Faturamento/lotes`); if(res.ok) setLotes(await res.json()); } catch (e) {} }
  const toggleSelecao = (id: number) => { setSelecionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); };
  
  const gerarLote = async () => {
      if(selecionados.length === 0) return alert("Selecione itens");
      if(!confirm("Gerar lote XML?")) return;
      try { await fetch(`${API_URL}/Faturamento/gerar-xml`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(selecionados) }); alert("Lote gerado!"); setSelecionados([]); setTab('lotes'); } catch(e) { alert("Erro"); }
  };
  const baixarXml = (id: number) => { window.open(`${API_URL}/Faturamento/lote/${id}/xml`, '_blank'); };

  const abrirEditor = async (agendamentoId: number) => {
    setLoading(true);
    try {
        const res = await fetch(`${API_URL}/Faturamento/guia/${agendamentoId}`);
        if(res.ok) {
            const data = await res.json();
            setGuia(data.guia);
            setValorProcedimento(data.valorProcedimento);
            if(data.guia.id > 0) carregarDespesas(data.guia.id);
            else setDespesas([]);
            setModalAberto(true);
        }
    } catch (e) { alert("Erro ao carregar"); }
    finally { setLoading(false); }
  };

  const carregarDespesas = async (guiaId: number) => {
      try { const res = await fetch(`${API_URL}/Faturamento/despesas/${guiaId}`); if(res.ok) setDespesas(await res.json()); } catch(e) {}
  };

  const salvarGuia = async () => {
      try {
          const payload = { guia, valorProcedimento };
          const res = await fetch(`${API_URL}/Faturamento/salvar-guia`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
          if(res.ok) { alert("Guia salva!"); setModalAberto(false); carregarPendentes(); }
      } catch (e) { alert("Erro ao salvar"); }
  };

  // Funcao para quando selecionar um kit no dropdown
  const selecionarMaterialCatalogo = (idStr: string) => {
      const id = parseInt(idStr);
      const mat = catalogoMateriais.find(m => m.id === id);
      if(mat) {
          setNovaDespesa({
              descricao: mat.nome,
              quantidade: 1,
              valorUnitario: mat.precoBase,
              codigo: mat.codigoTuss || 'MAT'
          });
      } else {
          // Limpa se selecionar a opção padrão
          setNovaDespesa({ descricao: '', quantidade: 1, valorUnitario: 0, codigo: 'MAT' });
      }
  };

  const adicionarDespesa = async () => {
      if(guia.id === 0) return alert("Salve a guia principal antes de adicionar kits.");
      try {
          const payload = { ...novaDespesa, guiaTissId: guia.id };
          const res = await fetch(`${API_URL}/Faturamento/despesas`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload) });
          if(res.ok) {
              setNovaDespesa({ descricao: '', quantidade: 1, valorUnitario: 0, codigo: 'MAT' });
              carregarDespesas(guia.id);
          }
      } catch(e) { alert("Erro ao adicionar item"); }
  };

  const removerDespesa = async (id: number) => {
      if(!confirm("Excluir item?")) return;
      await fetch(`${API_URL}/Faturamento/despesas/${id}`, { method: 'DELETE' });
      carregarDespesas(guia.id);
  };

  return (
    <div className="p-8 h-full bg-slate-50 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><FileText className="text-green-600"/> Financeiro & TISS</h1>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('caixa')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${tab === 'caixa' ? 'bg-white shadow text-emerald-600' : 'text-slate-500 hover:bg-slate-200'}`}><Wallet size={18}/> Fluxo de Caixa</button>
        <button onClick={() => setTab('pendentes')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${tab === 'pendentes' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:bg-slate-200'}`}><List size={18}/> Guias Pendentes</button>
        <button onClick={() => setTab('lotes')} className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition ${tab === 'lotes' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:bg-slate-200'}`}><Archive size={18}/> Lotes Gerados</button>
      </div>

      {tab === 'caixa' && caixa && (
          <div className="flex-1 space-y-4">
              <div className="bg-white p-4 rounded-xl shadow border flex items-center gap-4">
                  <Calendar className="text-slate-500"/>
                  <input type="date" className="border p-2 rounded font-bold text-lg" value={dataCaixa} onChange={e => setDataCaixa(e.target.value)} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                  <div className="bg-emerald-600 text-white p-6 rounded-xl shadow-lg">
                      <div className="text-emerald-100 font-bold text-sm uppercase">Total Recebido</div>
                      <div className="text-4xl font-bold mt-2">R$ {caixa.totalGeral?.toFixed(2)}</div>
                  </div>
                  <div className="col-span-2 bg-white p-6 rounded-xl shadow border">
                      <h3 className="font-bold text-slate-700 mb-4">Detalhamento</h3>
                      {caixa.detalhamento?.map((d: any, i: number) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded mb-2">
                              <span className="font-bold text-slate-600">{d.forma}</span>
                              <div className="flex gap-4"><span className="text-slate-400">{d.qtd} exames</span><span className="font-bold">R$ {d.total.toFixed(2)}</span></div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {tab === 'pendentes' && (
        <div className="flex-1 bg-white rounded-xl shadow border border-slate-200 p-4 flex flex-col">
            <div className="flex justify-between mb-4">
                <h3 className="font-bold text-slate-700">Faturamento TISS</h3>
                <button onClick={gerarLote} className="bg-green-600 text-white px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-green-700"><Download size={18}/> Gerar XML ({selecionados.length})</button>
            </div>
            <div className="overflow-auto flex-1">
                <table className="w-full text-left">
                    <thead className="bg-slate-100"><tr><th className="p-3 w-10"><CheckSquare size={18}/></th><th className="p-3">Data</th><th className="p-3">Paciente</th><th className="p-3">Convênio</th><th className="p-3">Exame</th><th className="p-3 text-right">Valor</th><th className="p-3 text-center">Ação</th></tr></thead>
                    <tbody>
                        {pendentes.map((p: any) => (
                            <tr key={p.id} className="border-b hover:bg-slate-50">
                                <td className="p-3"><input type="checkbox" checked={selecionados.includes(p.id)} onChange={() => toggleSelecao(p.id)} className="w-4 h-4"/></td>
                                <td className="p-3 text-sm">{new Date(p.data).toLocaleDateString()}</td>
                                <td className="p-3 font-bold">{p.paciente}</td>
                                <td className="p-3 text-sm">{p.convenio}</td>
                                <td className="p-3 text-sm">{p.exame}</td>
                                <td className="p-3 text-right font-mono">R$ {p.valor.toFixed(2)}</td>
                                <td className="p-3 text-center"><button onClick={() => abrirEditor(p.id)} className="text-indigo-600 bg-indigo-50 p-2 rounded hover:bg-indigo-100"><Edit size={18}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* MODAL EDITOR COMPLETO */}
      {modalAberto && guia && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden">
                <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><Edit size={20}/> Editor de Guia</h3>
                    <button onClick={() => setModalAberto(false)}><X/></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-6">
                    {/* VALOR DO EXAME */}
                    <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase border-b pb-2 mb-3">Valor do Procedimento Principal</h4>
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-bold">Valor (R$):</label>
                            <input type="number" className="border p-2 rounded w-32 font-bold text-lg" value={valorProcedimento} onChange={e => setValorProcedimento(parseFloat(e.target.value))} />
                            <span className="text-xs text-slate-400">Este valor será atualizado no sistema ao salvar.</span>
                        </div>
                    </div>

                    {/* DADOS AUTORIZAÇÃO */}
                    <div className="bg-white p-4 rounded-lg border shadow-sm grid grid-cols-4 gap-4">
                        <div className="col-span-4 text-xs font-bold text-indigo-600 uppercase border-b pb-2 mb-2">Autorização</div>
                        <div><label className="block text-xs font-bold">Guia Op.</label><input className="w-full border p-1 rounded" value={guia.numeroGuiaOperadora || ''} onChange={e => setGuia({...guia, numeroGuiaOperadora: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold">Senha</label><input className="w-full border p-1 rounded" value={guia.senha || ''} onChange={e => setGuia({...guia, senha: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold">Carteirinha</label><input className="w-full border p-1 rounded" value={guia.numeroCarteira || ''} onChange={e => setGuia({...guia, numeroCarteira: e.target.value})} /></div>
                        <div><label className="block text-xs font-bold">Data Val.</label><input type="date" className="w-full border p-1 rounded" value={guia.dataValidadeSenha?.split('T')[0] || ''} onChange={e => setGuia({...guia, dataValidadeSenha: e.target.value})} /></div>
                    </div>

                    {/* KITS E DESPESAS */}
                    <div className="bg-white p-4 rounded-lg border shadow-sm">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase border-b pb-2 mb-3">Kits, Taxas e Materiais</h4>
                        
                        {/* SELEÇÃO RÁPIDA DE CATALOGO */}
                        <div className="mb-4 bg-indigo-50 p-2 rounded border border-indigo-100 flex items-center gap-2">
                            <Package size={16} className="text-indigo-600"/>
                            <span className="text-xs font-bold text-indigo-700 uppercase">Seleção Rápida:</span>
                            <select className="flex-1 border p-1 rounded text-sm" onChange={e => selecionarMaterialCatalogo(e.target.value)}>
                                <option value="">Selecione um Kit/Material cadastrado...</option>
                                {catalogoMateriais.map(m => (
                                    <option key={m.id} value={m.id}>{m.nome} - R$ {m.precoBase.toFixed(2)}</option>
                                ))}
                            </select>
                        </div>

                        {/* CAMPOS MANUAIS (PREENCHIDOS AUTO) */}
                        <div className="flex gap-2 mb-4 bg-slate-100 p-2 rounded items-end">
                            <div><label className="block text-xs">Descrição</label><input className="border p-1 rounded w-64" value={novaDespesa.descricao} onChange={e => setNovaDespesa({...novaDespesa, descricao: e.target.value})} /></div>
                            <div><label className="block text-xs">Qtd</label><input type="number" className="border p-1 rounded w-16" value={novaDespesa.quantidade} onChange={e => setNovaDespesa({...novaDespesa, quantidade: parseFloat(e.target.value)})} /></div>
                            <div><label className="block text-xs">Valor Un.</label><input type="number" className="border p-1 rounded w-24" value={novaDespesa.valorUnitario} onChange={e => setNovaDespesa({...novaDespesa, valorUnitario: parseFloat(e.target.value)})} /></div>
                            <button onClick={adicionarDespesa} className="bg-indigo-600 text-white p-1 px-3 rounded text-sm font-bold flex items-center gap-1 h-8"><Plus size={14}/> Add</button>
                        </div>

                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500"><tr><th>Desc</th><th>Qtd</th><th>Unit.</th><th>Total</th><th></th></tr></thead>
                            <tbody>
                                {despesas.map(d => (
                                    <tr key={d.id} className="border-b">
                                        <td className="p-2">{d.descricao}</td>
                                        <td className="p-2">{d.quantidade}</td>
                                        <td className="p-2">{d.valorUnitario.toFixed(2)}</td>
                                        <td className="p-2 font-bold">{d.valorTotal.toFixed(2)}</td>
                                        <td className="p-2 text-right"><button onClick={() => removerDespesa(d.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button></td>
                                    </tr>
                                ))}
                                {despesas.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-slate-400 italic">Nenhuma despesa extra lançada.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="p-4 bg-slate-100 border-t flex justify-end gap-2">
                    <button onClick={() => setModalAberto(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-200 rounded font-bold">Cancelar</button>
                    <button onClick={salvarGuia} className="px-6 py-2 bg-indigo-600 text-white rounded font-bold hover:bg-indigo-700 flex items-center gap-2"><Save size={18}/> Salvar Tudo</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}