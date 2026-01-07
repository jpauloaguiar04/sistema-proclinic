using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProClinic.Api.Data;
using ProClinic.Api.Models;

namespace ProClinic.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ConveniosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ConveniosController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Convenio>>> GetConvenios()
        {
            return await _context.Convenios.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Convenio>> PostConvenio(Convenio convenio)
        {
            _context.Convenios.Add(convenio);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetConvenios), new { id = convenio.Id }, convenio);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutConvenio(int id, Convenio convenio)
        {
            if (id != convenio.Id) return BadRequest();
            _context.Entry(convenio).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteConvenio(int id)
        {
            var convenio = await _context.Convenios.FindAsync(id);
            if (convenio == null) return NotFound();
            _context.Convenios.Remove(convenio);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
