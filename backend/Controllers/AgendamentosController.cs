using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProClinic.Api.Data;
using ProClinic.Api.Models;
using System.Globalization;

namespace ProClinic.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AgendamentosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AgendamentosController(AppDbContext context) => _context = context;

        // --- NOVO ENDPOINT DE DASHBOARD ---
        [HttpGet("dashboard")]
        public async Task<ActionResult<object>> GetDashboardStats([FromQuery] string data)
        {
            // 1. Recebe a data do frontend (Ex: "2026-01-07")
            if (!DateTime.TryParse(data, out var dataLocal)) 
                dataLocal = DateTime.Now;

            // 2. Converte para o intervalo UTC absoluto do dia inteiro (00:00:00 a 23:59:59)
            // Isso blinda a busca contra qualquer fuso horário
            var inicioDiaUtc = DateTime.SpecifyKind(dataLocal.Date, DateTimeKind.Utc);
            var fimDiaUtc = inicioDiaUtc.AddDays(1).AddTicks(-1);

            // 3. Busca apenas o necessário (Count) em vez de trazer todos os dados
            var stats = await _context.Agendamentos
                .Where(a => a.DataHoraInicio >= inicioDiaUtc && a.DataHoraInicio <= fimDiaUtc && a.Status != "Cancelado")
                .GroupBy(a => 1) // Agrupa tudo para calcular somatórios
                .Select(g => new {
                    Total = g.Count(),
                    Confirmados = g.Count(x => x.Status == "Confirmado"),
                    Realizados = g.Count(x => x.Status == "Realizado"),
                    Aguardando = g.Count(x => x.Status == "Agendado")
                })
                .FirstOrDefaultAsync();

            // 4. Busca os próximos 5 exames para a lista rápida
            var proximos = await _context.Agendamentos
                .Include(a => a.Servico)
                .Include(a => a.Paciente) // Inclui Paciente para mostrar nome
                .Where(a => a.DataHoraInicio >= inicioDiaUtc && a.DataHoraInicio <= fimDiaUtc && a.Status != "Cancelado")
                .OrderBy(a => a.DataHoraInicio)
                .Take(5)
                .Select(a => new {
                    a.Id,
                    Hora = a.DataHoraInicio, // O Frontend converte para hora local
                    Paciente = a.Paciente != null ? a.Paciente.Nome : "Desconhecido",
                    Exame = a.Servico != null ? a.Servico.Nome : "Exame",
                    a.Status
                })
                .ToListAsync();

            return Ok(new {
                Stats = stats ?? new { Total = 0, Confirmados = 0, Realizados = 0, Aguardando = 0 },
                Agenda = proximos
            });
        }

        // --- MÉTODOS EXISTENTES MANTIDOS ---
        [HttpGet("slots")]
        public async Task<ActionResult<IEnumerable<object>>> GetSlots(int agendaId, string data)
        {
            if (!DateTime.TryParse(data, out var dataParsed)) return BadRequest("Data inválida");

            var agenda = await _context.Agendas.FindAsync(agendaId);
            if (agenda == null) return NotFound("Agenda não encontrada");

            if (agenda.IntervaloMinutos < 5) agenda.IntervaloMinutos = 20;
            if (!TimeSpan.TryParse(agenda.HorarioInicio, out var horaInicio)) horaInicio = new TimeSpan(8, 0, 0); 
            if (!TimeSpan.TryParse(agenda.HorarioFim, out var horaFim)) horaFim = new TimeSpan(18, 0, 0); 
            if (horaFim <= horaInicio) horaFim = new TimeSpan(23, 59, 0);

            var dataInicioDia = DateTime.SpecifyKind(dataParsed.Date, DateTimeKind.Utc);
            var dataFimDia = dataInicioDia.AddDays(1).AddTicks(-1);

            var agendamentosDia = await _context.Agendamentos
                .Where(a => a.AgendaConfigId == agendaId && a.DataHoraInicio >= dataInicioDia && a.DataHoraInicio <= dataFimDia && a.Status != "Cancelado")
                .ToListAsync();

            var cpfs = agendamentosDia.Select(a => a.CpfPaciente).Distinct().ToList();
            var pacientes = await _context.Pacientes.Where(p => cpfs.Contains(p.CPF)).ToDictionaryAsync(p => p.CPF, p => p.Nome);

            var slots = new List<object>();
            var cursor = horaInicio;

            while (cursor < horaFim)
            {
                var inicioSlot = dataInicioDia.Add(cursor);
                var ocupante = agendamentosDia.FirstOrDefault(a => Math.Abs((a.DataHoraInicio - inicioSlot).TotalMinutes) < 1);

                if (ocupante != null)
                {
                    var nomePac = pacientes.ContainsKey(ocupante.CpfPaciente) ? pacientes[ocupante.CpfPaciente] : "Paciente";
                    slots.Add(new { Hora = cursor.ToString(@"hh\:mm"), Disponivel = false, AgendamentoId = ocupante.Id, PacienteNome = nomePac, Status = ocupante.Status });
                }
                else
                {
                    slots.Add(new { Hora = cursor.ToString(@"hh\:mm"), Disponivel = true });
                }
                cursor = cursor.Add(TimeSpan.FromMinutes(agenda.IntervaloMinutos));
            }
            return Ok(slots);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetAgendamentos()
        {
            var lista = await _context.Agendamentos.OrderByDescending(a => a.DataHoraInicio).Take(50).ToListAsync();
            return Ok(lista);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetAgendamento(int id)
        {
            var a = await _context.Agendamentos.Include(x => x.Servico).Include(x => x.Convenio).FirstOrDefaultAsync(x => x.Id == id);
            if (a == null) return NotFound();
            var p = await _context.Pacientes.FirstOrDefaultAsync(x => x.CPF == a.CpfPaciente);
            return Ok(new { a.Id, a.DataHoraInicio, a.Status, a.OrdemServico, a.NumeroCarteirinha, a.NumeroGuia, a.SenhaAutorizacao, a.ValorFinal, a.FormaPagamento, a.Pago, CpfPaciente = a.CpfPaciente, NomePaciente = p?.Nome, ConvenioId = a.ConvenioId, ServicoId = a.ServicoId });
        }

        [HttpPost]
        public async Task<ActionResult<Agendamento>> PostAgendamento(Agendamento agendamento)
        {
            agendamento.DataHoraInicio = agendamento.DataHoraInicio.ToUniversalTime();
            agendamento.DataHoraFim = agendamento.DataHoraInicio.AddMinutes(20);
            _context.Agendamentos.Add(agendamento);
            await _context.SaveChangesAsync();
            agendamento.OrdemServico = $"{DateTime.Now:yyyyMMdd}{agendamento.Id:D4}";
            await _context.SaveChangesAsync();
            return CreatedAtAction("GetAgendamento", new { id = agendamento.Id }, agendamento);
        }

        [HttpPut("{id}/confirmar")]
        public async Task<IActionResult> Confirmar(int id, [FromBody] Agendamento dados)
        {
            var a = await _context.Agendamentos.FindAsync(id);
            if (a == null) return NotFound();
            a.Status = "Confirmado";
            a.DataConfirmacao = DateTime.UtcNow;
            a.NumeroCarteirinha = dados.NumeroCarteirinha;
            a.NumeroGuia = dados.NumeroGuia;
            a.SenhaAutorizacao = dados.SenhaAutorizacao;
            if (dados.ConvenioId.HasValue && dados.ConvenioId > 0) a.ConvenioId = dados.ConvenioId;
            a.ValorFinal = dados.ValorFinal;
            a.FormaPagamento = dados.FormaPagamento;
            a.Pago = dados.Pago;
            await _context.SaveChangesAsync();
            return Ok(new { a.OrdemServico });
        }

        [HttpPut("{id}/cancelar")]
        public async Task<IActionResult> Cancelar(int id)
        {
            var a = await _context.Agendamentos.FindAsync(id);
            if (a == null) return NotFound();
            a.Status = "Cancelado";
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}