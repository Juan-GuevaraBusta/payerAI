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
- Esquema de identidad, roles y onboarding de empresas.
- Fuentes y nivel de detalle de contratos y presupuestos.
- Modelo exacto de aprobaciones, delegación y quorum.
- Reglas de riesgo y umbrales. La escala de severidad existe; la calibración no.
- Catálogo cerrado de estados y transiciones. El requisito es definirlos; el enum no está adoptado.

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
