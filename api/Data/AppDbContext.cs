using Api.Auth;
using Api.Vms;
using Microsoft.EntityFrameworkCore;

namespace Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<VirtualMachine> VirtualMachines => Set<VirtualMachine>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(256);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.PasswordHash).IsRequired();
            // Enum como texto: legible al inspeccionar la BD y estable ante reordenamientos.
            entity.Property(u => u.Role).HasConversion<string>().HasMaxLength(20);
        });

        modelBuilder.Entity<VirtualMachine>(entity =>
        {
            entity.HasKey(v => v.Id);
            entity.Property(v => v.Name).IsRequired().HasMaxLength(50);
            entity.Property(v => v.Os).HasConversion<string>().HasMaxLength(20);
            entity.Property(v => v.Status).HasConversion<string>().HasMaxLength(20);
        });
    }
}
