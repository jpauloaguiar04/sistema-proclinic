import React, { useState } from 'react';
import { User, ChevronDown, Activity, LogOut } from 'lucide-react';

interface TopMenuProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function TopMenu({ onNavigate, currentPage }: TopMenuProps) {
  const [menuAberto, setMenuAberto] = useState(false);

  // Função auxiliar para navegar e fechar o menu ao mesmo tempo
  const handleNav = (rota: string) => {
    onNavigate(rota);
    setMenuAberto(false);
  };

  return (
    // Z-50 Garante que o menu fique acima do Dashboard
    <div className="bg-white text-slate-700 text-sm shadow-sm relative z-50 border-b border-slate-200 font-sans">
      
      {/* Linha Superior */}
      <div className="flex justify-between items-center px-6 h-12 bg-indigo-700 text-white">
        <div 
          className="font-bold text-xl tracking-wider flex items-center cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => handleNav('dashboard')}
        >
          <Activity className="mr-2 text-indigo-200" size={22}/> 
          PROCLINIC <span className="font-light text-indigo-200 text-xs ml-1">RIS</span>
        </div>
        
        <div className="flex items-center gap-3 text-xs bg-indigo-800/50 py-1 px-3 rounded-full">
          <User size={14} className="text-indigo-200" />
          <span className="font-bold uppercase tracking-wide">JPAULO</span>
          <span className="text-indigo-200">| Online</span>
        </div>
      </div>

      {/* Linha de Menus */}
      <div className="flex px-4 space-x-1 bg-white py-1 overflow-x-visible">
        
        <MenuItem label="Dashboard" active={currentPage === 'dashboard'} onClick={() => handleNav('dashboard')} />

        {/* DROPDOWN DE CADASTROS */}
        <div className="relative">
          <button 
            className={`px-3 py-2 rounded-md hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-1 transition-colors font-medium ${menuAberto ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600'}`}
            onClick={() => setMenuAberto(!menuAberto)}
          >
            Cadastros <ChevronDown size={14} className={`transition-transform duration-200 ${menuAberto ? 'rotate-180' : ''}`}/>
          </button>
          
          {/* O Menu Flutuante */}
          {menuAberto && (
            <>
              {/* Overlay invisível para fechar ao clicar fora */}
              <div className="fixed inset-0 z-40" onClick={() => setMenuAberto(false)}></div>
              
              <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 shadow-xl rounded-lg min-w-[220px] z-50 flex flex-col py-2 animate-fade-in">
                <div className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Acessos</div>
                <DropdownItem label="Usuários e Grupos" onClick={() => handleNav('cadastro_grupos')} />
                <DropdownItem label="Médicos (Corpo Clínico)" onClick={() => handleNav('cadastro_medicos')} />
                
                <div className="border-b my-2 border-slate-100"></div>
                <div className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Recepção</div>
                <DropdownItem label="Pacientes" onClick={() => handleNav('cadastro_pacientes')} />
                <DropdownItem label="Convênios" onClick={() => handleNav('cadastro_convenios')} />
                
                <div className="border-b my-2 border-slate-100"></div>
                <div className="px-4 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Técnico</div>
                <DropdownItem label="Agendas & Salas" onClick={() => handleNav('config_agendas')} />
                <DropdownItem label="Exames e Serviços" onClick={() => handleNav('cadastro_servicos')} />
              </div>
            </>
          )}
        </div>

        <MenuItem label="Exames" onClick={() => alert("Módulo em desenvolvimento")} />
        <MenuItem label="Laudos" onClick={() => handleNav('laudos')} />
        <MenuItem label="Faturamento" onClick={() => handleNav('faturamento')} />
        <MenuItem label="Configurações" onClick={() => handleNav('config_agendas')} />
      </div>
    </div>
  );
}

// Componentes Auxiliares
const MenuItem = ({ label, onClick, active }: any) => (
  <button 
    onClick={onClick} 
    className={`px-3 py-2 rounded-md transition-colors whitespace-nowrap text-sm font-medium ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'}`}
  >
    {label}
  </button>
);

const DropdownItem = ({ label, onClick }: any) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }} 
    className="text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-700 w-full text-sm text-slate-600 transition-colors z-50 relative"
  >
    {label}
  </button>
);