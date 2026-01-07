using Microsoft.EntityFrameworkCore;
using ProClinic.Api.Data;
using System.Text.Json.Serialization;

// --- CORREÇÃO 1: Permite datas sem UTC estrito no PostgreSQL (Evita erro 500 em datas) ---
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// 1. Configuração de CORS (Permitir acesso do Frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("ProClinicPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 2. Configurar o Kestrel para ouvir na porta 8080 (Docker)
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(8080);
});

// 3. Conexão com Banco de Dados
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// --- CORREÇÃO 2: Ignora ciclos de referência no JSON (Evita erro 500 em objetos aninhados) ---
builder.Services.AddControllers().AddJsonOptions(x =>
   x.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Aplica as Migrações Automaticamente ao Iniciar
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated();
        Console.WriteLine("Banco de dados migrado com sucesso!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Erro ao migrar banco de dados: {ex.Message}");
    }
}

// Configuração do Pipeline HTTP
app.UseSwagger();
app.UseSwaggerUI();

// app.UseHttpsRedirection(); // Comentado para simplificar Docker interno

app.UseCors("ProClinicPolicy");

app.UseAuthorization();

app.MapControllers();

app.Run();