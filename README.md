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

### HU03 — Gestionar videos del refugio

Como administrador de refugio quiero cargar videos de mi refugio para que los adoptantes reconozcan las instalaciones.

**Cómo visualizarla**

1. Levanta el back-end y carga datos de prueba (la base se borra al reiniciar el back). Primero las mascotas y los refugios, luego los videos:
   ```powershell
   .\infra\seed-data.ps1
   .\infra\seed-videos.ps1
   ```
    `seed-videos.ps1` usa los dos primeros refugios existentes (crea los que falten). Crea 3 videos en el primero (dos archivos `.mp4` y un enlace de YouTube, que se reproducen en el detalle y requieren internet) y 1 en el segundo, e imprime sus ids y las URLs de cada caso de prueba. Si PowerShell bloquea el script: `powershell -ExecutionPolicy Bypass -File .\infra\seed-videos.ps1`.
2. Ejecuta `npm run dev`, abre `http://localhost:5173/refugios`, entra al detalle de un refugio y pulsa "Videos" (también puedes ir directo a `/refugios/:id/videos`).

| Criterio de aceptación | Dónde verlo |
| --- | --- |
| 1. Crear video válido | En `/refugios/:id/videos`, panel "Cargar video": escribir una URL → "Cargar video"; aparece en "Videos publicados" y el contador sube. Elegir otro refugio en el select abre la lista de ese refugio |
| 2. URL inválida | Dejar vacía la URL al cargar o al editar → "La URL es obligatoria."; si el back la rechaza, se muestra su mensaje |
| 3. Refugio inexistente | `/refugios/9999/videos` → "Refugio no encontrado."; también al cargar un video si el refugio ya no existe |
| 4. Consultar videos | `/refugios/:id/videos` (lista) y clic en la URL de un video → `/refugios/:id/videos/:videoId`, donde se reproduce si es un archivo `.mp4`/`.webm`/`.ogg` o un enlace de YouTube; si no existe (`/refugios/:id/videos/9999`), "Video no encontrado." |
| 5. Video de otro refugio | El script imprime los ids; abrir `/refugios/<id del segundo refugio>/videos/<id de un video del primero>` → "Este video pertenece a otro refugio."; editar o eliminar desde otro refugio se rechaza con el mismo mensaje (por la UI solo se llega al detalle; esos casos se prueban por la API con `PUT` o `DELETE /api/shelters/<otro>/videos/<id>`) |
| 6. Editar video | "Editar" en la fila → el panel pasa a "Editar video" con el refugio bloqueado → "Guardar cambios"; el video conserva su refugio y una URL vacía se rechaza |
| 7. Borrar video | "Eliminar" (con confirmación); el video desaparece de la lista y baja el contador; si ya no existe, "Video no encontrado." |

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

### HU07 — Registrar y gestionar adoptante

Como adoptante quiero registrar mis datos personales (nombre, correo electrónico y teléfono) para poder participar en los procesos de adopción.

**Cómo visualizarla**

1. Levanta el back-end y carga datos de prueba (la base se borra al reiniciar el back; el script se ejecuta una sola vez por arranque):
   ```powershell
   .\infra\seed-adopters.ps1
   ```
   Crea (o reutiliza por correo) a Mariana Ruiz, Andrés Molina (sin teléfono) y Valentina Rojas, sin adopciones, y a Camilo Herrera, con una adopción de la mascota Canela, de modo que al eliminarlo el back responde 412. El correo de Mariana sirve para probar el correo repetido. Si PowerShell bloquea el script: `powershell -ExecutionPolicy Bypass -File .\infra\seed-adopters.ps1`.
2. Ejecuta `npm run dev` y abre `http://localhost:5173/adoptantes`.

| Criterio de aceptación | Dónde verlo |
| --- | --- |
| 1. Crear adoptante válido | `/adoptantes/nuevo` → nombre, correo y, si se quiere, teléfono → "Registrar"; aparece en el listado |
| 2. Datos obligatorios | Dejar vacío el nombre o el correo y enviar → mensaje de error bajo el campo; no se registra nada |
| 3. Correo repetido | Registrar con el correo de Mariana (`mariana.ruiz@adoptaya.test`) → el error aparece bajo el campo de correo, en español |
| 4. Consultar adoptante | `/adoptantes` (listado) y "Ver perfil" → `/adoptantes/:id`; si no existe (`/adoptantes/9999`), "Adoptante no encontrado." |
| 5. Editar adoptante | "Editar" → `/adoptantes/:id/editar` → "Guardar"; conservar el propio correo es válido y se conserva la dirección; un correo de otro adoptante se rechaza |
| 6. Borrar adoptante | "Eliminar" (con confirmación) en Mariana o Valentina: desaparece del listado; en Camilo (tiene una adopción) el back responde 412 y se muestra el mensaje de rechazo |

**Notas para quien revise**

- El back usa `/adopters`; las rutas del front son `/adoptantes...`.
- El back devuelve el error de correo repetido en inglés; el front lo traduce al español.
- Al editar un adoptante que tiene adopciones, el PUT del back elimina esas adopciones (probado con Camilo: antes 1, después 0, y la adopción desaparece de `/api/adoptions`). Se probó reenviar `adoptions` sin `adopter` y con `adopter: { id }`, y en ambos casos se pierden. No tiene arreglo desde el front; queda pendiente para el equipo del back. Tras esa prueba hay que reiniciar el back, porque la mascota queda no disponible.

### HU08 — Gestionar convivencia de prueba

Como administrador de refugio quiero registrar la convivencia de prueba de una adopción con fecha de inicio y fecha de fin opcional para hacer seguimiento al periodo de prueba.

**Cómo visualizarla**

1. Levanta el back-end y carga datos de prueba (la base se borra al reiniciar el back; el script se ejecuta una sola vez por arranque):
   ```powershell
   .\infra\seed-trial-cohabitation.ps1
   ```
   Crea (o reutiliza) el refugio, al veterinario Dr. Andrés Ríos, a la adoptante Laura Gómez y 4 adopciones: Firulais y Kira sin convivencia, Pelusa con fecha de inicio y de fin, y Bruno solo con fecha de inicio. Imprime los ids, las URLs y el JSON de la convivencia de Pelusa. Si PowerShell bloquea el script: `powershell -ExecutionPolicy Bypass -File .\infra\seed-trial-cohabitation.ps1`.
2. Ejecuta `npm run dev`, abre `http://localhost:5173/adopciones` y entra al detalle de una adopción: la sección "Convivencia de prueba" muestra las fechas o el botón "Registrar convivencia".

| Criterio de aceptación | Dónde verlo |
| --- | --- |
| 1. Registrar convivencia válida | Detalle de Firulais → "Registrar convivencia" (`/adopciones/:id/convivencia-prueba/nueva`): inicio y, si se quiere, fin posterior → "Registrar convivencia"; vuelve al detalle con aviso verde y las fechas |
| 2. Fecha de inicio obligatoria | Dejar vacío el inicio y enviar → "La fecha de inicio es obligatoria."; no se registra nada |
| 3. Fecha de fin inválida | Fin anterior o igual al inicio → "La fecha de fin debe ser posterior a la fecha de inicio."; lo mismo al editar |
| 4. Una sola convivencia por adopción | `/adopciones/<id de Pelusa>/convivencia-prueba/nueva` → "Esta adopción ya tiene una convivencia de prueba registrada." sin formulario; si otra persona la registra antes de enviar, el back la rechaza y se muestra el mismo mensaje |
| 5. Adopción inexistente | `/adopciones/9999/convivencia-prueba/nueva` → "Adopción no encontrada." |
| 6. Consultar convivencia | Detalle de Pelusa (fechas), de Bruno ("Sin fecha de fin") y de Firulais ("Esta adopción no tiene una convivencia de prueba registrada." con el botón para registrarla) |
| 7. Editar convivencia | "Editar convivencia" → `/adopciones/:id/convivencia-prueba/editar` → "Guardar cambios"; conserva el resultado (`outcome`); fechas inválidas se rechazan |
| 8. Borrar convivencia | "Eliminar convivencia" (con confirmación); aparece aviso verde y vuelve el botón "Registrar convivencia"; si ya no existe, "Esta adopción no tiene una convivencia de prueba registrada." |

### HU09 — Gestionar notificaciones del refugio

Como administrador de refugio quiero enviar notificaciones por un canal válido (EMAIL, SMS o PUSH) con un mensaje para mantener informados a los usuarios.

**Cómo visualizarla**

1. Levanta el back-end y carga datos de prueba (la base se borra al reiniciar el back; el script se ejecuta una sola vez por arranque):
   ```powershell
   .\infra\seed-notifications.ps1
   ```
   Reutiliza los refugios existentes, crea notificaciones de prueba e imprime las URLs de los criterios 4 y 6. Si PowerShell bloquea el script: `powershell -ExecutionPolicy Bypass -File .\infra\seed-notifications.ps1`.
2. Ejecuta `npm run dev`, abre el detalle de un refugio (`/refugios/:id`) y entra por el botón "Notificaciones", o directamente a `/refugios/:id/notificaciones`.

| Criterio de aceptación | Dónde verlo |
| --- | --- |
| 1. Crear notificación válida | `/refugios/:id/notificaciones` → en el formulario elegir "Canal" (EMAIL, SMS o PUSH) y escribir el "Mensaje" → "Enviar notificación"; aparece en la lista del refugio |
| 2. Canal inválido | Enviar el formulario sin un canal válido → mensaje de error bajo el campo "Canal"; no se registra nada |
| 3. Mensaje obligatorio | Dejar "Mensaje" vacío o solo con espacios y enviar → mensaje de error bajo el campo; no se registra nada |
| 4. Refugio inexistente | `/refugios/9999/notificaciones` (consultar) o intentar crear en un refugio inexistente → "Refugio no encontrado." |
| 5. Consultar notificaciones | La lista muestra todas las del refugio; "Ver detalle" (junto al badge de cada tarjeta) → `/refugios/:id/notificaciones/:notificationId`; si no existe, mensaje de notificación no encontrada |
| 6. Notificación de otro refugio | Abrir, editar o borrar una notificación con el id de otro refugio (el seed imprime la URL) → "La notificación pertenece a otro refugio." |
| 7. Editar notificación | "Editar" en una notificación → cambiar canal o mensaje con valores válidos → "Guardar cambios"; se conserva la fecha; con valores inválidos se rechaza el cambio |
| 8. Borrar notificación | "Eliminar" en una notificación propia → desaparece de la lista del refugio |

**Notas para quien revise**

- El back usa `/shelters/{shelterId}/notifications`; las rutas del front son `/refugios/:id/notificaciones`. Campos: `id`, `message`, `date`, `channel`, `shelter`.
- El back no asigna `date` y el PUT la borra: el front la envía al crear (hoy a las 12:00 UTC) y la conserva al editar.
- El back acepta mensajes con solo espacios; el front los rechaza. El back valida el mensaje antes que el canal.
- Con un refugio inexistente el back responde 404 al listar o consultar, pero 412 ("Shelter is not valid") al crear; el front muestra "Refugio no encontrado." en ambos casos.
- Una notificación de otro refugio da 412 con "not associated to the shelter"; el front la traduce.
- El back responde en inglés y el front traduce los mensajes conocidos.
- "Ver detalle" es un enlace discreto junto al badge porque el mockup no lo incluye. El detalle aún no muestra la fecha (falta revisar `utils/eventDates.js` para formatearla bien).

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
