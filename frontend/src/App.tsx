import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { HomeIcon, MapIcon, BookmarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import { addRestaurant } from './api';
import RecommendTab from './components/RecommendTab';
import KakaoMap from './components/KakaoMap';
import MyRestaurantsTab from './components/MyRestaurantsTab';
import VisitsTab from './components/VisitsTab';
import PopupModal from './components/PopupModal';
import HealthIndicator from './components/HealthIndicator';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const tabs = [
  { name: '추천', icon: HomeIcon, component: RecommendTab },
  { name: '지도', icon: MapIcon, component: KakaoMap },
  { name: '나의 맛집', icon: BookmarkIcon, component: MyRestaurantsTab },
  { name: '방문 기록', icon: ClockIcon, component: VisitsTab },
];

const App: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // 맛집 등록 핸들러
  const handleAddRestaurant = async (place: any) => {
    try {
      console.log('Adding restaurant:', place); // 디버깅용 로그
      
      const restaurantData = {
        Name: place.place_name || '',
        Address: place.address_name || '',
        Latitude: parseFloat(place.y) || 0,
        Longitude: parseFloat(place.x) || 0,
        Category: place.category_group_name || place.category_name || '음식점',
        Phone: place.phone || '전화번호 없음'
      };

      console.log('Restaurant data to send:', restaurantData); // 디버깅용 로그

      await addRestaurant(restaurantData);
      queryClient.invalidateQueries(['restaurants']);
      setModalMessage('맛집이 등록되었습니다!');
      setModalOpen(true);
    } catch (error: any) {
      console.error('맛집 등록 실패:', error);
      if (error.message?.includes('이미 등록된 맛집입니다')) {
        setModalMessage('이미 동일한 맛집이 등록되어 있습니다');
      } else {
        setModalMessage(error.message || '맛집 등록에 실패했습니다.');
      }
      setModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary-600 tracking-tight">🍽️ Lunch App</h1>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-2 py-6">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="flex space-x-2 bg-white rounded-xl p-1 shadow-soft mb-6">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium',
                    selected
                      ? 'bg-primary-500 text-white shadow'
                      : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                  )
                }
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels>
            {tabs.map((tab, idx) => (
              <Tab.Panel key={idx} className="focus:outline-none">
                {tab.name === '지도' ? (
                  <div className="bg-white rounded-xl shadow-soft p-4">
                    <KakaoMap onAddRestaurant={handleAddRestaurant} />
                  </div>
                ) : tab.name === '추천' ? (
                  <div className="bg-white rounded-xl shadow-soft p-4">
                    <RecommendTab />
                  </div>
                ) : (
                  <tab.component />
                )}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        © 2025 Lunch App
      </footer>

      {/* 팝업 모달 */}
      <PopupModal
        open={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
      
      {/* 헬스 인디케이터 */}
      <HealthIndicator />
    </div>
  );
};

export default App;