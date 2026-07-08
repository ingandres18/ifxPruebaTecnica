namespace Api.Auth;

/// <summary>
/// Punto único de verdad de la cookie de sesión. El JWT viaja SOLO aquí: HttpOnly (invisible a JS),
/// SameSite=Strict (mitiga CSRF con arquitectura same-origin) y Secure en producción (SPEC §4).
/// </summary>
public static class AuthCookie
{
    public const string Name = "ifx_auth";

    public static void Append(HttpResponse response, string token, IHostEnvironment env, int expiryHours)
    {
        response.Cookies.Append(Name, token, BuildOptions(env, DateTimeOffset.UtcNow.AddHours(expiryHours)));
    }

    public static void Delete(HttpResponse response, IHostEnvironment env)
    {
        // Para borrar la cookie hay que reenviar las MISMAS opciones con la que se creó.
        response.Cookies.Delete(Name, BuildOptions(env, expires: null));
    }

    private static CookieOptions BuildOptions(IHostEnvironment env, DateTimeOffset? expires) => new()
    {
        HttpOnly = true,
        SameSite = SameSiteMode.Strict,
        // En dev el proxy de Vite es http → Secure se relaja para que la cookie viaje (SPEC §4).
        Secure = !env.IsDevelopment(),
        Path = "/",
        Expires = expires,
    };
}
