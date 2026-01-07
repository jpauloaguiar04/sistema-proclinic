using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProClinic.Api.Data;
using ProClinic.Api.Models;

namespace ProClinic.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UnidadeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UnidadeController(AppDbContext context) => _context = context;

        // GET: Retorna os dados da clínica (sempre o primeiro registro)
        [HttpGet]
        public async Task<ActionResult<Unidade>> Get()
        {
            var unidade = await _context.Unidade.FirstOrDefaultAsync();
            if (unidade == null) return Ok(new Unidade()); // Retorna vazio para preencher
            return unidade;
        }

        // POST: Salva ou Atualiza (Upsert)
        [HttpPost]
        public async Task<ActionResult<Unidade>> Post(Unidade unidade)
        {
            var existente = await _context.Unidade.FirstOrDefaultAsync();
            
            if (existente == null)
            {
                // Cria novo
                _context.Unidade.Add(unidade);
            }
            else
            {
                // Atualiza existente
                existente.NomeFantasia = unidade.NomeFantasia;
                existente.RazaoSocial = unidade.RazaoSocial;
                existente.CNPJ = unidade.CNPJ;
                existente.CNES = unidade.CNES;
                existente.Endereco = unidade.Endereco;
                existente.Telefone = unidade.Telefone;
                existente.Email = unidade.Email;
                
                // Só atualiza logo se enviou uma nova
                if (!string.IsNullOrEmpty(unidade.LogoBase64))
                    existente.LogoBase64 = unidade.LogoBase64;
            }

            await _context.SaveChangesAsync();
            return Ok(unidade);
        }
    }
}
