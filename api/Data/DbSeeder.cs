using Api.Auth;
using Api.Vms;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

/// <summary>
/// Aplica migraciones pendientes y siembra datos de prueba (SPEC §3): 2 usuarios y 8 VMs con
/// estados/OS variados para que charts y listado no arranquen vacíos. Idempotente: no re-siembra
/// si ya hay datos.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db, CancellationToken ct = default)
    {
        await db.Database.MigrateAsync(ct);

        if (!await db.Users.AnyAsync(ct))
        {
            db.Users.AddRange(
                new User
                {
                    Id = Guid.NewGuid(),
                    Email = "admin@ifx.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                    Role = UserRole.Administrador
                },
                new User
                {
                    Id = Guid.NewGuid(),
                    Email = "cliente@ifx.com",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Cliente123!"),
                    Role = UserRole.Cliente
                });
        }

        if (!await db.VirtualMachines.AnyAsync(ct))
        {
            var now = DateTime.UtcNow;
            db.VirtualMachines.AddRange(
                NewVm("web-frontend-01", 4, 8, 80, OsType.Ubuntu, VmStatus.Encendida, now),
                NewVm("api-backend-01", 8, 16, 160, OsType.Debian, VmStatus.Encendida, now),
                NewVm("db-primary", 8, 32, 500, OsType.RHEL, VmStatus.Encendida, now),
                NewVm("db-replica", 8, 32, 500, OsType.RHEL, VmStatus.Suspendida, now),
                NewVm("win-ad-controller", 4, 16, 200, OsType.WindowsServer, VmStatus.Encendida, now),
                NewVm("build-agent-01", 4, 8, 120, OsType.Ubuntu, VmStatus.Apagada, now),
                NewVm("cache-redis", 2, 4, 40, OsType.Debian, VmStatus.Encendida, now),
                NewVm("legacy-batch", 2, 4, 60, OsType.Otro, VmStatus.Apagada, now));
        }

        await db.SaveChangesAsync(ct);
    }

    private static VirtualMachine NewVm(
        string name, int cores, int ram, int disk, OsType os, VmStatus status, DateTime now) => new()
    {
        Id = Guid.NewGuid(),
        Name = name,
        Cores = cores,
        Ram = ram,
        Disk = disk,
        Os = os,
        Status = status,
        CreatedAt = now,
        UpdatedAt = now
    };
}
