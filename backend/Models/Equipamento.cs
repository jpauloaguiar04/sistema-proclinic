using System.ComponentModel.DataAnnotations;

namespace ProClinic.Api.Models
{
    public class Equipamento
    {
        [Key]
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string AETitle { get; set; } = string.Empty; // Identificador DICOM único
        public string Modalidade { get; set; } = "CR"; // CT, MR, US, CR, DX...
        public string? IP { get; set; }
        public int? Porta { get; set; }
    }
}
