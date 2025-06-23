# 맛집 추천 애플리케이션 (Lunch App)

맛집 추천 애플리케이션은 사용자의 위치 기반으로 주변 맛집을 추천하고, 사용자가 저장한 맛집 목록 및 방문 기록을 관리할 수 있는 웹 애플리케이션입니다.

## 주요 기능

- **위치 기반 맛집 추천**
  - 현재 위치 기준으로 주변 맛집 검색
  - 카카오맵을 통한 시각적 맛집 위치 확인
  - **랜덤 순서로 맛집 목록 표시** (매번 다른 발견의 재미)
  - 거리 기반 정렬 및 필터링

- **나의 맛집 관리**
  - 맛집 정보 저장 및 관리
  - 저장된 맛집 목록에서 랜덤 추천
  - **현재 위치에서 추천 맛집까지의 예상 소요시간 표시** (도보/차량)
  - 맛집 상세 정보 조회 및 삭제
  - "방문" 버튼을 통한 방문 기록 추가
  - **맛집을 삭제해도 방문 기록은 남으며, 삭제된 맛집은 '삭제된 맛집'으로 표시됨**

- **방문 기록**
  - 사용자가 방문한 맛집의 기록을 카드형 리스트로 표시
  - **한국 시간대(Asia/Seoul) 기준 정확한 방문일시 표시**
  - 방문일, 맛집 이름, 주소 등 상세 정보 제공
  - 방문 기록 삭제 기능
  - **삭제된 맛집의 방문 기록도 유지되며, 별도 안내와 함께 표시됨**

- **검색 기능**
  - 맛집 이름, 주소, 카테고리 기반 검색
  - 실시간 검색 결과 표시

## 기술 스택

### 프론트엔드
- React + TypeScript
- Tailwind CSS (모던 UI/UX, 애니메이션, 반응형 디자인)
- React Query (데이터 페칭 및 캐싱)
- Kakao Maps API (지도 및 장소 검색)
- @headlessui/react (탭, 모달 등 UI 컴포넌트)
- **통합 PopupModal 시스템** (일관된 알림/확인 대화상자)
- **실시간 백엔드 헬스체크** (10초 간격 자동 모니터링)
- **반응형 디자인** (모바일/데스크톱 최적화)

### 백엔드
- Go (Gin, GORM)
- **SQLite** (로컬 개발/테스트용)
- **PostgreSQL** (프로덕션 배포용, Render.com 자동 제공)
- RESTful API
- 헬스체크 시스템 (`/health` 엔드포인트)

## 프로젝트 구조

```
lunch_app/
├── frontend/           # React 프론트엔드
│   ├── src/           # 소스 코드 (App.tsx, components, api 등)
│   ├── public/        # 정적 파일
│   └── package.json   # 프론트엔드 의존성
│
├── backend/           # Go 백엔드
│   ├── cmd/api/       # 메인 애플리케이션
│   ├── internal/      # 내부 패키지 (models, handlers, routes 등)
│   └── go.mod         # Go 모듈 정의
│
└── README.md         # 프로젝트 문서
```

## 데이터베이스 테이블 구조

### Restaurant 테이블

| 필드명      | 타입         | 설명
|-------------|--------------|------------------
| ID          | uint (PK)    | 맛집 고유 ID (자동 생성)
| Name        | string       | 맛집 이름
| Address     | string       | 맛집 주소
| Latitude    | float        | 위도
| Longitude   | float        | 경도
| Category    | string       | 맛집 카테고리 (예: 한식, 중식, 일식 등)
| Phone       | string       | 맛집 전화번호 (없을 경우 "전화번호 없음")
| CreatedAt   | time.Time    | 생성일 (GORM 자동 생성)
| UpdatedAt   | time.Time    | 수정일 (GORM 자동 생성)
| DeletedAt   | gorm.DeletedAt (index) | (소프트) 삭제일 (GORM)

### Visit 테이블

| 필드명         | 타입         | 설명
|----------------|--------------|------------------
| ID             | uint (PK)    | 방문 기록 고유 ID (자동 생성)
| RestaurantID   | uint (FK, nullable) | 맛집 ID (Restaurant 테이블 참조, 삭제 시 NULL)
| Restaurant     | Restaurant (GORM 관계) | 맛집 정보 (GORM 관계)
| VisitDate      | time.Time    | 방문일 (예: 2024-01-01T00:00:00Z)
| CreatedAt      | time.Time    | 생성일 (GORM 자동 생성)
| UpdatedAt      | time.Time    | 수정일 (GORM 자동 생성)
| DeletedAt      | gorm.DeletedAt (index) | (소프트) 삭제일 (GORM)

- **맛집 삭제 시 Visit의 RestaurantID는 NULL로 변경되고, 프론트엔드에서는 '삭제된 맛집'으로 안내**

---

## 시작하기

### 필수 요구사항
- Node.js 16.x 이상
- Go 1.19 이상
- **(DB 불필요, SQLite 자동 생성)**
- 카카오맵 API 키

### 환경 설정

1. 프론트엔드 설정  
   ```bash
   cd frontend
   npm install
   ```

2. 백엔드 설정  
   ```bash
   cd backend
   go mod download
   ```

3. 환경 변수 설정  
   - 프론트엔드: `.env` 파일 생성  
     ```
     REACT_APP_KAKAO_MAP_APP_KEY=your_kakao_map_api_key
     REACT_APP_API_BASE_URL=http://localhost:8080
     ```
   - 백엔드: 별도 환경 변수 필요 없음 (SQLite 사용)

### 실행 방법

1. 백엔드 서버 실행  
   ```bash
   cd backend
   go run cmd/api/main.go
   ```

2. 프론트엔드 개발 서버 실행  
   ```bash
   cd frontend
   npm start
   ```

## 주요 정책 및 변경점

- **맛집 삭제 시 방문 기록은 삭제되지 않음**
  - 삭제된 맛집의 방문 기록은 '삭제된 맛집'으로 표시됨
- **데이터 검증 및 오류 처리 강화**
  - 맛집 추가 시 이름, 주소, 위치 정보가 없으면 등록 불가
  - 프론트엔드/백엔드 모두에서 입력값 검증 및 에러 안내
- **DB는 SQLite로 자동 생성/마이그레이션**
  - 별도 DB 설정 없이 바로 실행 가능
- **API 응답 구조 개선**
  - 방문 기록에 삭제된 맛집 여부, 안내 메시지 포함
- **프론트엔드 UX 개선**
  - 에러/로딩/빈 상태 안내 강화
  - 삭제/방문 처리 시 알림 및 안내 강화

## API 문서

### 주요 엔드포인트

- `GET /health` – **서버 헬스체크** (상태, 타임스탬프, 버전 정보)
- `GET /api/restaurants/` – 맛집 목록 조회
- `POST /api/restaurants/` – 새로운 맛집 추가
- `GET /api/restaurants/{id}` – 특정 맛집 정보 조회
- `DELETE /api/restaurants/{id}` – 맛집 삭제
- `GET /api/visits/` – 방문 기록 조회 (한국 시간대 포맷팅)
- `POST /api/visits/` – 방문 기록 추가 (맛집 ID 기반)
- `DELETE /api/visits/{id}` – 방문 기록 삭제

## 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. 새로운 브랜치 생성 (`feature/your-feature-name`)
3. 변경사항 커밋
4. Pull Request 생성

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 무료 배포 가이드 (Render.com)

Render.com을 사용하면 AWS보다 간단하고 무료로 애플리케이션을 배포할 수 있습니다.

### 1. Render.com 계정 생성
- [Render.com](https://render.com)에 가입
- GitHub 계정으로 로그인 (권장)

### 2. 프론트엔드 배포 (Static Site)
1. Render 대시보드에서 "New +" 클릭
2. "Static Site" 선택
3. GitHub 저장소 연결
4. 빌드 설정:
   - Build Command: `npm run build` 또는 `./render-build.sh`
   - Publish Directory: `frontend/build`
   - Root Directory: (비워두기)
5. 환경 변수 설정:
   ```
   REACT_APP_API_BASE_URL=https://your-backend-url.onrender.com
   REACT_APP_KAKAO_MAP_APP_KEY=your_kakao_map_api_key
   NODE_VERSION=18
   ```

#### 🔧 배포 문제 해결 가이드
- **빌드 실패 시**: 루트 디렉토리 `package.json`과 `render-build.sh` 스크립트 사용
- **ESLint 경고**: 이미 수정 완료 (빌드 성공)
- **서브모듈 문제**: 자동화된 빌드 스크립트로 해결

### 3. 데이터베이스 설정 (PostgreSQL)
1. Render 대시보드에서 "New +" 클릭
2. "PostgreSQL" 선택
3. 데이터베이스 설정:
   - Name: `lunch-app-db`
   - Database: `lunch_app`
   - User: `lunch_app_user`
   - Plan: **Free** (월 90일 제한)
4. External Database URL 복사 (백엔드 설정에서 사용)

### 4. 백엔드 배포 (Web Service)
1. Render 대시보드에서 "New +" 클릭
2. "Web Service" 선택
3. GitHub 저장소 연결
4. 서비스 설정:
   - Name: `lunch-app-backend`
   - Environment: `Go`
   - Build Command: `cd backend && go build -o main cmd/api/main.go`
   - Start Command: `cd backend && ./main`
   - Root Directory: (비워두기)
5. 환경 변수 설정:
   ```
   PORT=$PORT
   GIN_MODE=release
   DATABASE_URL=[위에서 복사한 PostgreSQL URL]
   ```

### 5. 배포 순서 및 주의사항
1. **PostgreSQL 데이터베이스 먼저 생성**하고 URL 확인
2. **백엔드 배포** 시 DATABASE_URL 환경변수 설정
3. **프론트엔드 배포** 시 백엔드 URL을 환경변수로 설정
4. **카카오맵 API 키**는 반드시 설정해야 함
5. 배포 후 프론트엔드에서 백엔드 연결 및 헬스체크 확인

### 6. 문제 해결
- **빌드 실패 시**: Render.com 로그에서 오류 확인
- **API 연결 실패 시**: 환경변수 `REACT_APP_API_BASE_URL` 확인
- **지도 로딩 실패 시**: `REACT_APP_KAKAO_MAP_APP_KEY` 확인

### 7. 최근 주요 업데이트 (2024-06-23)

#### ✅ **UI/UX 대폭 개선**
- **통합 PopupModal 시스템**: 모든 alert/confirm을 일관된 모달로 대체
- **브라우저 탭 제목**: "React App" → "Lunch App"으로 변경
- **실시간 백엔드 상태 모니터링**: 우상단 헬스 인디케이터 (10초 간격)
- **소요시간 표시**: 내 맛집 추천 시 도보/차량 예상 시간 제공
- **랜덤 추천**: 위치 기반 추천 목록 랜덤 배열

#### ✅ **데이터베이스 영구화**
- **PostgreSQL 도입**: 프로덕션 배포 시 데이터 보존
- **환경별 DB 선택**: 개발(SQLite) / 프로덕션(PostgreSQL) 자동 전환
- **한국 시간대 적용**: 모든 방문 기록이 Asia/Seoul 기준으로 표시

#### ✅ **백엔드 안정성 강화**
- **헬스체크 시스템**: `/health` 엔드포인트로 서버 상태 모니터링
- **CORS 정책 개선**: 프론트엔드 도메인 명시적 허용
- **API URL 통합**: 모든 API 호출이 환경변수 기반으로 동작

#### ✅ **배포 인프라 최적화**
- **render.yaml 설정**: 백엔드/프론트엔드 동시 배포 지원
- **환경변수 자동화**: DATABASE_URL, API_BASE_URL 자동 연결
- **빌드 최적화**: 타입 에러 완전 제거, 안정적 배포

#### ✅ **이전 수정사항 (2024-06-20)**
- **지도 검색 결과 클릭 네비게이션 문제 수정**
- **Render.com 배포 오류 수정**
- **ESLint 경고 완전 제거**

### 8. 프로젝트 파일 구조
```
lunch_app/
├── frontend/              # React 프론트엔드
├── backend/              # Go 백엔드
├── package.json          # 루트 빌드 설정
├── render-build.sh       # Render.com 배포 스크립트
├── render.yaml          # Render.com 서비스 구성
├── CLAUDE.md            # 개발 가이드라인
└── README.md            # 프로젝트 문서
```