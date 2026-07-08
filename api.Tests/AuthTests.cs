using System.Net;
using System.Net.Http.Json;

namespace Api.Tests;

/// <summary>
/// Tests de integración de autenticación (SPEC §11). Golpean la API real en memoria: validan
/// la cookie HttpOnly, la ausencia del token en el body y el rechazo sin sesión.
/// </summary>
public class AuthTests(IfxApiFactory factory) : IClassFixture<IfxApiFactory>
{
    private static readonly object AdminCredentials = new { email = "admin@ifx.com", password = "Admin123!" };

    [Fact]
    public async Task Login_correcto_devuelve_200_con_cookie_httponly_y_body_sin_token()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", AdminCredentials);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        // La cookie de sesión debe existir y ser HttpOnly.
        var setCookie = Assert.Single(response.Headers.GetValues("Set-Cookie"));
        Assert.Contains("ifx_auth=", setCookie);
        Assert.Contains("httponly", setCookie, StringComparison.OrdinalIgnoreCase);

        // El body NO debe contener el token (regla no negociable): solo id, email y role.
        var body = await response.Content.ReadAsStringAsync();
        Assert.DoesNotContain("token", body, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("eyJ", body); // prefijo típico de un JWT
        Assert.Contains("admin@ifx.com", body);
        Assert.Contains("Administrador", body);
    }

    [Fact]
    public async Task Login_incorrecto_devuelve_401_con_mensaje_generico()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new { email = "admin@ifx.com", password = "contrasena-incorrecta" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        // Mensaje genérico: no revela si el email existe (anti-enumeración).
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("Credenciales inválidas", body);
        Assert.DoesNotContain("ifx_auth", response.Headers.TryGetValues("Set-Cookie", out var c)
            ? string.Join(";", c) : string.Empty);
    }

    [Fact]
    public async Task Me_sin_cookie_devuelve_401()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/auth/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
