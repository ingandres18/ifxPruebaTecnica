namespace Api.Auth;

/// <summary>
/// Opciones de firma del JWT, enlazadas desde configuración (sección "Jwt").
/// La clave NUNCA se hardcodea: vive en appsettings.Development.json / user-secrets (SPEC §4).
/// </summary>
public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Key { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;

    /// <summary>Duración del token (SPEC §4: 8h).</summary>
    public int ExpiryHours { get; set; } = 8;
}
