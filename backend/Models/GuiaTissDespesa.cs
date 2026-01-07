using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ProClinic.Api.Models
{
    public class GuiaTissDespesa
    {
        [Key]
        public int Id { get; set; }

        public int GuiaTissId { get; set; }
        [JsonIgnore]
        [ForeignKey("GuiaTissId")]
        public GuiaTiss? GuiaTiss { get; set; }

        public string Codigo { get; set; } = "MAT";
        public string Descricao { get; set; } = string.Empty;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal ValorUnitario { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Quantidade { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal ValorTotal { get; set; }
        
        public string Tipo { get; set; } = "3"; // 3 = Materiais
    }
}
