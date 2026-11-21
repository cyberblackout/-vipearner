#!/bin/bash

echo "==================================="
echo " VIP Earner GH - Android Build"
echo "==================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed"
    exit 1
fi

echo "[1/5] Installing dependencies..."
npm install

echo ""
echo "[2/5] Building web app..."
npm run build

echo ""
echo "[3/5] Syncing with Capacitor..."
npx cap sync android

echo ""
echo "[4/5] Opening Android Studio..."
echo "Note: If Android Studio doesn't open automatically, run:"
echo "  npx cap open android"
npx cap open android

echo ""
echo "[5/5] Build complete!"
echo ""
echo "Next steps:"
echo "  1. Android Studio should open with the project"
echo "  2. Go to Build → Build Bundle(s) / APK(s) → Build APK(s)"
echo "  3. APK will be at: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "For release build, see README.md for signing instructions."
