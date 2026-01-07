using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProClinic.Api.Data;
using ProClinic.Api.Models;

namespace ProClinic.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MateriaisController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MateriaisController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Material>>> GetMateriais()
        {
            return await _context.Materiais.OrderBy(m => m.Nome).ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Material>> PostMaterial(Material material)
        {
            _context.Materiais.Add(material);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetMateriais), new { id = material.Id }, material);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMaterial(int id)
        {
            var material = await _context.Materiais.FindAsync(id);
            if (material == null) return NotFound();
            _context.Materiais.Remove(material);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
