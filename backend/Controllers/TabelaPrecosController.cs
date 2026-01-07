using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProClinic.Api.Data;
using ProClinic.Api.Models;

namespace ProClinic.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TabelaPrecosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TabelaPrecosController(AppDbContext context) => _context = context;

        // 1. LISTAR
        [HttpGet("convenio/{convenioId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetItensPorConvenio(int convenioId)
        {
            return await _context.TabelaPrecos
                .Include(x => x.Servico)
                .Where(x => x.ConvenioId == convenioId)
                .Select(x => new {
                    x.Id,
                    ServicoId = x.ServicoId,
                    NomeServico = x.Servico.Nome,
                    CodigoTuss = x.Servico.CodigoTuss,
                    Preco = x.Preco
                })
                .ToListAsync();
        }

        // 2. ADICIONAR OU ATUALIZAR (Lógica "Upsert")
        [HttpPost]
        public async Task<ActionResult<ConvenioServico>> PostItem(ConvenioServico item)
        {
            // Verifica se já existe esse serviço neste convênio
            var existente = await _context.TabelaPrecos
                .FirstOrDefaultAsync(x => x.ConvenioId == item.ConvenioId && x.ServicoId == item.ServicoId);
            
            if (existente != null)
            {
                // SE JÁ EXISTE: Apenas atualiza o preço
                existente.Preco = item.Preco;
                await _context.SaveChangesAsync();
                return Ok(existente);
            }

            // SE NÃO EXISTE: Cria novo
            _context.TabelaPrecos.Add(item);
            await _context.SaveChangesAsync();
            return Ok(item);
        }

        // 3. REMOVER
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(int id)
        {
            var item = await _context.TabelaPrecos.FindAsync(id);
            if (item == null) return NotFound();
            _context.TabelaPrecos.Remove(item);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
