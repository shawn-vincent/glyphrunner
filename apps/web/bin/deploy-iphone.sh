#!/bin/bash

# Deploy to iPhone matching pattern
# Usage: ./deploy-iphone.sh [device_name_pattern]
# Example: ./deploy-iphone.sh "Shawn"

set -e

# Get device name pattern from first argument, default to "iPhone" if not provided
DEVICE_PATTERN="${1:-iPhone}"

echo "🏗️  Building web app..."
npm run build

echo "🔧 Preemptively setting build directory attributes to prevent Xcode errors..."
cd ios/App
if [ -d "build" ]; then
    xattr -w com.apple.xcode.CreatedByBuildSystem true build 2>/dev/null || true
    echo "✅ Build directory xattr flag set"
else
    echo "ℹ️  No build directory found yet"
fi
cd ../..

echo "📱 Syncing with iOS project..."
npx cap sync ios

echo "🔍 Looking for connected devices matching '$DEVICE_PATTERN'..."

# Check for physical devices with pattern in name using xctrace (which shows the actual UDID)
DEVICE_ID=$(xcrun xctrace list devices 2>/dev/null | grep -i "$DEVICE_PATTERN" | grep -oE '[0-9A-F]{8}-[0-9A-F]{16}' | head -1)

if [ -z "$DEVICE_ID" ]; then
    echo "📱 No physical device matching '$DEVICE_PATTERN' found, checking simulators..."
    DEVICE_ID=$(xcrun simctl list devices available | grep -E "iPhone.*$DEVICE_PATTERN" | head -1 | grep -oE '[A-F0-9-]{36}')
fi

if [ -z "$DEVICE_ID" ]; then
    echo "❌ No device found matching '$DEVICE_PATTERN'"
    echo ""
    echo "Available physical devices:"
    xcrun devicectl list devices 2>/dev/null || echo "No physical devices connected"
    echo ""
    echo "Available simulators:"
    xcrun simctl list devices available | grep iPhone
    echo ""
    echo "Make sure your iPhone is:"
    echo "  1. Connected via USB"
    echo "  2. Unlocked"  
    echo "  3. Trusts this computer"
    echo "  4. Has Developer Mode enabled (Settings > Privacy & Security > Developer Mode)"
    echo "  5. Named to include '$DEVICE_PATTERN' (Settings > General > About > Name)"
    exit 1
fi

echo "✅ Found device: $DEVICE_ID"

# Check if it's a physical device (format: XXXXXXXX-XXXXXXXXXXXXXXXX)
if [[ "$DEVICE_ID" =~ ^[0-9A-F]{8}-[0-9A-F]{16}$ ]]; then
    echo "📱 Physical device detected, using xcodebuild..."
    
    cd ios/App
    
    # Clean up build directory to avoid xattr issues
    if [ -d "build" ]; then
        echo "🧹 Cleaning existing build directory..."
        # Try to set the attribute first, then remove
        xattr -w com.apple.xcode.CreatedByBuildSystem true build 2>/dev/null || true
        rm -rf build 2>/dev/null || {
            echo "⚠️  Warning: Could not remove build directory, but continuing..."
        }
    fi
    
    # Build and install using xcodebuild (without clean to avoid directory issues)
    echo "🔨 Building for device..."
    xcodebuild -workspace App.xcworkspace \
               -scheme App \
               -destination "id=$DEVICE_ID" \
               -configuration Debug \
               -derivedDataPath build \
               build
    
    # Install and run the app
    xcrun devicectl device install app --device "$DEVICE_ID" build/Build/Products/Debug-iphoneos/App.app
    xcrun devicectl device process launch --device "$DEVICE_ID" io.ionic.starter
    
    cd ../..
    echo "✨ Deployment complete!"
else
    echo "🚀 Deploying to simulator..."
    npx cap run ios --target "$DEVICE_ID"
    echo "✨ Deployment complete!"
fi