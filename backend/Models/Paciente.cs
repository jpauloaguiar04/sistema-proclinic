using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProClinic.Api.Models
{
    public class Paciente
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        
        // VOLTAMOS PARA MAIÚSCULO PARA AGRADAR O RESTO DO SISTEMA
        public string CPF { get; set; } 
        
        public DateTime DataNascimento { get; set; }
        public string? Telefone { get; set; }
        public string? Email { get; set; }
        public string? Sexo { get; set; }
        public DateTime DataCadastro { get; set; }
        public bool Ativo { get; set; }

        public int? ConvenioId { get; set; }
        
        [ForeignKey("ConvenioId")]
        public Convenio? Convenio { get; set; }
    }
}