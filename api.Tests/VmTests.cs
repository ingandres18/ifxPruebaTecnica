using System.Net;
using System.Net.Http.Json;

namespace Api.Tests;

/// <summary>
/// Tests de integración del CRUD de VMs (SPEC §11): autorización por rol, validación server-side
/// e idempotencia del DELETE. El cliente de la fábrica arrastra la cookie tras el login.
/// </summary>
public class VmTests(IfxApiFactory factory) : IClassFixture<IfxApiFactory>
{
    private static readonly object ValidVm = new
    {
        name = "test-vm-01",
        cores = 4,
        ram = 8,
        disk = 80,
        os = "Ubuntu",
        status = "Encendida",
    };

    private async Task<HttpClient> LoginAsAsync(string email, string password)
    {
        var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return client;
    }

    private Task<HttpClient> LoginAsAdminAsync() => LoginAsAsync("admin@ifx.com", "Admin123!");
    private Task<HttpClient> LoginAsClienteAsync() => LoginAsAsync("cliente@ifx.com", "Cliente123!");

    [Fact]
    public async Task Get_vms_sin_cookie_devuelve_401()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/vms");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Get_vms_con_cliente_o_admin_devuelve_200()
    {
        var admin = await LoginAsAdminAsync();
        var cliente = await LoginAsClienteAsync();

        Assert.Equal(HttpStatusCode.OK, (await admin.GetAsync("/api/vms")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await cliente.GetAsync("/api/vms")).StatusCode);
    }

    [Fact]
    public async Task Post_vms_con_cliente_devuelve_403()
    {
        var cliente = await LoginAsClienteAsync();

        var response = await cliente.PostAsJsonAsync("/api/vms", ValidVm);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Post_vms_con_admin_valido_devuelve_201()
    {
        var admin = await LoginAsAdminAsync();

        var response = await admin.PostAsJsonAsync("/api/vms", ValidVm);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<VmResponseDto>();
        Assert.NotNull(body);
        Assert.Equal("test-vm-01", body!.Name);
        Assert.Equal("Ubuntu", body.Os);
    }

    [Fact]
    public async Task Post_vms_con_ram_negativa_devuelve_400()
    {
        var admin = await LoginAsAdminAsync();

        var response = await admin.PostAsJsonAsync("/api/vms", new
        {
            name = "ram-negativa",
            cores = 4,
            ram = -8,
            disk = 80,
            os = "Ubuntu",
            status = "Encendida",
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Post_vms_con_nombre_invalido_devuelve_400()
    {
        var admin = await LoginAsAdminAsync();

        var response = await admin.PostAsJsonAsync("/api/vms", new
        {
            name = "1-empieza-con-numero",
            cores = 4,
            ram = 8,
            disk = 80,
            os = "Ubuntu",
            status = "Encendida",
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Delete_vm_inexistente_devuelve_404()
    {
        var admin = await LoginAsAdminAsync();

        var response = await admin.DeleteAsync($"/api/vms/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Delete_vm_dos_veces_la_segunda_devuelve_404()
    {
        var admin = await LoginAsAdminAsync();
        var created = await admin.PostAsJsonAsync("/api/vms", new
        {
            name = "para-borrar",
            cores = 2,
            ram = 4,
            disk = 40,
            os = "Debian",
            status = "Apagada",
        });
        var vm = await created.Content.ReadFromJsonAsync<VmResponseDto>();
        Assert.NotNull(vm);

        var first = await admin.DeleteAsync($"/api/vms/{vm!.Id}");
        var second = await admin.DeleteAsync($"/api/vms/{vm.Id}");

        Assert.Equal(HttpStatusCode.NoContent, first.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, second.StatusCode);
    }

    // DTO local para deserializar la respuesta en los tests.
    private record VmResponseDto(Guid Id, string Name, string Os, string Status);
}
