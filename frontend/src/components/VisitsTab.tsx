import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchVisits, deleteVisit } from '../api';
import { TrashIcon, CalendarDaysIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import PopupModal from './PopupModal';

const VisitsTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => void;
  }>({ open: false, message: '', onConfirm: () => {} });
  
  const { data: visits, isLoading, error } = useQuery({
    queryKey: ['visits'],
    queryFn: fetchVisits,
  });


  const handleDelete = (id: number) => {
    setConfirmModal({
      open: true,
      message: '방문 기록을 삭제하시겠습니까?',
      onConfirm: async () => {
        try {
          await deleteVisit(id);
          queryClient.invalidateQueries(['visits']);
          setModalMessage('방문 기록이 삭제되었습니다.');
          setModalOpen(true);
        } catch (error) {
          console.error('방문 기록 삭제 에러:', error);
          setModalMessage('방문 기록 삭제에 실패했습니다.');
          setModalOpen(true);
        }
        setConfirmModal({ open: false, message: '', onConfirm: () => {} });
      }
    });
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
        onClick={() => queryClient.invalidateQueries(['visits'])}
        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
      >
        다시 시도
      </button>
    </div>
  );
  
  if (!visits || visits.length === 0) return (
    <div className="text-center py-8">
      <div className="text-gray-400 mb-4">방문 기록이 없습니다.</div>
      <div className="text-sm text-gray-500">맛집을 방문하고 기록을 남겨보세요!</div>
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      {visits.map((v: any) => (
        <div key={v.ID} className={`bg-white rounded-xl shadow-soft p-4 flex items-center justify-between gap-4 ${v.isDeleted ? 'border-l-4 border-orange-400' : ''}`}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className={`font-bold text-lg ${v.isDeleted ? 'text-orange-600' : 'text-primary-700'}`}>
                {v.restaurantName}
              </div>
              {v.isDeleted && (
                <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" title="삭제된 맛집" />
              )}
            </div>
            <div className="text-sm text-gray-500 mb-1">{v.restaurantAddress}</div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <CalendarDaysIcon className="w-4 h-4" /> 
              {v.date} {v.time}
            </div>
          </div>
          <button
            className="flex items-center gap-1 px-2 py-1 text-xs bg-red-50 text-red-500 rounded hover:bg-red-100"
            onClick={() => handleDelete(v.ID)}
          >
            <TrashIcon className="w-4 h-4" /> 삭제
          </button>
        </div>
      ))}
      
      {/* 결과 메시지 모달 */}
      <PopupModal
        open={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
      />
      
      {/* 확인 모달 */}
      <PopupModal
        open={confirmModal.open}
        message={confirmModal.message}
        onClose={() => setConfirmModal({ open: false, message: '', onConfirm: () => {} })}
        onConfirm={confirmModal.onConfirm}
      />
    </div>
  );
};

export default VisitsTab; 