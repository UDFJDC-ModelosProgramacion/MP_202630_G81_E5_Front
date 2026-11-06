# Carga datos de prueba para Eventos del refugio (HU11) en el back.
# Reutiliza (o crea) "Refugio Adopciones" y crea un segundo refugio "Refugio Huellitas".
# Eventos del primer refugio (solo si todavia no tiene eventos):
#   Jornada de adopcion (futuro, tipo Jornada), Feria pasada (pasado, sin tipo), Vacunacion masiva (futuro, tipo Vacunacion).
# Evento del segundo refugio: sirve para probar que un evento de otro refugio se rechaza.
# Uso: .\infra\seed-eventos.ps1   (opcional: -Base "http://localhost:8080/api")
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

function Get-EventDate($daysFromToday) {
  $day = (Get-Date).AddDays($daysFromToday).ToString("yyyy-MM-dd", [Globalization.CultureInfo]::InvariantCulture)
  return "$($day)T12:00:00.000Z"
}

# 0. Verifica que el back responde
try {
  $existingShelters = @(Invoke-RestMethod -Uri "$Base/shelters" -ErrorAction Stop | Where-Object { $_ })
} catch {
  Write-Host "No se pudo conectar con el back en $Base. Esta en ejecucion?" -ForegroundColor Red
  return
}

# 1. Refugios (reutiliza los que ya existan con el mismo nombre)
function Resolve-Shelter($data) {
  $found = $existingShelters | Where-Object { $_.name -eq $data.name } | Select-Object -First 1
  if ($found) { return $found }
  Send-Api "Post" "/shelters" $data
}

$first = Resolve-Shelter @{ name = "Refugio Adopciones"; city = "Bogota" }
$second = Resolve-Shelter @{ name = "Refugio Huellitas"; city = "Medellin" }
if (-not $first -or -not $second) {
  Write-Host "No se pudieron crear los refugios." -ForegroundColor Red
  return
}

# 2. Eventos (solo si el refugio todavia no tiene eventos)
function Add-Events($shelter, $events) {
  $loaded = @(Invoke-RestMethod -Uri "$Base/shelters/$($shelter.id)/shelterEvents" | Where-Object { $_ })
  if ($loaded.Count -gt 0) {
    Write-Host "$($shelter.name) ya tiene eventos. Reinicia el back para empezar de cero." -ForegroundColor Yellow
    return
  }
  foreach ($item in $events) {
    Send-Api "Post" "/shelters/$($shelter.id)/shelterEvents" $item | Out-Null
  }
}

Add-Events $first @(
  @{ title = "Jornada de adopcion"; date = (Get-EventDate 30); type = "Jornada" },
  @{ title = "Feria pasada"; date = (Get-EventDate -30); type = $null },
  @{ title = "Vacunacion masiva"; date = (Get-EventDate 45); type = "Vacunacion" }
)
Add-Events $second @(
  @{ title = "Feria de Huellitas"; date = (Get-EventDate 20); type = "Feria" }
)

# 3. Resumen
foreach ($shelter in @($first, $second)) {
  $shelterEvents = @(Invoke-RestMethod -Uri "$Base/shelters/$($shelter.id)/shelterEvents" | Where-Object { $_ })
  foreach ($shelterEvent in $shelterEvents) {
    [pscustomobject]@{
      refugio = $shelter.name
      refugioId = $shelter.id
      eventoId = $shelterEvent.id
      titulo = $shelterEvent.title
      fecha = $shelterEvent.date
      tipo = $shelterEvent.type
    }
  }
}

$foreign = @(Invoke-RestMethod -Uri "$Base/shelters/$($second.id)/shelterEvents")[0]
Write-Host ""
Write-Host "Eventos del primer refugio: http://localhost:5173/refugios/$($first.id)/eventos" -ForegroundColor Green
Write-Host "Evento de otro refugio (debe rechazarse): http://localhost:5173/refugios/$($first.id)/eventos/$($foreign.id)" -ForegroundColor Green
Write-Host "Refugio inexistente (debe decir no encontrado): http://localhost:5173/refugios/9999/eventos" -ForegroundColor Green