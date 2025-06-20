import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchRestaurants, deleteRestaurant, addVisit } from '../api';
import { MapPinIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const MyRestaurantsTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: restaurants, isLoading, error } = useQuery({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurants,
    retry: 3,
    retryDelay: 1000,
  });

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`'${name}'을(를) 삭제하시겠습니까?`)) return;
    
    try {
      await deleteRestaurant(id);
      queryClient.invalidateQueries(['restaurants']);
      alert('맛집이 삭제되었습니다.');
    } catch (error) {
      console.error('삭제 에러:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleVisit = async (id: number, name: string) => {
    if (!window.confirm(`'${name}'을(를) 방문 처리하시겠습니까?`)) return;
    
    try {
      await addVisit(id);
      queryClient.invalidateQueries(['visits']);
      alert('방문 기록이 추가되었습니다!');
    } catch (error) {
      console.error('방문 기록 추가 에러:', error);
      alert('방문 기록 추가에 실패했습니다.');
    }
  };

  if (isLoading) return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
      <div className="text-gray-400">로딩 중...</div>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-8">
      <div className="text-red-400 mb-2">에러가 발생했습니다.</div>
      <div className="text-sm text-gray-500 mb-4">
        {error instanceof Error ? error.message : '알 수 없는 에러'}
      </div>
      <button 
        onClick={() => queryClient.invalidateQueries(['restaurants'])}
        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
      >
        다시 시도
      </button>
    </div>
  );
  
  if (!restaurants || restaurants.length === 0) return (
    <div className="text-center py-8">
      <div className="text-gray-400 mb-4">저장된 맛집이 없습니다.</div>
      <div className="text-sm text-gray-500">지도 탭에서 맛집을 추가해보세요!</div>
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      {restaurants.map((r: any) => (
        <div key={r.ID} className="bg-white rounded-xl shadow-soft p-4 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="font-bold text-lg text-primary-700 mb-1">{r.Name}</div>
            <div className="text-sm text-gray-500 mb-1">{r.Address}</div>
            <div className="text-xs text-gray-400">{r.Category} | {r.Phone}</div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <button
              className="flex items-center gap-1 px-2 py-1 text-xs bg-primary-50 text-primary-600 rounded hover:bg-primary-100"
              onClick={() => {
                try {
                  if (window.kakao && window.kakao.maps) {
                    const pos = new window.kakao.maps.LatLng(r.Latitude, r.Longitude);
                    const map = new window.kakao.maps.Map(document.createElement('div'), { center: pos, level: 3 });
                    map.setCenter(pos);
                    window.open(`https://map.kakao.com/link/map/${r.Name},${r.Latitude},${r.Longitude}`, '_blank');
                  } else {
                    alert('카카오맵이 로드되지 않았습니다.');
                  }
                } catch (error) {
                  console.error('지도 열기 에러:', error);
                  alert('지도를 열 수 없습니다.');
                }
              }}
            >
              <MapPinIcon className="w-4 h-4" /> 지도
            </button>
            <button
              className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100"
              onClick={() => handleVisit(r.ID, r.Name)}
            >
              <CheckCircleIcon className="w-4 h-4" /> 방문
            </button>
            <button
              className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-500 rounded hover:bg-red-100"
              onClick={() => handleDelete(r.ID, r.Name)}
            >
              <TrashIcon className="w-4 h-4" /> 삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyRestaurantsTab; 