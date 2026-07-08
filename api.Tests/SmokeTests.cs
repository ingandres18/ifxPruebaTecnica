using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Api.Tests;

/// <summary>
/// Prueba de humo del harness de integración (Slice 1). Arranca la API en memoria con
/// WebApplicationFactory y confirma que responde. Usa una BD SQLite separada para no tocar la
/// de desarrollo. Los tests reales de auth/VMs llegan en slices posteriores.
/// </summary>
public class SmokeTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public SmokeTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
            builder.UseSetting("ConnectionStrings:Default", "Data Source=ifxvms-tests.db"));
    }

    [Fact]
    public async Task Endpoint_raiz_responde_200()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
