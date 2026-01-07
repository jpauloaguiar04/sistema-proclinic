using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ProClinic.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPacientes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Permissao_Usuarios_UsuarioId",
                table: "Permissao");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Permissao",
                table: "Permissao");

            migrationBuilder.DropIndex(
                name: "IX_Permissao_UsuarioId",
                table: "Permissao");

            migrationBuilder.DropColumn(
                name: "UsuarioId",
                table: "Permissao");

            migrationBuilder.RenameTable(
                name: "Permissao",
                newName: "Permissoes");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Permissoes",
                table: "Permissoes",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Pacientes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CPF = table.Column<string>(type: "text", nullable: false),
                    DataNascimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Telefone = table.Column<string>(type: "text", nullable: true),
                    Convenio = table.Column<string>(type: "text", nullable: true),
                    DataCadastro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pacientes", x => x.Id);
                });

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Pacientes");

            migrationBuilder.DropTable(
                name: "PermissaoUsuario");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Permissoes",
                table: "Permissoes");

            migrationBuilder.RenameTable(
                name: "Permissoes",
                newName: "Permissao");

            migrationBuilder.AddColumn<int>(
                name: "UsuarioId",
                table: "Permissao",
                type: "integer",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Permissao",
                table: "Permissao",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Permissao_UsuarioId",
                table: "Permissao",
                column: "UsuarioId");

            migrationBuilder.AddForeignKey(
                name: "FK_Permissao_Usuarios_UsuarioId",
                table: "Permissao",
                column: "UsuarioId",
                principalTable: "Usuarios",
                principalColumn: "Id");
        }
    }
}
