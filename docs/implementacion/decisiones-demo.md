# Decisiones de demo

Estas decisiones permiten implementar una demo local sin cerrar asuntos de producto. No son decisiones adoptadas del producto. Si una decisión de producto cambia, esta tabla se revisa.

| Tema | Default de demo | Estado real |
| --- | --- | --- |
| Persistencia | D1 local | D1 es default de demo; PostgreSQL sigue abierto |
| Documentos | R2 local o almacenamiento simulado | Retención y proveedor siguen abiertos |
| Identidad | Adaptador demo por cabeceras y membresía sembrada | Proveedor, MFA y SSO siguen abiertos |
| Correo | Evento sintético | Proveedor y protocolo siguen abiertos |
| Extracción | Fixtures y PDF con texto | OCR sigue abierto |
| IA | Sin modelo en la primera implementación | Modelo, costo y proveedor siguen abiertos |
| Pago | Sin `Execution`; estados de ciclo únicamente | Ejecución real fuera del MVP |
| Obligación | No se crea una entidad separada | El momento exacto sigue abierto |
| Roles | `admin`, `approver`, `viewer`, `service` | Catálogo definitivo abierto |
| Quorum | Uno para demo; dos para severidad alta o crítica | Números definitivos abiertos |
| Umbrales | Reglas demo: duplicado exacto, diferencia sobre contrato y evidencia faltante | Valores calibrados abiertos |
| Datos | Sintéticos y marcados | Nunca datos reales de clientes |

## Límites

- La identidad demo no es autenticación de producción.
- Un estado `APPROVED_FOR_PAYMENT` no significa pago ejecutado.
- Un timeout no significa pago fallido ni exitoso.
- Una recomendación de spend intelligence es ahorro potencial, no ahorro realizado.
- Los umbrales demo existen para probar el flujo, no para calibrar riesgo.
