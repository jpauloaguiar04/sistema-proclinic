using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProClinic.Api.Data;
using ProClinic.Api.Models;

namespace ProClinic.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MascarasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MascarasController(AppDbContext context) => _context = context;

        // GET: Lista todos os padrões
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MascaraLaudo>>> Get()
        {
            return await _context.MascarasLaudo.OrderBy(m => m.Titulo).ToListAsync();
        }

        // GET: Pega um padrão ESPECÍFICO com suas frases
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetDetalhes(int id)
        {
            var mascara = await _context.MascarasLaudo.FindAsync(id);
            if (mascara == null) return NotFound();

            var frases = await _context.FrasesLaudo.Where(f => f.MascaraLaudoId == id).ToListAsync();

            return Ok(new { Mascara = mascara, Frases = frases });
        }

        // POST: Cria Padrão
        [HttpPost]
        public async Task<ActionResult<MascaraLaudo>> Post(MascaraLaudo mascara)
        {
            _context.MascarasLaudo.Add(mascara);
            await _context.SaveChangesAsync();
            return Ok(mascara);
        }

        // PUT: Atualiza Padrão (Texto base)
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, MascaraLaudo mascara)
        {
            if (id != mascara.Id) return BadRequest();
            _context.Entry(mascara).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // --- GERENCIAMENTO DE FRASES ---

        [HttpPost("{id}/frases")]
        public async Task<ActionResult<FraseLaudo>> AddFrase(int id, FraseLaudo frase)
        {
            frase.MascaraLaudoId = id;
            _context.FrasesLaudo.Add(frase);
            await _context.SaveChangesAsync();
            return Ok(frase);
        }

        [HttpDelete("frases/{fraseId}")]
        public async Task<IActionResult> DeleteFrase(int fraseId)
        {
            var f = await _context.FrasesLaudo.FindAsync(fraseId);
            if (f == null) return NotFound();
            _context.FrasesLaudo.Remove(f);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMascara(int id)
        {
             var m = await _context.MascarasLaudo.FindAsync(id);
             if (m == null) return NotFound();
             _context.MascarasLaudo.Remove(m); // Cascade apaga as frases
             await _context.SaveChangesAsync();
             return NoContent();
        }
    }
}
