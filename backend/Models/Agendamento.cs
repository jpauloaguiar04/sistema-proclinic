using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProClinic.Api.Models
{
    public class Agendamento
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int AgendaConfigId { get; set; } 
        [ForeignKey("AgendaConfigId")]
        public AgendaConfig? AgendaConfig { get; set; }

        [Required]
        public string CpfPaciente { get; set; } = string.Empty; 
        
        // --- CORREÇÃO: Propriedade de Navegação Adicionada ---
        // Permite usar .Include(a => a.Paciente) no Controller
        [ForeignKey("CpfPaciente")]
        public Paciente? Paciente { get; set; }

        public DateTime DataHoraInicio { get; set; }
        public DateTime DataHoraFim { get; set; }

        public string Status { get; set; } = "Agendado"; 
        public string? OrdemServico { get; set; } 
        public string? Observacoes { get; set; }

        public int? ConvenioId { get; set; }
        [ForeignKey("ConvenioId")]
        public Convenio? Convenio { get; set; }

        public int? ServicoId { get; set; }
        [ForeignKey("ServicoId")]
        public Servico? Servico { get; set; }
        
        // --- NOVO RELACIONAMENTO (Solicitante) ---
        // Se você implementou a funcionalidade anterior, mantenha isso:
        public int? MedicoSolicitanteId { get; set; }
        [ForeignKey("MedicoSolicitanteId")]
        public Medico? MedicoSolicitante { get; set; }

        // --- TISS/FINANCEIRO ---
        public string? NumeroCarteirinha { get; set; }
        public string? NumeroGuia { get; set; }
        public string? SenhaAutorizacao { get; set; }
        public decimal ValorFinal { get; set; }
        public string? FormaPagamento { get; set; }
        public bool Pago { get; set; } = false;
        public DateTime? DataConfirmacao { get; set; }

        // --- LAUDO ---
        public string? TextoLaudo { get; set; }
        public string? StatusLaudo { get; set; } = "Pendente";
        public DateTime? DataLaudo { get; set; }

        public int? MedicoLaudoId { get; set; }
        [ForeignKey("MedicoLaudoId")]
        public Medico? MedicoLaudo { get; set; }

        // --- LOTE TISS ---
        public int? LoteTissId { get; set; }
        [ForeignKey("LoteTissId")]
        public LoteTiss? LoteTiss { get; set; }
    }
}