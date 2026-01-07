using System.ComponentModel.DataAnnotations;

namespace ProClinic.Api.Models
{
    public class LoteTiss
    {
        [Key]
        public int Id { get; set; }
        public DateTime DataFechamento { get; set; }
        public string? ConvenioNome { get; set; }
        public decimal ValorTotal { get; set; }
        public string? XmlConteudo { get; set; } // Aqui guardamos o texto do XML
        public int QtdGuias { get; set; }
    }
}
