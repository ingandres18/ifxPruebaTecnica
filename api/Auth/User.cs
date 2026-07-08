namespace Api.Auth;

/// <summary>Rol del usuario. La autorización real se aplica en el backend (SPEC §4).</summary>
public enum UserRole
{
    Administrador,
    Cliente
}

/// <summary>
/// Usuario del sistema. La contraseña se almacena SOLO como hash BCrypt (SPEC §3);
/// nunca en texto plano ni se expone en DTOs.
/// </summary>
public class User
{
    public Guid Id { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public UserRole Role { get; set; }
}
