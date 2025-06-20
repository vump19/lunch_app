let isScriptLoading = false;
let isScriptLoaded = false;
let scriptLoadPromise: Promise<void> | null = null;

export const loadKakaoMapScript = (): Promise<void> => {
  console.log('🔍 카카오맵 스크립트 로더 시작');
  
  // HTML에서 이미 스크립트가 로드되어 있는지 확인
  if (window.kakao && window.kakao.maps) {
    console.log('✅ 카카오맵 스크립트가 이미 HTML에서 로드됨');
    return new Promise((resolve) => {
      window.kakao.maps.load(() => {
        console.log('✅ HTML에서 로드된 카카오맵 API 초기화 완료!');
        isScriptLoaded = true;
        resolve();
      });
    });
  }

  // 이미 스크립트가 로드되어 있는 경우
  if (isScriptLoaded && window.kakao?.maps) {
    return Promise.resolve();
  }

  // 스크립트 로딩 중인 경우
  if (isScriptLoading && scriptLoadPromise) {
    return scriptLoadPromise;
  }

  // 새로운 스크립트 로딩 시작 (동적 로딩)
  isScriptLoading = true;
  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    const appKey = process.env.REACT_APP_KAKAO_MAP_APP_KEY;
    console.log('🔑 Kakao Maps API Key 상태:', appKey ? '설정됨' : '누락됨');
    console.log('🔑 API Key 값 (첫 8자리):', appKey ? appKey.substring(0, 8) + '...' : 'N/A');
    console.log('🌐 현재 도메인:', window.location.origin);
    
    if (!appKey) {
      const errorMsg = '카카오맵 API 키가 설정되지 않았습니다. Render.com 환경 변수 REACT_APP_KAKAO_MAP_APP_KEY를 확인하세요.';
      console.error(errorMsg);
      reject(new Error(errorMsg));
      return;
    }

    console.log('⚠️ HTML 스크립트 로드 실패, 동적 로딩 시도...');

    // 기존 스크립트가 있다면 제거
    const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
    script.async = true;

    script.onload = () => {
      console.log('✅ 동적 카카오맵 스크립트 로드 성공!');
      window.kakao.maps.load(() => {
        console.log('✅ 동적 카카오맵 API 초기화 완료!');
        isScriptLoaded = true;
        isScriptLoading = false;
        resolve();
      });
    };

    script.onerror = (error) => {
      isScriptLoading = false;
      scriptLoadPromise = null;
      console.error('🚨 동적 카카오맵 스크립트 로드도 실패:', error);
      console.error('스크립트 URL:', script.src);
      console.error('현재 도메인:', window.location.origin);
      console.error('📋 해결 방법:');
      console.error('1. 카카오 개발자 콘솔에서 도메인 등록 재확인');
      console.error('2. API 키 유효성 확인');
      console.error('3. 30분 후 다시 시도 (설정 전파 시간)');
      reject(new Error('카카오맵 스크립트 로드 실패. 도메인 등록 확인 또는 30분 후 재시도.'));
    };

    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}; 