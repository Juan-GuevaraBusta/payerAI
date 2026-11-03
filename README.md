# Financial Operations Intelligence Platform

Nombre de trabajo. No es el nombre comercial.

Plataforma B2B de inteligencia y control sobre operaciones financieras. El primer dominio es cuentas por pagar. El repositorio está en discovery: hay decisiones firmes y hipótesis sin validar. No hay aplicación ni código de producto.

Este repositorio no es un producto, socio, proveedor ni proyecto respaldado por Blinka.

## Cómo leer

1. [`docs/documento-maestro.md`](docs/documento-maestro.md) es la fuente principal. Léelo completo antes de proponer arquitectura, diseñar funcionalidades o implementar.
2. [`docs/decisiones/adoptadas.md`](docs/decisiones/adoptadas.md) y [`docs/decisiones/abiertas.md`](docs/decisiones/abiertas.md) separan lo cerrado de lo pendiente.
3. [`docs/tareas/`](docs/tareas/) parte el trabajo de discovery. Ninguna tarea autoriza a escribir código por sí sola.
4. [`docs/glosario.md`](docs/glosario.md) fija términos que no deben colapsarse.

Si un chat, issue o instrucción contradice una decisión del documento maestro, señala el conflicto. No la sobrescribas en silencio.

Índice de producto: [`docs/README.md`](docs/README.md).

El orquestador de ingeniería está en [`docs/orchestrator/uso.md`](docs/orchestrator/uso.md). No sustituye al documento de producto y no autoriza a construir el dominio financiero mientras falte `MASTER_PROMPT_FINANCIAL_OPERATIONS.md`.

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) valida las pruebas del orquestador, los enlaces relativos de la documentación, los marcadores de conflicto, los artefactos versionados y el estado mínimo del repositorio. En local:

```bash
bash scripts/ci.sh
```

El pipeline es solo CI. No hay despliegue porque todavía no existe código de producto ni destino de despliegue.
