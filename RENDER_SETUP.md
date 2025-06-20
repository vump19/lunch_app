# Render.com 환경 설정 가이드

## 🔧 카카오맵 API 키 설정 (필수)

현재 사이트는 성공적으로 배포되었지만 카카오맵 API 키가 누락되어 지도 기능이 작동하지 않습니다.

### 설정 방법:

1. **Render.com 대시보드 접속**
   - https://dashboard.render.com 로그인
   - `lunch-app-frontend` 서비스 클릭

2. **환경 변수 추가**
   - 좌측 메뉴에서 **Environment** 클릭
   - **Add Environment Variable** 버튼 클릭
   - 다음 정보 입력:
     ```
     Key: REACT_APP_KAKAO_MAP_APP_KEY
     Value: 7cfe6b7dc56bedfec53e2cdf7ac0b079
     ```
   - **Save Changes** 클릭

3. **자동 재배포 확인**
   - 환경 변수 저장 후 자동으로 재배포 시작됨
   - **Events** 탭에서 배포 진행 상황 확인
   - 약 3-5분 소요

4. **배포 완료 후 테스트**
   - https://lunch-app-spd2.onrender.com 접속
   - 브라우저 개발자 도구 콘솔에서 다음 메시지 확인:
     ```
     Kakao Maps API Key 확인: 설정됨
     ```

## 🔍 문제 해결

### 카카오맵이 여전히 로드되지 않는 경우:

1. **브라우저 캐시 삭제**
   - 하드 새로고침: `Ctrl+Shift+R` (또는 `Cmd+Shift+R`)

2. **환경 변수 재확인**
   - Render.com → Environment 탭에서 키 값 확인
   - 오타나 공백 없는지 확인

3. **콘솔 로그 확인**
   - F12 → Console 탭
   - 카카오맵 관련 오류 메시지 확인

4. **수동 재배포**
   - Render.com → Manual Deploy 버튼 클릭

## ✅ 성공 확인 방법

배포가 성공하면 다음 기능들이 정상 작동해야 합니다:

- 🗺️ 지도 표시
- 🔍 장소 검색
- 📍 마커 표시
- 🏪 맛집 추가 기능

## 📞 추가 지원

문제가 지속되면:
1. 브라우저 개발자 도구 콘솔 스크린샷 제공
2. Render.com 빌드 로그 확인
3. 환경 변수 설정 재확인