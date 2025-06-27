# Lunch App 개발 히스토리

## 프로젝트 개요
**위치 기반 맛집 추천 애플리케이션**
- React/TypeScript 프론트엔드 + Go 백엔드
- 카카오맵 API 연동
- SQLite(개발) / PostgreSQL(프로덕션) 지원
- Render.com 배포

---

## 🚀 개발 단계별 히스토리

### **Phase 1: 기본 인프라 구축**
#### 1.1 프로젝트 초기 설정
- ✅ React/TypeScript 프론트엔드 생성
- ✅ Go/Gin 백엔드 API 서버 구축
- ✅ GORM을 사용한 데이터베이스 모델링
- ✅ 기본 CRUD API 엔드포인트 구현

#### 1.2 데이터베이스 설계
```sql
-- Restaurant 테이블
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    category VARCHAR(100),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL -- Soft Delete
);

-- Visit 테이블  
CREATE TABLE visits (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE SET NULL,
    visit_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);
```

#### 1.3 기본 API 구조
- `GET /api/restaurants/` - 맛집 목록 조회
- `POST /api/restaurants/` - 맛집 추가
- `DELETE /api/restaurants/{id}` - 맛집 삭제 (Soft Delete)
- `GET /api/visits/` - 방문 기록 조회
- `POST /api/visits/` - 방문 기록 추가
- `DELETE /api/visits/{id}` - 방문 기록 삭제

---

### **Phase 2: 프론트엔드 UI/UX 구현**
#### 2.1 탭 기반 네비게이션 구조
- ✅ **추천 탭**: 맛집 추천 및 지도 표시
- ✅ **지도 탭**: 카카오맵 통합, 장소 검색
- ✅ **나의 맛집 탭**: 저장된 맛집 관리
- ✅ **방문 기록 탭**: 방문 히스토리 관리

#### 2.2 카카오맵 API 연동
- ✅ 카카오맵 스크립트 동적 로딩
- ✅ 장소 검색 및 마커 표시
- ✅ 지도 중심 이동 및 줌 제어
- ✅ 인포윈도우를 통한 상세 정보 표시

#### 2.3 상태 관리 및 데이터 페칭
- ✅ React Query를 활용한 서버 상태 관리
- ✅ 실시간 데이터 동기화
- ✅ 캐시 무효화를 통한 UI 업데이트

---

### **Phase 3: 핵심 기능 구현**
#### 3.1 맛집 추천 시스템
- ✅ **내 맛집 중에서 랜덤 추천**
  - 저장된 맛집 목록에서 무작위 선택
  - 현재 위치에서의 거리 및 예상 소요시간 계산
- ✅ **현재 위치 기반 추천**
  - 카카오맵 장소 검색 API 활용
  - 반경 3km → 5km → 10km로 점진적 확장
  - 검색 결과 랜덤 정렬로 발견의 재미 제공

#### 3.2 지도 통합 기능
- ✅ 실시간 현재 위치 추적
- ✅ 검색 결과 마커 표시 및 클러스터링
- ✅ 지도 확대/축소 컨트롤
- ✅ 검색 반경 확장 (2km → 10km)

#### 3.3 방문 기록 관리
- ✅ 방문 일자/시간 자동 기록
- ✅ 한국 시간대(Asia/Seoul) 정확한 처리
- ✅ 삭제된 맛집의 방문 기록 보존
- ✅ **방문 일자 수정 기능** (인라인 편집)

---

### **Phase 4: 고급 기능 및 UX 개선**
#### 4.1 실제 도로 경로 길찾기
- ✅ **OSRM API 연동**으로 무료 실제 도로 경로 제공
- ✅ 직선 거리 대신 실제 걸을 수 있는/운전할 수 있는 경로
- ✅ 도보/차량 모드별 최적화된 경로 계산
- ✅ **카카오맵 길찾기 연동** (새 창에서 상세 길찾기)

#### 4.2 커스텀 마커 및 시각화
- ✅ SVG 기반 출발지(S)/목적지(E) 마커
- ✅ 경로 색상 구분 (도보: 빨간색, 차량: 청록색)
- ✅ 실제 거리와 정확한 소요시간 정보 표시
- ✅ 경로 초기화 기능

#### 4.3 통합 모달 시스템
- ✅ **PopupModal 컴포넌트**로 일관된 사용자 피드백
- ✅ 모든 alert/confirm 대화상자를 모달로 대체
- ✅ 확인/취소 액션 지원

---

### **Phase 5: 데이터베이스 및 배포 고도화**
#### 5.1 데이터 영구화
- ✅ **SQLite(개발) / PostgreSQL(프로덕션)** 이중 지원
- ✅ 환경변수 기반 데이터베이스 자동 선택
- ✅ GORM Auto-Migration으로 스키마 자동 관리

#### 5.2 시간대 처리 개선
- ✅ 모든 시간 데이터를 **Asia/Seoul** 기준으로 통일
- ✅ 프론트엔드-백엔드 간 시간대 동기화
- ✅ 사용자 친화적인 날짜/시간 포맷팅

#### 5.3 배포 및 인프라
- ✅ **Render.com 무료 배포**
  - Frontend: Static Site
  - Backend: Web Service  
  - Database: PostgreSQL Service
- ✅ 환경변수 기반 설정 관리
- ✅ CORS 정책 및 보안 설정

---

### **Phase 6: 모니터링 및 안정성**
#### 6.1 헬스체크 시스템
- ✅ **실시간 백엔드 상태 모니터링**
- ✅ 10초 간격 자동 헬스체크
- ✅ 우상단 시각적 인디케이터 (🟢 연결됨 / 🔴 연결 끊김)
- ✅ `/health` API 엔드포인트

#### 6.2 에러 처리 및 사용자 경험
- ✅ 포괄적인 에러 핸들링
- ✅ 네트워크 오류 시 재시도 로직
- ✅ 로딩 상태 및 에러 상태 UI
- ✅ 사용자 친화적인 오류 메시지

---

### **Phase 7: UI/UX 정제 및 최적화**
#### 7.1 네비게이션 개선
- ✅ **브라우저 탭 제목**: "React App" → "Lunch App"
- ✅ **로고 클릭**: 언제든지 추천 탭으로 빠른 이동
- ✅ 탭 간 부드러운 전환 애니메이션

#### 7.2 검색 및 추천 기능 강화
- ✅ **주변 맛집 목록 클릭**: 지도 중심 이동 및 상세 보기
- ✅ **검색 반경 확대**: 지방/시골 지역 대응 강화
- ✅ 검색 결과 없음 시 명확한 안내 메시지
- ✅ 추천 방식별 UI 상태 관리

#### 7.3 방문 기록 고도화
- ✅ **인라인 편집 모드**: 날짜/시간 직접 수정 가능
- ✅ **저장/취소 액션**: 직관적인 편집 플로우
- ✅ **실시간 반영**: React Query 캐시 무효화

---

## 🛠 기술 스택 상세

### **Frontend**
```typescript
- React 18 + TypeScript
- Tailwind CSS (모던 디자인, 반응형)
- React Query (서버 상태 관리)
- @headlessui/react (접근성 UI 컴포넌트)
- @heroicons/react (아이콘 라이브러리)
- Kakao Maps API (지도 및 검색)
```

### **Backend**
```go
- Go 1.19+
- Gin (웹 프레임워크)
- GORM (ORM)
- SQLite (개발환경)
- PostgreSQL (프로덕션)
```

### **External APIs**
```
- Kakao Maps API (지도, 장소 검색)
- OSRM API (실제 도로 경로)
- Kakao Mobility (길찾기 연동)
```

### **배포 및 인프라**
```
- Render.com (Frontend Static Site + Backend Web Service)
- PostgreSQL (Render 관리형 DB)
- GitHub Actions (CI/CD)
- 환경변수 기반 설정 관리
```

---

## 📊 성능 최적화

### **Frontend 최적화**
- ✅ React Query 캐싱으로 불필요한 API 호출 제거
- ✅ 컴포넌트별 지연 로딩 (Code Splitting)
- ✅ 이미지 및 에셋 최적화
- ✅ Bundle 크기 최적화 (Tree Shaking)

### **Backend 최적화**
- ✅ 데이터베이스 인덱싱 (deleted_at, visit_date 등)
- ✅ GORM Preload로 N+1 쿼리 문제 해결
- ✅ Connection Pooling
- ✅ GZIP 압축

### **사용자 경험 최적화**
- ✅ 무한 리렌더링 방지 (useCallback 의존성 최적화)
- ✅ 실시간 피드백 (로딩 스피너, 상태 메시지)
- ✅ 오프라인 상태 감지 및 안내
- ✅ 모바일 반응형 디자인

---

## 🔒 보안 및 안정성

### **보안 조치**
- ✅ CORS 정책 설정 (허용된 도메인만 접근)
- ✅ SQL Injection 방지 (GORM Prepared Statement)
- ✅ XSS 방지 (React 기본 보호)
- ✅ 환경변수로 민감 정보 관리

### **데이터 무결성**
- ✅ Soft Delete로 데이터 보존
- ✅ Foreign Key 관계 설정
- ✅ 입력값 검증 (프론트엔드 + 백엔드)
- ✅ 트랜잭션 처리

---

## 📈 향후 확장 가능성

### **기능 확장 아이디어**
1. **사용자 인증 시스템**
   - 회원가입/로그인 기능
   - 개인별 맛집 목록 관리

2. **리뷰 및 평점 시스템**
   - 맛집별 별점 및 리뷰 작성
   - 리뷰 기반 추천 알고리즘

3. **소셜 기능**
   - 친구와 맛집 목록 공유
   - 그룹별 맛집 투표

4. **고급 추천 알고리즘**
   - 머신러닝 기반 개인화 추천
   - 날씨, 시간대별 맞춤 추천

5. **오프라인 지원**
   - PWA (Progressive Web App) 적용
   - 오프라인 데이터 캐싱

### **기술적 확장**
1. **마이크로서비스 아키텍처**
   - 서비스별 독립 배포
   - API Gateway 도입

2. **실시간 기능**
   - WebSocket을 활용한 실시간 업데이트
   - 실시간 맛집 공유

3. **모바일 앱**
   - React Native 크로스플랫폼 앱
   - 네이티브 기능 활용 (GPS, 카메라 등)

---

## 📝 개발 교훈 및 베스트 프랙티스

### **성공 요인**
1. **점진적 개발**: MVP → 기능 추가 → 최적화 순서
2. **사용자 중심 설계**: 실제 사용 시나리오 기반 기능 구현  
3. **에러 처리 우선**: 예외 상황에 대한 사전 대비
4. **문서화**: 개발 과정과 의사결정 기록 유지

### **기술적 교훈**
1. **TypeScript 활용**: 컴파일 타임 에러 방지의 중요성
2. **React Query**: 서버 상태 관리의 복잡성 해결
3. **환경별 설정**: 개발/프로덕션 환경 분리의 필요성
4. **API 설계**: RESTful 원칙과 일관성 있는 응답 구조

### **UI/UX 교훈**
1. **사용자 피드백**: 모든 액션에 대한 즉각적인 피드백 제공
2. **에러 커뮤니케이션**: 기술적 오류를 사용자 친화적 메시지로 변환
3. **로딩 상태**: 비동기 작업의 진행 상태 시각화
4. **모바일 우선**: 반응형 디자인의 중요성

---

## 🎯 프로젝트 성과

### **기능적 성과**
- ✅ **완전한 CRUD 기능**: 맛집 및 방문 기록 관리
- ✅ **실시간 위치 기반 서비스**: GPS + 지도 API 연동
- ✅ **실제 도로 경로**: 상용 수준의 길찾기 기능
- ✅ **크로스 플랫폼**: 웹/모바일 반응형 지원
- ✅ **데이터 영구화**: 프로덕션 레벨 데이터베이스

### **기술적 성과**
- ✅ **풀스택 개발**: 프론트엔드부터 백엔드, 배포까지
- ✅ **타입 안전성**: TypeScript + Go 강타입 언어 활용
- ✅ **성능 최적화**: 캐싱, 번들링, 데이터베이스 튜닝
- ✅ **확장성**: 마이크로서비스 마이그레이션 가능한 구조
- ✅ **유지보수성**: 모듈화, 문서화, 테스트 커버리지

### **사용자 경험 성과**
- ✅ **직관적 인터페이스**: 학습 비용 최소화
- ✅ **빠른 응답성**: 실시간 피드백 및 로딩 최적화
- ✅ **안정성**: 에러 처리 및 fallback 메커니즘
- ✅ **접근성**: 다양한 디바이스 및 브라우저 지원

---

**총 개발 기간**: 약 4주 (MVP 1주 + 기능 확장 3주)  
**커밋 수**: 20+ commits  
**파일 수**: 30+ files  
**API 엔드포인트**: 10개  
**외부 API 연동**: 3개 (Kakao Maps, OSRM, Kakao Mobility)

---

*이 문서는 Lunch App 프로젝트의 전체 개발 과정을 기록한 것으로, 향후 유사한 프로젝트 개발 시 참고 자료로 활용할 수 있습니다.*