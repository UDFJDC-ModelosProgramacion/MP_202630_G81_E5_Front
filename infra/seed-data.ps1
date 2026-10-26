# Carga un refugio y 4 mascotas de prueba en el back.
# Uso: .\infra\seed-data.ps1   (opcional: -Base "http://localhost:8080/api")
param([string]$Base = "http://localhost:8080/api")

function Send-Api($method, $path, $body) {
  $json = $body | ConvertTo-Json -Depth 5
  try {
    Invoke-RestMethod -Method $method -Uri "$Base$path" `
      -ContentType "application/json; charset=utf-8" `
      -Body ([Text.Encoding]::UTF8.GetBytes($json)) -ErrorAction Stop
  } catch {
    $reader = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host $reader.ReadToEnd() -ForegroundColor Red
  }
}

# 1. Refugio (reutiliza el existente si ya está creado)
$shelter = Invoke-RestMethod -Uri "$Base/shelters" |
  Where-Object { $_.name -eq "Refugio Adopciones" } |
  Select-Object -First 1

if (-not $shelter) {
  $shelter = Send-Api "Post" "/shelters" @{ name = "Refugio Adopciones"; city = "Bogotá" }
}

# 2. Mascotas
$pets = @(
  @{ name = "Luna";  species = "Perro"; breed = "Labrador"; age = 2; available = $true  },
  @{ name = "Michi"; species = "Gato";  breed = "Siamés";   age = 0; available = $true  },
  @{ name = "Rocky"; species = "Perro"; breed = "Pitbull";  age = 5; available = $false },
  @{ name = "Nube";  species = "Gato";  breed = "Criollo";  age = 1; available = $true  }
)

foreach ($pet in $pets) {
  $pet.shelter = @{ id = $shelter.id }
  Send-Api "Post" "/pets" $pet | Out-Null
}

Invoke-RestMethod -Uri "$Base/pets" | Select-Object id, name, species, breed, age, available