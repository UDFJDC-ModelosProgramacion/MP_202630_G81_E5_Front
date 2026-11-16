param([string]$ApiUrl = 'http://localhost:8080/api')

$ErrorActionPreference = 'Stop'

$pets = @(Invoke-RestMethod -Method Get -Uri "$ApiUrl/pets")
if ($pets.Count -eq 0) {
  Write-Host 'No hay mascotas. Ejecuta primero .\infra\seed-data.ps1'
  exit 1
}

function Test-HasRecord($petId) {
  try {
    Invoke-RestMethod -Method Get -Uri "$ApiUrl/pets/$petId/vaccinationRecord" | Out-Null
    return $true
  } catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) { return $false }
    throw
  }
}

$pet = $pets[0]
if (Test-HasRecord $pet.id) {
  Write-Host "La mascota $($pet.name) ya tiene carnet; se omite."
} else {
  $record = @{ vaccinesApplied = 'Rabia, Parvovirus, Moquillo'; nextDueDate = '2027-08-01' }
  $json = $record | ConvertTo-Json
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
  Invoke-RestMethod -Method Post -Uri "$ApiUrl/pets/$($pet.id)/vaccinationRecord" `
    -ContentType 'application/json; charset=utf-8' -Body $bytes | Out-Null
  Write-Host "Carnet creado para $($pet.name) (id=$($pet.id))."
}

Write-Host "Con carnet:  http://localhost:5173/mascotas/$($pet.id)/carnet"
if ($pets.Count -gt 1) {
  Write-Host "Sin carnet:  http://localhost:5173/mascotas/$($pets[1].id)/carnet"
}