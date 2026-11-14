param([string]$ApiUrl = 'http://localhost:8080/api')

$ErrorActionPreference = 'Stop'

$pets = @(Invoke-RestMethod -Method Get -Uri "$ApiUrl/pets")
if ($pets.Count -eq 0) {
  Write-Host 'No hay mascotas. Ejecuta primero .\infra\seed-data.ps1'
  exit 1
}
$veterinarians = @(Invoke-RestMethod -Method Get -Uri "$ApiUrl/veterinarians")
if ($veterinarians.Count -eq 0) {
  Write-Host 'No hay veterinarios; los eventos se crean sin veterinario (opcional: .\infra\seed-veterinarian.ps1).'
}

$o = [char]0x00F3
$i = [char]0x00ED
$a = [char]0x00E1

function Send-Json($Method, $Path, $Body) {
  $json = $Body | ConvertTo-Json -Depth 5
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
  Invoke-RestMethod -Method $Method -Uri "$ApiUrl$Path" `
    -ContentType 'application/json; charset=utf-8' -Body $bytes
}

$pet = $pets[0]
$first = if ($veterinarians.Count -gt 0) { $veterinarians[0] } else { $null }
$second = if ($veterinarians.Count -gt 1) { $veterinarians[1] } else { $first }

$events = @(
  @{ type = "Vacunaci${o}n"; date = '2026-05-10'; description = "Aplicaci${o}n de la vacuna antirr${a}bica"; vet = $first },
  @{ type = 'Control'; date = '2026-03-02'; description = "Chequeo general y desparasitaci${o}n"; vet = $second },
  @{ type = "Cirug${i}a"; date = '2026-01-15'; description = "Esterilizaci${o}n sin complicaciones"; vet = $first }
)

$firstEventId = $null
foreach ($event in $events) {
  $body = @{ type = $event.type; date = $event.date; description = $event.description }
  if ($event.vet) { $body.veterinarian = @{ id = $event.vet.id } }
  $created = Send-Json 'Post' "/pets/$($pet.id)/lifeEvents" $body
  if (-not $firstEventId) { $firstEventId = $created.id }
  Write-Host "Evento creado: id=$($created.id) $($event.date) para $($pet.name)"
}

Write-Host "Con eventos:           http://localhost:5173/mascotas/$($pet.id)/eventos-de-vida"
if ($pets.Count -gt 1) {
  Write-Host "Sin eventos:           http://localhost:5173/mascotas/$($pets[1].id)/eventos-de-vida"
  Write-Host "Evento de otra mascota: http://localhost:5173/mascotas/$($pets[1].id)/eventos-de-vida/$firstEventId"
}