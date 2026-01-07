using System.ComponentModel.DataAnnotations;

namespace ProClinic.Api.Models
{
    public class Material
    {
        [Key]
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; } // <--- Campo Novo
        public decimal PrecoBase { get; set; }
        public string Tipo { get; set; } = "MATERIAL"; // MATERIAL, MEDICAMENTO, TAXA
        public string? CodigoTuss { get; set; }
    }
}
