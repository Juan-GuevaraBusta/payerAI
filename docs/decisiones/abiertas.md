# Asuntos abiertos

Fuente: [documento maestro](../documento-maestro.md), sección 17. No presentarlos como decisiones. Una tarea puede dejar una hipótesis reversible por escrito; no puede cerrar un punto de esta lista sin evidencia y una decisión explícita.

Si el dato que falta cambia el modelo de dominio, la seguridad, la autorización o el costo, hace falta una sola pregunta concreta antes de fijarlo. Si no es crítico, se declara la hipótesis y se sigue en discovery, no en código.

## Producto y mercado

- Nombre y marca.
- Industria prioritaria y tamaño de cliente.
- Volumen mínimo de facturas y comprador económico.
- Requisitos regulatorios y jurisdicciones del mercado objetivo.

La hipótesis de cliente (empresas medianas y grandes, con proveedores, monedas, finanzas, procurement y auditoría) no está validada.

## Diseño que aún no es esquema

- Arquitectura concreta y stack de frontend.
- Identidad y onboarding: proveedor, protocolo, MFA, recuperación, SSO/SCIM, autoservicio frente a invitación y verificación de dominio. El modelo conceptual está adoptado en [modelo 13](../modelo/13-identidad-aprobaciones.md).
- Catálogo definitivo de roles, nombres finales y roles personalizados. Los arquetipos de referencia están en [modelo 13](../modelo/13-identidad-aprobaciones.md).
- Nivel de detalle de contratos y presupuestos; inclusión de la orden de compra; vigencia y precedencia entre anexos; granularidad y fuente de consumido/comprometido; quién confirma excepciones; tasas y redondeo; canal y plazo de confirmación. El alcance de fuentes del MVP está adoptado en [modelo 15](../modelo/15-contratos-presupuestos-evidencia.md).
- Aprobaciones: números de quorum, abstenciones, empates, pesos y suplencias; re-delegación y límites de duración; prioridad exacta de políticas; aprobación automática L2; aprobación por procesos de servicio. El modelo conceptual está adoptado en [modelo 13](../modelo/13-identidad-aprobaciones.md).
- Acceso de soporte a datos de un tenant. El modelo conceptual está adoptado en [modelo 13](../modelo/13-identidad-aprobaciones.md).
- Valores numéricos y calibración de riesgo y severidad: señales del MVP, puntaje compuesto, datos y momento de calibración, monedas y tasas, plazos de revisión, gobernanza de cambios y evidencia para bajar severidad. La estructura está adoptada en [modelo 14](../modelo/14-riesgo-severidad-umbrales.md); los valores no.
- Enum de implementación, identificadores técnicos y persistencia de los estados. El catálogo conceptual está adoptado en [modelo 12](../modelo/12-estados-transiciones.md).

## Tecnología sin cierre

- D1 frente a PostgreSQL serverless. Comparar transacciones, integridad, consultas, concurrencia, experiencia de desarrollo, costo y migración.
- Proveedor y protocolo de correo. Comparar costo, seguridad y viabilidad antes de una dependencia difícil de revertir.
- OCR y extracción de PDF para documentos escaneados.
- Implementación, interfaz, licencia, costo y utilidad real de JEV. No inventar primitivas ni precios.
- Modelos de IA y política de escalamiento entre modelo ligero, modelo capaz y humano.
- Integraciones futuras con ERP, CRM, bancos, contabilidad, HRIS o sistemas de uso. No son alcance del MVP.

## Evidencia que el documento no trae

No hay, y no deben inventarse:

- Estadísticas de mercado.
- Entrevistas además de la conversación ya descrita con el CTO de Blinka.
- Clientes, pilotos o cartas de apoyo.
- Integraciones contratadas o probadas.
- Confirmación de que las empresas pagan licencias sin uso. Eso exige evidencia de utilización.

## Hecho, no validación de mercado

El problema inicial sale de conversaciones con el CTO de Blinka sobre dificultades de clientes de Blinka: la aprobación y el rechazo de pagos a proveedores cambian según la empresa y su política, y se complican con pagos en serie, muchos proveedores y jerarquías de aprobación.

Eso no demuestra por sí solo el resto de hipótesis de la sección 3 del documento maestro (correo como canal real, duplicados, contratos vencidos, ciclos lentos, gasto redundante).
