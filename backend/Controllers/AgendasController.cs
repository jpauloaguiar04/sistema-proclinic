using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProClinic.Api.Data;
using ProClinic.Api.Models;

namespace ProClinic.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AgendasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AgendasController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Agendas (Lista todas as agendas cadastradas)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AgendaConfig>>> GetAgendas()
        {
            return await _context.Agendas.ToListAsync();
        }

        // POST: api/Agendas (Cria uma nova configuração de agenda)
        [HttpPost]
        public async Task<ActionResult<AgendaConfig>> PostAgenda(AgendaConfig agenda)
        {
            _context.Agendas.Add(agenda);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAgendas), new { id = agenda.Id }, agenda);
        }

        // DELETE: api/Agendas/5 (Exclui uma agenda)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAgenda(int id)
        {
            var agenda = await _context.Agendas.FindAsync(id);
            if (agenda == null) return NotFound();

            _context.Agendas.Remove(agenda);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
