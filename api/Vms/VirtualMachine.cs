namespace Api.Vms;

/// <summary>
/// Sistema operativo de la VM (SPEC §3). El miembro <c>WindowsServer</c> se muestra como
/// "Windows Server" en el contrato de API; el mapeo de display se hará en la capa de DTOs (Slice 3).
/// </summary>
public enum OsType
{
    Ubuntu,
    Debian,
    WindowsServer,
    RHEL,
    Otro
}

/// <summary>Estado operativo de la VM (SPEC §3). "Encendida" es la que cuenta para el dashboard.</summary>
public enum VmStatus
{
    Encendida,
    Apagada,
    Suspendida
}

/// <summary>
/// Máquina virtual gestionada por la plataforma. Rangos y formato validados en backend (SPEC §3),
/// no solo en la UI.
/// </summary>
public class VirtualMachine
{
    public Guid Id { get; set; }

    /// <summary>3–50 chars, patrón <c>^[a-zA-Z][a-zA-Z0-9-]*$</c>.</summary>
    public required string Name { get; set; }

    /// <summary>1–64.</summary>
    public int Cores { get; set; }

    /// <summary>GB, 1–512.</summary>
    public int Ram { get; set; }

    /// <summary>GB, 10–4096.</summary>
    public int Disk { get; set; }

    public OsType Os { get; set; }
    public VmStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
