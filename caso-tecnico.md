# Caso Técnico  — Roda (6–8h)

> Enfoque: Backend Python requerido (FastAPI/Flask/Django, se sugiere FastAPI). Frontend React requerido. Tailwind es un plus. Sin acceso a BD externa: debes montar tu propia PostgreSQL local con datos de ejemplo.
> 

---

## 1) Contexto de negocio (2 párrafos máx.)

Roda financia e‑bikes/e‑mopeds para repartidores, tenderos y usuarios de estratos 1–3. El **cronograma de pagos** es la vista más consultada por clientes y por cobranzas: debe ser claro, rápido y confiable.

Tu app será usada por un repartidor que quiere ver **cuánto pagar, cuándo** y si está **al día o en mora**. El reto: construir una solución **fullstack** que muestre el cronograma desde PostgreSQL con una **UI moderna** y **API limpia**.

---

## 2) Reglas del juego y entregables

- **Tiempo:** 6–8 horas (máx.).
- **Base de datos:** **local**. Docker es un **plus** (no obligatorio). No uses credenciales externas.
- **Repo** (GitHub/GitLab):
    - `/server` (Python) y `/web` (React).
    - `sql/01_schema_seed.sql` (DDL + seed) listo para copiar/pegar.
    - `README.md` (≤1 pág) con: cómo levantar, decisiones, y trade‑offs.
- **Demo (30 min):** 15’ arquitectura/decisiones + 15’ pruebas en vivo.

**Criterios:** finalización, calidad de código, buenas prácticas, diseño UI/UX, y pequeños **add‑ons** (filtros, gráficos, exportar, dark mode, etc.).

---

## 3) Esquema mínimo de datos (copiar/pegar)

> Crea un esquema core y estos objetos. Puedes simplificar nombres, pero respeta las relaciones.
> 

```sql
-- sql/01_schema_seed.sql
CREATE SCHEMA IF NOT EXISTS core;

CREATE TABLE IF NOT EXISTS core.clientes (
  cliente_id   BIGSERIAL PRIMARY KEY,
  tipo_doc     TEXT NOT NULL,
  num_doc      TEXT NOT NULL,
  nombre       TEXT NOT NULL,
  ciudad       TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (tipo_doc, num_doc)
);

CREATE TABLE IF NOT EXISTS core.creditos (
  credito_id   BIGSERIAL PRIMARY KEY,
  cliente_id   BIGINT NOT NULL REFERENCES core.clientes(cliente_id),
  producto     TEXT NOT NULL,                  -- e-bike, e-moped
  inversion    NUMERIC(12,2) NOT NULL,
  cuotas_totales INT NOT NULL,
  tea          NUMERIC(8,6) NOT NULL,
  fecha_desembolso DATE NOT NULL,
  fecha_inicio_pago DATE NOT NULL,
  estado       TEXT NOT NULL DEFAULT 'vigente'  -- vigente|cancelado|castigado
);

CREATE TABLE IF NOT EXISTS core.payment_schedule (
  schedule_id  BIGSERIAL PRIMARY KEY,
  credito_id   BIGINT NOT NULL REFERENCES core.creditos(credito_id),
  num_cuota    INT NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  valor_cuota  NUMERIC(12,2) NOT NULL,
  estado       TEXT NOT NULL DEFAULT 'pendiente', -- pendiente|parcial|pagada|vencida
  UNIQUE (credito_id, num_cuota)
);

CREATE TABLE IF NOT EXISTS core.pagos (
  pago_id      BIGSERIAL PRIMARY KEY,
  schedule_id  BIGINT NOT NULL REFERENCES core.payment_schedule(schedule_id),
  fecha_pago   TIMESTAMPTZ NOT NULL,
  monto        NUMERIC(12,2) NOT NULL,
  medio        TEXT
);

-- Índices mínimos
CREATE INDEX IF NOT EXISTS ix_ps_credito_cuota ON core.payment_schedule(credito_id, num_cuota);
CREATE INDEX IF NOT EXISTS ix_pagos_schedule_fecha ON core.pagos(schedule_id, fecha_pago);

```

### Seed rápido (datos realistas):

```sql
-- Clientes (10), créditos (20), cuotas mensuales (6–12), pagos variados
INSERT INTO core.clientes (tipo_doc, num_doc, nombre, ciudad)
SELECT 'CC', to_char(10000000+g, 'FM99999999'),
       'Cliente '||g, (ARRAY['Bogotá','Medellín','Cali','Barranquilla'])[1 + (random()*3)::int]
FROM generate_series(1,10) g;

INSERT INTO core.creditos (cliente_id, producto, inversion, cuotas_totales, tea, fecha_desembolso, fecha_inicio_pago, estado)
SELECT c.cliente_id,
       (ARRAY['e-bike','e-moped'])[1 + (random()*1)::int],
       round((random()*3000000 + 2000000)::numeric, -3),
       (ARRAY[6,9,12])[1 + (random()*2)::int],
       0.28,
       (CURRENT_DATE - (random()*60)::int),
       (CURRENT_DATE - (random()*30)::int),
       'vigente'
FROM core.clientes c
CROSS JOIN LATERAL (SELECT 2) x  -- ~2 créditos por cliente
LIMIT 20;

-- Programación de cuotas (valor fijo simple) y pagos (algunos parciales/atrasos)
INSERT INTO core.payment_schedule (credito_id, num_cuota, fecha_vencimiento, valor_cuota)
SELECT cr.credito_id,
       n AS num_cuota,
       cr.fecha_inicio_pago + ((n-1) * INTERVAL '1 month'),
       round((cr.inversion / cr.cuotas_totales)::numeric, -1)
FROM core.creditos cr
JOIN LATERAL generate_series(1, cr.cuotas_totales) n ON TRUE;

-- Pagos: 0–2 por cuota (algunos atrasados, parciales, completos)
INSERT INTO core.pagos (schedule_id, fecha_pago, monto, medio)
SELECT ps.schedule_id,
       (ps.fecha_vencimiento + ((-5 + (random()*15)::int)) * INTERVAL '1 day'),
       round((ps.valor_cuota * (CASE WHEN random() < 0.3 THEN 0.5 WHEN random()<0.7 THEN 1 ELSE 0 END))::numeric, -1),
       (ARRAY['app','efectivo','link'])[1 + (random()*2)::int]
FROM core.payment_schedule ps
WHERE random() < 0.7;  -- no todos pagan

-- Marcar estados básicos (opcional: persistir saldo si quieres)
UPDATE core.payment_schedule ps
SET estado = CASE
  WHEN (SELECT COALESCE(SUM(monto),0) FROM core.pagos p WHERE p.schedule_id=ps.schedule_id) >= ps.valor_cuota THEN 'pagada'
  WHEN ps.fecha_vencimiento < CURRENT_DATE AND (SELECT COALESCE(SUM(monto),0) FROM core.pagos p WHERE p.schedule_id=ps.schedule_id) < ps.valor_cuota THEN 'vencida'
  WHEN (SELECT COALESCE(SUM(monto),0) FROM core.pagos p WHERE p.schedule_id=ps.schedule_id) > 0 THEN 'parcial'
  ELSE 'pendiente' END;

```

---

## 4) Implementación (arquitectura libre)

- **Backend:** debe estar en **Python** (Flask preferido; puedes usar FastAPI/Django si lo justificas). Diseño y estructura **libres**: queremos ver tus decisiones desde cero (routing, capas, manejo de errores, etc.).
- **Frontend:** debe estar en **React**. Diseño y estructura **libres** (state management, routing, estilos). **Tailwind** es un plus opcional.
- **UI / Branding:** usa la paleta **Roda**: `#000000`, `#0C0D0D`, `#FFFFFF`, `#EBFF00`, `#C6F833`, `#B794F6`.
- **Entrega mínima:** app corriendo local, README breve (cómo correr + decisiones clave). No imponemos estructura de carpetas ni endpoints.

---

## 6) Requisitos funcionales mínimos (checklist)

- 

**Plus (elige 1–3):**

- 

---

## 7) Buenas prácticas esperadas (breve)

- Código modular, validaciones básicas, manejo de errores y CORS.
- Consultas eficientes (usa índices dados), paginación en listados.
- `.env` y variables de entorno, sin secretos en repo.
- README con pasos de instalación y decisiones (por qué FastAPI/Flask, librerías, trade‑offs de modelado).

---

## 8) Presentación (30’)

1. **Arquitectura**: diagrama breve y flujos (2–3’).
2. **Demo**: listado → detalle de cronograma → filtros/export (10–12’).
3. **Decisiones**: performance (consultas/índices), DX (estructura), UX (accesibilidad) (5–7’).
4. **Q&A**: troubleshoot y mejoras futuras (8–10’).

---

## 9) Evaluación (rúbrica)

- **Funcionalidad (30%)**: cumple requerimientos mínimos y lee de PostgreSQL local.
- **Calidad técnica (30%)**: API clara, manejo de errores, paginación, estructura de proyecto.
- **UI/UX (20%)**: claridad, consistencia visual Roda, responsivo.
- **Buenas prácticas (10%)**: env, lint, git hygiene.
- **Plus/innovación (10%)**: uno o más add‑ons funcionando.

---

## 10) Notas finales

- Puedes usar Mocha o Lovable para prototipos UI (opcional) siempre que la app final corra localmente.
- Si cambias tecnologías, documenta el porqué en el README.