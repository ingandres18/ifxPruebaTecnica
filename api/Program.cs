using System.Text;
using System.Threading.RateLimiting;
using Api.Auth;
using Api.Common;
using Api.Data;
using Api.Vms;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// EF Core + SQLite. La cadena de conexión vive en configuración (appsettings.Development.json),
// nunca hardcodeada.
var connectionString = builder.Configuration.GetConnectionString("Default")
    ?? "Data Source=ifxvms.db";
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(connectionString));

// OpenAPI nativo (documento) + Scalar (UI interactiva) para que se pruebe la API sin curl.
builder.Services.AddOpenApi();

// Errores en formato ProblemDetails (RFC 7807) en toda la app.
builder.Services.AddProblemDetails();

// --- Autenticación: JWT leído desde la cookie HttpOnly, no del header Authorization ---
var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? throw new InvalidOperationException("Falta la sección de configuración 'Jwt'.");
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));
builder.Services.AddScoped<TokenService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false; // no remapear "sub"/"role" a URIs largas
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key)),
            RoleClaimType = TokenService.RoleClaim,
            ClockSkew = TimeSpan.FromMinutes(1),
        };
        // El token viaja en la cookie HttpOnly: lo extraemos aquí para el pipeline de auth.
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.TryGetValue(AuthCookie.Name, out var token))
                {
                    context.Token = token;
                }
                return Task.CompletedTask;
            },
        };
    });
// Autorización por rol: las mutaciones de VMs exigen Administrador (SPEC §4).
builder.Services.AddAuthorizationBuilder()
    .AddPolicy(VmEndpoints.AdminPolicy, policy => policy.RequireRole("Administrador"));

// --- Rate limiting en /login: 5 intentos/min por IP → 429 (SPEC §4) ---
// El límite es configurable para que los tests de integración no choquen con él.
var loginPermitLimit = builder.Configuration.GetValue("RateLimiting:LoginPermitLimit", 5);
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("login", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = loginPermitLimit,
                Window = TimeSpan.FromMinutes(1),
            }));
});

var app = builder.Build();

// Los 500 devuelven ProblemDetails genérico, nunca stack traces (SPEC §4).
app.UseExceptionHandler();
app.UseStatusCodePages();

// Headers de seguridad en todas las respuestas.
app.UseSecurityHeaders();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();               // documento en /openapi/v1.json
    app.MapScalarApiReference();    // UI interactiva en /scalar
}

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// Endpoint de humo: confirma que la API responde.
app.MapGet("/", () => Results.Ok(new { status = "ok", service = "ifx-vms-api" }));

// Features (vertical slices).
app.MapAuthEndpoints();
app.MapVmEndpoints();

// Aplica migraciones y siembra datos al arrancar (cero setup para el revisor).
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DbSeeder.SeedAsync(db);
}

app.Run();

// Expuesto para WebApplicationFactory<Program> en api.Tests (tests de integración en memoria).
public partial class Program;
