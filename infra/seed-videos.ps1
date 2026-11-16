<#
  Datos de prueba de la HU03 (videos del refugio).
  Uso: powershell -ExecutionPolicy Bypass -File infra/seed-videos.ps1
  El back usa H2 en memoria: al reiniciarlo hay que volver a ejecutarlo.
#>
param(
  [string]$ApiUrl = "http://localhost:8080/api",
  [string]$FrontUrl = "http://localhost:5173"
)

$ErrorActionPreference = "Stop"

function Invoke-Api {
  param([string]$Method, [string]$Path, $Body = $null)
  $params = @{ Method = $Method; Uri = "$ApiUrl$Path" }
  if ($null -ne $Body) {
    $json = $Body | ConvertTo-Json -Depth 5
    $params.Body = [System.Text.Encoding]::UTF8.GetBytes($json)
    $params.ContentType = "application/json; charset=utf-8"
  }
  Invoke-RestMethod @params
}

$wantedShelters = @(
  @{ name = "Refugio Adopciones"; city = "Bogotá" },
  @{ name = "Refugio Patitas"; city = "Cali" }
)

$shelters = @(Invoke-Api GET "/shelters")
for ($i = $shelters.Count; $i -lt 2; $i++) {
  $shelters += Invoke-Api POST "/shelters" $wantedShelters[$i]
}
$first = $shelters[0]
$second = $shelters[1]

# URLs públicas de terceros para que el reproductor del detalle funcione (requiere internet).
$firstUrls = @(
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://www.youtube.com/watch?v=jNQXAC9IVRw"
)
$otherUrl = "https://www.w3schools.com/html/movie.mp4"

$firstVideos = $firstUrls | ForEach-Object {
  Invoke-Api POST "/shelters/$($first.id)/videos" @{ url = $_ }
}
$otherVideo = Invoke-Api POST "/shelters/$($second.id)/videos" @{ url = $otherUrl }

Write-Host ""
Write-Host "Videos creados: 3 en '$($first.name)' (id $($first.id)) y 1 en '$($second.name)' (id $($second.id))."
Write-Host ""
Write-Host "Pantallas para probar los criterios de aceptación:"
Write-Host "  Lista, crear, editar y borrar : $FrontUrl/refugios/$($first.id)/videos"
Write-Host "  Detalle de un video           : $FrontUrl/refugios/$($first.id)/videos/$($firstVideos[0].id)"
Write-Host "  Refugio inexistente           : $FrontUrl/refugios/99999/videos"
Write-Host "  Video inexistente             : $FrontUrl/refugios/$($first.id)/videos/99999"
Write-Host "  Video de otro refugio         : $FrontUrl/refugios/$($second.id)/videos/$($firstVideos[0].id)"