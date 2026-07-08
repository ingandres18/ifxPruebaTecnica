# Bitácora de IA


## 1. Herramientas utilizadas

- **Claude (claude.ai)** — capa de planeación: análisis del enunciado, definición de `SPEC.md`
  y `CLAUDE.md`, decisiones de arquitectura y trade-offs, antes de escribir código.
- **Claude Code (CLI)** — capa de ejecución: agente trabajando sobre el repositorio, gobernado
  por `CLAUDE.md` (convenciones y reglas de seguridad) y `SPEC.md` (fuente de verdad funcional).
- **Modelos, usados de forma diferenciada:**
  - *Claude Fable 5* → planeación y slices de alto riesgo (auth, optimistic UI, SignalR) en plan mode.
  - *Claude Opus 4.8* → implementación del día a día (CRUD, componentes, formularios).

## 2. Metodología de trabajo con IA (harness, no prompts sueltos)

1. **Spec primero**: ningún código se generó sin `SPEC.md` cerrado. El agente trabaja contra
   una especificación, no contra instrucciones improvisadas.
2. **Reglas persistentes**: `CLAUDE.md` (commiteado en este repo) define reglas no negociables
   de seguridad, convenciones de código y un Definition of Done por slice.
3. **Slices verticales**: el trabajo se dividió en rebanadas funcionales completas
   (auth → CRUD/listado → formulario+optimistic → dashboard → real-time → cierre),
   cada una con su commit. El historial de git refleja este proceso.
4. **Plan mode en tareas de riesgo**: para auth, optimistic UI y SignalR, primero se pidió
   un plan, se corrigió el rumbo ahí (barato), y solo entonces se ejecutó.
5. **Loop de verificación**: el agente ejecuta `npm run verify` / `dotnet build` / `dotnet test`
   antes de reportar cualquier tarea como completa. Ningún slice se cerró con verificación en rojo.
6. Nota: se evaluó encapsular las convenciones como *skill* reutilizable de Claude Code;
   para un proyecto de un día, `CLAUDE.md` es la herramienta proporcional.

## 3. Qué se delegó a la IA (por slice)

**Slice 1 — Scaffolding + harness:(Delegado IA)**

- Versiones parcheadas forzadas: subí Microsoft.OpenApi → 2.10.0 y SQLitePCLRaw.bundle_e_sqlite3 → 3.0.3 para eliminar 2 CVEs de severidad alta que arrastran los paquetes oficiales .NET 10, y así dejar dotnet build sin warnings.
- Majors actuales del tooling en vez de las del SPEC: React 19, React Router 7, Zod 4, Recharts 3, SignalR 10, Vite 8, Tailwind 4 (aprobado por humano). → Toca actualizar SPEC/README.
- ESLint en lugar de oxlint: el scaffold de Vite 8 trae oxlint; lo reemplacé por ESLint para cumplir literalmente npm run verify = tsc --noEmit && eslint . del CLAUDE.md.

**Slice 2 — Auth end-to-end:**

- (pendiente)

**Slice 3 — CRUD + listado:**

- (pendiente)

**Slice 4 — Formulario + Optimistic UI:**

- (pendiente)

**Slice 5 — Dashboard:**

- (pendiente)

**Slice 6 — Real-time (SignalR):**

- (pendiente)

**Slice 7 — Cierre:**

- (pendiente)

## 4. Dónde intervine yo (correcciones de rumbo y decisiones humanas, por slice)


- Definí el stack, la arquitectura (vertical slices en vez de Clean Architecture multi-proyecto,
  con trade-off documentado en el README), el orden de slices y las reglas de seguridad ANTES
  de generar código (planeación, slice 0).

**Slice 1:**
- Decidi actualizar version de stack propuestas iniciales en el SPEC para mejor compatibilidad y LTS

**Slice 2 :**

- (pendiente)

**Slice 3:**
- (pendiente)

**Slice 4:**

- (pendiente)

**Slice 5:**
- (pendiente)

**Slice 6:**

- (pendiente)

**Slice 7:**
- (pendiente)

## 5. Prompts clave


### Prompt 1 — (título pendiente)

```text
(pendiente)
```

**Por qué funcionó:** (pendiente)

### Prompt 2 — (título pendiente)

```text
(pendiente)
```

**Por qué funcionó:** (pendiente)
