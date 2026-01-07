using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ProClinic.Api.Models
{
    public class FraseLaudo
    {
        [Key]
        public int Id { get; set; }
        
        public int MascaraLaudoId { get; set; }
        [JsonIgnore]
        [ForeignKey("MascaraLaudoId")]
        public MascaraLaudo? MascaraLaudo { get; set; }

        public string Titulo { get; set; } = string.Empty; // Nome do atalho
        public string Texto { get; set; } = string.Empty;  // O texto a inserir
    }
}
