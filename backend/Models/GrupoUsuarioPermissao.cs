using System.ComponentModel.DataAnnotations.Schema;

namespace ProClinic.Api.Models
{
    public class GrupoUsuarioPermissao
    {
        public int GruposId { get; set; }
        [ForeignKey("GruposId")]
        public GrupoUsuario? Grupo { get; set; }

        public int PermissoesId { get; set; }
        [ForeignKey("PermissoesId")]
        public Permissao? Permissao { get; set; }
    }
}
