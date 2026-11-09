# Carga datos de prueba para Mensajes (HU12: Enviar y gestionar mensajes) en el back.
# Crea (o reutiliza por nombre) 2 adoptantes y les agrega mensajes:
#   Laura Gomez (la primera adoptante, la que abre "Mis mensajes"): 3 mensajes.
#   Carlos Perez: 2 mensajes. Sirve para probar que el mensaje de otro adoptante se rechaza.
# Uso: .\infra\seed-mensajes.ps1   (opcional: -Base "http://localhost:8999/api")
# Puede ejecutarse despues de seed-adoptions.ps1 (reutiliza a los adoptantes) o solo.
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

# El back no acepta fechas futuras: se envia la hora actual menos un minuto.
function Get-SentDate {
  $moment = (Get-Date).ToUniversalTime().AddMinutes(-1)
  return $moment.ToString("yyyy-MM-ddTHH:mm:ss.fffZ", [Globalization.CultureInfo]::InvariantCulture)
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

$lauraName = "Laura G$([char]0x00F3)mez"
$carlosName = "Carlos P$([char]0x00E9)rez"
$laura = Resolve-Adopter @{ name = $lauraName; email = "laura.gomez@adoptaya.test"; phone = "3001234567"; address = "Calle 45 # 12-30, Bogota" }
$carlos = Resolve-Adopter @{ name = $carlosName; email = "carlos.perez@adoptaya.test"; phone = "3002345678"; address = "Carrera 7 # 80-12, Bogota" }
if (-not $laura -or -not $carlos) {
  Write-Host "No se pudieron crear los adoptantes." -ForegroundColor Red
  return
}

# 2. Verifica que no haya mensajes cargados
$loaded = @(Invoke-RestMethod -Uri "$Base/adopters/$($laura.id)/messages" | Where-Object { $_ })
if ($loaded.Count -gt 0) {
  Write-Host "Ya hay mensajes cargados. Reinicia el back para empezar de cero." -ForegroundColor Yellow
  return
}

# 3. Mensajes (el contenido es obligatorio)
$messageData = @(
  @{ adopter = $laura; content = "Hola, quisiera saber como va el proceso de adopcion de Firulais." },
  @{ adopter = $laura; content = "Puedo pasar a conocer a Luna este fin de semana?" },
  @{ adopter = $laura; content = "Gracias por la atencion, el refugio fue muy amable conmigo." },
  @{ adopter = $carlos; content = "Buenas tardes, necesito los documentos para adoptar a Michi." },
  @{ adopter = $carlos; content = "Quedo atento a la fecha de la visita al refugio." }
)
foreach ($item in $messageData) {
  Send-Api "Post" "/adopters/$($item.adopter.id)/messages" @{ content = $item.content; sentDate = (Get-SentDate) } | Out-Null
}

# 4. Resumen
foreach ($adopter in @($laura, $carlos)) {
  Invoke-RestMethod -Uri "$Base/adopters/$($adopter.id)/messages" | ForEach-Object {
    [pscustomobject]@{
      adoptante = $adopter.name
      adoptanteId = $adopter.id
      mensajeId = $_.id
      contenido = $_.content
      fecha = $_.sentDate
    }
  }
}

$foreign = @(Invoke-RestMethod -Uri "$Base/adopters/$($carlos.id)/messages")[0]
Write-Host ""
Write-Host "Mis mensajes (Laura): http://localhost:5173/mis-mensajes" -ForegroundColor Green
Write-Host "Mensaje de otro adoptante (debe rechazarse): http://localhost:5173/adoptantes/$($laura.id)/mensajes/$($foreign.id)" -ForegroundColor Green
Write-Host "Adoptante inexistente (debe decir no encontrado): http://localhost:5173/adoptantes/9999/mensajes" -ForegroundColor Green