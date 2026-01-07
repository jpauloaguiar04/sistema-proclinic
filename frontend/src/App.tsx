import React, { useState } from 'react';
import TopMenu from './components/TopMenu';
import Dashboard from './pages/Dashboard';
import ConfigAgendas from './pages/ConfigAgendas';
import GruposUsuario from './pages/GruposUsuario';
import Pacientes from './pages/Pacientes';
import Medicos from './pages/Medicos'; 
import Convenios from './pages/Convenios';
import Servicos from './pages/Servicos';
import Agenda from './pages/Agenda';
import Laudos from './pages/Laudos';
import Faturamento from './pages/Faturamento';
import ConfigUnidade from './pages/ConfigUnidade';
import Materiais from './pages/Materiais';
import Equipamentos from './pages/Equipamentos';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderContent = () => {
    switch (currentPage) {
      // 1. DASHBOARD
      case 'dashboard': 
        return <Dashboard onNavigate={setCurrentPage} />;
      
      // 2. MÓDULO DE CADASTROS
      case 'cadastro_grupos': return <GruposUsuario />;
      case 'cadastro_pacientes': return <Pacientes />;
      case 'config_agendas': return <ConfigAgendas />;
      case 'cadastro_medicos': return <Medicos />;
      case 'cadastro_convenios': return <Convenios />;
      case 'cadastro_servicos': return <Servicos />;
      case 'laudos': return <Laudos />;
      case 'faturamento': return <Faturamento />;
      case 'config_unidade': return <ConfigUnidade />;
      case 'cadastro_materiais': return <Materiais />;
      case 'cadastro_equipamentos': return <Equipamentos />;
      
      // 3. OPERACIONAL
      // CORREÇÃO AQUI: Passando onNavigate para permitir o link "Novo Paciente"
      case 'agenda': return <Agenda onNavigate={setCurrentPage} />;
      
      default: return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      <TopMenu onNavigate={setCurrentPage} currentPage={currentPage} />
      
      <div className="flex-1 overflow-auto relative">
        {renderContent()}
      </div>

      <div className="bg-white border-t border-slate-200 text-slate-400 text-xs p-1 px-4 flex justify-between">
        <span>ProClinic v1.0.0</span>
        <span>Licenciado para: CLÍNICA RADIOLOGIA CENTRO</span>
      </div>
    </div>
  );
}

export default App;