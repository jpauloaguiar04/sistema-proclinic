using System.ComponentModel.DataAnnotations;

namespace ProClinic.Api.Models
{
    public class Servico
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Nome { get; set; } = string.Empty;

        public string CodigoTuss { get; set; } = string.Empty;

        // --- NOVO CAMPO: Define se é RX, Tomo, Ressonância, etc. ---
        public string Modalidade { get; set; } = "CR"; 

        public decimal PrecoBase { get; set; }
    }
}