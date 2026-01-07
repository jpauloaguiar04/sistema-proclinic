using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProClinic.Api.Models
{
    public class ConvenioServico
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ConvenioId { get; set; }
        [ForeignKey("ConvenioId")]
        public Convenio? Convenio { get; set; }

        [Required]
        public int ServicoId { get; set; }
        [ForeignKey("ServicoId")]
        public Servico? Servico { get; set; }

        // O Preço negociado para ESTE convênio neste exame
        public decimal Preco { get; set; }

        // Código específico do convênio (às vezes difere do TUSS padrão)
        public string? CodigoNoConvenio { get; set; }
    }
}
