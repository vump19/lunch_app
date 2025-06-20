#!/bin/bash

# Render.com 빌드 스크립트
echo "Starting Render.com build process..."

# 현재 디렉토리 확인
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# frontend 디렉토리로 이동
cd frontend

# 의존성 설치
echo "Installing dependencies..."
npm ci

# 빌드 실행
echo "Building application..."
npm run build

# 빌드 결과 확인
echo "Build completed. Contents of build directory:"
ls -la build/

echo "Build process completed successfully!"