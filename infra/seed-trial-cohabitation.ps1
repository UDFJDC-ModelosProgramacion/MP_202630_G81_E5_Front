# Carga datos de prueba para Convivencia de prueba (HU08) en el back.
# Crea (o reutiliza) el refugio, al veterinario Dr. Andrés Ríos, a la adoptante Laura Gómez y 4 adopciones:
#   Firulais y Kira: sin convivencia (para registrarla).
#   Pelusa: con fecha de inicio y de fin.
#   Bruno: solo con fecha de inicio.
# Imprime los ids, las URLs del front y el JSON crudo de la convivencia de Pelusa.
# Uso: .\infra\seed-trial-cohabitation.ps1   (opcional: -Base "http://localhost:8080/api")
# Nota: en Windows PowerShell 5.1 Invoke-RestMethod entrega las listas JSON como un solo objeto;
# por eso cada consulta va entre parentesis antes de filtrarla con Where-Object.
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
  $null = Invoke-RestMethod -Uri "$Base/adoptions" -ErrorAction Stop
} catch {
  Write-Host "No se pudo conectar con el back en $Base. Esta en ejecucion?" -ForegroundColor Red
  return
}

# 1. Refugio, veterinario y adoptante (se reutilizan si ya existen)
$shelter = (Invoke-RestMethod -Uri "$Base/shelters") |
  Where-Object { $_.name -eq "Refugio Adopciones" } | Select-Object -First 1
if (-not $shelter) {
  $shelter = Send-Api "Post" "/shelters" @{ name = "Refugio Adopciones"; city = "Bogota" }
}

$vetEmail = "andres.rios@adoptaya.test"
$vet = (Invoke-RestMethod -Uri "$Base/veterinarians") |
  Where-Object { $_.email -eq $vetEmail } | Select-Object -First 1
if (-not $vet) {
  $vet = Send-Api "Post" "/veterinarians" @{ name = "Dr. Andrés Ríos"; email = $vetEmail; phone = "3101112233"; specialty = "Medicina general"; availability = "Lunes a viernes" }
}

$adopterEmail = "laura.gomez@adoptaya.test"
$adopter = (Invoke-RestMethod -Uri "$Base/adopters") |
  Where-Object { $_.email -eq $adopterEmail } | Select-Object -First 1
if (-not $adopter) {
  $adopter = Send-Api "Post" "/adopters" @{ name = "Laura Gómez"; email = $adopterEmail; phone = "3001234567"; address = "Calle 45 # 12-30, Bogota" }
}

if (-not ($shelter -and $vet -and $adopter)) {
  Write-Host "Falta refugio, veterinario o adoptante. No se puede continuar." -ForegroundColor Red
  return
}
# 2. Adopciones (reutiliza la adopcion de la mascota si ya existe)
function Resolve-Adoption($petData, $date) {
  $found = (Invoke-RestMethod -Uri "$Base/adoptions") |
    Where-Object { $_.pet.name -eq $petData.name } | Select-Object -First 1
  if ($found) { return $found }

  $pet = (Invoke-RestMethod -Uri "$Base/pets") |
    Where-Object { $_.name -eq $petData.name } | Select-Object -First 1
  if (-not $pet) {
    $petData.available = $true
    $petData.shelter = @{ id = $shelter.id }
    $pet = Send-Api "Post" "/pets" $petData
  }
  if (-not $pet) { return $null }

  Send-Api "Post" "/adoptions" @{
    date = "${date}T12:00:00.000Z"
    pet = @{ id = $pet.id }
    adopter = @{ id = $adopter.id }
    responsibleVeterinarian = @{ id = $vet.id }
  }
}

$items = @(
  @{ pet = @{ name = "Firulais"; species = "Perro"; breed = "Criollo"; age = 3 }; date = "2026-09-20"; start = $null; end = $null },
  @{ pet = @{ name = "Kira"; species = "Perro"; breed = "Husky"; age = 4 }; date = "2026-09-25"; start = $null; end = $null },
  @{ pet = @{ name = "Pelusa"; species = "Gato"; breed = "Persa"; age = 2 }; date = "2026-10-01"; start = "2026-10-05"; end = "2026-11-05" },
  @{ pet = @{ name = "Bruno"; species = "Perro"; breed = "Golden Retriever"; age = 6 }; date = "2026-10-08"; start = "2026-10-12"; end = $null }
)

$ids = @{}
foreach ($item in $items) {
  $name = $item.pet.name
  $adoption = Resolve-Adoption $item.pet $item.date
  if (-not $adoption) {
    Write-Host "No se pudo crear la adopcion de $name." -ForegroundColor Red
    continue
  }
  $ids[$name] = $adoption.id

  # 3. Convivencia (solo si corresponde y la adopcion aun no tiene una)
  $detail = Invoke-RestMethod -Uri "$Base/adoptions/$($adoption.id)"
  if ($detail.trialCohabitation) {
    if (-not $item.start) {
      Write-Host "$name ya tiene una convivencia (de pruebas anteriores); reinicia el back para empezar de cero." -ForegroundColor Yellow
    }
    continue
  }
  if ($item.start) {
    $body = @{ startDate = "$($item.start)T12:00:00.000Z" }
    if ($item.end) { $body.endDate = "$($item.end)T12:00:00.000Z" }
    $null = Send-Api "Post" "/adoptions/$($adoption.id)/trialCohabitation" $body
  }
}

# 4. Resumen
Write-Host ""
Write-Host "Adopciones de prueba:" -ForegroundColor Cyan
foreach ($name in "Firulais", "Kira", "Pelusa", "Bruno") {
  if ($ids[$name]) {
    Write-Host ("  {0,-9} id {1,-4} http://localhost:5173/adopciones/{1}" -f $name, $ids[$name])
  }
}
if ($ids["Pelusa"]) {
  Write-Host ""
  Write-Host "JSON crudo de la convivencia de Pelusa (verifica la hora de las fechas):" -ForegroundColor Cyan
  (Invoke-WebRequest -UseBasicParsing -Uri "$Base/adoptions/$($ids['Pelusa'])/trialCohabitation").Content
}