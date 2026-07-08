using System.Text.RegularExpressions;

namespace Api.Vms;

/// <summary>
/// Validación server-side de VMs (SPEC §3). Es la validación real: la del frontend es solo UX.
/// Devuelve errores por campo en formato compatible con ValidationProblem (RFC 7807).
/// </summary>
public static partial class VmValidation
{
    [GeneratedRegex("^[a-zA-Z][a-zA-Z0-9-]*$")]
    private static partial Regex NameRegex();

    public static bool TryValidate(
        string name, int cores, int ram, int disk, string os, string status,
        out OsType parsedOs, out VmStatus parsedStatus,
        out Dictionary<string, string[]> errors)
    {
        errors = new Dictionary<string, string[]>();
        parsedOs = default;
        parsedStatus = default;

        var trimmedName = name?.Trim() ?? string.Empty;
        if (trimmedName.Length is < 3 or > 50)
            errors["name"] = ["El nombre debe tener entre 3 y 50 caracteres."];
        else if (!NameRegex().IsMatch(trimmedName))
            errors["name"] = ["El nombre debe iniciar con letra y contener solo letras, números y guiones."];

        if (cores is < 1 or > 64)
            errors["cores"] = ["Los cores deben estar entre 1 y 64."];

        if (ram is < 1 or > 512)
            errors["ram"] = ["La RAM (GB) debe estar entre 1 y 512."];

        if (disk is < 10 or > 4096)
            errors["disk"] = ["El disco (GB) debe estar entre 10 y 4096."];

        if (!OsDisplay.TryParse(os, out parsedOs))
            errors["os"] = ["Sistema operativo inválido."];

        if (!Enum.TryParse(status, ignoreCase: false, out parsedStatus) || !Enum.IsDefined(parsedStatus))
            errors["status"] = ["Estado inválido."];

        return errors.Count == 0;
    }
}
