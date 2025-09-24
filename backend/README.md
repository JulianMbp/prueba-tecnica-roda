# Backend Flask

Stack:
- Flask
- SQLAlchemy
- PostgreSQL (Docker)
- pgAdmin (Docker)

Quickstart

1. Copia `.env.example` a `.env` y ajusta variables si es necesario:

   cp .env.example .env

2. Levanta los servicios con Docker Compose:

   docker-compose up --build

3. Abre `http://localhost:8000` para la API y `http://localhost:5050` para pgAdmin (usar las credenciales del `.env`).

pgAdmin

1. Abre `http://localhost:5050` y entra con las credenciales definidas en `.env` (`PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD`).
2. Para añadir la conexión a la base de datos en pgAdmin usa:
   - Host: `db`
   - Puerto: `5432`
   - Maintenance DB: `postgres`
   - Usuario: `postgres`
   - Contraseña: `postgres`

Notas

- Si quieres persistir datos asegúrate de detener con `docker-compose down` sin la opción `-v` para mantener los volúmenes.
- Si usas un entorno local sin Docker, puedes configurar `DATABASE_URL` en tu `.env` para apuntar a otra instancia.

Endpoints:
- `GET /` → estado
- `GET /users` → lista usuarios
- `POST /users` → crea usuario `{ "name": "...", "email": "..." }`

Nota: la app ejecuta migraciones con `flask db upgrade` automáticamente si existen migraciones.
