using System.ComponentModel.DataAnnotations;

namespace ProClinic.Api.Models
{
    public class MascaraLaudo
    {
        [Key]
        public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Conteudo { get; set; } = string.Empty;
        public string? Atalho { get; set; }
        public string? ExameNome { get; set; }
    }
}
