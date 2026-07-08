namespace Api.Common;

/// <summary>
/// Headers de seguridad en todas las respuestas (SPEC §4): evita sniffing de MIME, framing
/// (clickjacking) y fuga del referer.
/// </summary>
public static class SecurityHeaders
{
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
    {
        return app.Use(async (context, next) =>
        {
            var headers = context.Response.Headers;
            headers["X-Content-Type-Options"] = "nosniff";
            headers["X-Frame-Options"] = "DENY";
            headers["Referrer-Policy"] = "no-referrer";
            await next();
        });
    }
}
