using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Api.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Api.Auth;

public static class AuthEndpoints
{
    // Hash BCrypt "señuelo": se verifica cuando el email no existe para que el tiempo de respuesta
    // sea equivalente al de un usuario real y no se filtre su existencia por timing (SPEC §4).
    private static readonly string DummyHash = BCrypt.Net.BCrypt.HashPassword("dummy-timing-defense");

    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/login", LoginAsync)
            .AllowAnonymous()
            .RequireRateLimiting("login")
            .WithSummary("Inicia sesión")
            .WithDescription("Valida credenciales, firma un JWT y lo entrega en una cookie HttpOnly. " +
                "El cuerpo de la respuesta NUNCA contiene el token.")
            .Produces<UserResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);

        group.MapPost("/logout", Logout)
            .RequireAuthorization()
            .WithSummary("Cierra sesión")
            .WithDescription("Borra la cookie de autenticación.")
            .Produces(StatusCodes.Status204NoContent);

        group.MapGet("/me", Me)
            .RequireAuthorization()
            .WithSummary("Usuario actual")
            .WithDescription("Devuelve el usuario autenticado a partir de la cookie (rehidratar sesión).")
            .Produces<UserResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        return app;
    }

    private static async Task<Results<Ok<UserResponse>, ProblemHttpResult>> LoginAsync(
        LoginRequest request,
        AppDbContext db,
        TokenService tokens,
        IOptions<JwtOptions> jwtOptions,
        IHostEnvironment env,
        HttpResponse response,
        CancellationToken ct)
    {
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email, ct);

        // Anti-enumeración: misma respuesta exista o no el email. Verificamos siempre un hash
        // (real o señuelo) para no filtrar por timing.
        var hashToCheck = user?.PasswordHash ?? DummyHash;
        var passwordOk = BCrypt.Net.BCrypt.Verify(request.Password, hashToCheck);

        if (user is null || !passwordOk)
        {
            return TypedResults.Problem(
                title: "Credenciales inválidas",
                detail: "El email o la contraseña son incorrectos.",
                statusCode: StatusCodes.Status401Unauthorized);
        }

        var token = tokens.CreateToken(user);
        AuthCookie.Append(response, token, env, jwtOptions.Value.ExpiryHours);

        return TypedResults.Ok(user.ToResponse());
    }

    private static NoContent Logout(IHostEnvironment env, HttpResponse response)
    {
        AuthCookie.Delete(response, env);
        return TypedResults.NoContent();
    }

    private static async Task<Results<Ok<UserResponse>, ProblemHttpResult>> Me(
        ClaimsPrincipal principal,
        AppDbContext db,
        CancellationToken ct)
    {
        var sub = principal.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (!Guid.TryParse(sub, out var userId))
        {
            return TypedResults.Problem(statusCode: StatusCodes.Status401Unauthorized);
        }

        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user is null)
        {
            return TypedResults.Problem(statusCode: StatusCodes.Status401Unauthorized);
        }

        return TypedResults.Ok(user.ToResponse());
    }
}
