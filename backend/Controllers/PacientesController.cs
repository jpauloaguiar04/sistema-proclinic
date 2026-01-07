using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProClinic.Api.Data;
using ProClinic.Api.Models;

namespace ProClinic.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PacientesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PacientesController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Paciente>>> GetPacientes()
        {
            return await _context.Pacientes.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Paciente>> GetPaciente(int id)
        {
            var paciente = await _context.Pacientes.FindAsync(id);
            if (paciente == null) return NotFound();
            return paciente;
        }

        [HttpPost]
        public async Task<ActionResult<Paciente>> PostPaciente(Paciente paciente)
        {
            // CORREÇÃO DE DATA (UTC) PARA O POSTGRES
            if (paciente.DataNascimento.Kind == DateTimeKind.Unspecified)
                paciente.DataNascimento = DateTime.SpecifyKind(paciente.DataNascimento, DateTimeKind.Utc);
            else
                paciente.DataNascimento = paciente.DataNascimento.ToUniversalTime();

            // Garante data de cadastro
            paciente.DataCadastro = DateTime.UtcNow;

            _context.Pacientes.Add(paciente);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                if (await _context.Pacientes.AnyAsync(e => e.CPF == paciente.CPF))
                {
                    return Conflict("CPF já cadastrado.");
                }
                throw;
            }

            return CreatedAtAction(nameof(GetPaciente), new { id = paciente.Id }, paciente);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPaciente(int id, Paciente paciente)
        {
            if (id != paciente.Id) return BadRequest();

            // CORREÇÃO DE DATA (UTC) NA EDIÇÃO TAMBÉM
            if (paciente.DataNascimento.Kind == DateTimeKind.Unspecified)
                paciente.DataNascimento = DateTime.SpecifyKind(paciente.DataNascimento, DateTimeKind.Utc);
            else
                paciente.DataNascimento = paciente.DataNascimento.ToUniversalTime();

            _context.Entry(paciente).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Pacientes.AnyAsync(e => e.Id == id)) return NotFound();
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePaciente(int id)
        {
            var paciente = await _context.Pacientes.FindAsync(id);
            if (paciente == null) return NotFound();
            _context.Pacientes.Remove(paciente);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
