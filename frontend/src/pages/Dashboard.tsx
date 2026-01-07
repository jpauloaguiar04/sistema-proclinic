import React, { useEffect, useState } from 'react';
import { 
  Calendar, Users, FileText, DollarSign, 
  Activity, Building, Stethoscope, Clock, Shield, ClipboardList, Archive, Server
} from 'lucide-react';

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const nav = (page: string) => {
    if (onNavigate) onNavigate(page);
  };

  const [stats, setStats] = useState({
    agendamentos: 0,
    pacientes: 0,
    laudosPendentes: 0,
    faturamentoDia: 0
  });

  const API_URL = '/api'; 

  useEffect(() => {
    carregarDados();
    
    // Atualiza a cada 60s para manter os números em tempo real
    const interval = setInterval(carregarDados, 60000);
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    try {
      // CORREÇÃO CRÍTICA: Envia apenas a data (YYYY-MM-DD) para evitar erros de Fuso Horário (UTC)
      const hoje = new Date().toISOString().split('T')[0];

      const results = await Promise.allSettled([
        // Usa o endpoint otimizado que criamos para garantir contagem correta do dia
        fetch(`${API_URL}/Agendamentos/dashboard?data=${hoje}`),             
        fetch(`${API_URL}/Pacientes`),                
        fetch(`${API_URL}/Laudos/worklist`),          
        fetch(`${API_URL}/Faturamento/caixa?data=${hoje}`) 
      ]);

      const [resAgenda, resPacientes, resLaudos, resCaixa] = results;

      // Processa Agendamentos (Vindo do endpoint de Dashboard)
      let agendamentosHoje = 0;
      if (resAgenda.status === 'fulfilled' && resAgenda.value.ok) {
          const dados = await resAgenda.value.json();
          // O endpoint retorna { Stats: { Total: X, ... }, Agenda: [...] }
          agendamentosHoje = dados.Stats ? dados.Stats.Total : 0;
      }

      // Processa Pacientes (Contagem total)
      const pacientesData = resPacientes.status === 'fulfilled' && resPacientes.value.ok ? await resPacientes.value.json() : [];
      
      // Processa Laudos (Lista de pendentes)
      const laudosData = resLaudos.status === 'fulfilled' && resLaudos.value.ok ? await resLaudos.value.json() : [];
      
      // Processa Caixa (Total do dia)
      const caixaData = resCaixa.status === 'fulfilled' && resCaixa.value.ok ? await resCaixa.value.json() : { totalGeral: 0 };

      setStats({
        agendamentos: agendamentosHoje,
        pacientes: Array.isArray(pacientesData) ? pacientesData.length : 0,
        laudosPendentes: Array.isArray(laudosData) ? laudosData.length : 0,
        faturamentoDia: caixaData.totalGeral || 0
      });

    } catch (error) {
      console.error("Erro geral ao carregar dashboard:", error);
    }
  };

  return (
    <div className="p-8 h-full bg-slate-50 animate-fade-in overflow-auto">
      
      <div className="mb-10 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-light text-slate-800">Bem-vindo ao ProClinic</h1>
            <p className="text-slate-500 mt-2">Visão Geral e Acesso Rápido</p>
        </div>
        <button onClick={carregarDados} className="text-indigo-600 text-sm font-bold hover:bg-indigo-50 px-3 py-1 rounded transition">
            Atualizar Dados
        </button>
      </div>

      {/* --- MÓDULO OPERACIONAL --- */}
      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Operacional</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* AGENDA */}
        <div onClick={() => nav('agenda')} 
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-lg hover:border-indigo-300 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Calendar size={24} />
            </div>
            <span className="text-2xl font-bold text-slate-700">{stats.agendamentos}</span>
          </div>
          <h3 className="font-bold text-lg text-slate-700 group-hover:text-indigo-600">Agenda de Hoje</h3>
          <p className="text-sm text-slate-400 mt-2">Agendamentos marcados para hoje</p>
        </div>

        {/* RECEPÇÃO */}
        <div onClick={() => nav('cadastro_pacientes')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-lg hover:border-emerald-300 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
            <span className="text-2xl font-bold text-slate-700">{stats.pacientes}</span>
          </div>
          <h3 className="font-bold text-lg text-slate-700 group-hover:text-emerald-600">Pacientes</h3>
          <p className="text-sm text-slate-400 mt-2">Total de pacientes cadastrados</p>
        </div>

        {/* LAUDOS */}
        <div onClick={() => nav('laudos')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Activity size={24} />
            </div>
            <span className="text-2xl font-bold text-slate-700">{stats.laudosPendentes}</span>
          </div>
          <h3 className="font-bold text-lg text-slate-700 group-hover:text-blue-600">Central de Laudos</h3>
          <p className="text-sm text-slate-400 mt-2">Exames aguardando laudo</p>
        </div>

        {/* FINANCEIRO */}
        <div onClick={() => nav('faturamento')}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-lg hover:border-green-300 transition-all group">
          <div className="flex justify-between items-start mb-4">
             <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <DollarSign size={24} />
            </div>
            <span className="text-xl font-bold text-slate-700">
                {stats.faturamentoDia.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <h3 className="font-bold text-lg text-slate-700 group-hover:text-green-600">Caixa do Dia</h3>
          <p className="text-sm text-slate-400 mt-2">Recebimentos confirmados hoje</p>
        </div>
      </div>

      {/* --- MÓDULO ADMINISTRATIVO --- */}
      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Administração & Cadastros</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div onClick={() => nav('config_unidade')} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-400 cursor-pointer transition text-center hover:shadow-md">
          <Building className="mx-auto text-slate-500 mb-2" size={28}/>
          <span className="font-bold text-sm text-slate-700">Minha Clínica</span>
        </div>

        <div onClick={() => nav('cadastro_medicos')} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-400 cursor-pointer transition text-center hover:shadow-md">
          <Stethoscope className="mx-auto text-slate-500 mb-2" size={28}/>
          <span className="font-bold text-sm text-slate-700">Médicos</span>
        </div>

        <div onClick={() => nav('cadastro_convenios')} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-400 cursor-pointer transition text-center hover:shadow-md">
          <FileText className="mx-auto text-slate-500 mb-2" size={28}/>
          <span className="font-bold text-sm text-slate-700">Convênios</span>
        </div>

        <div onClick={() => nav('cadastro_servicos')} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-400 cursor-pointer transition text-center hover:shadow-md">
          <ClipboardList className="mx-auto text-slate-500 mb-2" size={28}/>
          <span className="font-bold text-sm text-slate-700">Exames / Serviços</span>
        </div>

        {/* MATERIAIS */}
        <div onClick={() => nav('cadastro_materiais')} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-400 cursor-pointer transition text-center hover:shadow-md">
          <Archive className="mx-auto text-slate-500 mb-2" size={28}/>
          <span className="font-bold text-sm text-slate-700">Materiais / Kits</span>
        </div>

        {/* EQUIPAMENTOS */}
        <div onClick={() => nav('cadastro_equipamentos')} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-400 cursor-pointer transition text-center hover:shadow-md">
          <Server className="mx-auto text-slate-500 mb-2" size={28}/>
          <span className="font-bold text-sm text-slate-700">Equipamentos DICOM</span>
        </div>

        <div onClick={() => nav('config_agendas')} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-400 cursor-pointer transition text-center hover:shadow-md">
          <Clock className="mx-auto text-slate-500 mb-2" size={28}/>
          <span className="font-bold text-sm text-slate-700">Salas & Horários</span>
        </div>

        <div onClick={() => nav('cadastro_grupos')} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-400 cursor-pointer transition text-center hover:shadow-md">
          <Shield className="mx-auto text-slate-500 mb-2" size={28}/>
          <span className="font-bold text-sm text-slate-700">Permissões</span>
        </div>

      </div>
    </div>
  );
}