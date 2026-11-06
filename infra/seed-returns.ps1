# Carga datos de prueba para Devoluciones (HU06: Registrar devolución de una mascota) en el back.
# Requiere las adopciones de seed-adoptions.ps1 (ejecútalo antes).
# Registra una devolución para la adopción de Michi (Carlos Pérez): la adopción pasa a "Devuelta" y Michi vuelve a estar disponible.
# Las demás adopciones quedan sin devolución para probar el registro (Rocky, Firulais, Nube) y la consulta de una adopción devuelta sin registro (Luna).
# Uso: .\infra\seed-returns.ps1   (opcional: -Base "http://localhost:8080/api")
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

function Get-ReturnRecord($adoptionId) {
  try {
    Invoke-RestMethod -Uri "$Base/adoptions/$adoptionId/returnRecord" -ErrorAction Stop
  } catch {
    $null
  }
}

# 0. Verifica que el back responde y que ya existen las adopciones
try {
  $adoptions = @(Invoke-RestMethod -Uri "$Base/adoptions" -ErrorAction Stop | Where-Object { $_ })
} catch {
  Write-Host "No se pudo conectar con el back en $Base. Esta en ejecucion?" -ForegroundColor Red
  return
}
$michi = $adoptions | Where-Object { $_.pet.name -eq "Michi" } | Select-Object -First 1
if (-not $michi) {
  Write-Host "No hay adopciones de prueba. Ejecuta primero .\infra\seed-adoptions.ps1" -ForegroundColor Yellow
  return
}

# 1. Verifica que no haya devoluciones cargadas
if (Get-ReturnRecord $michi.id) {
  Write-Host "Ya hay devoluciones cargadas. Reinicia el back para empezar de cero." -ForegroundColor Yellow
  return
}

# 2. Devolución de la adopción de Michi (la fecha se envía a las 12:00 UTC para no correr el día)
Send-Api "Post" "/adoptions/$($michi.id)/returnRecord" @{
  date = "2026-10-05T12:00:00.000Z"
  reason = "El adoptante cambió de ciudad y no puede llevar a la mascota consigo."
} | Out-Null

# 3. Resumen
Invoke-RestMethod -Uri "$Base/adoptions" | ForEach-Object {
  $record = Get-ReturnRecord $_.id
  [pscustomobject]@{
    adopcionId = $_.id
    mascota = $_.pet.name
    estado = $_.status
    mascotaDisponible = $_.pet.available
    devolucion = if ($record) { $record.reason } else { "(sin devolución)" }
  }
}

$withoutReturn = $adoptions | Where-Object { $_.pet.name -eq "Rocky" } | Select-Object -First 1
Write-Host ""
Write-Host "Con devolución (consultar, editar, eliminar): http://localhost:5173/adopciones/$($michi.id)/devolucion" -ForegroundColor Green
if ($withoutReturn) {
  Write-Host "Sin devolución (registrar): http://localhost:5173/adopciones/$($withoutReturn.id)/devolucion" -ForegroundColor Green
}
Write-Host "Adopción inexistente (debe decir no encontrada): http://localhost:5173/adopciones/9999/devolucion" -ForegroundColor Green
