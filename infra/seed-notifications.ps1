# Datos de prueba para HU09 (notificaciones del refugio). Requiere el back en http://localhost:8080
$api = "http://localhost:8080/api"

function Send-Post($path, $body) {
  $json = $body | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri "$api$path" -ContentType "application/json; charset=utf-8" -Body ([Text.Encoding]::UTF8.GetBytes($json))
}

$date = (Get-Date).ToString("yyyy-MM-dd") + "T12:00:00.000Z"

$shelter = Send-Post "/shelters" @{ name = "Refugio Adopciones"; city = "Bogotá" }
$sid = $shelter.id
$other = Send-Post "/shelters" @{ name = "Refugio Vecino"; city = "Medellín" }
$oid = $other.id

Send-Post "/shelters/$sid/notifications" @{ channel = "EMAIL"; message = "Recordatorio de la jornada de vacunación de este sábado."; date = $date } | Out-Null
Send-Post "/shelters/$sid/notifications" @{ channel = "SMS"; message = "Tu cita de seguimiento fue confirmada."; date = $date } | Out-Null
Send-Post "/shelters/$sid/notifications" @{ channel = "PUSH"; message = "Hay una nueva mascota disponible para adopción."; date = $date } | Out-Null
$foreign = Send-Post "/shelters/$oid/notifications" @{ channel = "SMS"; message = "Mensaje de otro refugio."; date = $date }

Write-Host "Refugio con notificaciones : http://localhost:5173/refugios/$sid/notificaciones"
Write-Host "Refugio vecino             : http://localhost:5173/refugios/$oid/notificaciones"
Write-Host "Criterio 6 (otro refugio)  : http://localhost:5173/refugios/$sid/notificaciones/$($foreign.id)"
Write-Host "Criterio 4 (no existe)     : http://localhost:5173/refugios/99999/notificaciones"