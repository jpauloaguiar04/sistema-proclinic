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
        
        // Campo novo para a imagem da assinatura
        public string? AssinaturaBase64 { get; set; }
    }
}
