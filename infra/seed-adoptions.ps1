# Carga datos de prueba para Adopciones (HU05) en el back.
# Crea: 1 refugio, 2 veterinarios, 5 adoptantes, 7 mascotas y 5 adopciones
# (En curso, Aprobada y Devuelta). Toby y Mia quedan disponibles para probar el formulario.
# Uso: .\infra\seed-adoptions.ps1   (opcional: -Base "http://localhost:8080/api")
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

# 0. Verifica que el back responde y que no hay adopciones cargadas
try {
  $existing = @(Invoke-RestMethod -Uri "$Base/adoptions" -ErrorAction Stop | Where-Object { $_ })
} catch {
  Write-Host "No se pudo conectar con el back en $Base. Esta en ejecucion?" -ForegroundColor Red
  return
}
if ($existing.Count -gt 0) {
  Write-Host "Ya hay adopciones cargadas. Reinicia el back para empezar de cero." -ForegroundColor Yellow
  return
}

# 1. Refugio (reutiliza el existente si ya esta creado)
$shelter = Invoke-RestMethod -Uri "$Base/shelters" |
  Where-Object { $_.name -eq "Refugio Adopciones" } |
  Select-Object -First 1

if (-not $shelter) {
  $shelter = Send-Api "Post" "/shelters" @{ name = "Refugio Adopciones"; city = "Bogota" }
}

# 2. Veterinarios
$vetData = @(
  @{ name = "Dr. Andrés Ríos"; email = "andres.rios@adoptaya.test"; phone = "3101112233"; specialty = "Medicina general"; availability = "Lunes a viernes" },
  @{ name = "Dra. Marta Silva"; email = "marta.silva@adoptaya.test"; phone = "3104445566"; specialty = "Cirugia"; availability = "Martes y jueves" }
)
$vets = @{}
foreach ($vet in $vetData) {
  $vets[$vet.name] = Send-Api "Post" "/veterinarians" $vet
}

# 3. Adoptantes
$adopterData = @(
  @{ name = "Laura Gómez"; email = "laura.gomez@adoptaya.test"; phone = "3001234567"; address = "Calle 45 # 12-30, Bogota" },
  @{ name = "Carlos Pérez"; email = "carlos.perez@adoptaya.test"; phone = "3002345678"; address = "Carrera 7 # 80-12, Bogota" },
  @{ name = "Ana Torres"; email = "ana.torres@adoptaya.test"; phone = "3003456789"; address = "Calle 100 # 15-20, Bogota" },
  @{ name = "Diego Ramírez"; email = "diego.ramirez@adoptaya.test"; phone = "3004567890"; address = "Avenida 68 # 24-10, Bogota" },
  @{ name = "Sofía Castro"; email = "sofia.castro@adoptaya.test"; phone = "3005678901"; address = "Carrera 15 # 90-45, Bogota" }
)
$adopters = @{}
foreach ($adopter in $adopterData) {
  $adopters[$adopter.name] = Send-Api "Post" "/adopters" $adopter
}

# 4. Mascotas (todas nacen disponibles; al adoptarlas el back las marca como no disponibles)
$petData = @(
  @{ name = "Firulais"; species = "Perro"; breed = "Criollo"; age = 3 },
  @{ name = "Michi"; species = "Gato"; breed = "Siamés"; age = 1 },
  @{ name = "Luna"; species = "Perro"; breed = "Labrador"; age = 2 },
  @{ name = "Rocky"; species = "Perro"; breed = "Pitbull"; age = 5 },
  @{ name = "Nube"; species = "Gato"; breed = "Criollo"; age = 1 },
  @{ name = "Toby"; species = "Perro"; breed = "Beagle"; age = 4 },
  @{ name = "Mia"; species = "Gato"; breed = "Persa"; age = 2 }
)
$pets = @{}
foreach ($pet in $petData) {
  $pet.available = $true
  $pet.shelter = @{ id = $shelter.id }
  $pets[$pet.name] = Send-Api "Post" "/pets" $pet
}

# 5. Adopciones (las Aprobada y Devuelta se crean en curso y luego se actualiza el estado)
$adoptionData = @(
  @{ pet = "Firulais"; adopter = "Laura Gómez"; vet = "Dr. Andrés Ríos"; date = "2026-09-20"; status = "IN_PROGRESS" },
  @{ pet = "Michi"; adopter = "Carlos Pérez"; vet = "Dra. Marta Silva"; date = "2026-09-14"; status = "APPROVED" },
  @{ pet = "Luna"; adopter = "Ana Torres"; vet = "Dr. Andrés Ríos"; date = "2026-09-02"; status = "RETURNED" },
  @{ pet = "Rocky"; adopter = "Diego Ramírez"; vet = "Dra. Marta Silva"; date = "2026-08-28"; status = "APPROVED" },
  @{ pet = "Nube"; adopter = "Sofía Castro"; vet = "Dr. Andrés Ríos"; date = "2026-08-15"; status = "IN_PROGRESS" }
)
foreach ($item in $adoptionData) {
  $date = "$($item.date)T12:00:00.000Z"
  $body = @{
    date = $date
    pet = @{ id = $pets[$item.pet].id }
    adopter = @{ id = $adopters[$item.adopter].id }
    responsibleVeterinarian = @{ id = $vets[$item.vet].id }
  }
  $created = Send-Api "Post" "/adoptions" $body
  if ($created -and $item.status -ne "IN_PROGRESS") {
    Send-Api "Put" "/adoptions/$($created.id)" @{ date = $date; status = $item.status } | Out-Null
  }
}

Invoke-RestMethod -Uri "$Base/adoptions" | ForEach-Object {
  [pscustomobject]@{
    id = $_.id
    mascota = $_.pet.name
    adoptante = $_.adopter.name
    veterinario = $_.responsibleVeterinarian.name
    estado = $_.status
    fecha = $_.date
  }
}
