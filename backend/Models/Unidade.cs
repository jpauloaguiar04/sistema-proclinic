using System.ComponentModel.DataAnnotations;

namespace ProClinic.Api.Models
{
    public class Unidade
    {
        [Key]
        public int Id { get; set; }
        public string? NomeFantasia { get; set; }
        public string? RazaoSocial { get; set; }
        public string? CNPJ { get; set; }
        public string? CNES { get; set; } // Cadastro Nacional de Estabelecimento de Saúde
        public string? Endereco { get; set; }
        public string? Telefone { get; set; }
        public string? Email { get; set; }
        public string? LogoBase64 { get; set; } // Para o cabeçalho do laudo
    }
}
