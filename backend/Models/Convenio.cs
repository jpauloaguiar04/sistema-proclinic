namespace ProClinic.Api.Models {
    public class Convenio {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string RegistroAns { get; set; } = string.Empty;
        public decimal ValorConsulta { get; set; }
    }
}
