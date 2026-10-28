# Carga datos de prueba para Reseñas (HU04: Calificar el proceso de adopción) en el back.
# Crea (o reutiliza por nombre) 2 adoptantes y les agrega reseñas:
#   Laura Gómez (la primera adoptante, la que abre "Mis reseñas"): 3 reseñas con calificaciones 5, 4 y 4.
#   Carlos Pérez: 2 reseñas, una de ellas sin comentario. Sirve para probar que Laura no puede ver, editar ni eliminar reseñas ajenas.
# Uso: .\infra\seed-reviews.ps1   (opcional: -Base "http://localhost:8080/api")
# Puede ejecutarse después de seed-adoptions.ps1 (reutiliza a los adoptantes) o solo.
# La base H2 se borra al reiniciar el back: ejecuta este script una sola vez por arranque.
param([string]$Base = "http://localhost:8080/api")

function Send-Api($method, $path, $body) {
  $json = $body | ConvertTo-Json -Depth 5
  try {
    Invoke-RestMethod -Method $method -Uri "$Base$path" `
      -ContentType "application/json; charset=utf-8" `
      -Body ([Text.Encoding]::UTF8.GetBytes($json)) -ErrorAction Stop
  } catch {
    if ($_.Exception.Response) {
      $reader = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())
      Write-Host $reader.ReadToEnd() -ForegroundColor Red
    } else {
      Write-Host $_.Exception.Message -ForegroundColor Red
    }
  }
}

# 0. Verifica que el back responde
try {
  $existingAdopters = @(Invoke-RestMethod -Uri "$Base/adopters" -ErrorAction Stop | Where-Object { $_ })
} catch {
  Write-Host "No se pudo conectar con el back en $Base. Esta en ejecucion?" -ForegroundColor Red
  return
}

# 1. Adoptantes (reutiliza los que ya existan con el mismo nombre)
function Resolve-Adopter($data) {
  $found = $existingAdopters | Where-Object { $_.name -eq $data.name } | Select-Object -First 1
  if ($found) { return $found }
  Send-Api "Post" "/adopters" $data
}

$laura = Resolve-Adopter @{ name = "Laura Gómez"; email = "laura.gomez@adoptaya.test"; phone = "3001234567"; address = "Calle 45 # 12-30, Bogota" }
$carlos = Resolve-Adopter @{ name = "Carlos Pérez"; email = "carlos.perez@adoptaya.test"; phone = "3002345678"; address = "Carrera 7 # 80-12, Bogota" }
if (-not $laura -or -not $carlos) {
  Write-Host "No se pudieron crear los adoptantes." -ForegroundColor Red
  return
}

# 2. Verifica que no haya reseñas cargadas
$loaded = @(Invoke-RestMethod -Uri "$Base/adopters/$($laura.id)/reviews" | Where-Object { $_ })
if ($loaded.Count -gt 0) {
  Write-Host "Ya hay reseñas cargadas. Reinicia el back para empezar de cero." -ForegroundColor Yellow
  return
}

# 3. Reseñas (la calificación va de 1 a 5; el comentario es opcional)
$reviewData = @(
  @{ adopter = $laura; rating = 5; comment = "Todo el proceso fue muy claro y el equipo del refugio siempre estuvo atento." },
  @{ adopter = $laura; rating = 4; comment = "Buen acompañamiento después de la adopción, aunque la visita tardó un poco." },
  @{ adopter = $laura; rating = 4; comment = "Mi mascota llegó sana y con sus vacunas al día." },
  @{ adopter = $carlos; rating = 3; comment = "El trámite fue correcto, pero faltó información sobre el cuidado inicial." },
  @{ adopter = $carlos; rating = 5; comment = $null }
)
foreach ($item in $reviewData) {
  Send-Api "Post" "/adopters/$($item.adopter.id)/reviews" @{ rating = $item.rating; comment = $item.comment } | Out-Null
}

# 4. Resumen
foreach ($adopter in @($laura, $carlos)) {
  Invoke-RestMethod -Uri "$Base/adopters/$($adopter.id)/reviews" | ForEach-Object {
    [pscustomobject]@{
      adoptante = $adopter.name
      adoptanteId = $adopter.id
      resenaId = $_.id
      calificacion = $_.rating
      comentario = $_.comment
    }
  }
}

$foreign = @(Invoke-RestMethod -Uri "$Base/adopters/$($carlos.id)/reviews")[0]
Write-Host ""
Write-Host "Mis reseñas (Laura): http://localhost:5173/mis-resenas" -ForegroundColor Green
Write-Host "Reseña de otro adoptante (debe rechazarse): http://localhost:5173/adoptantes/$($laura.id)/resenas/$($foreign.id)" -ForegroundColor Green
Write-Host "Adoptante inexistente (debe decir no encontrado): http://localhost:5173/adoptantes/9999/resenas" -ForegroundColor Green
