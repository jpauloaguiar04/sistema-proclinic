using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ProClinic.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarColunaMedicoSolicitante : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PermissaoUsuario");

            migrationBuilder.DropColumn(
                name: "Crm",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "DataCriacao",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "Descricao",
                table: "Permissoes");

            migrationBuilder.RenameColumn(
                name: "Role",
                table: "Usuarios",
                newName: "SenhaHash");

            migrationBuilder.RenameColumn(
                name: "PasswordHash",
                table: "Usuarios",
                newName: "Login");

            migrationBuilder.AddColumn<int>(
                name: "GrupoUsuarioId",
                table: "Usuarios",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Modulo",
                table: "Permissoes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "Pacientes",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<DateTime>(
                name: "DataNascimento",
                table: "Pacientes",
                type: "timestamp without time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DataCadastro",
                table: "Pacientes",
                type: "timestamp without time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<string>(
                name: "Sexo",
                table: "Pacientes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Pacientes_CPF",
                table: "Pacientes",
                column: "CPF");

            migrationBuilder.CreateTable(
                name: "Convenios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    RegistroAns = table.Column<string>(type: "text", nullable: false),
                    ValorConsulta = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Convenios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Equipamentos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    AETitle = table.Column<string>(type: "text", nullable: false),
                    Modalidade = table.Column<string>(type: "text", nullable: false),
                    IP = table.Column<string>(type: "text", nullable: true),
                    Porta = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Equipamentos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GruposUsuario",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GruposUsuario", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LotesTiss",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DataFechamento = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    ConvenioNome = table.Column<string>(type: "text", nullable: true),
                    ValorTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    XmlConteudo = table.Column<string>(type: "text", nullable: true),
                    QtdGuias = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LotesTiss", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MascarasLaudo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Titulo = table.Column<string>(type: "text", nullable: false),
                    Conteudo = table.Column<string>(type: "text", nullable: false),
                    Atalho = table.Column<string>(type: "text", nullable: true),
                    ExameNome = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MascarasLaudo", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Materiais",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: true),
                    PrecoBase = table.Column<decimal>(type: "numeric", nullable: false),
                    Tipo = table.Column<string>(type: "text", nullable: false),
                    CodigoTuss = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Materiais", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Medicos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    CRM = table.Column<string>(type: "text", nullable: false),
                    UF = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: true),
                    Telefone = table.Column<string>(type: "text", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    AssinaturaBase64 = table.Column<string>(type: "text", nullable: true),
                    EhSolicitante = table.Column<bool>(type: "boolean", nullable: false),
                    EhCorpoClinico = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medicos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Servicos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    CodigoTuss = table.Column<string>(type: "text", nullable: false),
                    Modalidade = table.Column<string>(type: "text", nullable: false),
                    PrecoBase = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Servicos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Unidade",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NomeFantasia = table.Column<string>(type: "text", nullable: true),
                    RazaoSocial = table.Column<string>(type: "text", nullable: true),
                    CNPJ = table.Column<string>(type: "text", nullable: true),
                    CNES = table.Column<string>(type: "text", nullable: true),
                    Endereco = table.Column<string>(type: "text", nullable: true),
                    Telefone = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    LogoBase64 = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Unidade", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Agendas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    IntervaloMinutos = table.Column<int>(type: "integer", nullable: false),
                    HorarioInicio = table.Column<string>(type: "text", nullable: false),
                    HorarioFim = table.Column<string>(type: "text", nullable: false),
                    Ativa = table.Column<bool>(type: "boolean", nullable: false),
                    EquipamentoId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Agendas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Agendas_Equipamentos_EquipamentoId",
                        column: x => x.EquipamentoId,
                        principalTable: "Equipamentos",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "GrupoUsuarioPermissao",
                columns: table => new
                {
                    GruposId = table.Column<int>(type: "integer", nullable: false),
                    PermissoesId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GrupoUsuarioPermissao", x => new { x.GruposId, x.PermissoesId });
                    table.ForeignKey(
                        name: "FK_GrupoUsuarioPermissao_GruposUsuario_GruposId",
                        column: x => x.GruposId,
                        principalTable: "GruposUsuario",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GrupoUsuarioPermissao_Permissoes_PermissoesId",
                        column: x => x.PermissoesId,
                        principalTable: "Permissoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FrasesLaudo",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MascaraLaudoId = table.Column<int>(type: "integer", nullable: false),
                    Titulo = table.Column<string>(type: "text", nullable: false),
                    Texto = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FrasesLaudo", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FrasesLaudo_MascarasLaudo_MascaraLaudoId",
                        column: x => x.MascaraLaudoId,
                        principalTable: "MascarasLaudo",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TabelaPrecos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ConvenioId = table.Column<int>(type: "integer", nullable: false),
                    ServicoId = table.Column<int>(type: "integer", nullable: false),
                    Preco = table.Column<decimal>(type: "numeric", nullable: false),
                    CodigoNoConvenio = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TabelaPrecos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TabelaPrecos_Convenios_ConvenioId",
                        column: x => x.ConvenioId,
                        principalTable: "Convenios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TabelaPrecos_Servicos_ServicoId",
                        column: x => x.ServicoId,
                        principalTable: "Servicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Agendamentos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AgendaConfigId = table.Column<int>(type: "integer", nullable: false),
                    CpfPaciente = table.Column<string>(type: "text", nullable: false),
                    DataHoraInicio = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    DataHoraFim = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    OrdemServico = table.Column<string>(type: "text", nullable: true),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    ConvenioId = table.Column<int>(type: "integer", nullable: true),
                    ServicoId = table.Column<int>(type: "integer", nullable: true),
                    MedicoSolicitanteId = table.Column<int>(type: "integer", nullable: true),
                    NumeroCarteirinha = table.Column<string>(type: "text", nullable: true),
                    NumeroGuia = table.Column<string>(type: "text", nullable: true),
                    SenhaAutorizacao = table.Column<string>(type: "text", nullable: true),
                    ValorFinal = table.Column<decimal>(type: "numeric", nullable: false),
                    FormaPagamento = table.Column<string>(type: "text", nullable: true),
                    Pago = table.Column<bool>(type: "boolean", nullable: false),
                    DataConfirmacao = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    TextoLaudo = table.Column<string>(type: "text", nullable: true),
                    StatusLaudo = table.Column<string>(type: "text", nullable: true),
                    DataLaudo = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    MedicoLaudoId = table.Column<int>(type: "integer", nullable: true),
                    LoteTissId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Agendamentos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Agendamentos_Agendas_AgendaConfigId",
                        column: x => x.AgendaConfigId,
                        principalTable: "Agendas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Agendamentos_Convenios_ConvenioId",
                        column: x => x.ConvenioId,
                        principalTable: "Convenios",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Agendamentos_LotesTiss_LoteTissId",
                        column: x => x.LoteTissId,
                        principalTable: "LotesTiss",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Agendamentos_Medicos_MedicoLaudoId",
                        column: x => x.MedicoLaudoId,
                        principalTable: "Medicos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Agendamentos_Medicos_MedicoSolicitanteId",
                        column: x => x.MedicoSolicitanteId,
                        principalTable: "Medicos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Agendamentos_Pacientes_CpfPaciente",
                        column: x => x.CpfPaciente,
                        principalTable: "Pacientes",
                        principalColumn: "CPF",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Agendamentos_Servicos_ServicoId",
                        column: x => x.ServicoId,
                        principalTable: "Servicos",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "AgendamentoDespesas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AgendamentoId = table.Column<int>(type: "integer", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Quantidade = table.Column<int>(type: "integer", nullable: false),
                    PrecoUnitario = table.Column<decimal>(type: "numeric", nullable: false),
                    Tipo = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AgendamentoDespesas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AgendamentoDespesas_Agendamentos_AgendamentoId",
                        column: x => x.AgendamentoId,
                        principalTable: "Agendamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GuiasTiss",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AgendamentoId = table.Column<int>(type: "integer", nullable: false),
                    RegistroAns = table.Column<string>(type: "text", nullable: false),
                    NumeroGuiaPrestador = table.Column<string>(type: "text", nullable: false),
                    NumeroGuiaOperadora = table.Column<string>(type: "text", nullable: true),
                    DataAutorizacao = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    Senha = table.Column<string>(type: "text", nullable: true),
                    DataValidadeSenha = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    NumeroCarteira = table.Column<string>(type: "text", nullable: false),
                    AtendimentoRN = table.Column<string>(type: "text", nullable: false),
                    NomeProfissionalSolicitante = table.Column<string>(type: "text", nullable: true),
                    ConselhoProfissional = table.Column<string>(type: "text", nullable: true),
                    NumeroConselhoSolicitante = table.Column<string>(type: "text", nullable: true),
                    UFSolicitante = table.Column<string>(type: "text", nullable: true),
                    CBOSSolicitante = table.Column<string>(type: "text", nullable: true),
                    CaraterAtendimento = table.Column<string>(type: "text", nullable: false),
                    TipoAtendimento = table.Column<string>(type: "text", nullable: false),
                    IndicacaoAcidente = table.Column<string>(type: "text", nullable: false),
                    RegimeAtendimento = table.Column<string>(type: "text", nullable: false),
                    DataExecucao = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    HoraInicial = table.Column<string>(type: "text", nullable: false),
                    HoraFinal = table.Column<string>(type: "text", nullable: false),
                    Gerada = table.Column<bool>(type: "boolean", nullable: false),
                    LoteTissId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GuiasTiss", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GuiasTiss_Agendamentos_AgendamentoId",
                        column: x => x.AgendamentoId,
                        principalTable: "Agendamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GuiasTissDespesas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    GuiaTissId = table.Column<int>(type: "integer", nullable: false),
                    Codigo = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: false),
                    ValorUnitario = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Quantidade = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    ValorTotal = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Tipo = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GuiasTissDespesas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GuiasTissDespesas_GuiasTiss_GuiaTissId",
                        column: x => x.GuiaTissId,
                        principalTable: "GuiasTiss",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_GrupoUsuarioId",
                table: "Usuarios",
                column: "GrupoUsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_CPF",
                table: "Pacientes",
                column: "CPF",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AgendamentoDespesas_AgendamentoId",
                table: "AgendamentoDespesas",
                column: "AgendamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_AgendaConfigId",
                table: "Agendamentos",
                column: "AgendaConfigId");

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_ConvenioId",
                table: "Agendamentos",
                column: "ConvenioId");

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_CpfPaciente",
                table: "Agendamentos",
                column: "CpfPaciente");

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_LoteTissId",
                table: "Agendamentos",
                column: "LoteTissId");

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_MedicoLaudoId",
                table: "Agendamentos",
                column: "MedicoLaudoId");

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_MedicoSolicitanteId",
                table: "Agendamentos",
                column: "MedicoSolicitanteId");

            migrationBuilder.CreateIndex(
                name: "IX_Agendamentos_ServicoId",
                table: "Agendamentos",
                column: "ServicoId");

            migrationBuilder.CreateIndex(
                name: "IX_Agendas_EquipamentoId",
                table: "Agendas",
                column: "EquipamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_FrasesLaudo_MascaraLaudoId",
                table: "FrasesLaudo",
                column: "MascaraLaudoId");

            migrationBuilder.CreateIndex(
                name: "IX_GrupoUsuarioPermissao_PermissoesId",
                table: "GrupoUsuarioPermissao",
                column: "PermissoesId");

            migrationBuilder.CreateIndex(
                name: "IX_GuiasTiss_AgendamentoId",
                table: "GuiasTiss",
                column: "AgendamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_GuiasTissDespesas_GuiaTissId",
                table: "GuiasTissDespesas",
                column: "GuiaTissId");

            migrationBuilder.CreateIndex(
                name: "IX_TabelaPrecos_ConvenioId",
                table: "TabelaPrecos",
                column: "ConvenioId");

            migrationBuilder.CreateIndex(
                name: "IX_TabelaPrecos_ServicoId",
                table: "TabelaPrecos",
                column: "ServicoId");

            migrationBuilder.AddForeignKey(
                name: "FK_Usuarios_GruposUsuario_GrupoUsuarioId",
                table: "Usuarios",
                column: "GrupoUsuarioId",
                principalTable: "GruposUsuario",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Usuarios_GruposUsuario_GrupoUsuarioId",
                table: "Usuarios");

            migrationBuilder.DropTable(
                name: "AgendamentoDespesas");

            migrationBuilder.DropTable(
                name: "FrasesLaudo");

            migrationBuilder.DropTable(
                name: "GrupoUsuarioPermissao");

            migrationBuilder.DropTable(
                name: "GuiasTissDespesas");

            migrationBuilder.DropTable(
                name: "Materiais");

            migrationBuilder.DropTable(
                name: "TabelaPrecos");

            migrationBuilder.DropTable(
                name: "Unidade");

            migrationBuilder.DropTable(
                name: "MascarasLaudo");

            migrationBuilder.DropTable(
                name: "GruposUsuario");

            migrationBuilder.DropTable(
                name: "GuiasTiss");

            migrationBuilder.DropTable(
                name: "Agendamentos");

            migrationBuilder.DropTable(
                name: "Agendas");

            migrationBuilder.DropTable(
                name: "Convenios");

            migrationBuilder.DropTable(
                name: "LotesTiss");

            migrationBuilder.DropTable(
                name: "Medicos");

            migrationBuilder.DropTable(
                name: "Servicos");

            migrationBuilder.DropTable(
                name: "Equipamentos");

            migrationBuilder.DropIndex(
                name: "IX_Usuarios_GrupoUsuarioId",
                table: "Usuarios");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Pacientes_CPF",
                table: "Pacientes");

            migrationBuilder.DropIndex(
                name: "IX_Pacientes_CPF",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "GrupoUsuarioId",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "Modulo",
                table: "Permissoes");

            migrationBuilder.DropColumn(
                name: "Sexo",
                table: "Pacientes");

            migrationBuilder.RenameColumn(
                name: "SenhaHash",
                table: "Usuarios",
                newName: "Role");

            migrationBuilder.RenameColumn(
                name: "Login",
                table: "Usuarios",
                newName: "PasswordHash");

            migrationBuilder.AddColumn<string>(
                name: "Crm",
                table: "Usuarios",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DataCriacao",
                table: "Usuarios",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Usuarios",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Descricao",
                table: "Permissoes",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nome",
                table: "Pacientes",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DataNascimento",
                table: "Pacientes",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "DataCadastro",
                table: "Pacientes",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");

            migrationBuilder.CreateTable(
                name: "PermissaoUsuario",
                columns: table => new
                {
                    PermissoesId = table.Column<int>(type: "integer", nullable: false),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PermissaoUsuario", x => new { x.PermissoesId, x.UsuarioId });
                    table.ForeignKey(
                        name: "FK_PermissaoUsuario_Permissoes_PermissoesId",
                        column: x => x.PermissoesId,
                        principalTable: "Permissoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PermissaoUsuario_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PermissaoUsuario_UsuarioId",
                table: "PermissaoUsuario",
                column: "UsuarioId");
        }
    }
}
