using System.ComponentModel.DataAnnotations;

namespace Api.Auth;

/// <summary>Credenciales de entrada del login.</summary>
public record LoginRequest(
    [property: Required, EmailAddress] string Email,
    [property: Required] string Password);

/// <summary>
/// Respuesta pública del usuario autenticado. Contiene SOLO datos no sensibles.
/// NUNCA incluye el token (va en cookie HttpOnly) ni el PasswordHash.
/// </summary>
public record UserResponse(Guid Id, string Email, string Role);

public static class UserMapping
{
    public static UserResponse ToResponse(this User user) =>
        new(user.Id, user.Email, user.Role.ToString());
}
