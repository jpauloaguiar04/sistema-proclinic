using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace ProClinic.Api.Models
{
    public class Permissao
    {
        [Key]
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Modulo { get; set; } = string.Empty;

        // Evita ciclo infinito no JSON
        [JsonIgnore]
        public virtual ICollection<GrupoUsuario> Grupos { get; set; } = new List<GrupoUsuario>();
    }
}
