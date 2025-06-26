import React, { useEffect, useRef, useState } from "react";
import { loadKakaoMapScript } from "../utils/kakaoMapLoader";
import PopupModal from "./PopupModal";
import MapErrorFallback from "./MapErrorFallback";

declare global {
  interface Window {
    kakao: any;
  }
}

// 기본 중심 좌표(서울) 정의
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 };

const KakaoMap: React.FC<{ onAddRestaurant?: (place: any) => void }> = ({ onAddRestaurant }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const markersRef = useRef<any[]>([]); // 마커들을 ref로 관리
  const [keyword, setKeyword] = useState("");
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [zoomLevel, setZoomLevel] = useState(4); // 기본 줌 레벨
  const [isSearching, setIsSearching] = useState(false); // 검색 중 상태
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 오픈 상태
  const [modalMessage, setModalMessage] = useState(""); // 모달 메시지
  const [mapError, setMapError] = useState<string | null>(null); // 지도 오류 상태

  // [주석] markers 상태가 변경될 때마다 ref 업데이트
  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  // [주석] 컴포넌트 마운트 시 내 위치를 가져와 상태에 저장
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setMyLocation(null); // 권한 거부 시 null
        }
      );
    }
  }, []);

  // [주석] 내 위치가 바뀔 때만 지도를 새로 초기화
  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadKakaoMapScript();
        if (!mapRef.current) return;
        const center = myLocation 
          ? new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng) 
          : new window.kakao.maps.LatLng(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng);
        const mapInstance = new window.kakao.maps.Map(mapRef.current, {
          center,
          level: zoomLevel,
        });
        setMap(mapInstance);
        setSdkLoaded(true);
        // [주석] 지도 줌 레벨 변경 이벤트 리스너 등록
        window.kakao.maps.event.addListener(mapInstance, 'zoom_changed', function() {
          setZoomLevel(mapInstance.getLevel());
        });
      } catch (error) {
        console.error('지도 초기화 실패:', error);
        setMapError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      }
    };
    initializeMap();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myLocation]);

  // 줌 인/아웃 핸들러
  const handleZoomIn = () => {
    if (map && zoomLevel > 1) {
      map.setLevel(zoomLevel - 1);
      setZoomLevel(zoomLevel - 1);
    }
  };

  const handleZoomOut = () => {
    if (map && zoomLevel < 14) {
      map.setLevel(zoomLevel + 1);
      setZoomLevel(zoomLevel + 1);
    }
  };

  // 검색 함수
  const handleSearch = () => {
    if (!map || !window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
      setModalMessage("지도를 불러오는 중이거나, services 객체가 준비되지 않았습니다. 새로고침 해보세요.");
      setIsModalOpen(true);
      return;
    }
    if (!keyword) {
      setModalMessage("검색어를 입력하세요.");
      setIsModalOpen(true);
      return;
    }
    setIsSearching(true); // 검색 시작
    try {
      const ps = new window.kakao.maps.services.Places();
      const searchOptions: any = {};
      if (myLocation) {
        searchOptions.location = new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng);
        searchOptions.radius = 10000; // 10km로 확장
      }
      ps.keywordSearch(
        keyword,
        (data: any, status: any) => {
          setIsSearching(false); // 검색 종료
          if (status === window.kakao.maps.services.Status.OK) {
            // 기존 마커 제거
            markersRef.current.forEach((m) => {
              if (m.infowindow) {
                m.infowindow.close();
              }
              m.setMap(null);
            });
            
            console.log("검색 결과 개수:", data.length);
            
            // 새로운 마커 배열 생성
            const newMarkers = data.map((place: any) => {
              console.log("마커 생성 중:", place.place_name, "위치:", place.y, place.x);
              
              // 마커 생성
              const markerPosition = new window.kakao.maps.LatLng(place.y, place.x);
              const marker = new window.kakao.maps.Marker({
                position: markerPosition,
                map: map  // 지도에 마커를 표시
              });
              
              // 인포윈도우 생성
              const infowindow = new window.kakao.maps.InfoWindow({
                content: `
                  <div style="padding:8px 12px;min-width:150px;">
                    <div style="font-weight:bold;margin-bottom:4px;">${place.place_name}</div>
                    <div style="font-size:12px;color:#666;">${place.address_name}</div>
                    ${place.phone ? `<div style="font-size:12px;color:#666;margin-top:4px;">${place.phone}</div>` : ''}
                  </div>
                `
              });
              
              // 마커에 인포윈도우 참조 저장
              marker.infowindow = infowindow;
              
              // 마커 클릭 이벤트 - 현재 마커들만 참조하도록 수정
              window.kakao.maps.event.addListener(marker, "click", () => {
                // 현재 마커들만 참조하여 다른 인포윈도우 닫기
                newMarkers.forEach((m: any) => {
                  if (m.infowindow && m !== marker) {
                    m.infowindow.close();
                  }
                });
                infowindow.open(map, marker);
              });
              
              return marker;
            });
            
            console.log("생성된 마커 개수:", newMarkers.length);
            
            // 마커 상태 업데이트
            setMarkers(newMarkers);
            setSearchResults(data);
            
            // 검색 결과가 있으면 지도 중심 이동 및 줌 레벨 조정
            if (data.length > 0) {
              // 첫 번째 결과로 지도 중심 이동 (즉시 실행)
              const firstPlace = data[0];
              const centerPosition = new window.kakao.maps.LatLng(firstPlace.y, firstPlace.x);
              
              console.log("지도 중심 이동:", centerPosition);
              map.setCenter(centerPosition);
              
              // 검색 결과에 따라 적절한 줌 레벨 설정
              let newZoomLevel;
              if (data.length > 1) {
                // 여러 결과가 있으면 첫 번째 결과를 중심으로 적당한 거리
                newZoomLevel = 4;
              } else {
                // 결과가 하나면 가까이 보기
                newZoomLevel = 3;
              }
              
              console.log("줌 레벨 설정:", newZoomLevel);
              map.setLevel(newZoomLevel);
              setZoomLevel(newZoomLevel);
              
              // 첫 번째 마커의 인포윈도우 바로 열기
              setTimeout(() => {
                if (newMarkers[0] && newMarkers[0].infowindow) {
                  newMarkers[0].infowindow.open(map, newMarkers[0]);
                  console.log("첫 번째 마커 인포윈도우 열기 완료");
                }
              }, 200);
            }
          } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
            setSearchResults([]);
            setMarkers([]);
            setModalMessage("반경 10Km 이내에 해당하는 음식점이 없습니다.");
            setIsModalOpen(true);
          } else {
            setSearchResults([]);
            setMarkers([]);
            setModalMessage("검색 중 오류가 발생했습니다. 다시 시도해 주세요.");
            setIsModalOpen(true);
          }
        },
        searchOptions
      );
    } catch (error) {
      setIsSearching(false);
      setSearchResults([]);
      setMarkers([]);
      setModalMessage("검색 중 오류가 발생했습니다. 다시 시도해 주세요.");
      setIsModalOpen(true);
    }
  };

  // 컴포넌트 언마운트 시 마커와 인포윈도우 정리
  useEffect(() => {
    return () => {
      markersRef.current.forEach((marker) => {
        if (marker.infowindow) {
          marker.infowindow.close();
        }
        marker.setMap(null);
      });
    };
  }, []);

  return (
    <div>
      {/* 모달 */}
      <PopupModal open={isModalOpen} message={modalMessage} onClose={() => setIsModalOpen(false)} />
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="border border-gray-300 px-4 py-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-primary-200"
          placeholder="맛집 또는 장소 검색"
          disabled={!sdkLoaded}
        />
        <button
          onClick={handleSearch}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
          disabled={!sdkLoaded}
        >
          검색
        </button>
      </div>
      
      <div className="relative">
        <div ref={mapRef} style={{ width: "100%", height: "400px" }} className="rounded-xl border border-gray-300" />
        
        {/* 확대/축소 버튼 - z-index 추가 */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
          <button 
            onClick={handleZoomIn}
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 focus:outline-none"
            disabled={!sdkLoaded || zoomLevel <= 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={handleZoomOut}
            className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 focus:outline-none"
            disabled={!sdkLoaded || zoomLevel >= 14}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* 검색 결과 목록/로딩/없음 안내 */}
      {isSearching && (
        <div className="flex items-center justify-center py-8 text-gray-500">
          <svg className="animate-spin h-5 w-5 mr-2 text-primary-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
          검색 중...
        </div>
      )}
      {!isSearching && searchResults.length === 0 && keyword && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
          <span className="text-3xl mb-2">🔍</span>
          <span>반경 10Km 이내에 해당하는 음식점이 없습니다.</span>
        </div>
      )}
      {searchResults.length > 0 && (
        <ul className="mt-4 bg-gray-50 rounded p-2">
          {searchResults.map((place, index) => (
            <li 
              key={place.id || place.place_url} 
              className="mb-2 p-2 border-b flex justify-between items-center hover:bg-gray-100 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (!map || !window.kakao || !window.kakao.maps) {
                  console.error('지도 또는 Kakao Maps API가 준비되지 않았습니다.');
                  return;
                }
                
                console.log('검색 결과 클릭:', place.place_name, 'Y:', place.y, 'X:', place.x);
                
                try {
                  // 해당 마커로 지도 중심 이동
                  const lat = parseFloat(place.y);
                  const lng = parseFloat(place.x);
                  
                  if (isNaN(lat) || isNaN(lng)) {
                    console.error('잘못된 좌표값:', place.y, place.x);
                    return;
                  }
                  
                  const markerPosition = new window.kakao.maps.LatLng(lat, lng);
                  
                  // 다른 모든 인포윈도우 먼저 닫기
                  markers.forEach((m) => {
                    if (m.infowindow) {
                      m.infowindow.close();
                    }
                  });
                  
                  // 즉시 지도 중심 이동
                  map.setCenter(markerPosition);
                  map.setLevel(3);
                  setZoomLevel(3);
                  
                  // 인포윈도우 열기
                  if (markers[index] && markers[index].infowindow) {
                    markers[index].infowindow.open(map, markers[index]);
                  }
                  
                  console.log('지도 이동 및 인포윈도우 열기 완료');
                  
                } catch (error) {
                  console.error('마커 이동 중 오류:', error);
                }
              }}
            >
              <div>
                <div className="font-semibold">{place.place_name}</div>
                <div className="text-sm text-gray-600">{place.address_name}</div>
                <div className="text-xs text-blue-600">
                  <a 
                    href={place.place_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()} // 링크 클릭 시 이벤트 전파 방지
                  >
                    카카오맵에서 보기
                  </a>
                </div>
              </div>
              {onAddRestaurant && (
                <button
                  className="ml-4 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={(e) => {
                    e.stopPropagation(); // 버튼 클릭 시 이벤트 전파 방지
                    onAddRestaurant(place);
                  }}
                >
                  맛집 추가
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default KakaoMap;