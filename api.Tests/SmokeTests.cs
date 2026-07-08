using System.Net;

namespace Api.Tests;

/// <summary>
/// Prueba de humo del harness de integración (Slice 1). Arranca la API en memoria y confirma
/// que responde. Los tests de negocio (auth, VMs) viven en sus propios archivos.
/// </summary>
public class SmokeTests(IfxApiFactory factory) : IClassFixture<IfxApiFactory>
{
    [Fact]
    public async Task Endpoint_raiz_responde_200()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
