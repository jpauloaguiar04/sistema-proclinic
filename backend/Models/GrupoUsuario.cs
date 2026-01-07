using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace ProClinic.Api.Models
{
    public class GrupoUsuario
    {
        [Key]
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public bool Ativo { get; set; } = true;

        // Relacionamento N:N explícito
        public virtual ICollection<Permissao> Permissoes { get; set; } = new List<Permissao>();
    }
}
