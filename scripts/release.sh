#!/usr/bin/env bash
# ============================================================
# HBD — HOME BOARD DESIGNER
# SCRIPT DE RELEASE MANUAL CONTROLADO (Bash)
# ============================================================
#
# Autor: Adrián Palma
# Copyright: © 2026 Adrián Palma — HBD (Home Board Designer)
# Repositorio: https://github.com/adrianpalma360-create/HBD.git
# ============================================================

set -e

echo "============================================================"
echo "🚀 HBD — ASISTENTE DE PUBLICACIÓN CONTROLADA (MANUAL RELEASE)"
echo "============================================================"

# 1. Comprobar directorio raíz
if [ ! -f "package.json" ]; then
    echo "❌ Error: Este script debe ejecutarse desde el directorio raíz de HBD."
    exit 1
fi

# 2. Leer versión actual del proyecto
CURRENT_VERSION=$(node -p "require('./package.json').version")
TAG_NAME="v$CURRENT_VERSION"

echo ""
echo "📦 Versión actual detectada: $CURRENT_VERSION (Tag: $TAG_NAME)"

# 3. Comprobar Git Branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "🌿 Rama Git actual: $CURRENT_BRANCH"

# 4. Comprobar Git Remote
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
echo "🔗 Repositorio remoto origin: $REMOTE_URL"

if [ -z "$REMOTE_URL" ]; then
    echo "❌ Error: El remoto 'origin' no está configurado."
    exit 1
fi

# 5. Comprobar estado de Git
echo ""
echo "🔍 Estado de archivos en Git:"
git status --short

# 6. Validaciones técnicas
echo ""
echo "--- 1/4 Verificando Linting & Types ---"
npm run lint

echo ""
echo "--- 2/4 Verificando TypeScript (Typecheck) ---"
npm run typecheck

echo ""
echo "--- 3/4 Ejecutando Suite de Pruebas ---"
npm run test

echo ""
echo "--- 4/4 Compilando paquetes para producción ---"
npm run build

# 7. Resumen y Confirmación Explícita
echo ""
echo "============================================================"
echo "✅ TODAS LAS VALIDACIONES TÉCNICAS HAN SIDO SUPERADAS"
echo "============================================================"
echo "Detalles del Release a Publicar:"
echo "  • Versión del Producto : $CURRENT_VERSION"
echo "  • Tag de Git           : $TAG_NAME"
echo "  • Rama destino         : $CURRENT_BRANCH"
echo "  • Repositorio remoto   : $REMOTE_URL"
echo "  • Imágenes en GHCR     : ghcr.io/adrianpalma360-create/hbd-server:$CURRENT_VERSION"
echo "                           ghcr.io/adrianpalma360-create/hbd-client:$CURRENT_VERSION"
echo "============================================================"
echo ""

read -p "¿Deseas confirmar la creación del tag $TAG_NAME y publicar los cambios en GitHub? (s/N): " CONFIRMATION

if [[ "$CONFIRMATION" =~ ^[sSyY]$ ]]; then
    echo ""
    echo "🚀 Procediendo con la publicación..."
    
    if [ -n "$(git status --porcelain)" ]; then
        read -p "Introduce el mensaje de commit [chore(release): release $TAG_NAME]: " COMMIT_MSG
        COMMIT_MSG=${COMMIT_MSG:-"chore(release): release $TAG_NAME"}
        git add .
        git commit -m "$COMMIT_MSG"
    fi

    if ! git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
        git tag -a "$TAG_NAME" -m "Release $TAG_NAME"
        echo "🏷️ Tag $TAG_NAME creado correctamente."
    else
        echo "ℹ️ El tag $TAG_NAME ya existía localmente."
    fi

    echo "📤 Subiendo commits y tags a origin..."
    git push origin "$CURRENT_BRANCH"
    git push origin --tags

    echo ""
    echo "🎉 Publicación completada con éxito. El workflow de GitHub Actions iniciará la construcción y publicación en GHCR."
else
    echo ""
    echo "🛑 Publicación cancelada por el usuario. No se ha realizado ningún push ni tag remoto."
fi
