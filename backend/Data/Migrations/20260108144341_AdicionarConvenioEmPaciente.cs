using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProClinic.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarConvenioEmPaciente : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Convenio",
                table: "Pacientes",
                newName: "Email");

            migrationBuilder.AlterColumn<string>(
                name: "Sexo",
                table: "Pacientes",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<bool>(
                name: "Ativo",
                table: "Pacientes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "ConvenioId",
                table: "Pacientes",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_ConvenioId",
                table: "Pacientes",
                column: "ConvenioId");

            migrationBuilder.AddForeignKey(
                name: "FK_Pacientes_Convenios_ConvenioId",
                table: "Pacientes",
                column: "ConvenioId",
                principalTable: "Convenios",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pacientes_Convenios_ConvenioId",
                table: "Pacientes");

            migrationBuilder.DropIndex(
                name: "IX_Pacientes_ConvenioId",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Ativo",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "ConvenioId",
                table: "Pacientes");

            migrationBuilder.RenameColumn(
                name: "Email",
                table: "Pacientes",
                newName: "Convenio");

            migrationBuilder.AlterColumn<string>(
                name: "Sexo",
                table: "Pacientes",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }
    }
}
