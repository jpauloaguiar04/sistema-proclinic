using System.ComponentModel.DataAnnotations;

namespace ProClinic.Api.Models
{
    public class Medico
    {
        [Key]
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string CRM { get; set; } = string.Empty;
        public string UF { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Telefone { get; set; }
        public bool Ativo { get; set; } = true;
        public string? AssinaturaBase64 { get; set; }

        // --- NOVOS CAMPOS ---
        // Quem pede o exame (aparece no dropdown da Agenda)
        public bool EhSolicitante { get; set; } = false; 

        // Quem faz o laudo (aparece na tela de Laudos e futuramente terá Login)
        public bool EhCorpoClinico { get; set; } = true; 
    }
}