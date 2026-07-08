namespace Api.Vms;

/// <summary>Respuesta pública de una VM. Enums como texto de display para el contrato de API.</summary>
public record VmResponse(
    Guid Id,
    string Name,
    int Cores,
    int Ram,
    int Disk,
    string Os,
    string Status,
    DateTime CreatedAt,
    DateTime UpdatedAt);

/// <summary>Cuerpo para crear una VM. Os/Status llegan como texto de display y se validan.</summary>
public record CreateVmRequest(
    string Name,
    int Cores,
    int Ram,
    int Disk,
    string Os,
    string Status);

/// <summary>Cuerpo para actualizar una VM (mismos campos que crear).</summary>
public record UpdateVmRequest(
    string Name,
    int Cores,
    int Ram,
    int Disk,
    string Os,
    string Status);

public static class VmMapping
{
    public static VmResponse ToResponse(this VirtualMachine vm) => new(
        vm.Id, vm.Name, vm.Cores, vm.Ram, vm.Disk,
        OsDisplay.ToDisplay(vm.Os), vm.Status.ToString(),
        vm.CreatedAt, vm.UpdatedAt);
}

/// <summary>
/// Traduce entre el enum <see cref="OsType"/> y su texto de display. Solo "Windows Server" difiere
/// del nombre del miembro; el resto coincide.
/// </summary>
public static class OsDisplay
{
    public static string ToDisplay(OsType os) => os switch
    {
        OsType.WindowsServer => "Windows Server",
        _ => os.ToString(),
    };

    public static bool TryParse(string? value, out OsType os)
    {
        switch (value?.Trim())
        {
            case "Windows Server":
                os = OsType.WindowsServer;
                return true;
            default:
                return Enum.TryParse(value, ignoreCase: false, out os) && Enum.IsDefined(os);
        }
    }
}
