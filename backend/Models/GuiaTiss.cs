using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProClinic.Api.Models
{
    public class GuiaTiss
    {
        [Key]
        public int Id { get; set; }

        public int AgendamentoId { get; set; }
        [ForeignKey("AgendamentoId")]
        public Agendamento? Agendamento { get; set; }

        // --- Cabeçalho ---
        public string RegistroAns { get; set; } = string.Empty;
        public string NumeroGuiaPrestador { get; set; } = string.Empty;

        // --- Autorização ---
        public string? NumeroGuiaOperadora { get; set; }
        public DateTime? DataAutorizacao { get; set; }
        public string? Senha { get; set; }
        public DateTime? DataValidadeSenha { get; set; }

        // --- Beneficiário ---
        public string NumeroCarteira { get; set; } = string.Empty;
        public string AtendimentoRN { get; set; } = "N"; // S ou N

        // --- Solicitante (Médico Externo) ---
        public string? NomeProfissionalSolicitante { get; set; }
        public string? ConselhoProfissional { get; set; } = "06"; // 06 = CRM
        public string? NumeroConselhoSolicitante { get; set; }
        public string? UFSolicitante { get; set; }
        public string? CBOSSolicitante { get; set; } = "225250"; // Médico Clínico (Padrão)

        // --- Dados do Atendimento ---
        public string CaraterAtendimento { get; set; } = "1"; // 1-Eletivo, 2-Urgência
        public string TipoAtendimento { get; set; } = "05"; // 05-Exame
        public string IndicacaoAcidente { get; set; } = "9"; // 9-Não Acidente
        public string RegimeAtendimento { get; set; } = "01"; // 01-Ambulatorial

        // --- Execução ---
        public DateTime DataExecucao { get; set; }
        public string HoraInicial { get; set; } = "08:00:00";
        public string HoraFinal { get; set; } = "08:20:00";

        public bool Gerada { get; set; } = false; // Se já foi para um lote XML fechado
        public int? LoteTissId { get; set; } // Vínculo com o lote final

        // --- Relacionamento Adicionado para Faturamento ---
        public List<GuiaTissDespesa>? Despesas { get; set; }
    }
}