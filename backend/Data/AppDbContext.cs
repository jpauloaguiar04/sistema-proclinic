using Microsoft.EntityFrameworkCore;
using ProClinic.Api.Models;

namespace ProClinic.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<AgendaConfig> Agendas { get; set; }
        public DbSet<Agendamento> Agendamentos { get; set; }
        public DbSet<Convenio> Convenios { get; set; }
        public DbSet<Medico> Medicos { get; set; }
        public DbSet<Paciente> Pacientes { get; set; }
        public DbSet<Servico> Servicos { get; set; }
        public DbSet<Unidade> Unidade { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<GrupoUsuario> GruposUsuario { get; set; }
        public DbSet<Permissao> Permissoes { get; set; }
        public DbSet<GrupoUsuarioPermissao> GrupoUsuarioPermissao { get; set; }
        public DbSet<ConvenioServico> TabelaPrecos { get; set; }
        public DbSet<LoteTiss> LotesTiss { get; set; }
        public DbSet<Material> Materiais { get; set; }
        public DbSet<AgendamentoDespesa> AgendamentoDespesas { get; set; }
        public DbSet<MascaraLaudo> MascarasLaudo { get; set; }
        public DbSet<FraseLaudo> FrasesLaudo { get; set; }
        public DbSet<Equipamento> Equipamentos { get; set; }
        public DbSet<GuiaTiss> GuiasTiss { get; set; }
        
        // --- Adicionado para Faturamento ---
        public DbSet<GuiaTissDespesa> GuiasTissDespesas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<GrupoUsuario>()
                .HasMany(g => g.Permissoes)
                .WithMany(p => p.Grupos)
                .UsingEntity<GrupoUsuarioPermissao>(
                    j => j.HasOne(gp => gp.Permissao).WithMany().HasForeignKey(gp => gp.PermissoesId),
                    j => j.HasOne(gp => gp.Grupo).WithMany().HasForeignKey(gp => gp.GruposId),
                    j => { j.HasKey(t => new { t.GruposId, t.PermissoesId }); });
        }
    }
}