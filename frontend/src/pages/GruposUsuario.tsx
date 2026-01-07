import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Shield, Save, Plus, Trash2, CheckSquare, Square } from 'lucide-react';

interface Permissao { id: number; nome: string; modulo: string; }
interface Grupo { id: number; nome: string; permissoes: Permissao[]; }

export default function GruposUsuario() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [permissoesBase, setPermissoesBase] = useState<Permissao[]>([]);
  
  // Estado de Edição
  const [editando, setEditando] = useState<Partial<Grupo> | null>(null);
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<number[]>([]);

  // Carrega dados ao abrir a tela
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [resGrupos, resPermissoes] = await Promise.all([
        axios.get('http://172.16.1.207:5000/api/GruposUsuario'),
        axios.get('http://172.16.1.207:5000/api/GruposUsuario/permissoes')
      ]);
      setGrupos(resGrupos.data);
      setPermissoesBase(resPermissoes.data);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    }
  };

  const iniciarEdicao = (grupo?: Grupo) => {
    if (grupo) {
      setEditando(grupo);
      setPermissoesSelecionadas(grupo.permissoes.map(p => p.id));
    } else {
      setEditando({ nome: '' });
      setPermissoesSelecionadas([]);
    }
  };

  const togglePermissao = (id: number) => {
    if (permissoesSelecionadas.includes(id)) {
      setPermissoesSelecionadas(permissoesSelecionadas.filter(pId => pId !== id));
    } else {
      setPermissoesSelecionadas([...permissoesSelecionadas, id]);
    }
  };

  const salvar = async () => {
    if (!editando?.nome) return alert("Digite o nome do grupo");

    const payload = {
      nome: editando.nome,
      permissoesIds: permissoesSelecionadas
    };

    try {
      if (editando.id) {
        // Editar
        await axios.put(`http://172.16.1.207:5000/api/GruposUsuario/${editando.id}`, payload);
      } else {
        // Criar Novo
        await axios.post('http://172.16.1.207:5000/api/GruposUsuario', payload);
      }
      alert("Grupo salvo com sucesso!");
      setEditando(null);
      carregarDados();
    } catch (error) {
      alert("Erro ao salvar grupo.");
    }
  };

  const excluir = async (id: number) => {
    if(!confirm("Tem certeza que deseja excluir este grupo?")) return;
    try {
      await axios.delete(`http://172.16.1.207:5000/api/GruposUsuario/${id}`);
      carregarDados();
    } catch (error) {
      alert("Não foi possível excluir (verifique se há usuários vinculados).");
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-full">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-light text-slate-700 flex items-center">
            <Shield className="mr-3 text-blue-600" size={28} /> Controle de Acesso (Grupos)
          </h1>
          <button 
            onClick={() => iniciarEdicao()}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow flex items-center hover:bg-blue-700 transition">
            <Plus size={18} className="mr-2"/> Novo Grupo
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUNA ESQUERDA: LISTA */}
          <div className="bg-white rounded-lg shadow lg:col-span-1 overflow-hidden h-fit">
            <div className="bg-slate-50 p-3 border-b font-semibold text-gray-600 uppercase text-xs tracking-wider">Grupos Cadastrados</div>
            <div className="divide-y">
              {grupos.map(g => (
                <div key={g.id} className="p-4 hover:bg-blue-50 flex justify-between items-center group transition">
                  <div>
                    <span className="font-bold text-gray-700 block">{g.nome}</span>
                    <span className="text-xs text-gray-400">{g.permissoes.length} permissões</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => iniciarEdicao(g)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Editar</button>
                    <button onClick={() => excluir(g.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
              {grupos.length === 0 && <div className="p-4 text-gray-400 text-center italic">Nenhum grupo encontrado.</div>}
            </div>
          </div>

          {/* COLUNA DIREITA: FORMULÁRIO */}
          <div className="bg-white rounded-lg shadow lg:col-span-2 p-6 border-t-4 border-blue-600 relative">
            {!editando ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Users size={48} className="mb-4 text-gray-200"/>
                <p>Selecione um grupo ao lado ou crie um novo para gerenciar permissões.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl text-gray-800">
                    {editando.id ? `Editando: ${editando.nome}` : 'Criar Novo Grupo'}
                  </h3>
                  <button onClick={() => setEditando(null)} className="text-gray-400 hover:text-gray-600">Cancelar</button>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Grupo</label>
                  <input 
                    type="text" 
                    value={editando.nome}
                    onChange={e => setEditando({...editando, nome: e.target.value})}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition" 
                    placeholder="Ex: Recepcionista Noturno, Médico Plantonista..."
                    autoFocus
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-700 mb-3">Permissões de Acesso</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                    {permissoesBase.map(p => {
                      const isSelected = permissoesSelecionadas.includes(p.id);
                      return (
                        <div 
                          key={p.id} 
                          onClick={() => togglePermissao(p.id)}
                          className={`flex items-center p-3 border rounded cursor-pointer transition select-none ${isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50 border-gray-200'}`}
                        >
                          <div className={`mr-3 ${isSelected ? 'text-blue-600' : 'text-gray-300'}`}>
                            {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                          </div>
                          <div>
                            <div className={`font-medium text-sm ${isSelected ? 'text-blue-800' : 'text-gray-700'}`}>{p.nome}</div>
                            <div className="text-xs text-gray-500 uppercase">{p.modulo}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button 
                    onClick={salvar}
                    className="px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 flex items-center font-bold transition">
                    <Save size={18} className="mr-2"/> Salvar Alterações
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
