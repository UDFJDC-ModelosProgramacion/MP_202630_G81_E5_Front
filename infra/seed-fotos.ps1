# Carga fotos de prueba para HU02 (Gestionar fotos): 3 para Luna, 1 para Michi y 2 para el refugio.
# Requiere mascotas y refugio cargados: .\infra\seed-data.ps1
# Uso: .\infra\seed-fotos.ps1   (opcional: -Base "http://localhost:8080/api")
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

# Recorre el arreglo con foreach: en Windows PowerShell 5.1, Where-Object recibe la lista completa como un solo objeto.
function Find-ByName($items, $name) {
  foreach ($item in $items) {
    if ($item.name -eq $name) { return $item }
  }
}

function Add-Photos($ownerKey, $ownerId, $listPath, $urls) {
  $existing = Invoke-RestMethod -Uri "$Base$listPath"
  if ($existing -and $existing.Count -gt 0) {
    Write-Host "Ya tiene fotos, se omite: $listPath" -ForegroundColor Yellow
    return
  }
  foreach ($url in $urls) {
    Send-Api "Post" "/photos" @{ url = $url; $ownerKey = @{ id = $ownerId } } | Out-Null
  }
}

function Show-Photos($label, $listPath) {
  Write-Host "`n$label ($listPath)" -ForegroundColor Cyan
  $photos = Invoke-RestMethod -Uri "$Base$listPath"
  foreach ($photo in $photos) {
    Write-Host ("  id={0}  {1}" -f $photo.id, $photo.url)
  }
}

$shelter = Find-ByName (Invoke-RestMethod -Uri "$Base/shelters") "Refugio Adopciones"
$luna    = Find-ByName (Invoke-RestMethod -Uri "$Base/pets") "Luna"
$michi   = Find-ByName (Invoke-RestMethod -Uri "$Base/pets") "Michi"

if (-not $shelter -or -not $luna -or -not $michi) {
  Write-Host "Faltan el refugio o las mascotas. Ejecuta primero .\infra\seed-data.ps1" -ForegroundColor Red
  exit 1
}

Add-Photos "pet" $luna.id "/pets/$($luna.id)/photos" @(
  "https://picsum.photos/seed/luna1/400/300",
  "https://picsum.photos/seed/luna2/400/300",
  "https://picsum.photos/seed/luna3/400/300"
)
Add-Photos "pet" $michi.id "/pets/$($michi.id)/photos" @(
  "https://picsum.photos/seed/michi1/400/300"
)
Add-Photos "shelter" $shelter.id "/shelters/$($shelter.id)/photos" @(
  "https://picsum.photos/seed/refugio1/400/300",
  "https://picsum.photos/seed/refugio2/400/300"
)

Show-Photos "Fotos de Luna" "/pets/$($luna.id)/photos"
Show-Photos "Fotos de Michi" "/pets/$($michi.id)/photos"
Show-Photos "Fotos del refugio" "/shelters/$($shelter.id)/photos"
Write-Host "`nPara el criterio 6, usa el id de una foto del refugio en /mascotas/$($luna.id)/fotos/<id>." -ForegroundColor Green