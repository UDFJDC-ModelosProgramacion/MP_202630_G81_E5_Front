# Carga datos de prueba para Adoptantes (HU07: Registrar y gestionar adoptante) en el back.
# Crea (o reutiliza por correo) 4 adoptantes:
#   Mariana Ruiz, Andrés Molina (sin teléfono) y Valentina Rojas: no tienen adopciones, mensajes ni reseñas,
#   así que se pueden editar y eliminar sin problema. Con el correo de Mariana se prueba el "correo repetido".
#   Camilo Herrera: tiene una adopción (la mascota Canela), así que al eliminarlo el back responde 412.
# Uso: .\infra\seed-adopters.ps1   (opcional: -Base "http://localhost:8080/api")
# Nota: en Windows PowerShell 5.1 Invoke-RestMethod entrega las listas JSON como un solo objeto;
# por eso cada consulta va entre parentesis antes de filtrarla con Where-Object.
# Puede ejecutarse solo o después de otros scripts (reutiliza refugio, veterinaria y adoptantes que ya existan).
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
  $existingAdopters = @((Invoke-RestMethod -Uri "$Base/adopters" -ErrorAction Stop) | Where-Object { $_ })
} catch {
  Write-Host "No se pudo conectar con el back en $Base. Esta en ejecucion?" -ForegroundColor Red
  return
}

# 1. Adoptantes (reutiliza el que ya exista con el mismo correo)
function Resolve-Adopter($data) {
  $found = $existingAdopters | Where-Object { $_.email -eq $data.email } | Select-Object -First 1
  if ($found) { return $found }
  Send-Api "Post" "/adopters" $data
}

$null = Resolve-Adopter @{ name = "Mariana Ruiz"; email = "mariana.ruiz@adoptaya.test"; phone = "3011112233"; address = "Calle 72 # 10-34, Bogota" }
$null = Resolve-Adopter @{ name = "Andrés Molina"; email = "andres.molina@adoptaya.test"; address = "Carrera 30 # 45-10, Bogota" }
$null = Resolve-Adopter @{ name = "Valentina Rojas"; email = "valentina.rojas@adoptaya.test"; phone = "3023334455"; address = "Avenida 19 # 114-65, Bogota" }
$camilo = Resolve-Adopter @{ name = "Camilo Herrera"; email = "camilo.herrera@adoptaya.test"; phone = "3045556677"; address = "Calle 134 # 7-83, Bogota" }
if (-not $camilo) {
  Write-Host "No se pudo crear a Camilo Herrera." -ForegroundColor Red
  return
}

# 2. Adopción de Camilo (refugio, veterinaria y mascota se reutilizan o se crean)
$camiloDetail = Invoke-RestMethod -Uri "$Base/adopters/$($camilo.id)"
if (@($camiloDetail.adoptions | Where-Object { $_ }).Count -gt 0) {
  Write-Host "Camilo Herrera ya tiene una adopcion cargada." -ForegroundColor Yellow
} else {
  $shelter = (Invoke-RestMethod -Uri "$Base/shelters") |
    Where-Object { $_.name -eq "Refugio Adopciones" } |
    Select-Object -First 1
  if (-not $shelter) {
    $shelter = Send-Api "Post" "/shelters" @{ name = "Refugio Adopciones"; city = "Bogota" }
  }

  $vetEmail = "marta.silva@adoptaya.test"
  $vet = (Invoke-RestMethod -Uri "$Base/veterinarians") |
    Where-Object { $_.email -eq $vetEmail } |
    Select-Object -First 1
  if (-not $vet) {
    $vet = Send-Api "Post" "/veterinarians" @{ name = "Dra. Marta Silva"; email = $vetEmail; phone = "3104445566"; specialty = "Cirugia"; availability = "Martes y jueves" }
  }

  $pet = (Invoke-RestMethod -Uri "$Base/pets") |
    Where-Object { $_.name -eq "Canela" } |
    Select-Object -First 1
  if (-not $pet) {
    $pet = Send-Api "Post" "/pets" @{ name = "Canela"; species = "Perro"; breed = "Criollo"; age = 2; available = $true; shelter = @{ id = $shelter.id } }
  }

  if ($shelter -and $vet -and $pet) {
    $adoption = Send-Api "Post" "/adoptions" @{
      date = "2026-10-20T12:00:00.000Z"
      pet = @{ id = $pet.id }
      adopter = @{ id = $camilo.id }
      responsibleVeterinarian = @{ id = $vet.id }
    }
    if (-not $adoption) { Write-Host "No se pudo crear la adopcion de Camilo." -ForegroundColor Red }
  } else {
    Write-Host "No se pudo crear la adopcion de Camilo (falta refugio, veterinaria o mascota)." -ForegroundColor Red
  }
}

# 3. Resumen
(Invoke-RestMethod -Uri "$Base/adopters") | ForEach-Object {
  [pscustomobject]@{
    id = $_.id
    nombre = $_.name
    correo = $_.email
    telefono = $_.phone
    adopciones = @($_.adoptions | Where-Object { $_ }).Count
  }
}
