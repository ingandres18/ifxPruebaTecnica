using Api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Api.Tests;

/// <summary>
/// Fábrica de la API para tests de integración. Reemplaza la BD SQLite de archivo por una en
/// memoria (conexión abierta durante la vida de la fábrica) para aislar cada suite. El seed de
/// arranque (migración + usuarios) corre automáticamente contra esta BD.
/// </summary>
public class IfxApiFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection;

    public IfxApiFactory()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Development: Secure=false en la cookie (para poder inspeccionarla en el test).
        builder.UseEnvironment("Development");

        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor is not null) services.Remove(descriptor);

            services.AddDbContext<AppDbContext>(options => options.UseSqlite(_connection));
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _connection.Dispose();
    }
}
