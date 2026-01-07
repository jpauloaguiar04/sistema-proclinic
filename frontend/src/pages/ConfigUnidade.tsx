import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Building, Save, Upload, ImageIcon } from 'lucide-react';

const API_URL = 'http://172.16.1.207:5000/api/Unidade';

export default function ConfigUnidade() {
  const [form, setForm] = useState({
    nomeFantasia: '', razaoSocial: '', cnpj: '', cnes: '',
    endereco: '', telefone: '', email: '', logoBase64: ''
  });

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    try {
      const res = await axios.get(API_URL);
      if (res.data.id) setForm(res.data);
    } catch (e) { console.error("Erro ao carregar dados da unidade"); }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, logoBase64: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const salvar = async () => {
    try {
      await axios.post(API_URL, form);
      alert("Dados da Clínica salvos com sucesso!");
    } catch (e) { alert("Erro ao salvar."); }
  };

  return (
    <div className="p-8 h-full bg-slate-50 animate-fade-in flex flex-col items-center">
      
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-light text-slate-800 mb-8 flex items-center">
          <Building className="mr-3 text-indigo-600" size={32} /> Dados da Clínica (Unidade)
        </h1>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* COLUNA DA ESQUERDA: LOGO */}
            <div className="flex flex-col items-center">
              <label className="label-premium w-full text-center mb-2">Logotipo (Para Laudos)</label>
              <div className="w-full aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center relative hover:bg-slate-50 transition cursor-pointer overflow-hidden">
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                {form.logoBase64 ? (
                  <img src={form.logoBase64} alt="Logo" className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="text-slate-400 text-center p-4">
                    <ImageIcon size={48} className="mx-auto mb-2 opacity-50"/>
                    <span className="text-sm">Clique para enviar imagem</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">Recomendado: PNG Transparente</p>
            </div>

            {/* COLUNA DA DIREITA: DADOS */}
            <div className="md:col-span-2 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="label-premium">Nome Fantasia (Título do Sistema)</label>
                  <input className="input-premium" value={form.nomeFantasia} onChange={e => setForm({...form, nomeFantasia: e.target.value})} placeholder="Ex: ProClinic Diagnósticos" />
                </div>
                <div className="col-span-2">
                  <label className="label-premium">Razão Social</label>
                  <input className="input-premium" value={form.razaoSocial} onChange={e => setForm({...form, razaoSocial: e.target.value})} />
                </div>
                <div>
                  <label className="label-premium">CNPJ</label>
                  <input className="input-premium" value={form.cnpj} onChange={e => setForm({...form, cnpj: e.target.value})} placeholder="00.000.000/0001-00" />
                </div>
                <div>
                  <label className="label-premium">CNES (Opcional)</label>
                  <input className="input-premium" value={form.cnes} onChange={e => setForm({...form, cnes: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="label-premium">Endereço Completo</label>
                  <input className="input-premium" value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} placeholder="Rua, Número, Bairro, Cidade - UF" />
                </div>
                <div>
                  <label className="label-premium">Telefone</label>
                  <input className="input-premium" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} />
                </div>
                <div>
                  <label className="label-premium">E-mail</label>
                  <input className="input-premium" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                </div>
              </div>
            </div>

          </div>

          {/* RODAPÉ */}
          <div className="bg-slate-50 p-5 flex justify-end border-t border-slate-100">
            <button onClick={salvar} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center transition transform active:scale-95">
              <Save size={20} className="mr-2"/> Salvar Configurações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
