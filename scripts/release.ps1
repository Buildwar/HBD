# ============================================================
# HBD — HOME BOARD DESIGNER
# SCRIPT DE RELEASE MANUAL CONTROLADO (PowerShell)
# ============================================================
#
# Autor: Adrián Palma
# Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
# Repositorio: https://github.com/Buildwar/HBD.git
# ============================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🚀 HBD — ASISTENTE DE PUBLICACIÓN CONTROLADA (MANUAL RELEASE)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Comprobar directorio raíz
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Este script debe ejecutarse desde el directorio raíz de HBD." -ForegroundColor Red
    exit 1
}

# 2. Leer versión actual del proyecto
$packageJson = Get-Content -Raw "package.json" | ConvertFrom-Json
$currentVersion = $packageJson.version
$tagName = "v$currentVersion"

Write-Host "`n📦 Versión actual detectada: $currentVersion (Tag: $tagName)" -ForegroundColor Green

# 3. Comprobar Git Branch
$currentBranch = (git rev-parse --abbrev-ref HEAD).Trim()
Write-Host "🌿 Rama Git actual: $currentBranch" -ForegroundColor Yellow

if ($currentBranch -ne "main" -and $currentBranch -ne "master") {
    Write-Host "⚠️ Advertencia: No estás en la rama principal (main)." -ForegroundColor Yellow
}

# 4. Comprobar Git Remote
$remoteUrl = (git remote get-url origin 2>$null)
Write-Host "🔗 Repositorio remoto origin: $remoteUrl" -ForegroundColor Yellow

if (-not $remoteUrl) {
    Write-Host "❌ Error: El remoto 'origin' no está configurado." -ForegroundColor Red
    exit 1
}

# 5. Comprobar estado de Git
Write-Host "`n🔍 Estado de archivos en Git:" -ForegroundColor Cyan
git status --short

# 6. Validaciones técnicas (Lint, Typecheck, Tests, Build)
Write-Host "`n--- 1/4 Verificando Linting & Types ---" -ForegroundColor Cyan
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en Linting." -ForegroundColor Red
    exit 1
}

Write-Host "`n--- 2/4 Verificando TypeScript (Typecheck) ---" -ForegroundColor Cyan
npm run typecheck
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en Typecheck." -ForegroundColor Red
    exit 1
}

Write-Host "`n--- 3/4 Ejecutando Suite de Pruebas Unitarias y de Integración ---" -ForegroundColor Cyan
npm run test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en las pruebas automatizadas." -ForegroundColor Red
    exit 1
}

Write-Host "`n--- 4/4 Compilando paquetes para producción (Build) ---" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en la compilación del proyecto." -ForegroundColor Red
    exit 1
}

# 7. Resumen y Solicitud de Confirmación Explícita
Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "✅ TODAS LAS VALIDACIONES TÉCNICAS HAN SIDO SUPERADAS" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host "Detalles del Release a Publicar:"
Write-Host "  • Versión del Producto : $currentVersion"
Write-Host "  • Tag de Git           : $tagName"
Write-Host "  • Rama destino         : $currentBranch"
Write-Host "  • Repositorio remoto   : $remoteUrl"
Write-Host "  • Imágenes en GHCR     : ghcr.io/buildwar/hbd-server:$currentVersion"
Write-Host "                           ghcr.io/buildwar/hbd-client:$currentVersion"
Write-Host "============================================================" -ForegroundColor Green

$confirmation = Read-Host "`n¿Deseas confirmar la creación del tag $tagName y publicar los cambios en GitHub? (S/N)"

if ($confirmation -eq 'S' -or $confirmation -eq 's' -or $confirmation -eq 'SI' -or $confirmation -eq 'si') {
    Write-Host "`n🚀 Procediendo con la publicación..." -ForegroundColor Cyan
    
    # Comprobar si hay cambios sin commitear
    $hasChanges = (git status --porcelain)
    if ($hasChanges) {
        $commitMessage = Read-Host "Introduce el mensaje de commit (o pulsa Enter para 'chore(release): release $tagName')"
        if (-not $commitMessage) {
            $commitMessage = "chore(release): release $tagName"
        }
        git add .
        git commit -m $commitMessage
    }
    
    # Comprobar si el tag ya existe
    $tagExists = (git tag -l $tagName)
    if (-not $tagExists) {
        git tag -a $tagName -m "Release $tagName"
        Write-Host "🏷️ Tag $tagName creado correctamente." -ForegroundColor Green
    } else {
        Write-Host "ℹ️ El tag $tagName ya existía localmente." -ForegroundColor Yellow
    }

    Write-Host "📤 Subiendo commits y tags a origin..." -ForegroundColor Cyan
    git push origin $currentBranch
    git push origin --tags

    Write-Host "`n🎉 Publicación completada con éxito. El workflow de GitHub Actions iniciará la construcción y publicación en GHCR." -ForegroundColor Green
} else {
    Write-Host "`n🛑 Publicación cancelada por el usuario. No se ha realizado ningún push ni tag remoto." -ForegroundColor Yellow
}
