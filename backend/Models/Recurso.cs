using System.ComponentModel.DataAnnotations;

namespace ProClinic.Api.Models
{
    public class Recurso
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Nome { get; set; } = string.Empty; // Ex: "Sala RX 01", "Ressonância Magnética A"

        [Required]
        public string Tipo { get; set; } = string.Empty; // RX, RM, US, TC

        public int IntervaloMinutos { get; set; } = 20; // Tempo padrão do exame

        public string HorarioInicio { get; set; } = "08:00";
        public string HorarioFim { get; set; } = "18:00";

        public bool Ativo { get; set; } = true;
    }
}
