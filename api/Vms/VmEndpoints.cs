using Api.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Api.Vms;

public static class VmEndpoints
{
    /// <summary>Nombre de la política de autorización de administrador (registrada en Program.cs).</summary>
    public const string AdminPolicy = "Admin";

    public static IEndpointRouteBuilder MapVmEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/vms").WithTags("VMs").RequireAuthorization();

        group.MapGet("/", ListAsync)
            .WithSummary("Lista las VMs")
            .WithDescription("Accesible para Administrador y Cliente.")
            .Produces<IReadOnlyList<VmResponse>>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        group.MapPost("/", CreateAsync)
            .RequireAuthorization(AdminPolicy)
            .WithSummary("Crea una VM")
            .WithDescription("Solo Administrador. Valida rangos y formato server-side (SPEC §3).")
            .Produces<VmResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden);

        group.MapPut("/{id:guid}", UpdateAsync)
            .RequireAuthorization(AdminPolicy)
            .WithSummary("Actualiza una VM")
            .WithDescription("Solo Administrador. 404 si no existe.")
            .Produces<VmResponse>(StatusCodes.Status200OK)
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}", DeleteAsync)
            .RequireAuthorization(AdminPolicy)
            .WithSummary("Elimina una VM")
            .WithDescription("Solo Administrador. Idempotente: 404 si no existe.")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status403Forbidden)
            .ProducesProblem(StatusCodes.Status404NotFound);

        return app;
    }

    private static async Task<Ok<IReadOnlyList<VmResponse>>> ListAsync(AppDbContext db, CancellationToken ct)
    {
        var vms = await db.VirtualMachines
            .OrderByDescending(v => v.CreatedAt)
            .Select(v => v.ToResponse())
            .ToListAsync(ct);

        return TypedResults.Ok<IReadOnlyList<VmResponse>>(vms);
    }

    private static async Task<Results<Created<VmResponse>, ValidationProblem>> CreateAsync(
        CreateVmRequest request, AppDbContext db, CancellationToken ct)
    {
        if (!VmValidation.TryValidate(
                request.Name, request.Cores, request.Ram, request.Disk, request.Os, request.Status,
                out var os, out var status, out var errors))
        {
            return TypedResults.ValidationProblem(errors);
        }

        var now = DateTime.UtcNow;
        var vm = new VirtualMachine
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Cores = request.Cores,
            Ram = request.Ram,
            Disk = request.Disk,
            Os = os,
            Status = status,
            CreatedAt = now,
            UpdatedAt = now,
        };

        db.VirtualMachines.Add(vm);
        await db.SaveChangesAsync(ct);

        return TypedResults.Created($"/api/vms/{vm.Id}", vm.ToResponse());
    }

    private static async Task<Results<Ok<VmResponse>, ValidationProblem, NotFound>> UpdateAsync(
        Guid id, UpdateVmRequest request, AppDbContext db, CancellationToken ct)
    {
        var vm = await db.VirtualMachines.FirstOrDefaultAsync(v => v.Id == id, ct);
        if (vm is null) return TypedResults.NotFound();

        if (!VmValidation.TryValidate(
                request.Name, request.Cores, request.Ram, request.Disk, request.Os, request.Status,
                out var os, out var status, out var errors))
        {
            return TypedResults.ValidationProblem(errors);
        }

        vm.Name = request.Name.Trim();
        vm.Cores = request.Cores;
        vm.Ram = request.Ram;
        vm.Disk = request.Disk;
        vm.Os = os;
        vm.Status = status;
        vm.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync(ct);

        return TypedResults.Ok(vm.ToResponse());
    }

    private static async Task<Results<NoContent, NotFound>> DeleteAsync(
        Guid id, AppDbContext db, CancellationToken ct)
    {
        var vm = await db.VirtualMachines.FirstOrDefaultAsync(v => v.Id == id, ct);
        if (vm is null) return TypedResults.NotFound();

        db.VirtualMachines.Remove(vm);
        await db.SaveChangesAsync(ct);

        return TypedResults.NoContent();
    }
}
