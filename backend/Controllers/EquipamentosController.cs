using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProClinic.Api.Data;
using ProClinic.Api.Models;

namespace ProClinic.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EquipamentosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EquipamentosController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Equipamento>>> Get()
        {
            return await _context.Equipamentos.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Equipamento>> Post(Equipamento equipamento)
        {
            _context.Equipamentos.Add(equipamento);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = equipamento.Id }, equipamento);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, Equipamento equipamento)
        {
            if (id != equipamento.Id) return BadRequest();
            _context.Entry(equipamento).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var e = await _context.Equipamentos.FindAsync(id);
            if (e == null) return NotFound();
            _context.Equipamentos.Remove(e);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
