using Api.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Api.Vms;

/// <summary>Publica eventos de dominio de VMs al hub tras persistir cada mutación.</summary>
public interface IVmNotifier
{
    Task VmCreatedAsync(VmResponse vm, string? excludeConnectionId, CancellationToken ct = default);
    Task VmUpdatedAsync(VmResponse vm, string? excludeConnectionId, CancellationToken ct = default);
    Task VmDeletedAsync(Guid id, string? excludeConnectionId, CancellationToken ct = default);
}

public class VmNotifier(IHubContext<VmsHub> hub) : IVmNotifier
{
    public Task VmCreatedAsync(VmResponse vm, string? excludeConnectionId, CancellationToken ct = default) =>
        Target(excludeConnectionId).SendAsync("VmCreated", vm, ct);

    public Task VmUpdatedAsync(VmResponse vm, string? excludeConnectionId, CancellationToken ct = default) =>
        Target(excludeConnectionId).SendAsync("VmUpdated", vm, ct);

    public Task VmDeletedAsync(Guid id, string? excludeConnectionId, CancellationToken ct = default) =>
        Target(excludeConnectionId).SendAsync("VmDeleted", id, ct);

    /// <summary>
    /// Excluye la conexión originadora (si se envió su connectionId): quien mutó ya aplicó el
    /// cambio por optimistic UI, así que no debe recibir el eco ni re-animar su propia acción.
    /// </summary>
    private IClientProxy Target(string? excludeConnectionId) =>
        string.IsNullOrEmpty(excludeConnectionId)
            ? hub.Clients.All
            : hub.Clients.AllExcept(excludeConnectionId);
}
