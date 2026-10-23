# AdoptaYa — Front-end

Interfaz web del sistema de adopción de mascotas (curso Modelos de Programación, equipo G81-E5). Consume la API REST del back-end (`MP_202630_G81_E5_Back`).

## Tecnologías

- React + Vite (JavaScript, sin TypeScript)
- React Router, Axios
- Bootstrap + estilos propios (`src/styles/theme.css`)
- ESLint
- Vitest + React Testing Library (cobertura con v8)
- Docker Compose: Jenkins y SonarQube locales (`infra/`)

## Requisitos

- Node.js y npm (probado con Node v24 y npm 11)
- Back-end en ejecución en `http://localhost:8080` (prefijo `/api`)
- Docker Desktop (solo para Jenkins y SonarQube)

## Instalación y ejecución

```powershell
git clone <url-del-repositorio>
cd MP_202630_G81_E5_Front
npm install
Copy-Item .env.example .env
npm run dev
```

La aplicación queda en `http://localhost:5173`.

### Variables de entorno

| Variable | Descripción | Valor por defecto |
| --- | --- | --- |
| `VITE_API_URL` | URL base de la API | `http://localhost:8080/api` |

### Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | Análisis estático con ESLint |
| `npm run test:coverage` | Pruebas unitarias con cobertura (`coverage/lcov.info`) |

## Historias de usuario implementadas

### HU01 — Registrar mascota

Como administrador de refugio quiero registrar una mascota con nombre, especie y edad válidos para publicarla como disponible para adopción.

**Cómo visualizarla**

1. Levanta el back-end y carga datos de prueba (la base se borra al reiniciar el back):
   ```powershell
   .\infra\seed-data.ps1
   ```
2. Ejecuta `npm run dev` y abre `http://localhost:5173/mascotas`.

| Criterio de aceptación | Dónde verlo |
| --- | --- |
| 1. Crear mascota válida | `/mascotas/nueva` → "Registrar mascota"; aparece en el listado |
| 2. Nombre o especie inválidos | En el formulario, dejar vacío nombre o especie → mensaje de error |
| 3. Edad inválida (0 es válida) | Edad `-1` → error; edad `0` → se guarda |
| 4. Refugio ausente o inexistente | No seleccionar refugio → error; si el back lo rechaza, se muestra su mensaje |
| 5. Consultar mascotas | `/mascotas` (listado) y clic en el nombre → `/mascotas/:id`; si no existe, "Mascota no encontrada." |
| 6. Editar mascota | Botón "Editar" → `/mascotas/:id/editar`; conserva el refugio; datos inválidos se rechazan |
| 7. Borrar mascota | Botón "Eliminar"; con adopciones o fotos asociadas se muestra el error; si no existe, "Mascota no encontrada." |

## Pruebas

```powershell
npm run test:coverage
```

Cada funcionalidad incluye pruebas unitarias (servicios, utilidades, hooks, componentes y páginas) con los servicios de API simulados.

## Calidad: Jenkins y SonarQube

La infraestructura se levanta con Docker Compose desde `infra/`:

```powershell
docker compose -f infra/docker-compose.yml up -d
```

| Servicio | URL |
| --- | --- |
| SonarQube | `http://localhost:9000` |
| Jenkins | `http://localhost:8081` |

El `Jenkinsfile` ejecuta lint, build, pruebas con cobertura y el análisis de SonarQube, esperando el Quality Gate (configuración en `sonar-project.properties`).

## Flujo de trabajo (Git Flow)

- Una rama por historia: `feature/nombre-de-la-historia-id` (ej. `feature/registrar-mascota-hu01`).
- Prohibido subir directo a `main` o `develop`.
- Todo cambio entra por Pull Request con la aprobación de al menos un compañero.

## Estructura del proyecto

```
src/
  components/   componentes reutilizables (Header, PetForm, PetTable, ...)
  hooks/        carga de datos (usePets, usePet, useShelters)
  layouts/      layout principal
  pages/        páginas de las rutas
  routes/       definición de rutas
  services/     cliente HTTP, servicios de API y mapeo de datos
  styles/       tema global
  utils/        validaciones, formateo y mensajes
infra/          Jenkins, SonarQube y datos de prueba
```

## Notas

- `npm audit` reporta una vulnerabilidad en `node-forge`, dependencia transitiva de `@sonar/scan`. Es solo de desarrollo (no llega al build) y no tiene parche disponible; se acepta y documenta.