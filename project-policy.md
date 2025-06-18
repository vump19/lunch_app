# Project Policy

## Code Style Guidelines

### HTML and JSX
- Do not use HTML entities (&lt;, &gt;, &quot;, &apos;, &amp;) in code. 
- Instead, use the actual characters (<, >, ", ', &) directly in your source code.
- For JSX attributes, use double quotes (&quot;) or single quotes (&#39;) consistently.

### TypeScript/JavaScript
- Use consistent indentation (2 spaces recommended).
- Use semicolons at the end of statements.
- Prefer const over let when variables are not reassigned.
- Use meaningful variable and function names.

### CSS/Tailwind
- Follow the Tailwind CSS class naming conventions.
- Group related classes together for readability.

## Development Workflow
- Test your code locally before committing.
- Ensure there are no compilation errors or warnings.
- Follow the Git commit message conventions.

## API Integration
- Use consistent error handling patterns.
- Document API endpoints and their expected responses.

## 코드 품질 및 유지보수 정책

### 1. React 컴포넌트 작성 규칙

#### 1.1 상태 관리
- 사용하지 않는 상태 변수는 즉시 제거
- `useState` 훅으로 선언된 상태 변수는 반드시 사용되어야 함
- 상태 변수명은 명확하고 구체적으로 작성 (예: `isMapLoaded`, `currentLocation`)

#### 1.2 useEffect 의존성
- `useEffect` 훅의 의존성 배열은 반드시 사용되는 모든 외부 변수를 포함
- 의존성 배열에서 특정 변수를 제외해야 할 경우, 주석으로 이유를 명시
- 위치 정보(`lat`, `lng`)와 같은 중요 데이터는 의존성 배열에 반드시 포함

#### 1.3 컴포넌트 구조
- 하나의 컴포넌트 파일은 300줄을 넘지 않도록 유지
- 300줄 이상의 컴포넌트는 적절히 분리하여 재사용 가능한 컴포넌트로 구성
- 복잡한 로직은 커스텀 훅으로 분리

### 2. TypeScript 사용 규칙

#### 2.1 타입 정의
- 모든 props와 상태는 명시적인 타입 정의 필수
- `any` 타입 사용은 최소화하고, 불가피한 경우 주석으로 이유 명시
- 인터페이스는 재사용 가능한 경우 별도 타입 파일로 분리

#### 2.2 전역 타입 선언
- 전역 객체 확장(예: `window.kakao`)은 `declare global` 블록 내에서 정의
- 전역 타입 선언은 별도 파일(`types.d.ts`)로 분리 권장

### 3. API 및 외부 서비스 통합

#### 3.1 카카오맵 API
- API 키는 반드시 환경 변수로 관리
- API 초기화 실패 시 적절한 에러 처리 및 사용자 피드백 제공
- 지도 관련 이벤트 리스너는 컴포넌트 언마운트 시 정리

#### 3.2 에러 처리
- 모든 API 호출은 try-catch로 에러 처리
- 사용자에게 표시되는 에러 메시지는 한글로 작성
- 개발자용 로그는 `console.error`로 출력

### 4. 성능 최적화

#### 4.1 렌더링 최적화
- 불필요한 리렌더링 방지를 위해 `React.memo` 적절히 사용
- 큰 리스트 렌더링 시 가상화(virtualization) 고려
- 이미지 최적화 및 지연 로딩 적용

#### 4.2 메모리 관리
- 이벤트 리스너, 타이머, 구독 등은 반드시 정리
- 대용량 데이터는 페이지네이션 또는 무한 스크롤 적용
- 불필요한 상태 업데이트 최소화

### 5. 코드 리뷰 체크리스트

- [ ] ESLint 경고가 모두 해결되었는가?
- [ ] TypeScript 타입이 적절히 정의되었는가?
- [ ] 불필요한 주석이나 디버그 코드가 제거되었는가?
- [ ] 에러 처리가 적절히 구현되었는가?
- [ ] 성능에 영향을 주는 코드가 있는가?
- [ ] 테스트가 필요한 부분이 있는가?

### 6. 문서화

#### 6.1 코드 문서화
- 복잡한 비즈니스 로직은 주석으로 설명
- 컴포넌트 props는 JSDoc으로 문서화
- API 응답 타입은 명확히 정의

#### 6.2 커밋 메시지
- 커밋 메시지는 한글로 작성
- 변경 사항의 목적과 영향을 명확히 설명
- 관련 이슈 번호 포함