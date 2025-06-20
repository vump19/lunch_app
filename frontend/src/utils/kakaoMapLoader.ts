let isScriptLoading = false;
let isScriptLoaded = false;
let scriptLoadPromise: Promise<void> | null = null;

export const loadKakaoMapScript = (): Promise<void> => {
  // 이미 스크립트가 로드되어 있는 경우
  if (isScriptLoaded && window.kakao?.maps) {
    return Promise.resolve();
  }

  // 스크립트 로딩 중인 경우
  if (isScriptLoading && scriptLoadPromise) {
    return scriptLoadPromise;
  }

  // 새로운 스크립트 로딩 시작
  isScriptLoading = true;
  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    const appKey = process.env.REACT_APP_KAKAO_MAP_APP_KEY;
    if (!appKey) {
      reject(new Error('카카오맵 API 키가 설정되지 않았습니다.'));
      return;
    }

    // 기존 스크립트가 있다면 제거
    const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        isScriptLoaded = true;
        isScriptLoading = false;
        resolve();
      });
    };

    script.onerror = () => {
      isScriptLoading = false;
      scriptLoadPromise = null;
      reject(new Error('카카오맵 스크립트 로드 실패'));
    };

    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}; 