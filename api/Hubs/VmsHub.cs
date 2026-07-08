using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Api.Hubs;

/// <summary>
/// Hub de tiempo real de VMs. Autenticado por la MISMA cookie HttpOnly (viaja en el handshake,
/// same-origin vía el proxy de Vite). No expone métodos cliente→servidor: el flujo es solo
/// servidor→cliente (VmCreated/VmUpdated/VmDeleted), emitido tras persistir cada mutación.
/// </summary>
[Authorize]
public class VmsHub : Hub;
