# Render.com 배포 디버깅 가이드

## 현재 문제: Not Found 오류 지속

### Render.com 대시보드에서 확인해야 할 설정들:

#### 1. Service Type 확인
- **Static Site**로 설정되어 있는지 확인
- Web Service가 아닌 Static Site여야 함

#### 2. 빌드 설정 확인
```
Build Command: npm run build
Publish Directory: frontend/build
```

#### 3. 환경 변수 확인 (선택사항)
```
NODE_VERSION=18
```

#### 4. 자동 배포 확인
- GitHub 연결이 올바른지 확인
- main 브랜치에서 자동 배포되는지 확인

### 디버깅 단계:

#### 단계 1: 빌드 로그 확인
Render.com 대시보드 → 해당 서비스 → Logs에서:
1. 빌드가 성공했는지 확인
2. `frontend/build` 디렉토리가 생성되었는지 확인
3. `index.html`과 static 파일들이 있는지 확인

#### 단계 2: 설정 재확인
대시보드 → Settings에서:
1. **Build Command**: `npm run build`
2. **Publish Directory**: `frontend/build` (앞에 ./ 없이)
3. **Environment**: `Static Site`

#### 단계 3: 수동 재배포
1. 대시보드에서 "Manual Deploy" 버튼 클릭
2. 또는 Settings → "Clear build cache and deploy"

### 대안 해결책:

#### 옵션 1: 서비스 재생성
기존 서비스를 삭제하고 새로 생성:
1. 새 Static Site 생성
2. GitHub 저장소 연결
3. 설정 다시 입력

#### 옵션 2: 다른 배포 플랫폼 시도
- Netlify
- Vercel  
- GitHub Pages

### 확인용 명령어들:
```bash
# 로컬 빌드 테스트
npm run build
cd frontend/build
npx serve -s .
```

로컬에서 `npx serve -s .` 실행 후 http://localhost:3000 접속하여 정상 작동하는지 확인.