using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ProClinic.Api.Models
{
    public class AgendamentoDespesa
    {
        [Key]
        public int Id { get; set; }
        public int AgendamentoId { get; set; }
        
        [JsonIgnore]
        [ForeignKey("AgendamentoId")]
        public Agendamento? Agendamento { get; set; }

        public string Nome { get; set; } = string.Empty;
        public int Quantidade { get; set; } = 1;
        public decimal PrecoUnitario { get; set; }
        public string Tipo { get; set; } = "MATERIAL";
    }
}
