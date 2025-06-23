# Lunch App 아키텍처 문서

## 전체 시스템 아키텍처

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Frontend<br/>TypeScript]
        A1[Components<br/>UI]
        A2[Hooks<br/>Business Logic]
        A3[API Layer<br/>HTTP Client]
        A4[State Management<br/>React Query]
        
        A --> A1
        A --> A2
        A --> A3
        A --> A4
    end
    
    subgraph "External APIs"
        B[Kakao Maps API]
        B1[Map Display]
        B2[Place Search]
        B3[Geolocation Services]
        
        B --> B1
        B --> B2
        B --> B3
    end
    
    subgraph "Backend Layer"
        C[Go Server<br/>Gin Framework]
        C1[API Routes<br/>/api/*, /health]
        C2[Handlers<br/>Business Logic]
        C3[Models<br/>Data Structures]
        C4[Database Layer<br/>GORM]
        C5[Middleware<br/>CORS, Logging]
        
        C --> C1
        C --> C2
        C --> C3
        C --> C4
        C --> C5
    end
    
    subgraph "Database Layer"
        D[Database]
        D1[Development<br/>SQLite]
        D2[Production<br/>PostgreSQL]
        D3[Restaurant Table]
        D4[Visit Table]
        D5[Auto Migration]
        
        D --> D1
        D --> D2
        D --> D3
        D --> D4
        D --> D5
    end
    
    A3 -.->|HTTP/HTTPS| B
    A3 -->|HTTP/HTTPS| C1
    C4 -->|Database Driver| D
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
```

## 프론트엔드 아키텍처

### Component Architecture

```mermaid
graph TD
    A[App.tsx<br/>메인 애플리케이션] --> B[Components]
    
    B --> B1[RecommendTab.tsx<br/>추천 탭]
    B --> B2[KakaoMap.tsx<br/>카카오맵 통합]
    B --> B3[MyRestaurantsTab.tsx<br/>내 맛집 관리]
    B --> B4[VisitsTab.tsx<br/>방문 기록 관리]
    B --> B5[PopupModal.tsx<br/>통합 모달 시스템]
    B --> B6[HealthIndicator.tsx<br/>헬스 모니터링]
    
    A --> C[Hooks]
    C --> C1[useHealthCheck.ts<br/>헬스체크 로직]
    
    A --> D[Utils]
    D --> D1[kakaoMapLoader.ts<br/>카카오맵 로더]
    
    A --> E[api.ts<br/>API 클라이언트]
    
    B1 --> B2
    B3 --> B5
    B4 --> B5
    B6 --> C1
    B1 --> D1
    B2 --> D1
    
    style A fill:#ff9999
    style B fill:#99ccff
    style C fill:#99ff99
    style D fill:#ffcc99
    style E fill:#cc99ff
```

### State Management Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    State Management                            │
├─────────────────────────────────────────────────────────────────┤
│  React Query (Server State)                                    │
│  ├── Restaurant Cache                                          │
│  ├── Visit Cache                                               │
│  ├── Auto Refetch                                              │
│  └── Error Handling                                            │
│                                                                 │
│  Local State (useState)                                        │
│  ├── UI State (modals, forms)                                  │
│  ├── Map State (position, markers)                             │
│  └── Component State                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as UI Component
    participant EH as Event Handler
    participant API as API Layer
    participant RQ as React Query
    participant BE as Backend API
    participant DB as Database
    
    U->>UI: User Interaction
    UI->>EH: Trigger Event
    EH->>API: API Call (api.ts)
    API->>RQ: Cache Check
    RQ->>BE: HTTP Request
    BE->>DB: Database Query
    DB-->>BE: Query Result
    BE-->>RQ: JSON Response
    RQ-->>API: Cached Data
    API-->>EH: Response Data
    EH-->>UI: State Update
    UI-->>U: Re-render UI
    
    Note over RQ,BE: 캐시된 데이터가 있으면<br/>네트워크 요청 생략
    Note over UI,U: React Query가<br/>자동으로 UI 업데이트
```

## 백엔드 아키텍처

### Layered Architecture

```mermaid
graph TD
    A[main.go<br/>애플리케이션 엔트리포인트] --> B[internal/]
    
    B --> C[routes/<br/>라우팅 계층]
    C --> C1[routes.go<br/>API 경로 정의]
    
    B --> D[handlers/<br/>핸들러 계층]
    D --> D1[restaurant_handler.go<br/>맛집 CRUD 로직]
    D --> D2[visit_handler.go<br/>방문기록 CRUD 로직]
    D --> D3[health_handler.go<br/>헬스체크 로직]
    
    B --> E[models/<br/>모델 계층]
    E --> E1[restaurant.go<br/>맛집 모델]
    E --> E2[visit.go<br/>방문기록 모델]
    E --> E3[user.go<br/>사용자 모델]
    
    B --> F[database/<br/>데이터 액세스]
    F --> F1[database.go<br/>DB 연결 및 설정]
    
    C1 --> D
    D --> E
    D --> F
    
    style A fill:#ffcccc
    style C fill:#ccffcc
    style D fill:#ccccff
    style E fill:#ffffcc
    style F fill:#ffccff
```

### Request Flow
```
HTTP Request
        │
        ▼
Gin Router
        │
        ▼
CORS Middleware
        │
        ▼
Route Handler
        │
        ▼
Business Logic
        │
        ▼
GORM (ORM)
        │
        ▼
Database
        │
        ▼
Response JSON
```

## 데이터베이스 아키텍처

### Database Schema
```sql
-- Restaurant Table
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
    deleted_at TIMESTAMP NULL
);

-- Visit Table
CREATE TABLE visits (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE SET NULL,
    visit_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL
);

-- Indexes for Performance
CREATE INDEX idx_restaurants_deleted_at ON restaurants(deleted_at);
CREATE INDEX idx_visits_deleted_at ON visits(deleted_at);
CREATE INDEX idx_visits_restaurant_id ON visits(restaurant_id);
CREATE INDEX idx_visits_visit_date ON visits(visit_date DESC);
```

### Database ER Diagram

```mermaid
erDiagram
    RESTAURANTS {
        uint id PK "Primary Key"
        string name "맛집 이름"
        string address "주소"
        float latitude "위도"
        float longitude "경도"
        string category "카테고리"
        string phone "전화번호"
        timestamp created_at "생성일"
        timestamp updated_at "수정일"
        timestamp deleted_at "삭제일(Soft Delete)"
    }
    
    VISITS {
        uint id PK "Primary Key"
        uint restaurant_id FK "맛집 ID(NULL 허용)"
        timestamp visit_date "방문일"
        timestamp created_at "생성일"
        timestamp updated_at "수정일"
        timestamp deleted_at "삭제일(Soft Delete)"
    }
    
    RESTAURANTS ||--o{ VISITS : "has many visits"
    
    note "맛집 삭제 시 방문기록의 restaurant_id는 NULL로 설정되어 기록이 보존됨"
```

### Data Relationships

```mermaid
graph LR
    A[Restaurant<br/>맛집] -->|1:N| B[Visit<br/>방문기록]
    A -->|Soft Delete| A1[deleted_at<br/>소프트 삭제]
    B -->|Foreign Key| B1[restaurant_id<br/>ON DELETE SET NULL]
    
    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style A1 fill:#ffebee
    style B1 fill:#fff3e0
```

## API 아키텍처

### RESTful API Design
```
Health Check:
GET    /health                 # 서버 상태 확인

Restaurants:
GET    /api/restaurants/       # 목록 조회
POST   /api/restaurants/       # 신규 생성
GET    /api/restaurants/{id}   # 상세 조회
DELETE /api/restaurants/{id}   # 삭제 (Soft Delete)

Visits:
GET    /api/visits/            # 목록 조회
POST   /api/visits/            # 신규 생성
DELETE /api/visits/{id}        # 삭제
```

### API Response Format
```json
{
  "status": "success|error",
  "data": { ... },
  "message": "descriptive message",
  "timestamp": "2024-06-23T10:30:00Z"
}
```

## 보안 아키텍처

### CORS Configuration
```go
cors.New(cors.Config{
    AllowOrigins:     []string{
        "https://lunch-app-spd2.onrender.com",
        "http://localhost:3000"
    },
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
    ExposeHeaders:    []string{"Content-Length"},
    AllowCredentials: true,
    MaxAge:          12 * time.Hour,
})
```

### Environment Variables
```
Frontend:
- REACT_APP_KAKAO_MAP_APP_KEY  # 카카오맵 API 키
- REACT_APP_API_BASE_URL       # 백엔드 서버 URL

Backend:
- PORT                         # 서버 포트
- GIN_MODE                     # release/debug
- DATABASE_URL                 # PostgreSQL 연결 문자열
```

## 배포 아키텍처

### Render.com Infrastructure

```mermaid
graph TB
    subgraph "Render.com Services"
        subgraph "Frontend (Static Site)"
            F1[CDN Distribution<br/>전세계 배포]
            F2[Automatic HTTPS<br/>SSL 인증서]
            F3[SPA Routing<br/>_redirects 설정]
        end
        
        subgraph "Backend (Web Service)"
            B1[Go Runtime Environment<br/>서버 실행 환경]
            B2[Automatic Scaling<br/>자동 확장]
            B3[Health Check Monitoring<br/>상태 모니터링]
        end
        
        subgraph "Database (PostgreSQL)"
            D1[Managed Database Service<br/>관리형 DB 서비스]
            D2[Automatic Backups<br/>자동 백업]
            D3[Connection Pooling<br/>연결 풀 관리]
        end
    end
    
    U[Users<br/>사용자] --> F1
    F1 --> B1
    B1 --> D1
    
    style F1 fill:#e1f5fe
    style B1 fill:#e8f5e8
    style D1 fill:#fff3e0
```

### CI/CD Pipeline

```mermaid
flowchart TD
    A[GitHub Push<br/>코드 푸시] --> B[Render.com Webhook<br/>자동 트리거]
    
    B --> C{Build Process<br/>빌드 프로세스}
    
    C --> D[Frontend Build<br/>npm run build]
    C --> E[Backend Build<br/>go build]
    
    D --> F[Static Site Deploy<br/>정적 사이트 배포]
    E --> G[Web Service Deploy<br/>웹 서비스 배포]
    
    F --> H[Health Check<br/>상태 확인]
    G --> H
    
    H --> I{Deploy Success?<br/>배포 성공?}
    
    I -->|Yes| J[Live Service<br/>서비스 운영]
    I -->|No| K[Rollback<br/>이전 버전으로 복원]
    
    K --> L[Error Notification<br/>오류 알림]
    
    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style C fill:#fff3e0
    style J fill:#e8f5e8
    style K fill:#ffebee
```

## 모니터링 아키텍처

### Health Check System

```mermaid
sequenceDiagram
    participant FE as Frontend<br/>Health Indicator
    participant BE as Backend<br/>/health Endpoint
    participant DB as Database
    
    loop Every 10 seconds
        FE->>BE: GET /health
        BE->>DB: Check Connectivity
        DB-->>BE: Connection Status
        BE-->>FE: Health Response
        Note over BE,FE: {<br/>  status: "healthy",<br/>  timestamp: "2024-06-23T...",<br/>  service: "lunch-app-backend",<br/>  version: "1.0.0"<br/>}
        FE->>FE: Update UI Status
    end
    
    Note over FE: 🟢 연결됨 / 🔴 연결 끊김<br/>실시간 상태 표시
```

### Error Handling Strategy
```
Frontend Error Boundary
        │
        ├── Component Errors
        ├── API Errors
        └── Network Errors
        │
        ▼
PopupModal System
        │
        ├── User-friendly Messages
        ├── Retry Mechanisms
        └── Fallback UI
```

## 성능 최적화 아키텍처

### Frontend Optimizations
- **React Query**: 서버 상태 캐싱 및 자동 갱신
- **Code Splitting**: 컴포넌트별 지연 로딩
- **Image Optimization**: 카카오맵 마커 최적화
- **Bundle Optimization**: Tree shaking 및 압축

### Backend Optimizations
- **Database Indexing**: 자주 쿼리되는 컬럼 인덱싱
- **Connection Pooling**: GORM 연결 풀 관리
- **GZIP Compression**: HTTP 응답 압축
- **Query Optimization**: N+1 문제 방지 (Preload 사용)

## 확장성 고려사항

### Horizontal Scaling
- **Stateless Backend**: 세션 상태 없는 RESTful API
- **Database Scaling**: PostgreSQL 읽기 복제본 추가 가능
- **CDN Integration**: 정적 자산 글로벌 배포

### Feature Extensibility
- **Plugin Architecture**: 새로운 맛집 카테고리 추가 용이
- **API Versioning**: 하위 호환성 유지
- **Microservice Migration**: 필요시 서비스 분리 가능

이 아키텍처는 현재 구현된 Lunch App의 전체적인 구조와 설계 원칙을 설명하며, 향후 확장과 유지보수를 위한 기반을 제공합니다.