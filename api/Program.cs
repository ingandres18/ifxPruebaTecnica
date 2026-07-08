using Api.Data;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// EF Core + SQLite. La cadena de conexión vive en configuración (appsettings.Development.json),
// nunca hardcodeada.
var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? "Data Source=ifxvms.db";
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(connectionString));

// OpenAPI nativo (documento) + Scalar (UI interactiva) para que se pruebe la API sin curl.
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();               // documento en /openapi/v1.json
    app.MapScalarApiReference();    // UI interactiva en /scalar
}

// Endpoint de humo: confirma que la API responde (se reemplaza por features reales en slices siguientes).
app.MapGet("/", () => Results.Ok(new { status = "ok", service = "ifx-vms-api" }));

// Aplica migraciones y siembra datos al arrancar (cero setup para el revisor).
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DbSeeder.SeedAsync(db);
}

app.Run();

// Expuesto para WebApplicationFactory<Program> en api.Tests (tests de integración en memoria).
public partial class Program;
