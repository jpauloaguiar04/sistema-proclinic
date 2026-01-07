using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProClinic.Api.Data;
using ProClinic.Api.Models;
using System.Text;

namespace ProClinic.Api.Controllers
{
    // DTO para receber os dados do Frontend de forma tipada
    public class SalvarGuiaPayload
    {
        public GuiaTiss? Guia { get; set; }
        public decimal ValorProcedimento { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class FaturamentoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FaturamentoController(AppDbContext context) => _context = context;

        // --- 1. LISTAGEM ---
        [HttpGet("pendentes")]
        public async Task<ActionResult<IEnumerable<object>>> GetPendentes()
        {
            var dataCorte = DateTime.UtcNow.AddMonths(-6);
            
            // Join manual para trazer dados relacionados
            var query = from a in _context.Agendamentos
                        join p in _context.Pacientes on a.CpfPaciente equals p.CPF into pac
                        from subP in pac.DefaultIfEmpty()
                        where a.Status == "Confirmado" 
                              && a.LoteTissId == null 
                              && a.FormaPagamento == "FATURAMENTO"
                              && a.DataHoraInicio >= dataCorte
                        select new {
                            Agendamento = a,
                            NomePaciente = subP != null ? subP.Nome : "Desconhecido",
                            NomeConvenio = a.Convenio != null ? a.Convenio.Nome : "",
                            NomeServico = a.Servico != null ? a.Servico.Nome : ""
                        };

            var lista = await query.ToListAsync();
            var ids = lista.Select(x => x.Agendamento.Id).ToList();
            
            // Verifica quais já têm guia salva
            var guiasSalvas = await _context.GuiasTiss
                .Where(g => ids.Contains(g.AgendamentoId))
                .Select(g => g.AgendamentoId)
                .ToListAsync();

            return Ok(lista.Select(item => new {
                id = item.Agendamento.Id,
                data = item.Agendamento.DataHoraInicio,
                paciente = item.NomePaciente,
                convenio = item.NomeConvenio,
                exame = item.NomeServico,
                valor = item.Agendamento.ValorFinal,
                temGuiaSalva = guiasSalvas.Contains(item.Agendamento.Id)
            }));
        }

        // --- 2. EDITOR DE GUIA ---
        [HttpGet("guia/{agendamentoId}")]
        public async Task<ActionResult<object>> GetGuia(int agendamentoId)
        {
            var guia = await _context.GuiasTiss.FirstOrDefaultAsync(g => g.AgendamentoId == agendamentoId);
            var ag = await _context.Agendamentos.FindAsync(agendamentoId);
            
            if (ag == null) return NotFound("Agendamento não encontrado");

            if (guia == null)
            {
                // Cria guia em memória (pré-preenchida) se não existir
                guia = new GuiaTiss
                {
                    AgendamentoId = ag.Id,
                    RegistroAns = "000000",
                    NumeroGuiaPrestador = ag.OrdemServico ?? "",
                    NumeroCarteira = ag.NumeroCarteirinha ?? "",
                    HoraInicial = ag.DataHoraInicio.ToString("HH:mm:ss"),
                    HoraFinal = ag.DataHoraInicio.AddMinutes(20).ToString("HH:mm:ss"),
                    DataExecucao = ag.DataHoraInicio.Date,
                    CaraterAtendimento = "1", // Eletivo
                    TipoAtendimento = "05",   // Exame
                    IndicacaoAcidente = "9"   // Não Acidente
                };
            }

            return Ok(new {
                Guia = guia,
                ValorProcedimento = ag.ValorFinal
            });
        }

        [HttpPost("salvar-guia")]
        public async Task<ActionResult> SalvarGuia([FromBody] SalvarGuiaPayload payload)
        {
            if (payload == null || payload.Guia == null || payload.Guia.AgendamentoId == 0) 
                return BadRequest("Dados inválidos");

            var guiaModel = payload.Guia;
            var novoValor = payload.ValorProcedimento;

            // 1. Atualiza ou Cria a Guia TISS
            var existente = await _context.GuiasTiss
                .FirstOrDefaultAsync(g => g.AgendamentoId == guiaModel.AgendamentoId);

            if (existente != null)
            {
                // Copia os valores do modelo recebido para o existente
                _context.Entry(existente).CurrentValues.SetValues(guiaModel);
                // Garante que o ID não seja alterado
                existente.Id = existente.Id; 
            }
            else
            {
                guiaModel.Id = 0; // Força ID 0 para insert
                _context.GuiasTiss.Add(guiaModel);
            }

            // 2. Atualiza o Valor no Agendamento
            var agendamento = await _context.Agendamentos.FindAsync(guiaModel.AgendamentoId);
            if(agendamento != null)
            {
                agendamento.ValorFinal = novoValor;
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        // --- 3. DESPESAS / KITS ---
        [HttpGet("despesas/{guiaId}")]
        public async Task<ActionResult<IEnumerable<GuiaTissDespesa>>> GetDespesas(int guiaId)
        {
            return await _context.GuiasTissDespesas
                .Where(d => d.GuiaTissId == guiaId)
                .ToListAsync();
        }

        [HttpPost("despesas")]
        public async Task<ActionResult> AddDespesa([FromBody] GuiaTissDespesa despesa)
        {
            if (despesa.GuiaTissId == 0) return BadRequest("Guia não identificada. Salve a guia principal antes.");
            
            // Recalcula total para segurança
            despesa.ValorTotal = despesa.Quantidade * despesa.ValorUnitario;
            
            _context.GuiasTissDespesas.Add(despesa);
            await _context.SaveChangesAsync();
            return Ok(despesa);
        }

        [HttpDelete("despesas/{id}")]
        public async Task<ActionResult> RemoveDespesa(int id)
        {
            var d = await _context.GuiasTissDespesas.FindAsync(id);
            if (d == null) return NotFound();
            
            _context.GuiasTissDespesas.Remove(d);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // --- 4. FLUXO DE CAIXA E LOTES ---
        [HttpGet("caixa")]
        public async Task<ActionResult<object>> GetCaixaDia([FromQuery] DateTime data)
        {
             if (data.Kind == DateTimeKind.Unspecified) data = DateTime.SpecifyKind(data, DateTimeKind.Utc);
             
             var inicio = data.Date;
             var fim = data.Date.AddDays(1);

            var movimentos = await _context.Agendamentos
                .Where(a => a.DataConfirmacao >= inicio && a.DataConfirmacao < fim && a.Pago == true)
                .ToListAsync();

            var resumo = movimentos
                .GroupBy(a => a.FormaPagamento ?? "OUTROS")
                .Select(g => new { Forma = g.Key, Total = g.Sum(x => x.ValorFinal), Qtd = g.Count() })
                .ToList();

            return Ok(new { TotalGeral = movimentos.Sum(x => x.ValorFinal), Detalhamento = resumo });
        }

        [HttpPost("gerar-xml")]
        public async Task<ActionResult> GerarXml([FromBody] List<int> agendamentoIds)
        {
            if (agendamentoIds == null || !agendamentoIds.Any()) return BadRequest("Selecione itens.");

            var lote = new LoteTiss { 
                DataFechamento = DateTime.UtcNow, 
                QtdGuias = agendamentoIds.Count, 
                ValorTotal = 0, 
                XmlConteudo = "" 
            };
            _context.LotesTiss.Add(lote);
            await _context.SaveChangesAsync();

            var sb = new StringBuilder();
            
            // Cabeçalho XML TISS 4.01.00
            sb.AppendLine("<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?>");
            sb.AppendLine("<ans:mensagemTISS xmlns:ans=\"http://www.ans.gov.br/padroes/tiss/schemas\">");
            sb.AppendLine("  <ans:cabecalho><ans:identificacaoTransacao><ans:tipoTransacao>ENVIO_LOTE_GUIAS</ans:tipoTransacao><ans:sequencialTransacao>" + DateTime.Now.ToString("HHmmss") + "</ans:sequencialTransacao><ans:dataRegistroTransacao>" + DateTime.Now.ToString("yyyy-MM-dd") + "</ans:dataRegistroTransacao><ans:horaRegistroTransacao>" + DateTime.Now.ToString("HH:mm:ss") + "</ans:horaRegistroTransacao></ans:identificacaoTransacao><ans:origem><ans:identificacaoPrestador><ans:CNPJ>00000000000000</ans:CNPJ></ans:identificacaoPrestador></ans:origem><ans:Padrao>4.01.00</ans:Padrao></ans:cabecalho>");
            sb.AppendLine("  <ans:prestadorParaOperadora><ans:loteGuias>");
            sb.AppendLine($"      <ans:numeroLote>{lote.Id}</ans:numeroLote>");
            sb.AppendLine("      <ans:guiasTISS>");

            decimal totalLote = 0;

            foreach (var id in agendamentoIds)
            {
                var agendamento = await _context.Agendamentos.Include(a => a.Servico).FirstOrDefaultAsync(a => a.Id == id);
                if (agendamento == null) continue;

                var guia = await _context.GuiasTiss.Include(g => g.Despesas).FirstOrDefaultAsync(g => g.AgendamentoId == id);
                
                if (guia == null) guia = new GuiaTiss { 
                    DataExecucao = agendamento.DataHoraInicio, 
                    HoraInicial = "08:00:00", 
                    HoraFinal = "08:20:00",
                    RegistroAns = "000000",
                    NumeroGuiaPrestador = agendamento.OrdemServico ?? "0"
                };

                var paciente = await _context.Pacientes.FirstOrDefaultAsync(p => p.CPF == agendamento.CpfPaciente);

                decimal valorDespesas = guia.Despesas?.Sum(d => d.ValorTotal) ?? 0;
                decimal valorTotalGuia = agendamento.ValorFinal + valorDespesas;
                totalLote += valorTotalGuia;

                sb.AppendLine("        <ans:guiaSP-SADT>");
                sb.AppendLine($"          <ans:cabecalhoGuia><ans:registroANS>{guia.RegistroAns}</ans:registroANS><ans:numeroGuiaPrestador>{guia.NumeroGuiaPrestador}</ans:numeroGuiaPrestador></ans:cabecalhoGuia>");
                sb.AppendLine($"          <ans:dadosBeneficiario><ans:numeroCarteira>{guia.NumeroCarteira ?? "000"}</ans:numeroCarteira><ans:nomeBeneficiario>{paciente?.Nome ?? "CONSUMIDOR"}</ans:nomeBeneficiario><ans:atendimentoRN>N</ans:atendimentoRN></ans:dadosBeneficiario>");
                
                sb.AppendLine("          <ans:procedimentosExecutados>");
                sb.AppendLine("            <ans:procedimentoExecutado>");
                sb.AppendLine("              <ans:sequencialItem>1</ans:sequencialItem>");
                sb.AppendLine($"              <ans:dataExecucao>{guia.DataExecucao:yyyy-MM-dd}</ans:dataExecucao>");
                sb.AppendLine($"              <ans:horaInicial>{guia.HoraInicial}</ans:horaInicial><ans:horaFinal>{guia.HoraFinal}</ans:horaFinal>");
                sb.AppendLine($"              <ans:procedimento><ans:codigoTabela>22</ans:codigoTabela><ans:codigoProcedimento>{agendamento.Servico?.CodigoTuss ?? "00000000"}</ans:codigoProcedimento><ans:descricaoProcedimento>{agendamento.Servico?.Nome}</ans:descricaoProcedimento></ans:procedimento>");
                sb.AppendLine($"              <ans:quantidadeExecutada>1</ans:quantidadeExecutada><ans:reducaoAcrescimo>1.00</ans:reducaoAcrescimo><ans:valorUnitario>{agendamento.ValorFinal:F2}</ans:valorUnitario><ans:valorTotal>{agendamento.ValorFinal:F2}</ans:valorTotal>");
                sb.AppendLine("            </ans:procedimentoExecutado>");
                sb.AppendLine("          </ans:procedimentosExecutados>");

                if (guia.Despesas != null && guia.Despesas.Any())
                {
                    sb.AppendLine("          <ans:outrasDespesas>");
                    foreach(var d in guia.Despesas) {
                        sb.AppendLine("            <ans:despesa>");
                        sb.AppendLine($"              <ans:codigoDespesa>{d.Codigo}</ans:codigoDespesa>");
                        sb.AppendLine($"              <ans:servicosExecutados><ans:dataExecucao>{guia.DataExecucao:yyyy-MM-dd}</ans:dataExecucao><ans:horaInicial>{guia.HoraInicial}</ans:horaInicial><ans:horaFinal>{guia.HoraFinal}</ans:horaFinal><ans:codigoTabela>00</ans:codigoTabela><ans:codigoProcedimento>{d.Codigo}</ans:codigoProcedimento><ans:descricaoProcedimento>{d.Descricao}</ans:descricaoProcedimento><ans:quantidadeExecutada>{d.Quantidade}</ans:quantidadeExecutada><ans:reducaoAcrescimo>1.00</ans:reducaoAcrescimo><ans:valorUnitario>{d.ValorUnitario:F2}</ans:valorUnitario><ans:valorTotal>{d.ValorTotal:F2}</ans:valorTotal></ans:servicosExecutados>");
                        sb.AppendLine("            </ans:despesa>");
                    }
                    sb.AppendLine("          </ans:outrasDespesas>");
                }

                sb.AppendLine($"          <ans:valorTotal><ans:valorProcedimentos>{agendamento.ValorFinal:F2}</ans:valorProcedimentos><ans:valorMateriais>{valorDespesas:F2}</ans:valorMateriais><ans:valorTotalGeral>{valorTotalGuia:F2}</ans:valorTotalGeral></ans:valorTotal>");
                sb.AppendLine("        </ans:guiaSP-SADT>");

                agendamento.LoteTissId = lote.Id;
                _context.Agendamentos.Update(agendamento);
            }

            sb.AppendLine("      </ans:guiasTISS></ans:loteGuias></ans:prestadorParaOperadora><ans:epilogo><ans:hash>00000000000000000000000000000000</ans:hash></ans:epilogo></ans:mensagemTISS>");

            lote.ValorTotal = totalLote;
            lote.XmlConteudo = sb.ToString();
            _context.LotesTiss.Update(lote);
            await _context.SaveChangesAsync();

            return Ok(new { Mensagem = "Lote gerado com sucesso!" });
        }

        [HttpGet("lotes")]
        public async Task<ActionResult<IEnumerable<object>>> GetLotes()
        {
            return await _context.LotesTiss.OrderByDescending(l => l.DataFechamento).ToListAsync();
        }
        
        [HttpGet("lote/{id}/xml")]
        public async Task<IActionResult> DownloadXml(int id)
        {
            var lote = await _context.LotesTiss.FindAsync(id);
            if (lote == null) return NotFound();
            var bytes = Encoding.GetEncoding("ISO-8859-1").GetBytes(lote.XmlConteudo ?? "");
            return File(bytes, "application/xml", $"lote_{id}.xml");
        }
    }
}