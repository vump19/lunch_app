import React from 'react';

interface MapErrorFallbackProps {
  error?: string;
}

const MapErrorFallback: React.FC<MapErrorFallbackProps> = ({ error }) => {
  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl mb-4">🗺️</div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        지도를 불러올 수 없습니다
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        카카오맵 API 설정에 문제가 있습니다.
      </p>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md">
        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">해결 방법:</p>
          <ol className="list-decimal list-inside space-y-1 text-left">
            <li>카카오 개발자 콘솔에서 도메인 등록 확인</li>
            <li>API 키 유효성 확인</li>
            <li>네트워크 연결 상태 확인</li>
          </ol>
        </div>
      </div>
      
      {error && (
        <details className="mt-4 text-xs text-gray-400">
          <summary className="cursor-pointer">오류 세부사항</summary>
          <pre className="mt-2 text-left bg-gray-50 p-2 rounded overflow-auto">
            {error}
          </pre>
        </details>
      )}
    </div>
  );
};

export default MapErrorFallback;