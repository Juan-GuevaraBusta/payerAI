# Riesgo, severidad y umbrales

**Estado:** adoptado el 2026-11-09. Discovery; no implementar.
**Tarea:** 14.
**Orquestador:** `.cursor/agents/autoridad-ia.md`.
**Skill:** `karpathy-guidelines`.

Modelo conceptual de señales, hallazgos, severidad y umbrales. Define cómo una señal se convierte en un hallazgo tratable y cómo la política limita la autonomía. No es un esquema, ni una API, ni una tabla de números calibrados, ni una elección de proveedor.

Este documento registra el modelo adoptado. Lo que sigue marcado como hipótesis o abierto no está decidido.

## Fuentes y alcance

- [Documento maestro](../documento-maestro.md), secciones 8, 9, 11 y 15.
- [Master prompt](../../MASTER_PROMPT_FINANCIAL_OPERATIONS.md).
- [Glosario](../glosario.md).
- [Decisiones adoptadas](../decisiones/adoptadas.md) y [asuntos abiertos](../decisiones/abiertas.md).
- [Tarea 14](../tareas/14-riesgo-severidad-umbrales.md).
- [Validación](04-validacion.md), [workflows](05-workflows-aprobacion.md), [autoridad e IA](07-autoridad-ia.md), [seguridad y tenancy](10-seguridad-tenancy.md), [edge cases](11-edge-cases.md), [estados](12-estados-transiciones.md) e [identidad](13-identidad-aprobaciones.md).

**Alcance:** detección y clasificación de riesgo en Accounts Payable, severidad operativa, umbrales de política, acciones permitidas y calibración. No incluye la decisión de aprobar o rechazar, la ejecución de pagos ni la elección de tecnología.

## 1. Principios

1. **Señal no es conclusión.** Una señal indica que algo merece atención; no declara fraude, legitimidad, culpabilidad ni aprobación.
2. **Severidad no es probabilidad ni autoridad.** Es el nivel de tratamiento que exige un hallazgo. No concede permiso ni sustituye la política.
3. **La ausencia de evidencia no es un valor bajo.** Si falta un dato crítico, el resultado es `NO_EVALUABLE`, no "informativa".
4. **La IA señala; la regla determinista clasifica; el humano decide donde corresponde.** Un modelo no baja ni cierra una severidad.
5. **Un umbral se declara, no se adivina.** Tiene cantidad, unidad, alcance, operador, límite inclusivo o exclusivo, vigencia y versión.
6. **Sin número no hay umbral.** Si el valor no está definido, la evaluación no se completa; no se usa un valor por defecto silencioso.
7. **Elevar es seguro; bajar exige evidencia.** Una regla o un humano con autoridad puede elevar. Bajar requiere evidencia y registro.
8. **La evaluación es determinista y reproducible.** La misma entrada, evidencia y versión de política producen el mismo resultado.
9. **El conflicto se declara.** Dos políticas contradictorias no se resuelven por la última evaluada ni por la más permisiva.
10. **La severidad crítica bloquea la automatización.** No hay aprobación automática de una operación crítica.
11. **Todo queda en el tenant.** Señales, políticas, umbrales, calibración y registros no se mezclan entre tenants.
12. **Un cambio material reabre la evaluación.** No se reutiliza una severidad calculada sobre otra evidencia o política.

## 2. Conceptos

| Concepto | Qué conserva | Qué no implica |
| --- | --- | --- |
| Señal | Un hecho observable: falta un campo, cambia una cuenta, coincide un importe, vence un contrato. | Fraude, legitimidad ni severidad. |
| Hallazgo | Una señal evaluada con evidencia, fuente, confianza y tipo de riesgo. | Decisión de aprobar o rechazar. |
| Tipo de riesgo | Qué podría salir mal: pago a proveedor incorrecto, duplicado, sobrepago, gasto no autorizado, evasión de control, fuga de datos. | Probabilidad medida ni responsabilidad legal. |
| Evidencia | Dato, documento, comparación o respuesta que sostiene el hallazgo. | Verdad absoluta ni aprobación. |
| Confianza | Fuerza de la evidencia para sostener el hallazgo. | Autoridad ni permiso para bajar severidad. |
| Severidad | Nivel operativo de tratamiento: informativa, baja, media, alta o crítica. | Probabilidad, importe, autoridad ni decisión. |
| Umbral | Predicado versionado sobre una cantidad, con límite y alcance. | Puntaje de riesgo ni autorización. |
| Política | Conjunto de reglas y umbrales del tenant. | Permiso por sí sola. |
| Evaluación | Resultado de aplicar señales, evidencia, reglas y umbrales a una operación. | Transición de estado. |
| Override | Excepción humana con actor, motivo, evidencia y vigencia. | Atajo ni permiso ilimitado. |
| Calibración | Ajuste de umbrales con datos y resultados medidos. | Elección de proveedor ni promesa de precisión. |

**Riesgo y severidad no son lo mismo.** El tipo de riesgo dice qué podría fallar. La severidad dice cuánta protección exige el hallazgo. Un mismo tipo de riesgo puede tener severidades distintas según evidencia, alcance y política.

**Confianza no es severidad.** Una señal de modelo con confianza alta puede abrir una revisión; no convierte el hallazgo en crítico ni en aprobado. Una confianza baja no vuelve seguro un dato faltante.

## 3. Tipos de riesgo

Catálogo conceptual, no cerrado:

| Tipo | Qué protege |
| --- | --- |
| `PAGO_A_PROVEEDOR_INCORRECTO` | Identidad, cuenta bancaria y habilitación del proveedor. |
| `PAGO_DUPLICADO` | Duplicado exacto, probable y pago ya registrado. |
| `SOBREPAGO` | Importe, contrato, presupuesto, moneda y periodicidad. |
| `GASTO_NO_AUTORIZADO` | Permiso, segregación, delegación y quorum. |
| `EVASION_DE_CONTROL` | Conflicto de políticas, cambio material, instrucción maliciosa. |
| `ERROR_DE_DATOS` | Extracción, normalización, campos faltantes e inconsistencia. |
| `FUGA_ENTRE_TENANTS` | Acceso, búsqueda, caché o resultado de otro tenant. |
| `ESTADO_EXTERNO_INCIERTO` | Timeout, webhook tardío o resultado no confirmado. |

Un hallazgo puede tener más de un tipo de riesgo. No se combinan en un puntaje único sin una fórmula adoptada.

## 4. Catálogo de señales

Las severidades de la tabla son **puntos de partida, no calibrados**. La política puede elevarlas. Ninguna señal declara fraude ni legitimidad.

| ID | Señal | Tipo de riesgo | Severidad inicial propuesta | Nota |
| --- | --- | --- | --- | --- |
| S-01 | Proveedor no habilitado o identidad ambigua | Pago a proveedor incorrecto | Alta | Escalar; no habilitar por la factura. |
| S-02 | Cuenta bancaria nueva o modificada | Pago a proveedor incorrecto | Alta | Control reforzado; crítica si se combina con otras señales de manipulación. |
| S-03 | Duplicado exacto | Pago duplicado | Alta | Bloquear y revisar; no es fraude automático. |
| S-04 | Duplicado probable | Pago duplicado | Media | Hallazgo para revisión; no descartar solo. |
| S-05 | Documento alterado o totales inconsistentes | Error de datos / evasión | Alta | Registrar la inconsistencia concreta. |
| S-06 | Campos faltantes o ilegibles | Error de datos | Baja o media | Depende de si el campo es crítico; no rellenar. |
| S-07 | Sin contrato o contrato vencido | Sobrepago / gasto no autorizado | `NO_EVALUABLE` o media | Sin contrato es ausencia de evidencia; vencido es hallazgo. |
| S-08 | Importe superior al contrato o al límite | Sobrepago | Media | Diferencia concreta; pedir confirmación. |
| S-09 | Servicios adicionales o cargos extraordinarios | Sobrepago | Media | Requiere evidencia o confirmación. |
| S-10 | Presupuesto agotado o insuficiente | Gasto no autorizado | Media o alta | La política define el tratamiento. |
| S-11 | Moneda o periodo distinto | Sobrepago / error | Media | Sin tasa y fecha, no evaluable. |
| S-12 | Historial atípico de importe o frecuencia | Sobrepago / duplicado | Media | Señal para revisión, no conclusión. |
| S-13 | Conflicto de políticas o política ausente | Evasión de control | Alta | Bloquear o escalar; no elegir la permisiva. |
| S-14 | Actor sin autoridad, delegación vencida o segregación | Gasto no autorizado | Alta | La transición no se completa. |
| S-15 | Quorum no alcanzado | Gasto no autorizado | Media | No se presenta como aprobado. |
| S-16 | Cambio material después de aprobar | Evasión de control | Alta | Reevaluar o invalidar. |
| S-17 | Cruce entre tenants o instrucción maliciosa | Fuga / evasión | Crítica | Bloquear, no revelar y escalar. |
| S-18 | Timeout o estado externo desconocido | Estado externo incierto | Alta | No declarar pago fallido ni exitoso. |
| S-19 | Pago duplicado o parcial ya registrado | Pago duplicado | Alta | Verificar contra la fuente. |
| S-20 | Proveedor nuevo no validado | Pago a proveedor incorrecto | Alta | No habilitar por la factura. |

Reglas del catálogo:

- Una señal puede producir más de un hallazgo; no se pierde el detalle.
- Una señal de modelo puede añadir un hallazgo o elevar la revisión; no reduce la severidad.
- Una señal de seguridad o de cruce entre tenants es crítica y bloquea.
- La lista no es exhaustiva. Añadir una señal exige tipo de riesgo, evidencia y tratamiento.

## 5. Evaluación

Orden adoptado:

1. **Contexto.** Resolver tenant, operación, actor, versión de evidencia y versión de política. Si falta contexto, denegar o marcar `NO_EVALUABLE`.
2. **Evidencia suficiente.** Si falta evidencia crítica para evaluar una señal, producir `NO_EVALUABLE` con la lista de lo que falta. No asignar severidad baja.
3. **Prohibiciones absolutas.** Cruce entre tenants, L3 en el MVP, aprobación por IA, instrucción maliciosa o intento de saltarse un control: bloquear y elevar a crítica.
4. **Señales deterministas.** Detectar duplicado exacto, diferencias de importe, moneda, vigencia, límite, presupuesto, identidad y estado.
5. **Piso de severidad.** Aplicar reglas duras que fijan un mínimo. Un piso no se baja por una señal posterior.
6. **Umbrales de política.** Evaluar límites declarados y registrar cuál se aplicó.
7. **Señales asistidas.** Un modelo puede añadir un hallazgo o recomendar revisión. No puede bajar el piso ni cerrar un hallazgo.
8. **Tope de autonomía.** Aplicar el máximo L0–L3 permitido por la severidad y la política.
9. **Conflicto.** Si dos reglas aplicables se contradicen, producir `CONFLICTO` y escalar.
10. **Registro.** Guardar señal, evidencia, tipo de riesgo, confianza, regla, umbral, versión, severidad y acciones permitidas.

Resultado de la evaluación:

- `SEVERIDAD` con nivel y acciones permitidas;
- `NO_EVALUABLE` con evidencia faltante;
- `CONFLICTO` con reglas y versiones;
- `BLOQUEO` por prohibición absoluta.

La evaluación no aprueba, no rechaza, no paga y no cambia el estado por sí sola.

## 6. Severidad y acciones

| Severidad | Significado operativo | Acciones permitidas | Autoridad | Automatización |
| --- | --- | --- | --- | --- |
| Informativa | Diferencia de formato o dato no material. | Registrar y, si la política lo permite, corregir un dato no crítico. | Regla determinista o actor autorizado. | L0/L1; corrección no crítica solo con permiso. |
| Baja | Falta documentación o aclaración no crítica. | Pedir información o aclaración. | Workflow con autoridad. | L1. |
| Media | Diferencia o condición que requiere confirmación. | Pedir confirmación interna, escalar o dejar en espera. | Workflow y actor autorizado. | L2 solo con política, permiso y evidencia completa. |
| Alta | Posible duplicado, proveedor no validado o cambio sensible. | Bloquear temporalmente y derivar a revisión humana. | Humano con autoridad. | Sin aprobación automática. |
| Crítica | Señal de fraude, manipulación, cruce de tenants o intento de saltarse controles. | Suspender y derivar a revisión especializada. | Humano con autoridad y control reforzado. | Sin aprobación ni ejecución automática. |
| `NO_EVALUABLE` | No hay evidencia suficiente para clasificar. | Pedir evidencia o escalar. | Workflow con autoridad. | Sin aprobación automática. |

Reglas:

- `NO_EVALUABLE` no es una severidad; es un resultado de evaluación. Nunca se trata como informativa.
- Una severidad alta no se convierte en media por una explicación del proveedor sin evidencia.
- Una severidad crítica no se cierra con un override común; exige el control que defina la política.
- La severidad no concede permiso. Aunque sea informativa, la acción sigue exigiendo autoridad.
- La tabla no fija importes, plazos ni números.

## 7. Umbrales

Un umbral es una regla versionada con estos campos:

| Campo | Qué exige |
| --- | --- |
| `id` | Identificador estable del umbral. |
| `name` | Nombre legible. |
| `quantity` | Cantidad evaluada: importe, diferencia, ratio, conteo, antigüedad, similitud o confianza. |
| `unit` | Unidad: moneda, porcentaje, días, número. |
| `currency` | Moneda cuando la cantidad es monetaria. |
| `scope` | Tenant obligatorio; departamento, proveedor, tipo de operación, tipo de riesgo y nivel de autonomía opcionales. |
| `operator` | `<`, `<=`, `>`, `>=`, `between`. |
| `boundary` | Si el límite es inclusivo o exclusivo. Obligatorio si el operador lo permite. |
| `value` | Valor declarado. Si falta, el umbral no está definido. |
| `effective_from` / `effective_to` | Vigencia. |
| `version` | Versión inmutable. |
| `on_missing` | `NO_EVALUABLE`, `ESCALAR` o `BLOQUEAR`; nunca "aprobar". |
| `on_conflict` | `CONFLICTO` y escalamiento; nunca "gana la última". |
| `action` | Efecto permitido: elevar severidad, pedir evidencia, bloquear o limitar autonomía. |

Reglas:

- **Sin valor no hay umbral.** No se usa 0, infinito ni "sin límite" por defecto.
- **El límite se declara.** Un importe exactamente igual al límite no se decide por conveniencia; la política dice si es inclusivo o exclusivo.
- **Dato faltante no es dato bajo.** Si falta la cantidad, el resultado es `NO_EVALUABLE`.
- **Moneda explícita.** No se comparan monedas distintas sin tasa y fecha de conversión con fuente. Sin fuente, no evaluable.
- **Tiempo explícito.** Días, horas y zonas horarias se declaran; no se cuentan "días" sin calendario.
- **La versión se registra.** Un cambio de umbral crea una versión nueva y no reescribe evaluaciones anteriores.
- **El umbral limita, no autoriza.** Superar un umbral no concede permiso; solo activa una consecuencia.
- **Un umbral no es un puntaje.** No se suman umbrales para producir un número mágico.

### 7.1 Tipos de umbral

- **Importe absoluto:** monto de la factura contra un límite.
- **Diferencia absoluta:** separación entre factura y contrato o presupuesto.
- **Diferencia relativa:** porcentaje sobre la base declarada, con base explícita.
- **Conteo:** número de facturas, pagos o aprobaciones.
- **Antigüedad:** días desde vencimiento, aprobación o última evidencia.
- **Similitud:** solo si la medida es determinista y explicable; una similitud de modelo es señal, no umbral de decisión.
- **Confianza:** solo para ordenar revisión; nunca para bajar severidad ni conceder autonomía.

### 7.2 Base y override

Adoptado el 2026-11-09: una tabla base de plataforma con override por tenant. El tenant puede endurecer un umbral sin permiso especial; aflojarlo exige una decisión explícita y registro. Los valores base no se inventan en este documento y quedan marcados como no calibrados hasta el piloto.

## 8. Precedencia y conflicto

Se reutiliza la precedencia adoptada en [identidad](13-identidad-aprobaciones.md):

1. Prohibición absoluta.
2. Denegación o elevación explícita.
3. Política del tenant.
4. Valor base de plataforma.
5. Denegar por defecto.

Reglas:

- Una elevación prevalece sobre una reducción.
- Dentro del mismo nivel, se aplica la prioridad declarada.
- Si dos reglas aplicables tienen la misma prioridad y efectos contradictorios, se produce `CONFLICTO`.
- Un conflicto bloquea o escala; no se resuelve con la regla más permisiva ni con la última evaluada.
- Se registran las reglas, los umbrales y las versiones en conflicto.
- Un cambio de política durante el workflow obliga a reevaluar; no se congela una severidad vieja.

## 9. Acoplamiento con autonomía

La severidad puede limitar el nivel máximo; nunca concederlo.

| Severidad | Nivel máximo orientativo | Condición |
| --- | --- | --- |
| Informativa | L2 para corregir datos no críticos | Permiso y política; no decide dinero. |
| Baja | L1 | Pedir información; no aprobar. |
| Media | L2 solo si la política lo permite | Permiso verificado, evidencia completa y sin conflicto. |
| Alta | L1 con revisión humana | No hay aprobación automática. |
| Crítica | L0/L1 | Revisión especializada; no hay aprobación ni ejecución automática. |
| `NO_EVALUABLE` | L1 | Pedir evidencia o escalar; no aprobar. |

Reglas:

- Una severidad mayor no reduce la autoridad requerida; la aumenta o la mantiene.
- La autonomía configurada no puede superar el tope que impone la severidad.
- Un quorum no se alcanza con severidad alta o crítica sin la revisión que la política exija.
- La IA no sube de nivel por confianza ni por severidad.
- La combinación exacta de atributos que sube o baja autonomía sigue abierta; los ejes están decididos.

## 10. Override

Un override es una excepción humana. Exige:

- actor con permiso y tenant correcto;
- motivo concreto;
- evidencia que lo sostiene;
- alcance y vigencia;
- severidad anterior y resultante;
- fecha y versión de política;
- registro append-only o equivalente.

Límites:

- No puede saltarse una prohibición absoluta.
- No puede cruzar tenants.
- No puede convertir una severidad crítica en aprobación automática.
- No puede bajar una severidad sin evidencia.
- No puede cerrar una alerta por silencio ni por tiempo.
- No puede eliminar el hallazgo original; se conserva con la excepción.
- Si la política exige doble control para bajar una severidad alta o crítica, se cumple.

## 11. Calibración

No se inventan números. La calibración es un proceso, no una tabla copiada.

### 11.1 Fases

1. **Consistencia sintética.** Casos marcados, mismos insumos y versiones; verificar que la evaluación es reproducible y que ningún dato faltante se vuelve seguro.
2. **Piloto con datos etiquetados.** Casos revisados por humanos, con resultado y evidencia. Medir por señal: falsos positivos, falsos negativos, carga de revisión, tiempo hasta decisión y tasa de override.
3. **Ajuste y versión.** Cambiar umbrales con una hipótesis explícita, registrar la versión y comparar contra la anterior.
4. **Monitoreo y deriva.** Revisar periódicamente; un cambio de proveedores, monedas o políticas puede invalidar la calibración.

### 11.2 Reglas

- Sin datos etiquetados no se afirma precisión.
- Un resultado sintético no demuestra precisión real.
- La calibración no mezcla tenants ni usa datos de un tenant para otro sin base y consentimiento.
- Un modelo no se calibra con su propia salida como verdad.
- Un umbral no se baja para reducir carga de revisión si eso deja pasar severidades altas o críticas.
- La calibración se versiona y se audita.
- Las métricas y sus valores objetivo están abiertos; no se fijan aquí.

### 11.3 Datos mínimos

- Casos con resultado conocido y evidencia.
- Señal que se activó y severidad asignada.
- Acción tomada y resultado.
- Override, si existió, con motivo.
- Versión de política y de umbral.
- Tenant y periodo, sin exponer datos personales innecesarios.

## 12. Aislamiento y auditoría

- Señales, hallazgos, políticas, umbrales y calibración son del tenant.
- Una evaluación de un tenant no usa datos de otro.
- Un ID de otro tenant se trata como inexistente.
- Se registra: tenant, operación, documento y versión, señal, evidencia, tipo de riesgo, confianza, regla, umbral, versión de política, severidad anterior y resultante, acción permitida, actor y fecha.
- El registro no guarda secretos ni datos personales innecesarios.
- Un cambio de severidad deja rastro; no se sobrescribe el valor anterior.

## 13. Ejemplos sintéticos

Marcados como sintéticos. No son umbrales de producto.

### 13.1 Factura de USD 10.000 contra contrato de USD 8.000

- Señal S-08: diferencia de USD 2.000.
- Evidencia: contrato con condición mensual de USD 8.000.
- Severidad inicial: media.
- Acción: pedir confirmación al departamento responsable.
- No es fraude, no es servicio adicional aceptado y no es aprobación.
- Si falta el contrato, el resultado es `NO_EVALUABLE`, no media ni baja.

### 13.2 Duplicado exacto

- Señal S-03: mismo documento, o mismo proveedor, número e importe cuando esas señales existan.
- Severidad inicial: alta.
- Acción: bloquear temporalmente y revisar.
- No se declara fraude ni se descarta sin revisión.

### 13.3 Cuenta bancaria nueva

- Señal S-02: cuenta nueva o modificada.
- Severidad inicial: alta.
- Acción: control reforzado y revisión humana.
- Solo pasa a crítica si la política y las señales adicionales lo justifican; no se inventa la combinación.

### 13.4 Límite exacto

- Un umbral declara `importe >= límite` como inclusivo, o `importe > límite` como exclusivo.
- Si la política no declara el límite, el resultado es `NO_EVALUABLE` o `CONFLICTO`, no una elección por conveniencia.

### 13.5 Señal de modelo

- Un modelo señala una posible anomalía con confianza alta.
- Se añade un hallazgo para revisión.
- No baja una severidad media a baja, no cierra la alerta y no autoriza nada.

### 13.6 Políticas contradictorias

- Dos reglas aplicables de igual prioridad producen efectos opuestos.
- Resultado: `CONFLICTO`, bloqueo o escalamiento.
- Se registran ambas reglas y versiones.
- No gana la última ni la más permisiva.

## 14. Decidido, hipótesis y abierto

### Decidido antes de esta tarea

- Escala de severidad: informativa, baja, media, alta y crítica.
- La severidad es una entrada, no una decisión.
- Una severidad mayor no reduce la autoridad requerida.
- Una severidad crítica nunca se aprueba automáticamente.
- La IA no baja ni cierra una severidad.
- La ausencia de evidencia no es aprobación ni rechazo.
- Los cálculos y umbrales son deterministas.
- El override humano exige actor, motivo, fecha y evidencia.
- El aislamiento entre tenants no se negocia.

### Adoptado el 2026-11-09

- Distinguir señal, hallazgo, tipo de riesgo, confianza, severidad, umbral y decisión.
- Catálogo de señales y tipos de riesgo de las secciones 3 y 4.
- Evaluación en diez pasos con `SEVERIDAD`, `NO_EVALUABLE`, `CONFLICTO` y `BLOQUEO`.
- `NO_EVALUABLE` como resultado separado, nunca como severidad baja.
- Umbral con cantidad, unidad, moneda, alcance, operador, límite inclusivo o exclusivo, vigencia y versión.
- Elevación prevalece; reducción exige evidencia y autoridad.
- Conflicto de igual prioridad se declara y escala.
- Tope de autonomía por severidad.
- Tabla base de plataforma con override por tenant. El tenant endurece por defecto; aflojar exige una decisión explícita y registro.
- Calibración en fases, sin afirmar precisión sin datos.

### Hipótesis

- La demo se resuelve con pocas señales y casos sintéticos.
- Un puntaje compuesto de riesgo no es necesario para el MVP.
- La calibración real espera a un piloto con datos etiquetados.

### Abierto

- Valores numéricos de todos los umbrales.
- Señales incluidas en el MVP.
- Existencia y fórmula de un puntaje compuesto.
- Fuente y momento de la calibración.
- Monedas, tasas y fechas de conversión.
- Plazos de revisión, bloqueo y suspensión.
- Quién puede cambiar umbrales y con qué aprobación.
- Evidencia que permite bajar una severidad.
- Calibración por tenant o común, y agregación permitida.

## 15. Decisión de umbrales adoptada

Adoptado el 2026-11-09: **la plataforma ofrece una tabla base de señales, severidades y umbrales que cada tenant ajusta**, con los valores base marcados como no calibrados hasta el piloto.

- El tenant puede endurecer un umbral sin permiso especial.
- Aflojar un umbral exige una decisión explícita y registro.
- Una configuración solo por tenant queda descartada para el MVP; reabrirla exige una decisión explícita.
- La tabla base no inventa números: define la estructura y deja los valores pendientes de calibración.

## 16. Casos de aceptación

1. Una factura sin contrato produce `NO_EVALUABLE`, no severidad baja.
2. Una diferencia de USD 2.000 contra un contrato de USD 8.000 produce severidad media y pedido de confirmación.
3. Un duplicado exacto produce severidad alta y bloqueo temporal, no fraude automático.
4. Una cuenta bancaria nueva produce severidad alta y revisión humana.
5. Un modelo con confianza alta añade revisión, pero no baja una severidad media.
6. Dos reglas contradictorias de igual prioridad producen `CONFLICTO` y escalamiento.
7. Un importe exactamente en el límite se resuelve según el operador declarado, no por conveniencia.
8. Un umbral sin valor declarado no se evalúa como cero ni como infinito.
9. Una moneda distinta sin tasa y fecha produce `NO_EVALUABLE`.
10. Una severidad crítica no se aprueba automáticamente ni con override común.
11. Un cambio de evidencia o política obliga a reevaluar.
12. Un override conserva el hallazgo original y registra actor, motivo, evidencia y versión.
13. Una evaluación de un tenant no usa señales, umbrales ni calibración de otro.
14. La misma entrada, evidencia y versión producen la misma severidad.
15. Ningún ejemplo ni tabla de este documento se presenta como calibrado.

## 17. Relación con otras tareas

| Tarea | Relación |
| --- | --- |
| 04 Validación | Aporta señales y hallazgos; no decide. |
| 05 Workflows | Consume severidad y acciones permitidas. |
| 07 Autoridad e IA | Fija los límites que este modelo hace operativos. |
| 10 Seguridad | Aporta aislamiento, auditoría y controles de acceso. |
| 11 Edge cases | Aporta los casos que la severidad debe tratar. |
| 12 Estados | Cada transición consume la evaluación de este modelo. |
| 13 Identidad | Aporta permisos, delegación, quorum y precedencia. |

## 18. Fuera de alcance

- Elegir proveedor de base de datos, correo, OCR, JEV o modelo de IA.
- Diseñar tablas, APIs, eventos o un enum de implementación.
- Fijar importes, porcentajes, plazos o puntajes.
- Aprobar, rechazar o pagar.
- Declarar fraude, legitimidad o responsabilidad legal.
- Calibrar con datos reales de clientes.
- Cerrar cualquier punto de [asuntos abiertos](../decisiones/abiertas.md) sin una decisión explícita.
