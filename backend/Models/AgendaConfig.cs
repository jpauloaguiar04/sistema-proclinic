using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProClinic.Api.Models
{
    public class AgendaConfig
    {
        [Key]
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int IntervaloMinutos { get; set; } = 20;
        public string HorarioInicio { get; set; } = "08:00:00";
        public string HorarioFim { get; set; } = "18:00:00";
        public bool Ativa { get; set; } = true;

        // Vínculo com o Equipamento (Para o Worklist saber quem é quem)
        public int? EquipamentoId { get; set; }
        [ForeignKey("EquipamentoId")]
        public Equipamento? Equipamento { get; set; }
    }
}
