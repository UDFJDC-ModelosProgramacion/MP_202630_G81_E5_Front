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
 | 7. Eliminar reseña | "Eliminar" (con confirmación); la reseña desaparece de la lista |

### HU02 — Gestionar fotos

Como administrador de refugio quiero asociar fotos a una mascota o a un refugio para mostrar su aspecto a los adoptantes.

**Cómo visualizarla**

1. Levanta el back-end y carga datos de prueba (la base se borra al reiniciar el back). Primero las mascotas y el refugio, luego las fotos:
   ```powershell
   .\infra\seed-data.ps1
   .\infra\seed-fotos.ps1
   ```
   `seed-fotos.ps1` requiere las mascotas Luna y Michi y el refugio "Refugio Adopciones" (los crea `seed-data.ps1`). Crea 3 fotos para Luna, 1 para Michi y 2 para el refugio, e imprime sus ids; si el destino ya tiene fotos, lo omite. Si PowerShell bloquea el script: `powershell -ExecutionPolicy Bypass -File .\infra\seed-fotos.ps1`.
2. Ejecuta `npm run dev`, abre `http://localhost:5173/mascotas` y pulsa "Fotos" en la fila de Luna. También se llega desde el detalle de una mascota y desde el detalle de un refugio.

| Criterio de aceptación | Dónde verlo |
| --- | --- |
| 1. Crear foto válida | En `/mascotas/:id/fotos`, panel "Agregar foto": escribir una URL → "Agregar foto"; aparece en la lista de la mascota. Elegir el refugio en "Asociar a" abre `/refugios/:id/fotos` con la foto |
| 2. Foto sin destino | En "Asociar a" elegir "Selecciona un destino" y enviar → "La foto debe asociarse a una mascota o a un refugio." |
| 3. URL inválida | Dejar vacía la URL al agregar o al editar → "La URL es obligatoria."; si el back la rechaza, se muestra su mensaje |
| 4. Mascota o refugio inexistente | `/mascotas/9999/fotos` → "Mascota no encontrada."; `/refugios/9999/fotos` → "Refugio no encontrado." |
| 5. Consultar fotos | `/mascotas/:id/fotos` (o `/refugios/:id/fotos`) y clic en una foto → `/mascotas/:id/fotos/:photoId`; si no existe, "Foto no encontrada." |
| 6. Foto de otro destino | El script imprime los ids; abrir `/mascotas/<id de Luna>/fotos/<id de una foto del refugio>` → "La foto no pertenece a esta mascota." (y lo equivalente en `/refugios/...`); lo mismo ocurre al editarla o eliminarla |
| 7. Editar foto | "Editar" bajo una foto → el panel pasa a "Editar foto" con el destino bloqueado → "Guardar cambios"; la foto conserva su asociación y una URL vacía se rechaza |
| 8. Borrar foto | "Eliminar" (con confirmación); la foto desaparece de la lista; si ya no existe, "Foto no encontrada." |

### HU04 — Calificar el proceso de adopción

Como adoptante quiero calificar el proceso de adopción con una calificación de 1 a 5 y un comentario opcional para compartir mi experiencia y ayudar a mejorar el servicio.

**Cómo visualizarla**

1. Levanta el back-end y carga datos de prueba (la base se borra al reiniciar el back; el script se ejecuta una sola vez por arranque):
   ```powershell
   .\infra\seed-reviews.ps1
   ```
   Crea (o reutiliza) a Laura Gómez, con 3 reseñas (5, 4 y 4), y a Carlos Pérez, con 2 reseñas (una sin comentario). Si PowerShell bloquea el script: `powershell -ExecutionPolicy Bypass -File .\infra\seed-reviews.ps1`.
2. Ejecuta `npm run dev` y abre `http://localhost:5173/mis-resenas`. Como todavía no hay inicio de sesión, "Mis reseñas" abre las reseñas del primer adoptante registrado (Laura).

| Criterio de aceptación | Dónde verlo |
| --- | --- |
| 1. Crear reseña válida | En el panel "Nueva reseña", elegir de 1 a 5 estrellas y, si se quiere, un comentario → "Publicar reseña"; aparece en la lista y el promedio se actualiza |
| 2. Calificación inválida o ausente | "Publicar reseña" sin elegir estrellas → "Elige una calificación de 1 a 5."; si el back rechaza una calificación fuera de rango, se muestra su mensaje y no se crea la reseña |
| 3. Adoptante inexistente | `/adoptantes/9999/resenas` → "Adoptante no encontrado."; no se muestra el formulario |
| 4. Consultar reseñas | `/mis-resenas` (lista con promedio) y "Ver detalle" → `/adoptantes/:adopterId/resenas/:reviewId` |
| 5. Reseña de otro adoptante | El script imprime una URL con la reseña de Carlos bajo el adoptante de Laura → "Esta reseña pertenece a otro adoptante."; lo mismo ocurre al editarla o eliminarla |
| 6. Editar reseña | "Editar" en una tarjeta → el panel pasa a "Editar reseña" → "Guardar cambios"; una calificación inválida se rechaza |
| 7. Eliminar reseña | "Eliminar" (con confirmación); la reseña desaparece de la lista |


### HU05 — Registrar adopción

Como administrador de refugio quiero registrar una adopción con fecha, estado, mascota, adoptante y veterinario responsable válidos para formalizar y hacer seguimiento al proceso.

**Cómo visualizarla**

1. Levanta el back-end y carga datos de prueba (la base se borra al reiniciar el back; el script se ejecuta una sola vez por arranque):
   ```powershell
   .\infra\seed-adoptions.ps1
   ```
   Crea 1 refugio, 2 veterinarios, 5 adoptantes, 7 mascotas y 5 adopciones (En curso, Aprobada y Devuelta). Toby y Mia quedan disponibles para probar el formulario. Si PowerShell bloquea el script: `powershell -ExecutionPolicy Bypass -File .\infra\seed-adoptions.ps1`.
2. Ejecuta `npm run dev` y abre `http://localhost:5173/adopciones`.

| Criterio de aceptación | Dónde verlo |
| --- | --- |
| 1. Crear adopción válida | `/adopciones/nueva` → elegir una mascota disponible (Toby o Mia), adoptante, veterinario y fecha → "Registrar adopción"; aparece en el listado y la mascota deja de estar disponible |
| 2. Estado por defecto | En el formulario el estado es opcional y arranca en "En curso"; se guarda como `IN_PROGRESS` |
| 3. Datos obligatorios | Dejar vacío mascota, adoptante, veterinario o fecha → mensaje de error bajo cada campo |
| 4. Referencias inexistentes | Si el back responde 404 por adoptante, veterinario o mascota, se muestra "… no fue encontrado" y no se crea la adopción |
| 5. Mascota no disponible | Elegir una mascota ya adoptada (por ejemplo Luna) → "Esta mascota ya no está disponible para adopción. Elige otra." |
| 6. Consultar adopciones | `/adopciones` (listado con búsqueda y filtro por estado) y "Ver detalle" → `/adopciones/:id` con mascota, adoptante y veterinario; si no existe, "Adopción no encontrada." |
| 7. Actualizar estado | En el detalle, "Cambiar estado" → "Guardar estado"; un estado no válido se rechaza |
| 8. Mascota inmodificable | El cambio de estado solo envía fecha y estado; la adopción conserva su mascota original |
| 9. Borrar adopción | En el detalle, "Eliminar adopción" (con confirmación); vuelve al listado y ya no aparece |



### HU06 — Registrar devolución de una mascota

Como administrador de refugio quiero registrar la devolución de una mascota adoptada con fecha y motivo para dejar constancia y poder volver a ofrecerla en adopción.

**Cómo visualizarla**

1. Levanta el back-end y carga datos de prueba (la base se borra al reiniciar el back; los scripts se ejecutan una sola vez por arranque y en este orden):
   ```powershell
   .\infra\seed-adoptions.ps1
   .\infra\seed-returns.ps1
   ```
   El segundo registra la devolución de la adopción de Michi (Carlos Pérez) y deja las demás adopciones sin devolución. Si PowerShell bloquea un script: `powershell -ExecutionPolicy Bypass -File .\infra\seed-returns.ps1`.
2. Ejecuta `npm run dev`, abre el detalle de una adopción (`/adopciones/:id`) y pulsa **Devolución**, o usa las URLs que imprime el script (`/adopciones/:id/devolucion`).

| Criterio de aceptación | Dónde verlo |
| --- | --- |
| 1. Registrar devolución válida | En una adopción sin devolución (por ejemplo la de Rocky), elegir la fecha (hoy por defecto) y escribir el motivo → "Registrar devolución"; la adopción pasa a "Devuelta" y la mascota queda "Disponible" (también en `/mascotas`) |
| 2. Datos obligatorios | Enviar sin motivo → "El motivo es obligatorio."; sin fecha → "La fecha de devolución es obligatoria."; no se registra nada |
| 3. Una sola devolución por adopción | Una adopción con devolución (la de Michi) no ofrece el formulario; si otra persona la registra antes de enviar, el back la rechaza y se muestra "Esta adopción ya tiene una devolución registrada." junto con la que existe |
| 4. Consultar devolución | `/adopciones/:id/devolucion` de una adopción con devolución → tarjeta "Devolución registrada" con la fecha y el motivo |
| 5. Adopción sin devolución | Una adopción sin devolución muestra "Esta adopción todavía no tiene una devolución registrada."; si la devolución se borra en otra pestaña, editar o eliminar muestra "Devolución no encontrada."; `/adopciones/9999/devolucion` → "Adopción no encontrada." |
| 6. Editar devolución | "Editar devolución" → el panel pasa a "Editar devolución" → "Guardar cambios"; si falta la fecha o el motivo, el cambio se rechaza |
| 7. Borrar devolución | "Eliminar devolución" (con confirmación); la devolución desaparece y vuelve a ofrecerse el registro. El back solo la desasocia: la adopción sigue "Devuelta" y la mascota disponible |

### HU10 — Gestionar refugios

Como administrador quiero registrar y gestionar refugios con nombre y ciudad para mantener actualizado el listado de refugios aliados.

**Cómo visualizarla**

1. Levanta el back-end y carga datos de prueba (la base se borra al reiniciar el back; el script se ejecuta una sola vez por arranque):
   ```powershell
   .\infra\seed-data.ps1
   ```
   Crea "Refugio Adopciones" en Bogotá con 4 mascotas. Si PowerShell bloquea el script: `powershell -ExecutionPolicy Bypass -File .\infra\seed-data.ps1`. Si la ciudad se ve como "BogotÃ¡" (problema de codificación del script en Windows PowerShell), corrígela con "Editar" escribiendo `Bogotá`.
2. Ejecuta `npm run dev` y abre `http://localhost:5173/refugios`.

| Criterio de aceptación | Dónde verlo |
| --- | --- |
| 1. Registrar refugio válido | `/refugios/nuevo` → nombre y ciudad → "Registrar refugio"; aviso verde y aparece en el listado |
| 2. Nombre o ciudad vacíos | Enviar el formulario vacío → "El nombre es obligatorio." y "La ciudad es obligatoria." |
| 3. Refugio repetido | Registrar el mismo nombre en la misma ciudad (por ejemplo "Refugio Adopciones" en "Bogotá") → "Ya existe un refugio con este nombre en esta ciudad."; el mismo nombre en otra ciudad sí se crea |
| 4. Consultar refugios | `/refugios` (listado con mascotas y eventos) y "Ver detalle" → `/refugios/:id`; si no existe (`/refugios/9999`), "Refugio no encontrado." |
| 5. Editar refugio | "Editar" → `/refugios/:id/editar` → "Guardar cambios"; el refugio conserva sus mascotas; nombre o ciudad vacíos se rechazan |
| 6. Eliminar refugio | "Eliminar" (con confirmación); si tiene mascotas, eventos u otros datos asociados se muestra "No se puede eliminar …"; si no tiene, desaparece del listado |

### HU11 — Gestionar eventos del refugio

Como administrador de refugio quiero programar y gestionar los eventos de un refugio (jornadas, ferias, vacunaciones) para que los adoptantes sepan qué actividades se realizan.

**Cómo visualizarla**

1. Levanta el back-end y carga datos de prueba (la base se borra al reiniciar el back; el script se ejecuta una sola vez por arranque):
   ```powershell
   .\infra\seed-eventos.ps1
   ```
   Crea (o reutiliza) "Refugio Adopciones" con 3 eventos (uno próximo con tipo "Jornada", uno ya realizado sin tipo y otro próximo) y un segundo refugio, "Refugio Huellitas", con 1 evento propio. Si el refugio ya tiene eventos, los omite. Si PowerShell bloquea el script: `powershell -ExecutionPolicy Bypass -File .\infra\seed-eventos.ps1`.
2. Ejecuta `npm run dev`, abre `http://localhost:5173/refugios`, pulsa "Ver detalle" en un refugio y luego "Eventos" (o abre directamente `/refugios/:id/eventos`).

| Criterio de aceptación | Dónde verlo |
| --- | --- |
| 1. Crear evento válido | En `/refugios/:id/eventos`, panel "Nuevo evento": escribir nombre y fecha (el tipo es opcional) → "Programar evento"; aparece una tarjeta con la insignia "Próximo" (o "Realizado" si la fecha ya pasó) y el aviso "Evento programado correctamente." |
| 2. Datos obligatorios | "Programar evento" con el formulario vacío → "El nombre es obligatorio." y "La fecha es obligatoria."; lo mismo al guardar un evento editado sin nombre o sin fecha |
| 3. Refugio inexistente | `/refugios/9999/eventos` → "Refugio no encontrado."; no se muestra el formulario |
| 4. Consultar eventos | `/refugios/:id/eventos` (lista) y "Ver detalle" → `/refugios/:id/eventos/:eventId` con nombre, fecha, tipo y estado; si el evento no existe (`/refugios/1/eventos/9999`), "Evento no encontrado." |
| 5. Evento de otro refugio | El script imprime una URL con el evento de Huellitas bajo el primer refugio → "Este evento pertenece a otro refugio."; lo mismo ocurre al editarlo o eliminarlo |
| 6. Editar evento | "Editar" en una tarjeta → el panel pasa a "Editar evento" con los datos cargados → "Guardar cambios"; el evento conserva su refugio y el botón "Cancelar" vuelve al formulario nuevo |
| 7. Borrar evento | "Eliminar" (con confirmación) en un evento próximo: desaparece de la lista; en un evento ya realizado → "No se puede eliminar un evento que ya ocurrió." y la tarjeta se queda |

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
