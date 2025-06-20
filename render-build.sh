#!/bin/bash

# Render.com 빌드 스크립트
echo "Starting Render.com build process..."

# 현재 디렉토리 확인
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Node.js 버전 확인
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# frontend 디렉토리 확인
if [ ! -d "frontend" ]; then
    echo "ERROR: frontend directory not found!"
    exit 1
fi

echo "Frontend directory contents:"
ls -la frontend/

# frontend 디렉토리로 이동
cd frontend

# package.json 확인
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found in frontend directory!"
    exit 1
fi

echo "Frontend package.json exists"

# 의존성 설치
echo "Installing dependencies..."
npm install

# 빌드 실행
echo "Building application..."
if npm run build; then
    echo "React build completed successfully!"
else
    echo "ERROR: React build failed!"
    exit 1
fi

# 빌드 결과 확인
if [ -d "build" ] && [ -f "build/index.html" ]; then
    echo "Build verification successful! Contents of build directory:"
    ls -la build/
    echo "Build size:"
    du -sh build/
    echo "Checking for critical files:"
    ls -la build/index.html build/static/ 2>/dev/null || echo "WARNING: Some expected files missing"
else
    echo "ERROR: Build directory or index.html not created!"
    echo "Current build directory contents:"
    ls -la build/ 2>/dev/null || echo "Build directory does not exist"
    exit 1
fi

echo "Build process completed successfully!"