using System.ComponentModel.DataAnnotations;

namespace ProClinic.Api.Models
{
    public class Paciente
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Nome { get; set; } = string.Empty;

        [Required]
        public string CPF { get; set; } = string.Empty;

        public DateTime DataNascimento { get; set; }

        // --- NOVO CAMPO ---
        public string Sexo { get; set; } = "O"; // M=Masculino, F=Feminino, O=Outro

        public string? Telefone { get; set; }
        public string? Convenio { get; set; } // Texto livre ou ID de convênio
        
        public DateTime DataCadastro { get; set; } = DateTime.UtcNow;
    }
}