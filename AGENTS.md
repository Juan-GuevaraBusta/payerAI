# Instrucciones para agentes

Punto de entrada para cualquier agente que trabaje en este repositorio. El contrato detallado de orquestación vive en [ORCHESTRATOR.md](ORCHESTRATOR.md); este archivo no lo reemplaza ni lo resume por completo.

## Contexto obligatorio

Antes de proponer o cambiar algo, leer en este orden:

1. [Documento maestro](docs/documento-maestro.md)
2. [Decisiones adoptadas](docs/decisiones/adoptadas.md)
3. [Asuntos abiertos](docs/decisiones/abiertas.md)
4. [Glosario](docs/glosario.md)
5. La tarea correspondiente en [docs/tareas/](docs/tareas/) y su orquestador en `.cursor/agents/`.

`docs/decisiones/abiertas.md` manda: lo que figura allí no se cierra sin una decisión explícita.

No existe `MASTER_PROMPT_FINANCIAL_OPERATIONS.md`. No inventarlo. `docs/documento-maestro.md` no lo sustituye.

## Reglas no negociables

- El primer dominio es Accounts Payable. Accounts Receivable no entra en el MVP.
- Una factura es una solicitud de pago, no una obligación válida.
- Aprobación no es pago; instrucción enviada no es pago hecho; timeout no es pago fallido.
- La ausencia de contrato, presupuesto o evidencia no aprueba ni rechaza sola.
- Todo dato de negocio pertenece a un tenant.
- Un proveedor detectado no está habilitado para cobrar.
- La IA interpreta y señala; no concede autoridad ni aprueba sola.
- El MVP registra el ciclo y no mueve dinero.

## Forma de trabajo

- No escribir código, esquema, API, enum ni elegir proveedor si la tarea es de discovery.
- Trabajar en un worktree y una rama propios. No tocar `main` ni el worktree de otro agente.
- Cada cambio, por pequeño que sea, lleva commit y push a `origin` en la misma sesión.
- No hacer force-push, `reset --hard` ni cambiar la configuración de git.
- No añadir trailers `Co-Authored-By`.
- Reportar solo lo verificado.
