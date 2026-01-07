using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProClinic.Api.Data;
using ProClinic.Api.Models;

namespace ProClinic.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LaudosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public LaudosController(AppDbContext context) => _context = context;

        // 1. WORKLIST COM FILTROS
        [HttpGet("worklist")]
        public async Task<ActionResult<IEnumerable<object>>> GetWorklist(
            [FromQuery] DateTime? inicio, 
            [FromQuery] DateTime? fim,
            [FromQuery] string? modalidade) // Modalidade ou Nome do Exame
        {
            var query = _context.Agendamentos
                .Include(a => a.Servico)
                .Where(a => a.Status == "Confirmado" || a.StatusLaudo == "Digitando");

            // Filtro de Data (Padrão: Hoje se não enviar nada, ou intervalo específico)
            if (inicio.HasValue)
            {
                var dataInicio = inicio.Value.Kind == DateTimeKind.Unspecified 
                    ? DateTime.SpecifyKind(inicio.Value, DateTimeKind.Utc) 
                    : inicio.Value.ToUniversalTime();
                query = query.Where(a => a.DataHoraInicio >= dataInicio);
            }
            
            if (fim.HasValue)
            {
                var dataFim = fim.Value.Kind == DateTimeKind.Unspecified 
                    ? DateTime.SpecifyKind(fim.Value, DateTimeKind.Utc) 
                    : fim.Value.ToUniversalTime();
                // Ajusta para o final do dia
                dataFim = dataFim.Date.AddDays(1).AddTicks(-1); 
                query = query.Where(a => a.DataHoraInicio <= dataFim);
            }

            // Filtro de Texto (Nome do Exame/Modalidade)
            if (!string.IsNullOrEmpty(modalidade))
            {
                query = query.Where(a => a.Servico.Nome.ToLower().Contains(modalidade.ToLower()));
            }

            var lista = await query
                .OrderBy(a => a.DataHoraInicio)
                .Select(a => new {
                    a.Id,
                    a.CpfPaciente,
                    NomePaciente = _context.Pacientes.Where(p => p.CPF == a.CpfPaciente).Select(p => p.Nome).FirstOrDefault(),
                    NomeExame = a.Servico != null ? a.Servico.Nome : "Exame",
                    a.DataHoraInicio,
                    a.StatusLaudo,
                    a.OrdemServico
                })
                .ToListAsync();

            return Ok(lista);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Agendamento>> GetParaLaudar(int id)
        {
            var agendamento = await _context.Agendamentos
                .Include(a => a.Servico)
                .Include(a => a.MedicoLaudo) // Inclui dados do médico se já tiver assinado
                .FirstOrDefaultAsync(a => a.Id == id);

            if (agendamento == null) return NotFound();
            
            var paciente = await _context.Pacientes.FirstOrDefaultAsync(p => p.CPF == agendamento.CpfPaciente);
            
            return Ok(new {
                agendamento.Id,
                agendamento.TextoLaudo,
                agendamento.StatusLaudo,
                NomePaciente = paciente?.Nome,
                DataNascimento = paciente?.DataNascimento,
                NomeExame = agendamento.Servico?.Nome,
                agendamento.OrdemServico,
                agendamento.MedicoLaudoId,
                // Manda a assinatura para o frontend exibir
                AssinaturaMedico = agendamento.MedicoLaudo?.AssinaturaBase64,
                NomeMedico = agendamento.MedicoLaudo?.Nome,
                CRMMedico = agendamento.MedicoLaudo?.CRM,
                UFMedico = agendamento.MedicoLaudo?.UF
            });
        }

        // SALVAR COM MÉDICO SELECIONADO
        [HttpPut("{id}")]
        public async Task<IActionResult> SalvarLaudo(int id, [FromBody] LaudoDto dto)
        {
            var agendamento = await _context.Agendamentos.FindAsync(id);
            if (agendamento == null) return NotFound();

            agendamento.TextoLaudo = dto.Texto;
            
            if (dto.Acao == "ASSINAR")
            {
                if (!dto.MedicoId.HasValue) return BadRequest("Selecione o médico para assinar.");
                
                agendamento.StatusLaudo = "Assinado";
                agendamento.DataLaudo = DateTime.UtcNow;
                agendamento.MedicoLaudoId = dto.MedicoId;
            }
            else
            {
                agendamento.StatusLaudo = "Digitando";
            }

            await _context.SaveChangesAsync();
            return Ok(agendamento);
        }

        // --- INTEGRAÇÃO COM PRORADVOX ---
        // Recebe o texto ditado/digitado no visualizador externo e salva aqui.
        [HttpPost("integracao/receber-laudo")]
        public async Task<IActionResult> ReceberLaudoExterno([FromBody] LaudoExternoDto dto)
        {
            // O ProRadVox manda a O.S. (Accession Number) para identificar o exame
            var agendamento = await _context.Agendamentos
                .FirstOrDefaultAsync(a => a.OrdemServico == dto.AccessionNumber);

            if (agendamento == null) return NotFound("Exame não encontrado com esta O.S.");

            agendamento.TextoLaudo = dto.TextoLaudo;
            
            if (dto.Finalizado)
            {
                agendamento.StatusLaudo = "Assinado";
                agendamento.DataLaudo = DateTime.UtcNow;
                // Nota: O ProRadVox idealmente deveria mandar o ID ou CRM do médico também.
                // Por enquanto, fica sem médico específico ou vincula a um usuário genérico "Integração".
            }
            else
            {
                agendamento.StatusLaudo = "Digitando";
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Laudo recebido com sucesso." });
        }
    }

    public class LaudoDto
    {
        public string Texto { get; set; } = string.Empty;
        public string Acao { get; set; } = "SALVAR";
        public int? MedicoId { get; set; } // ID do médico que está assinando
    }

    public class LaudoExternoDto
    {
        public string AccessionNumber { get; set; } = string.Empty;
        public string TextoLaudo { get; set; } = string.Empty;
        public bool Finalizado { get; set; } = false;
    }
}