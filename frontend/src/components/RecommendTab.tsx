import React, { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRestaurants } from "../api";
import { loadKakaoMapScript } from "../utils/kakaoMapLoader";

// eslint-disable-next-line @typescript-eslint/no-explicit-any

// 전역 타입 선언 추가
declare global {
  interface Window {
    kakao: any;
  }
}

// Restaurant 인터페이스 정의
interface Restaurant {
  ID?: number;  // ID를 선택적으로 변경 (카카오 검색 결과는 ID가 없음)
  Name: string;
  Address: string;
  Latitude: number;
  Longitude: number;
  Category: string;
  Phone: string;
  distance?: number;
  place_url?: string;  // 카카오 검색 결과의 장소 URL 추가
}

// 거리 정보가 포함된 맛집 타입
type NearbyRestaurant = Restaurant & { distance: number };

// 두 좌표 간 거리(m) 계산 함수
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 거리 기반 예상 소요시간 계산 함수
function calculateTravelTime(distanceInMeters: number) {
  // 도보: 평균 시속 4km/h (67m/min)
  const walkingMinutes = Math.round(distanceInMeters / 67);
  // 차량: 평균 시속 25km/h (417m/min) - 도심 기준
  const drivingMinutes = Math.round(distanceInMeters / 417);
  
  return {
    walking: Math.max(1, walkingMinutes), // 최소 1분
    driving: Math.max(1, drivingMinutes)  // 최소 1분
  };
}

const RecommendTab: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [infowindow, setInfowindow] = useState<any>(null);  // 인포윈도우 상태 추가
  const [recommendType, setRecommendType] = useState<"my" | "location" | null>(null);
  const [recommendedRestaurant, setRecommendedRestaurant] = useState<Restaurant | null>(null);
  const [travelTime, setTravelTime] = useState<{walking: number, driving: number} | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<NearbyRestaurant[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isGeometryLoaded] = useState(false);
  const [searchService, setSearchService] = useState<any>(null);
  const [isSearchServiceLoaded, setIsSearchServiceLoaded] = useState(false);
  // const [isListExpanded] = useState(true);  // 목록 펼침/접기 상태 추가
  // const queryClient = useQueryClient();
  const [markers, setMarkers] = useState<any[]>([]);  // 마커 배열 상태 추가
  const [infowindows, setInfowindows] = useState<any[]>([]);  // 인포윈도우 배열 상태 추가
  const [directionsService, setDirectionsService] = useState<any>(null);  // 길찾기 서비스 상태 추가
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);  // 길찾기 렌더러 상태 추가
  
  // [주석] 맛집 데이터 가져오기 (React Query)
  const { data: restaurants, isLoading } = useQuery({
    queryKey: ["restaurants"],
    queryFn: fetchRestaurants,
  });

  // [주석] 컴포넌트 마운트 시 내 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (error) => {
          console.error("위치 정보를 가져오는데 실패했습니다:", error);
          alert("위치 정보를 가져오는데 실패했습니다. 위치 권한을 확인해주세요.");
        }
      );
    } else {
      alert("이 브라우저에서는 위치 기능을 지원하지 않습니다.");
    }
  }, []);

  // [주석] 카카오맵 스크립트 로드 및 지도 초기화
  useEffect(() => {
    const initializeMap = async () => {
      try {
        await loadKakaoMapScript();
        if (!mapRef.current) return;
        const mapInstance = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(
            currentLocation?.lat || 37.5665,
            currentLocation?.lng || 126.9780
          ),
          level: 3,
        });
        setMap(mapInstance);
        setIsMapLoaded(true);
        // [주석] 검색 서비스 초기화
        const places = new window.kakao.maps.services.Places();
        setSearchService(places);
        setIsSearchServiceLoaded(true);
        
        // [주석] 길찾기 서비스 초기화 (카카오맵에서는 외부 API 사용)
        // 카카오맵 자체 길찾기 기능 대신 Polyline을 사용한 직선 경로 표시
      } catch (error) {
        console.error("지도 초기화 실패:", error);
        alert("지도 초기화에 실패했습니다. 페이지를 새로고침해주세요.");
      }
    };
    if (!map) {
      initializeMap();
    }
  }, [map, currentLocation?.lat, currentLocation?.lng]);

  // currentLocation이 바뀔 때 지도 중심만 이동
  useEffect(() => {
    if (map && currentLocation) {
      const newCenter = new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);
      map.setCenter(newCenter);
      
      // 현재 위치에 마커 표시
      const currentMarker = new window.kakao.maps.Marker({
        position: newCenter,
        map: map
      });
      
      // 현재 위치 마커는 다른 마커들과 별도로 관리
      return () => {
        currentMarker.setMap(null);
      };
    }
  }, [currentLocation, map]);

  // 마커와 인포윈도우를 모두 제거하는 함수
  const clearMarkers = useCallback(() => {
    setMarkers(prevMarkers => {
      prevMarkers.forEach(marker => marker.setMap(null));
      return [];
    });
    setInfowindows(prevInfowindows => {
      prevInfowindows.forEach(infowindow => infowindow.close());
      return [];
    });
    
    // 기존 경로 제거
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }
  }, [directionsRenderer]);

  // OSRM API를 사용한 길찾기 함수 (무료)
  const getRouteFromOSRM = async (
    startLat: number, 
    startLng: number, 
    endLat: number, 
    endLng: number, 
    travelMode: 'WALKING' | 'DRIVING'
  ) => {
    try {
      const profile = travelMode === 'WALKING' ? 'foot' : 'driving';
      const apiUrl = `https://router.project-osrm.org/route/v1/${profile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('OSRM API 호출 실패:', error);
      return null;
    }
  };

  // 카카오맵 길찾기 페이지를 새 창에서 열기
  const openKakaoNavigation = (travelMode: 'WALKING' | 'DRIVING') => {
    if (!currentLocation || !recommendedRestaurant) return;
    
    const { lat: startLat, lng: startLng } = currentLocation;
    const { Latitude: endLat, Longitude: endLng } = recommendedRestaurant;
    
    // 카카오맵 길찾기 URL
    const kakaoMapUrl = `https://map.kakao.com/link/to/${encodeURIComponent(recommendedRestaurant.Name)},${endLat},${endLng}/from/현재위치,${startLat},${startLng}`;
    
    window.open(kakaoMapUrl, '_blank');
  };

  // 경로 표시 함수
  const showRoute = useCallback(async (travelMode: 'WALKING' | 'DRIVING') => {
    if (!currentLocation || !recommendedRestaurant || !map) {
      console.error("경로를 표시할 수 없습니다:", { currentLocation, recommendedRestaurant, map });
      return;
    }

    // 기존 마커와 경로 모두 제거
    setMarkers(prevMarkers => {
      prevMarkers.forEach(marker => marker.setMap(null));
      return [];
    });
    setInfowindows(prevInfowindows => {
      prevInfowindows.forEach(infowindow => infowindow.close());
      return [];
    });
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }

    // 출발지와 목적지 좌표
    const startLatLng = new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng);
    const endLatLng = new window.kakao.maps.LatLng(recommendedRestaurant.Latitude, recommendedRestaurant.Longitude);

    // OSRM API 호출하여 실제 도로 경로 가져오기
    const routeData = await getRouteFromOSRM(
      currentLocation.lat, 
      currentLocation.lng, 
      recommendedRestaurant.Latitude, 
      recommendedRestaurant.Longitude, 
      travelMode
    );

    let routePath: any[] = [];
    let routeInfo = { distance: 0, duration: 0 };
    
    if (routeData && routeData.routes && routeData.routes.length > 0) {
      // OSRM API에서 받은 실제 경로 좌표들을 사용
      const route = routeData.routes[0];
      const coordinates = route.geometry.coordinates;
      
      // OSRM은 [lng, lat] 형태로 반환하므로 변환
      routePath = coordinates.map((coord: [number, number]) => 
        new window.kakao.maps.LatLng(coord[1], coord[0])
      );
      
      // 거리와 시간 정보 저장
      routeInfo.distance = route.distance; // 미터
      routeInfo.duration = route.duration; // 초
    }
    
    // API 호출 실패시 직선 경로로 대체
    if (routePath.length === 0) {
      console.warn('OSRM API 실패, 직선 경로로 대체');
      routePath = [startLatLng, endLatLng];
    }

    // 먼저 지도 범위 조정
    const bounds = new window.kakao.maps.LatLngBounds();
    routePath.forEach((point: any) => bounds.extend(point));
    map.setBounds(bounds);

    // 지도 움직임이 완료된 후 polyline 그리기
    setTimeout(() => {
      const polyline = new window.kakao.maps.Polyline({
        path: routePath,
        strokeWeight: 6,
        strokeColor: travelMode === 'WALKING' ? '#FF6B6B' : '#4ECDC4',
        strokeOpacity: 0.9,
        strokeStyle: 'solid',
        zIndex: 1000
      });

      // Polyline을 지도에 표시
      polyline.setMap(map);
      setDirectionsRenderer(polyline);
    }, 100);

    // 출발지 마커 (사용자 정의 이미지) - 한글 문제 해결을 위해 URL 인코딩 사용
    const startSvg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#FF6B6B" stroke="white" stroke-width="3"/>
        <circle cx="16" cy="16" r="8" fill="white"/>
        <text x="16" y="20" text-anchor="middle" fill="#FF6B6B" font-size="10" font-weight="bold">S</text>
      </svg>
    `;
    
    const startMarkerImage = new window.kakao.maps.MarkerImage(
      'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(startSvg),
      new window.kakao.maps.Size(32, 32),
      { offset: new window.kakao.maps.Point(16, 16) }
    );

    const startMarker = new window.kakao.maps.Marker({
      position: startLatLng,
      map: map,
      image: startMarkerImage,
      zIndex: 2000
    });

    // 목적지 마커 (사용자 정의 이미지) - 한글 문제 해결을 위해 URL 인코딩 사용
    const endSvg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#4ECDC4" stroke="white" stroke-width="3"/>
        <circle cx="16" cy="16" r="8" fill="white"/>
        <text x="16" y="20" text-anchor="middle" fill="#4ECDC4" font-size="10" font-weight="bold">E</text>
      </svg>
    `;

    const endMarkerImage = new window.kakao.maps.MarkerImage(
      'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(endSvg),
      new window.kakao.maps.Size(32, 32),
      { offset: new window.kakao.maps.Point(16, 16) }
    );

    const endMarker = new window.kakao.maps.Marker({
      position: endLatLng,
      map: map,
      image: endMarkerImage,
      zIndex: 2000
    });

    // 마커들을 배열에 저장
    const newMarkers = [startMarker, endMarker];
    setMarkers(newMarkers);

    // 인포윈도우 생성
    const startInfowindow = new window.kakao.maps.InfoWindow({
      content: `<div style="padding:8px;font-size:12px;color:#FF6B6B;font-weight:bold;text-align:center;">
        📍 출발지 (Start)<br><span style="font-size:10px;color:#666;">현재 위치</span>
      </div>`
    });
    
    // 거리와 시간 정보 표시
    let distanceText = '';
    let timeText = '';
    if (routeInfo.distance > 0) {
      const distance = Math.round(routeInfo.distance / 1000 * 10) / 10; // km
      const duration = Math.round(routeInfo.duration / 60); // 분
      distanceText = distance < 1 ? `${Math.round(routeInfo.distance)}m` : `${distance}km`;
      timeText = `${duration}분`;
    } else {
      const time = travelMode === 'WALKING' ? travelTime?.walking : travelTime?.driving;
      timeText = `약 ${time}분`;
    }
    
    const endInfowindow = new window.kakao.maps.InfoWindow({
      content: `<div style="padding:8px;font-size:12px;color:#4ECDC4;font-weight:bold;text-align:center;">
        🎯 목적지 (End)<br>
        <div style="font-size:11px;color:#333;margin:2px 0;">${recommendedRestaurant.Name}</div>
        <span style="font-size:10px;color:#666;">${distanceText} · ${timeText}</span>
      </div>`
    });

    // 인포윈도우 열기
    startInfowindow.open(map, startMarker);
    endInfowindow.open(map, endMarker);
    
    const newInfowindows = [startInfowindow, endInfowindow];
    setInfowindows(newInfowindows);
  }, [currentLocation, recommendedRestaurant, map, directionsRenderer, travelTime]);

  // 위치 기반 추천 (카카오맵 검색 사용)
  const recommendByLocation = useCallback(() => {
    if (!currentLocation) {
      alert("현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.");
      return;
    }
    if (!isSearchServiceLoaded || !searchService || !map) {
      alert("검색 서비스를 초기화하는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    // 추천 유형 변경 시 소요시간 정보 초기화
    setTravelTime(null);
    setRecommendType("location");
    setRecommendedRestaurant(null);

    // 기존 마커와 인포윈도우 제거
    setMarkers(prevMarkers => {
      prevMarkers.forEach(marker => marker.setMap(null));
      return [];
    });
    setInfowindows(prevInfowindows => {
      prevInfowindows.forEach(infowindow => infowindow.close());
      return [];
    });
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }

    const searchOptions = {
      location: new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng),
      radius: 3000,
      sort: window.kakao.maps.services.SortBy.DISTANCE,
      category_group_code: 'FD6'
    };

    searchService.keywordSearch('맛집', (results: any[], status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const restaurantsWithDistance = results.map((place) => {
          const distance = getDistanceFromLatLonInMeters(
            currentLocation.lat,
            currentLocation.lng,
            place.y,
            place.x
          );
          return {
            Name: place.place_name,
            Address: place.address_name,
            Latitude: parseFloat(place.y),
            Longitude: parseFloat(place.x),
            Category: place.category_name,
            Phone: place.phone || '전화번호 없음',
            distance,
            place_url: place.place_url
          };
        });

        // 배열을 랜덤하게 섞기 (Fisher-Yates shuffle)
        const shuffledRestaurants = [...restaurantsWithDistance];
        for (let i = shuffledRestaurants.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledRestaurants[i], shuffledRestaurants[j]] = [shuffledRestaurants[j], shuffledRestaurants[i]];
        }

        setNearbyRestaurants(shuffledRestaurants);

        // 검색 결과를 지도에 표시 (랜덤 순서 적용)
        const newMarkers: any[] = [];
        const newInfowindows: any[] = [];

        shuffledRestaurants.forEach((place) => {
          const position = new window.kakao.maps.LatLng(place.Latitude, place.Longitude);
          
          // 마커 생성
          const marker = new window.kakao.maps.Marker({
            position: position,
            map: map
          });
          newMarkers.push(marker);

          // 인포윈도우 생성
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `
              <div style="padding:5px;font-size:12px;width:200px;">
                <div style="font-weight:bold;margin-bottom:5px;">${place.Name}</div>
                <div style="font-size:11px;color:#666;">
                  <div>${place.Address}</div>
                  <div>${place.Category}</div>
                  <div>${place.Phone}</div>
                  <div style="margin-top:5px;">거리: ${Math.round(place.distance)}m</div>
                </div>
              </div>
            `
          });
          newInfowindows.push(infowindow);

          // 마커 클릭 이벤트
          window.kakao.maps.event.addListener(marker, 'click', () => {
            // 다른 모든 인포윈도우 닫기
            newInfowindows.forEach(iw => iw.close());
            // 클릭한 마커의 인포윈도우 열기
            infowindow.open(map, marker);
          });
        });

        // 마커와 인포윈도우 상태 업데이트
        setMarkers(prevMarkers => {
          prevMarkers.forEach(m => m.setMap(null));
          return newMarkers;
        });
        setInfowindows(prevInfowindows => {
          prevInfowindows.forEach(iw => iw.close());
          return newInfowindows;
        });

        // 검색 결과가 있는 경우 지도 중심 이동
        if (shuffledRestaurants.length > 0) {
          const bounds = new window.kakao.maps.LatLngBounds();
          shuffledRestaurants.forEach(place => {
            bounds.extend(new window.kakao.maps.LatLng(place.Latitude, place.Longitude));
          });
          map.setBounds(bounds);
        }
      } else {
        alert("검색 결과가 없습니다.");
      }
    }, searchOptions);
  }, [currentLocation, searchService, isSearchServiceLoaded, map]);

  // 컴포넌트 언마운트 시 마커와 인포윈도우 정리
  useEffect(() => {
    return () => {
      setMarkers(prevMarkers => {
        prevMarkers.forEach(marker => marker.setMap(null));
        return [];
      });
      setInfowindows(prevInfowindows => {
        prevInfowindows.forEach(infowindow => infowindow.close());
        return [];
      });
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
      }
    };
  }, [directionsRenderer]);

  // 내 맛집 중에서 추천
  const recommendFromMyList = () => {
    if (!restaurants || restaurants.length === 0) {
      alert("저장된 맛집이 없습니다.");
      return;
    }

    if (!currentLocation) {
      alert("현재 위치를 가져올 수 없습니다. 위치 권한을 확인해주세요.");
      return;
    }

    // 주변 맛집 목록 초기화
    setNearbyRestaurants([]);

    // 기존 마커와 경로 모두 제거
    setMarkers(prevMarkers => {
      prevMarkers.forEach(marker => marker.setMap(null));
      return [];
    });
    setInfowindows(prevInfowindows => {
      prevInfowindows.forEach(infowindow => infowindow.close());
      return [];
    });
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }

    const randomIndex = Math.floor(Math.random() * restaurants.length);
    const selected = restaurants[randomIndex];
    
    // 거리와 소요시간 계산
    const distance = getDistanceFromLatLonInMeters(
      currentLocation.lat,
      currentLocation.lng,
      selected.Latitude,
      selected.Longitude
    );
    
    const calculatedTravelTime = calculateTravelTime(distance);
    
    setRecommendedRestaurant(selected);
    setRecommendType("my");
    setTravelTime(calculatedTravelTime);
    
    if (map && window.kakao && window.kakao.maps) {
      const position = new window.kakao.maps.LatLng(selected.Latitude, selected.Longitude);
      map.setCenter(position);
      showMarkerWithInfo(position, selected.Name);
    }
  };

  // 마커와 인포윈도우를 표시하는 함수
  const showMarkerWithInfo = (position: any, name: string) => {
    // 기존 마커와 인포윈도우 제거
    if (marker) marker.setMap(null);
    if (infowindow) infowindow.close();
    
    // 새 마커 생성
    const newMarker = new window.kakao.maps.Marker({ position, map });
    setMarker(newMarker);
    
    // 새 인포윈도우 생성
    const newInfowindow = new window.kakao.maps.InfoWindow({
      content: `<div style="padding:5px;font-size:12px;">${name}</div>`
    });
    setInfowindow(newInfowindow);
    newInfowindow.open(map, newMarker);
  };

  // 맛집 등록 핸들러 추가
  // const handleAddRestaurant = async (place: any) => {
  //   try {
  //     const restaurantData = {
  //       Name: place.place_name,
  //       Address: place.address_name,
  //       Latitude: parseFloat(place.y),
  //       Longitude: parseFloat(place.x),
  //       Category: place.category_name,
  //       Phone: place.phone || '전화번호 없음'
  //     };

  //     await addRestaurant(restaurantData);
  //     queryClient.invalidateQueries(['restaurants']);
  //     alert('맛집이 등록되었습니다!');
  //   } catch (error) {
  //     console.error('맛집 등록 실패:', error);
  //     alert('맛집 등록에 실패했습니다.');
  //   }
  // };


  return (
    <div className="space-y-4">
      {/* 추천 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={recommendFromMyList}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
        >
          내 맛집 중에서 추천
        </button>
        <button
          onClick={recommendByLocation}
          className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
        >
          현재 위치 기반 추천
        </button>
      </div>

      {/* 추천 결과 */}
      {recommendType && recommendedRestaurant && (
        <div className="bg-white rounded-xl shadow-soft p-2 sm:p-4">
          <div className="font-bold text-lg text-primary-700 mb-2">
            오늘의 추천 맛집
          </div>
          <div className="text-xl font-bold mb-1">
            {recommendedRestaurant.Name}
          </div>
          <div className="text-sm text-gray-600 mb-2">
            {recommendedRestaurant.Address}
            <br />
            {recommendedRestaurant.Category} | {recommendedRestaurant.Phone}
          </div>
          
          {/* 소요시간 정보 (내 맛집 추천일 때만 표시) */}
          {recommendType === "my" && travelTime && (
            <div className="bg-blue-50 rounded-lg p-3 mt-3">
              <div className="font-medium text-blue-800 mb-2">예상 소요시간</div>
              <div className="flex gap-4 text-sm">
                <button 
                  onClick={() => showRoute('WALKING')}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors cursor-pointer"
                >
                  <span className="text-blue-600">🚶‍♂️</span>
                  <span className="text-blue-700">도보 {travelTime.walking}분</span>
                </button>
                <button 
                  onClick={() => showRoute('DRIVING')}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors cursor-pointer"
                >
                  <span className="text-blue-600">🚗</span>
                  <span className="text-blue-700">차량 {travelTime.driving}분</span>
                </button>
              </div>
              <div className="mt-3">
                <div className="text-xs text-blue-600 mb-2">
                  * 클릭하면 지도에 실제 도로 경로가 표시됩니다
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openKakaoNavigation('WALKING')}
                    className="flex-1 text-xs px-3 py-2 bg-green-100 hover:bg-green-200 rounded text-green-700 transition-colors font-medium"
                  >
                    🗺️ 카카오맵에서 길찾기
                  </button>
                  <button 
                    onClick={() => {
                      // 마커와 경로 초기화
                      setMarkers(prevMarkers => {
                        prevMarkers.forEach(marker => marker.setMap(null));
                        return [];
                      });
                      setInfowindows(prevInfowindows => {
                        prevInfowindows.forEach(infowindow => infowindow.close());
                        return [];
                      });
                      if (directionsRenderer) {
                        directionsRenderer.setMap(null);
                      }
                      
                      if (recommendedRestaurant && map) {
                        const position = new window.kakao.maps.LatLng(recommendedRestaurant.Latitude, recommendedRestaurant.Longitude);
                        map.setCenter(position);
                        showMarkerWithInfo(position, recommendedRestaurant.Name);
                      }
                    }}
                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600 transition-colors"
                  >
                    경로 초기화
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 지도 표시 */}
      <div className="relative">
        <div
          ref={mapRef}
          style={{ width: "100%", height: "300px" }}
          className="rounded-xl border border-gray-300 sm:h-[400px]"
        />
      </div>

      {/* 주변 맛집 목록 */}
      {nearbyRestaurants.length > 0 && (
        <div className="bg-white rounded-xl shadow-soft p-2 sm:p-4 flex flex-col items-center">
          <div className="font-bold text-lg text-primary-700 mb-2">주변 맛집 목록</div>
          <div className="space-y-2 w-full">
            {nearbyRestaurants.map((r, index) => (
              <div 
                key={index} 
                className="p-3 border-b last:border-b-0 hover:bg-blue-50 cursor-pointer transition-colors rounded-lg"
                onClick={() => {
                  if (map && window.kakao && window.kakao.maps) {
                    // 기존 마커와 인포윈도우 모두 닫기
                    setMarkers(prevMarkers => {
                      prevMarkers.forEach(marker => marker.setMap(null));
                      return [];
                    });
                    setInfowindows(prevInfowindows => {
                      prevInfowindows.forEach(infowindow => infowindow.close());
                      return [];
                    });
                    if (directionsRenderer) {
                      directionsRenderer.setMap(null);
                    }

                    // 선택한 맛집 위치로 이동
                    const position = new window.kakao.maps.LatLng(r.Latitude, r.Longitude);
                    map.setCenter(position);
                    map.setLevel(3); // 가까이 확대

                    // 마커 생성
                    const marker = new window.kakao.maps.Marker({
                      position: position,
                      map: map,
                      zIndex: 2000
                    });

                    // 인포윈도우 생성
                    const infowindow = new window.kakao.maps.InfoWindow({
                      content: `<div style="padding:8px;font-size:12px;text-align:center;">
                        <div style="font-weight:bold;color:#4ECDC4;margin-bottom:4px;">${r.Name}</div>
                        <div style="font-size:10px;color:#666;">${r.Address}</div>
                        <div style="font-size:10px;color:#666;margin-top:2px;">${r.Category}</div>
                        <div style="font-size:10px;color:#007bff;margin-top:2px;">거리: ${Math.round(r.distance)}m</div>
                      </div>`
                    });

                    // 마커와 인포윈도우 상태 업데이트
                    setMarkers([marker]);
                    setInfowindows([infowindow]);

                    // 인포윈도우 열기
                    infowindow.open(map, marker);
                  }
                }}
              >
                <div className="font-medium text-gray-800">{r.Name}</div>
                <div className="text-sm text-gray-600">{r.Address}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {r.Category} | {Math.round(r.distance)}m
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendTab