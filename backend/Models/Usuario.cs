using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProClinic.Api.Models
{
    public class Usuario
    {
        [Key]
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Login { get; set; } = string.Empty;
        public string SenhaHash { get; set; } = string.Empty;

        [Required]
        public int GrupoUsuarioId { get; set; }

        [ForeignKey("GrupoUsuarioId")]
        public GrupoUsuario? Grupo { get; set; }

        public bool Ativo { get; set; } = true;
    }
}
