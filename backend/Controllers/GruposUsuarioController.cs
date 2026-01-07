using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProClinic.Api.Data;
using ProClinic.Api.Models;

namespace ProClinic.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GruposUsuarioController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GruposUsuarioController(AppDbContext context)
        {
            _context = context;
        }

        // 1. LISTAR GRUPOS (Trazendo as permissões junto)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GrupoUsuario>>> GetGrupos()
        {
            return await _context.GruposUsuario
                .Include(g => g.Permissoes)
                .ToListAsync();
        }

        // 2. LISTAR TODAS AS PERMISSÕES DISPONÍVEIS (Para preencher os checkboxes)
        [HttpGet("permissoes")]
        public async Task<ActionResult<IEnumerable<Permissao>>> GetPermissoes()
        {
            return await _context.Permissoes.ToListAsync();
        }

        // 3. CRIAR NOVO GRUPO
        [HttpPost]
        public async Task<ActionResult<GrupoUsuario>> PostGrupo(GrupoDto dto)
        {
            var novoGrupo = new GrupoUsuario { Nome = dto.Nome, Ativo = true };

            // Busca as permissões no banco pelos IDs enviados
            if (dto.PermissoesIds != null && dto.PermissoesIds.Any())
            {
                var permissoes = await _context.Permissoes
                    .Where(p => dto.PermissoesIds.Contains(p.Id))
                    .ToListAsync();
                novoGrupo.Permissoes = permissoes;
            }

            _context.GruposUsuario.Add(novoGrupo);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGrupos), new { id = novoGrupo.Id }, novoGrupo);
        }

        // 4. ATUALIZAR GRUPO
        [HttpPut("{id}")]
        public async Task<IActionResult> PutGrupo(int id, GrupoDto dto)
        {
            var grupo = await _context.GruposUsuario
                .Include(g => g.Permissoes)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (grupo == null) return NotFound();

            grupo.Nome = dto.Nome;
            
            // Atualiza as permissões (Limpa as antigas e põe as novas)
            grupo.Permissoes.Clear();
            if (dto.PermissoesIds != null && dto.PermissoesIds.Any())
            {
                var permissoes = await _context.Permissoes
                    .Where(p => dto.PermissoesIds.Contains(p.Id))
                    .ToListAsync();
                grupo.Permissoes = permissoes;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // 5. EXCLUIR GRUPO
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGrupo(int id)
        {
            var grupo = await _context.GruposUsuario.FindAsync(id);
            if (grupo == null) return NotFound();

            _context.GruposUsuario.Remove(grupo);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    // DTO para receber os dados do Frontend de forma limpa
    public class GrupoDto
    {
        public string Nome { get; set; } = string.Empty;
        public List<int> PermissoesIds { get; set; } = new();
    }
}
