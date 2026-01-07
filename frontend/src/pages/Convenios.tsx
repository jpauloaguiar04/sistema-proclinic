import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building, Save, Plus, Trash2, Search, DollarSign, ArrowRight } from 'lucide-react';

// AJUSTE SEU IP
const BASE_URL = 'http://172.16.1.207:5000/api';

export default function Convenios() {
  const [convenios, setConvenios] = useState<any[]>([]);
  const [servicosDisponiveis, setServicosDisponiveis] = useState<any[]>([]);
  
  // Estado de Seleção
  const [selectedConvenio, setSelectedConvenio] = useState<any | null>(null);
  const [tabelaPrecos, setTabelaPrecos] = useState<any[]>([]);
  
  // Forms
  const [novoConvenio, setNovoConvenio] = useState({ nome: '', registroAns: '' });
  const [novoItem, setNovoItem] = useState({ servicoId: '', preco: '' });

  useEffect(() => {
    carregarConvenios();
    carregarServicosGerais();
  }, []);

  // Quando seleciona um convênio, carrega a tabela dele
  useEffect(() => {
    if (selectedConvenio) {
      carregarTabelaPrecos(selectedConvenio.id);
    }
  }, [selectedConvenio]);

  const carregarConvenios = async () => {
    const res = await axios.get(`${BASE_URL}/Convenios`);
    setConvenios(res.data);
  };

  const carregarServicosGerais = async () => {
    const res = await axios.get(`${BASE_URL}/Servicos`);
    setServicosDisponiveis(res.data);
  };

  const carregarTabelaPrecos = async (id: number) => {
    const res = await axios.get(`${BASE_URL}/TabelaPrecos/convenio/${id}`);
    setTabelaPrecos(res.data);
  };

  const criarConvenio = async () => {
    if (!novoConvenio.nome) return alert("Nome obrigatório");
    await axios.post(`${BASE_URL}/Convenios`, { ...novoConvenio, valorConsulta: 0 }); // ValorConsulta deprecated
    setNovoConvenio({ nome: '', registroAns: '' });
    carregarConvenios();
  };

const adicionarItemTabela = async () => {
    // 1. Validação básica antes de enviar
    if (!selectedConvenio) return alert("Selecione um convênio.");
    if (!novoItem.servicoId) return alert("Selecione um serviço/exame.");
    if (!novoItem.preco) return alert("Digite o valor.");

    const precoNumber = parseFloat(novoItem.preco);
    if (isNaN(precoNumber)) return alert("O valor digitado é inválido.");

    try {
      console.log("Enviando dados:", {
        convenioId: selectedConvenio.id,
        servicoId: Number(novoItem.servicoId),
        preco: precoNumber
      });

      await axios.post(`${BASE_URL}/TabelaPrecos`, {
        convenioId: selectedConvenio.id,
        servicoId: Number(novoItem.servicoId),
        preco: precoNumber
      });

      // Sucesso
      setNovoItem({ servicoId: '', preco: '' });
      carregarTabelaPrecos(selectedConvenio.id);
      
    } catch (e: any) { 
      console.error("Erro detalhado:", e);
      // Aqui mostramos o erro REAL que vem do servidor
      if (e.response && e.response.data) {
        alert(`Erro do Servidor: ${JSON.stringify(e.response.data)}`);
      } else {
        alert("Erro ao salvar. Verifique o console (F12) para detalhes.");
      }
    }
  };

  const removerItem = async (id: number) => {
    if(confirm("Remover este preço?")) {
      await axios.delete(`${BASE_URL}/TabelaPrecos/${id}`);
      if(selectedConvenio) carregarTabelaPrecos(selectedConvenio.id);
    }
  };

  return (
    <div className="flex h-full animate-fade-in bg-slate-50">
      
      {/* LADO ESQUERDO: LISTA DE CONVÊNIOS */}
      <div className="w-1/3 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-indigo-50">
          <h2 className="text-xl font-light text-indigo-900 flex items-center mb-4">
            <Building className="mr-2" size={24}/> Convênios
          </h2>
          <div className="space-y-3">
            <input 
              type="text" placeholder="Nome do Convênio (Ex: Unimed)" 
              className="input-premium"
              value={novoConvenio.nome} onChange={e => setNovoConvenio({...novoConvenio, nome: e.target.value})}
            />
            <div className="flex gap-2">
              <input 
                type="text" placeholder="Registro ANS" 
                className="input-premium w-1/2"
                value={novoConvenio.registroAns} onChange={e => setNovoConvenio({...novoConvenio, registroAns: e.target.value})}
              />
              <button onClick={criarConvenio} className="bg-indigo-600 text-white px-4 rounded-lg flex-1 font-bold hover:bg-indigo-700 transition">
                <Plus size={20} className="mx-auto"/>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-2">
          {convenios.map(c => (
            <div 
              key={c.id} 
              onClick={() => setSelectedConvenio(c)}
              className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedConvenio?.id === c.id ? 'bg-indigo-600 text-white shadow-lg border-indigo-600 scale-[1.02]' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'}`}
            >
              <div className="font-bold text-lg">{c.nome}</div>
              <div className={`text-xs ${selectedConvenio?.id === c.id ? 'text-indigo-200' : 'text-slate-400'}`}>ANS: {c.registroAns || 'S/N'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* LADO DIREITO: TABELA DE PREÇOS DO CONVÊNIO SELECIONADO */}
      <div className="flex-1 bg-slate-50 flex flex-col">
        {!selectedConvenio ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
            <DollarSign size={64} className="mb-4"/>
            <p className="text-lg">Selecione um convênio ao lado para gerenciar os preços.</p>
          </div>
        ) : (
          <>
            {/* Cabeçalho da Tabela */}
            <div className="p-8 pb-4">
              <h1 className="text-2xl text-slate-800 font-light flex items-center">
                Tabela de Preços: <span className="font-bold ml-2 text-indigo-600">{selectedConvenio.nome}</span>
              </h1>
              <p className="text-slate-500 text-sm mt-1">Defina quais exames este convênio atende e o valor pago.</p>
            </div>

            {/* Formulário de Adição de Item */}
            <div className="px-8 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex gap-4 items-end">
                <div className="flex-1">
                  <label className="label-premium">Serviço / Exame (TUSS)</label>
                  <select 
                    className="input-premium"
                    value={novoItem.servicoId} onChange={e => setNovoItem({...novoItem, servicoId: e.target.value})}
                  >
                    <option value="">Selecione um serviço cadastrado...</option>
                    {servicosDisponiveis.map(s => (
                      <option key={s.id} value={s.id}>{s.nome} (TUSS: {s.codigoTuss})</option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <label className="label-premium">Valor (R$)</label>
                  <input 
                    type="number" 
                    className="input-premium" placeholder="0.00"
                    value={novoItem.preco} onChange={e => setNovoItem({...novoItem, preco: e.target.value})}
                  />
                </div>
                <button onClick={adicionarItemTabela} className="bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-lg font-bold shadow-md shadow-emerald-100 transition">
                  <Plus size={20}/>
                </button>
              </div>
            </div>

            {/* Lista de Preços */}
            <div className="flex-1 px-8 pb-8 overflow-auto">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="p-4">Código TUSS</th>
                      <th className="p-4">Procedimento</th>
                      <th className="p-4 text-right">Valor Negociado</th>
                      <th className="p-4 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tabelaPrecos.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-mono text-slate-500 text-sm">{item.codigoTuss || '-'}</td>
                        <td className="p-4 font-medium text-slate-700">{item.nomeServico}</td>
                        <td className="p-4 text-right font-bold text-emerald-600">R$ {item.preco.toFixed(2)}</td>
                        <td className="p-4 text-center">
                          <button onClick={() => removerItem(item.id)} className="text-slate-300 hover:text-red-500 transition"><Trash2 size={18}/></button>
                        </td>
                      </tr>
                    ))}
                    {tabelaPrecos.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                          Nenhum preço definido para este convênio. O agendamento usará valor zero.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
