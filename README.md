# AdoptaYa — Front-end

Interfaz web del sistema de adopción de mascotas (curso Modelos de Programación, equipo G81-E5). Consume la API REST del back-end (`MP_202630_G81_E5_Back`).

## Link Video Youtube
https://youtu.be/g9VOqNI6fNc

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
1. Ejecuta `npm run dev` y abre `http://localhost:5173/mascotas`.

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
1. Ejecuta `npm run dev`, abre `http://localhost:5173/mascotas`.

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
1. Ejecuta `npm run dev`, abre `http://localhost:5173/refugios`, entra al detalle de un refugio y pulsa "Videos" (también puedes ir directo a `/refugios/:id/videos`).

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
1. Ejecuta `npm run dev` y abre `http://localhost:5173/mis-resenas`. Como no hay inicio de sesión, "Mis reseñas" abre las reseñas del primer adoptante registrado.

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
1. Ejecuta `npm run dev` y abre `http://localhost:5173/adopciones`.

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
1. Ejecuta `npm run dev`, abre el detalle de una adopción (`/adopciones/:id`) y pulsa **Devolución**.

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
1. Ejecuta `npm run dev` y abre `http://localhost:5173/adoptantes`.

| Criterio de aceptación | Dónde verlo |
| --- | --- |
| 1. Crear adoptante válido | `/adoptantes/nuevo` → nombre, correo y, si se quiere, teléfono → "Registrar"; aparece en el listado |
| 2. Datos obligatorios | Dejar vacío el nombre o el correo y enviar → mensaje de error bajo el campo; no se registra nada |
| 3. Correo repetido | Registrar con el correo de Mariana (`mariana.ruiz@adoptaya.test`) → el error aparece bajo el campo de correo, en español |
| 4. Consultar adoptante | `/adoptantes` (listado) y "Ver perfil" → `/adoptantes/:id`; si no existe (`/adoptantes/9999`), "Adoptante no encontrado." |
| 5. Editar adoptante | "Editar" → `/adoptantes/:id/editar` → "Guardar"; conservar el propio correo es válido y se conserva la dirección; un correo de otro adoptante se rechaza |
| 6. Borrar adoptante | "Eliminar" (con confirmación) en Mariana o Valentina: desaparece del listado; en Camilo (tiene una adopción) el back responde 412 y se muestra el mensaje de rechazo |

### HU08 — Gestionar convivencia de prueba

Como administrador de refugio quiero registrar la convivencia de prueba de una adopción con fecha de inicio y fecha de fin opcional para hacer seguimiento al periodo de prueba.

**Cómo visualizarla**
1. Ejecuta `npm run dev`, abre `http://localhost:5173/adopciones` y entra al detalle de una adopción: la sección "Convivencia de prueba" muestra las fechas o el botón "Registrar convivencia".

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
1. Ejecuta `npm run dev`, abre el detalle de un refugio (`/refugios/:id`) y entra por el botón "Notificaciones", o directamente a `/refugios/:id/notificaciones`.

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

### HU10 — Gestionar refugios

Como administrador quiero registrar y gestionar refugios con nombre y ciudad para mantener actualizado el listado de refugios aliados.

**Cómo visualizarla**
1. Ejecuta `npm run dev` y abre `http://localhost:5173/refugios`.

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
1. Ejecuta `npm run dev`, abre `http://localhost:5173/refugios`, pulsa "Ver detalle" en un refugio y luego "Eventos" (o abre directamente `/refugios/:id/eventos`).

| Criterio de aceptación | Dónde verlo |
| --- | --- |
| 1. Crear evento válido | En `/refugios/:id/eventos`, panel "Nuevo evento": escribir nombre y fecha (el tipo es opcional) → "Programar evento"; aparece una tarjeta con la insignia "Próximo" (o "Realizado" si la fecha ya pasó) y el aviso "Evento programado correctamente." |
| 2. Datos obligatorios | "Programar evento" con el formulario vacío → "El nombre es obligatorio." y "La fecha es obligatoria."; lo mismo al guardar un evento editado sin nombre o sin fecha |
| 3. Refugio inexistente | `/refugios/9999/eventos` → "Refugio no encontrado."; no se muestra el formulario |
| 4. Consultar eventos | `/refugios/:id/eventos` (lista) y "Ver detalle" → `/refugios/:id/eventos/:eventId` con nombre, fecha, tipo y estado; si el evento no existe (`/refugios/1/eventos/9999`), "Evento no encontrado." |
| 5. Evento de otro refugio | El script imprime una URL con el evento de Huellitas bajo el primer refugio → "Este evento pertenece a otro refugio."; lo mismo ocurre al editarlo o eliminarlo |
| 6. Editar evento | "Editar" en una tarjeta → el panel pasa a "Editar evento" con los datos cargados → "Guardar cambios"; el evento conserva su refugio y el botón "Cancelar" vuelve al formulario nuevo |
| 7. Borrar evento | "Eliminar" (con confirmación) en un evento próximo: desaparece de la lista; en un evento ya realizado → "No se puede eliminar un evento que ya ocurrió." y la tarjeta se queda |

### HU12 — Enviar y gestionar mensajes

Como adoptante quiero enviar y gestionar mis mensajes para comunicarme con el refugio durante el proceso de adopción.

**Cómo visualizarla**
1. Ejecuta `npm run dev` y abre `http://localhost:5173/mis-mensajes` (el enlace "Mis mensajes" del menú); te lleva a los mensajes del primer adoptante registrado.

| Criterio de aceptación | Dónde verlo |
| --- | --- |
| 1. Enviar mensaje con contenido | En `/mis-mensajes`, panel "Nuevo mensaje": escribir el contenido → "Enviar mensaje"; aparece una tarjeta con la insignia "Enviado", la fecha de hoy y el aviso "Mensaje enviado correctamente." |
| 2. Contenido obligatorio | "Enviar mensaje" con el formulario vacío → "El mensaje es obligatorio." |
| 3. Adoptante inexistente | `/adoptantes/9999/mensajes` → "Adoptante no encontrado."; no se muestra el formulario |
| 4. Consultar mensajes | `/adoptantes/:adopterId/mensajes` (lista) y "Ver detalle" → `/adoptantes/:adopterId/mensajes/:messageId` con fecha, estado y mensaje; si el mensaje no existe (`/adoptantes/1/mensajes/9999`), "Mensaje no encontrado." |
| 5. Mensaje de otro adoptante | El script imprime una URL con un mensaje de Carlos bajo Laura → "Este mensaje pertenece a otro adoptante." |
| 6. Mensaje ya enviado no se edita | "Editar" en una tarjeta → el panel pasa a "Editar mensaje" con el contenido cargado → "Guardar cambios" → aviso rojo "No se puede editar un mensaje que ya fue enviado."; el contenido se conserva y "Cancelar" vuelve al formulario nuevo |
| 7. Borrar mensaje propio | "Eliminar" (con confirmación) en una tarjeta: desaparece de la lista y aparece "Mensaje eliminado correctamente." |

### HU13 — Gestionar veterinarios

Como administrador de refugio quiero registrar y administrar veterinarios con nombre, correo y especialidad válidos para asignarlos a adopciones y eventos de vida de las mascotas.

**Cómo visualizarla**
1. Ejecuta `npm run dev` y pulsa "Veterinarios" en el menú principal (o abre `http://localhost:5173/veterinarios`).

| Criterio de aceptación | Dónde verlo |
| --- | --- |
| 1. Crear veterinario válido | `/veterinarios/nuevo` → nombre, correo y especialidad (refugio, teléfono y disponibilidad son opcionales) → "Registrar veterinario"; aviso verde y aparece en el listado |
| 2. Datos obligatorios | Enviar el formulario vacío → "El nombre es obligatorio.", "El correo es obligatorio." y "La especialidad es obligatoria."; lo mismo al guardar un veterinario editado con alguno de esos campos vacío |
| 3. Refugio inexistente | El selector solo ofrece refugios existentes; si el refugio se elimina antes de enviar, el back rechaza la operación y su mensaje se muestra en el banner rojo del formulario (cubierto por pruebas) |
| 4. Consultar veterinarios | `/veterinarios` (listado con especialidad, refugio y disponibilidad) y clic en el nombre → `/veterinarios/:id` con sus datos y eventos de vida; si no existe (`/veterinarios/9999`), "Veterinario no encontrado." |
| 5. Editar veterinario | "Editar" → `/veterinarios/:id/editar` → "Guardar cambios"; el refugio queda bloqueado y se conserva; datos obligatorios vacíos se rechazan; si no existe (`/veterinarios/9999/editar`), "Veterinario no encontrado." |
| 6. Borrar veterinario | "Eliminar" (con confirmación) en un veterinario sin asociaciones: desaparece del listado; si tiene eventos de vida o adopciones → "No se puede eliminar a X: tiene eventos de vida asociados." (o "adopciones asociadas"); si ya no existe → "Veterinario no encontrado." |

### HU14 — Gestionar carnet de vacunación

Como administrador de refugio quiero registrar el carnet de vacunación de una mascota con las vacunas aplicadas para llevar el control de su salud y de su próxima vacuna.

**Cómo visualizarla**
1. Ejecuta `npm run dev`, abre `http://localhost:5173/mascotas`, entra al detalle de una mascota y pulsa "Carnet de vacunación" (o abre directamente `/mascotas/:id/carnet`).

| Criterio de aceptación | Dónde verlo |
| --- | --- |
| 1. Crear carnet válido | En una mascota sin carnet, `/mascotas/:id/carnet` → "Registrar carnet" (`/mascotas/:id/carnet/nuevo`) → escribir las vacunas separadas por comas (la próxima fecha es opcional) → "Guardar carnet"; aviso verde y se muestra el carnet |
| 2. Datos obligatorios | "Guardar carnet" o "Guardar cambios" con las vacunas vacías (o solo espacios y comas) → "Indica al menos una vacuna aplicada." |
| 3. Mascota inexistente | `/mascotas/9999/carnet`, `/mascotas/9999/carnet/nuevo` y `/mascotas/9999/carnet/editar` → "Mascota no encontrada."; no se muestra el formulario. El rechazo al eliminar si la mascota desaparece a mitad de camino está cubierto por pruebas |
| 4. Un carnet por mascota | En una mascota que ya tiene carnet, abrir `/mascotas/:id/carnet/nuevo` y guardar → "Esta mascota ya tiene un carnet de vacunación." |
| 5. Consultar carnet | `/mascotas/:id/carnet` muestra las vacunas como etiquetas, la próxima vacunación y la mascota; si la mascota no tiene carnet → "Carnet de vacunación no encontrado." con el botón "Registrar carnet" |
| 6. Editar carnet | "Editar carnet" → `/mascotas/:id/carnet/editar` → "Guardar cambios"; la mascota queda bloqueada y se conserva; las vacunas vacías se rechazan; si no hay carnet → "Carnet de vacunación no encontrado." |
| 7. Borrar carnet | "Eliminar carnet" (con confirmación) → "Carnet eliminado correctamente." y se ofrece "Registrar carnet"; si el carnet ya no existe → "Carnet de vacunación no encontrado." |


### HU15 — Gestionar eventos de vida

Como administrador de refugio quiero registrar eventos de vida de una mascota con tipo y fecha válidos, y opcionalmente el veterinario que los atendió, para mantener su historial.

**Cómo visualizarla**
1. Ejecuta `npm run dev`, abre `http://localhost:5173/mascotas`, entra al detalle de una mascota y pulsa "Eventos de vida" (o abre directamente `/mascotas/:id/eventos-de-vida`).

| Criterio de aceptación | Dónde verlo |
| --- | --- |
| 1. Crear evento válido | `/mascotas/:id/eventos-de-vida` → "+ Registrar evento" (`/mascotas/:id/eventos-de-vida/nuevo`) → tipo y fecha (descripción y veterinario son opcionales) → "Registrar evento"; aviso verde y el evento aparece en la lista |
| 2. Datos obligatorios | Registrar o guardar un evento sin tipo o sin fecha → "El tipo es obligatorio." y "La fecha es obligatoria." |
| 3. Mascota o veterinario inexistente | `/mascotas/9999/eventos-de-vida` (y sus rutas `nuevo`, `:eventId` y `:eventId/editar`) → "Mascota no encontrada."; si el veterinario desaparece antes de guardar, el banner muestra "Veterinario no encontrado." (cubierto por pruebas) |
| 4. Consultar eventos | La lista muestra fecha, tipo, descripción y veterinario, ordenados del más reciente al más antiguo; clic en la fecha → `/mascotas/:id/eventos-de-vida/:eventId`; si el evento no existe (`.../9999`) → "Evento de vida no encontrado." |
| 5. Evento de otra mascota | Abrir la URL "Evento de otra mascota" que imprime el script (y su `/editar`) → "Este evento no pertenece a la mascota."; guardar o eliminar desde otra mascota está cubierto por pruebas |
| 6. Editar evento | "Editar" → `/mascotas/:id/eventos-de-vida/:eventId/editar` → "Guardar cambios"; la mascota queda bloqueada y se conserva; el veterinario se puede cambiar o quitar; tipo o fecha vacíos se rechazan |
| 7. Borrar evento | "Eliminar" (con confirmación) → "Evento eliminado correctamente." y desaparece de la lista; si ya no existe → "Evento de vida no encontrado." |
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
