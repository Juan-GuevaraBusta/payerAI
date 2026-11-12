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
- Proveedores: identificadores verificados por jurisdicción, umbral de coincidencia, roles exactos de maker-checker, revocación/suspensión y listas de riesgo. La matriz está adoptada en [modelo 03](../modelo/03-proveedores.md).
- Catálogo definitivo de roles, nombres finales y roles personalizados. Los arquetipos de referencia están en [modelo 13](../modelo/13-identidad-aprobaciones.md).
- Nivel de detalle de contratos y presupuestos; inclusión de la orden de compra; vigencia y precedencia entre anexos; granularidad y fuente de consumido/comprometido; quién confirma excepciones; tasas y redondeo; plazo de confirmación. El alcance de fuentes del MVP está adoptado en [modelo 15](../modelo/15-contratos-presupuestos-evidencia.md).
- Validación: umbrales de duplicado probable y de exceso sobre contrato o presupuesto; fuente y fecha de tasas de cambio; plazo y destinatario de la confirmación; efecto de cambios de política a mitad de validación. Los cinco pasos y el congelamiento de política están adoptados en [modelo 04](../modelo/04-validacion.md).
- Aprobaciones: números de quorum, abstenciones, empates, pesos y suplencias; re-delegación y límites de duración; prioridad exacta de políticas; aprobación automática L2; aprobación por procesos de servicio. El modelo conceptual está adoptado en [modelo 13](../modelo/13-identidad-aprobaciones.md).
- Autoridad y autonomía: combinación de atributos que sube o baja el nivel permitido, precedencia exacta, plazos, retención y si se implementan los modos de L3. El marco está adoptado en [modelo 07](../modelo/07-autoridad-ia.md); modelos, JEV y precios siguen abiertos.
- Workflows: precedencia exacta de políticas, duraciones de timeout, mecanismo concreto de concurrencia e idempotencia, y si hace falta un proceso durable. El ciclo y las reglas de cambios materiales, aprobador ausente y timeout están adoptados en [modelo 05](../modelo/05-workflows-aprobacion.md).
- Spend intelligence: umbrales de aumento, recurrencia mínima, tolerancia de fechas, comparabilidad, tasas de cambio, fuente de fechas de compromiso y retención. El catálogo está adoptado en [modelo 06](../modelo/06-spend-intelligence.md); el MVP solo emite ahorro potencial.
- Acceso de soporte a datos de un tenant. El modelo conceptual está adoptado en [modelo 13](../modelo/13-identidad-aprobaciones.md).
- Valores numéricos y calibración de riesgo y severidad: señales del MVP, puntaje compuesto, datos y momento de calibración, monedas y tasas, plazos de revisión, gobernanza de cambios y evidencia para bajar severidad. La estructura está adoptada en [modelo 14](../modelo/14-riesgo-severidad-umbrales.md); los valores no.
- Enum de implementación, identificadores técnicos y persistencia de los estados. El catálogo conceptual está adoptado en [modelo 12](../modelo/12-estados-transiciones.md).

## Tecnología sin cierre

- Migración de D1 a PostgreSQL serverless para piloto o producción, y criterios de disparo. D1 es default de demo; el marco de despliegue y los guardrails de costo están adoptados en [modelo 09](../modelo/09-infraestructura-costo.md).
- Proveedor y protocolo de correo real. Comparar costo, seguridad y viabilidad antes de una dependencia difícil de revertir. La demo con carga manual y eventos sintéticos está adoptada en [modelo 02](../modelo/02-ingesta.md).
- OCR y extracción de PDF para documentos escaneados.
- Implementación, interfaz, licencia, costo y utilidad real de JEV. No inventar primitivas ni precios.
- Modelos, proveedores, versiones y precios de IA; umbrales de confianza por tarea; topes de costo y latencia; papel de T2 y evaluación de JEV; configurabilidad del tenant; retención y residencia. La política de escalamiento está adoptada en [modelo 16](../modelo/16-escalamiento-ia.md).
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
