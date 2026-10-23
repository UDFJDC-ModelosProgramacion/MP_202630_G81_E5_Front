# MP_202630_G81_E5_Front

Front-end del sistema de adopción de mascotas, desarrollado para el curso Modelos de Programación. Es una aplicación web que consume la API RESTful del back-end (repositorio `MP_202630_G81_E5_Back`).

## Tecnologías utilizadas

| Área | Tecnología |
| --- | --- |
| Librería y empaquetador | React + Vite 8 |
| Lenguaje | JavaScript (ES6+) |
| Estilos | Bootstrap |
| Calidad de código | ESLint |
| Pruebas | Vitest + React Testing Library (cobertura con v8, reporte lcov) |
| Análisis estático | SonarQube Community + `@sonar/scan` |
| Integración continua | Jenkins (pipeline declarativo en `Jenkinsfile`) |
| Infraestructura local | Docker y Docker Compose |

## Requisitos previos

- Node.js 24 y npm 11 (o superior).
- Back-end en ejecución, por defecto en `http://localhost:8080/api`.
- Docker Desktop, solo si se quiere levantar Jenkins y SonarQube en local.

## Instalación y ejecución

1. Clonar el repositorio e instalar las dependencias:

   ```bash
   git clone https://github.com/UDFJDC-ModelosProgramacion/MP_202630_G81_E5_Front.git
   cd MP_202630_G81_E5_Front
   npm install
   ```

2. Crear el archivo de variables de entorno a partir del ejemplo:

   ```bash
   cp .env.example .env
   ```

   En PowerShell: `Copy-Item .env.example .env`.

   | Variable | Descripción | Valor por defecto |
   | --- | --- | --- |
   | `VITE_API_URL` | URL base de la API del back-end | `http://localhost:8080/api` |

3. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Vite indica en la consola la URL local (por defecto `http://localhost:5173`).

## Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run preview` | Sirve localmente la versión de producción |
| `npm run lint` | Ejecuta ESLint sobre el proyecto |
| `npm test` | Ejecuta las pruebas una vez |
| `npm run test:watch` | Ejecuta las pruebas en modo observación |
| `npm run test:coverage` | Ejecuta las pruebas y genera la cobertura en `coverage/` |
| `npm run sonar` | Envía el análisis a SonarQube (requiere la cobertura generada) |

## Estructura del proyecto

```
src/
├── assets/       Recursos estáticos
├── components/   Componentes reutilizables
├── layouts/      Estructuras de página
├── pages/        Vistas de la aplicación
├── routes/       Configuración de rutas
├── services/     Consumo de la API
└── styles/       Estilos globales
infra/            Docker Compose de Jenkins y SonarQube
Jenkinsfile       Pipeline de integración continua
```

## Pruebas

Las pruebas automatizadas usan Vitest y React Testing Library, y viven junto al código con la extensión `.test.js` o `.test.jsx`.

```bash
npm test
npm run test:coverage
```

El reporte de cobertura queda en `coverage/lcov.info` y es el que lee SonarQube.

## Calidad: Jenkins y SonarQube

La carpeta `infra/` contiene un `docker-compose.yml` que levanta ambos servidores en la red `calidad-net`.

| Servicio | URL desde el equipo | URL desde otros contenedores |
| --- | --- | --- |
| SonarQube | http://localhost:9000 | http://sonarqube:9000 |
| Jenkins | http://localhost:8081 | http://jenkins:8080 |

### Puesta en marcha

1. Levantar la infraestructura (la primera vez construye la imagen de Jenkins, que incluye Node.js y los plugins de `infra/jenkins/plugins.txt`):

   ```bash
   docker compose -f infra/docker-compose.yml up -d --build
   ```

2. **SonarQube:** entrar a http://localhost:9000 (usuario `admin`, contraseña inicial `admin`; pide cambiarla) y generar un token en *My Account > Security*.

3. **Jenkins:** entrar a http://localhost:8081. La contraseña inicial se obtiene con:

   ```bash
   docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
   ```

   Completar el asistente inicial y crear la credencial con el token de SonarQube: *Manage Jenkins > Credentials*, tipo **Secret text**, ID `sonar-token`.

4. Crear el job: *New Item > Pipeline*, y en la sección Pipeline elegir:
   - **Definition:** Pipeline script from SCM
   - **SCM:** Git, con la URL del repositorio (público, no requiere credencial)
   - **Branch Specifier:** la rama a construir (por ejemplo `*/develop`)
   - **Script Path:** `Jenkinsfile`

5. Ejecutar **Build Now**.

### Pipeline

El `Jenkinsfile` define cuatro etapas:

1. **Checkout:** obtiene el código del repositorio.
2. **Build:** `npm ci`, `npm run lint` y `npm run build`.
3. **Testing:** `npm run test:coverage`.
4. **Static Analysis:** análisis en SonarQube con `-Dsonar.qualitygate.wait=true`, por lo que el build falla si no se cumple el Quality Gate.

### Quality Gate

Se usa el Quality Gate por defecto de SonarQube (*Sonar way*) con el periodo de código nuevo por defecto. Cada funcionalidad debe incluir pruebas unitarias para mantener o mejorar la cobertura del código nuevo.

### Análisis manual (opcional)

Con SonarQube en ejecución, desde la raíz del proyecto:

```bash
npm run test:coverage
npm run sonar -- -Dsonar.host.url=http://localhost:9000 -Dsonar.token=<TOKEN>
```

## Nota sobre `npm audit` (node-forge)

`npm audit` reporta una advertencia sobre `node-forge`, dependencia transitiva de `@sonar/scan`. Al momento de configurar el proyecto no existía una versión corregida. El equipo decidió aceptar el aviso porque `@sonar/scan` se usa solo en desarrollo y en integración continua, y no forma parte de lo que se despliega. Se revisará si aparece un parche.

## Flujo de trabajo (Git Flow)

- No se sube código directamente a `main` ni a `develop`.
- Cada historia de usuario se desarrolla en una rama `feature/nombre-de-la-historia-id` creada desde `develop`.
- Todo cambio entra mediante Pull Request hacia `develop`, con la aprobación de al menos un compañero.
