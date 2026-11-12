param([string]$ApiUrl = 'http://localhost:8080/api')

$ErrorActionPreference = 'Stop'

function Send-Json($Method, $Path, $Body) {
  $json = $Body | ConvertTo-Json -Depth 5
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
  Invoke-RestMethod -Method $Method -Uri "$ApiUrl$Path" `
    -ContentType 'application/json; charset=utf-8' -Body $bytes
}

$shelters = @(Invoke-RestMethod -Method Get -Uri "$ApiUrl/shelters")
if ($shelters.Count -gt 0) {
  $shelter = $shelters[0]
  Write-Host "Usando refugio existente: id=$($shelter.id) $($shelter.name)"
} else {
  $shelter = Send-Json 'Post' '/shelters' @{ name = 'Refugio Adopciones'; city = 'Bogota' }
  Write-Host "Refugio creado: id=$($shelter.id)"
}

$veterinarians = @(
  @{ name = 'Laura Martinez'; email = 'laura.martinez@refugio.org'; phone = '3105551234';
     specialty = 'Medicina interna'; availability = 'Lun-Vie 8:00-14:00'; shelter = @{ id = $shelter.id } },
  @{ name = 'Carlos Gomez'; email = 'carlos.gomez@refugio.org'; phone = '3105559876';
     specialty = 'Cirugia'; availability = 'Lun-Vie 14:00-18:00'; shelter = @{ id = $shelter.id } },
  @{ name = 'Andrea Ruiz'; email = 'andrea.ruiz@refugio.org';
     specialty = 'Medicina preventiva'; availability = 'Sab 8:00-12:00'; shelter = @{ id = $shelter.id } },
  @{ name = 'Sofia Rojas'; email = 'sofia.rojas@refugio.org'; specialty = 'Dermatologia' }
)

foreach ($veterinarian in $veterinarians) {
  $created = Send-Json 'Post' '/veterinarians' $veterinarian
  Write-Host "Veterinario creado: id=$($created.id) $($created.name)"
}