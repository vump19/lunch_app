import React from "react";

interface PopupModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const PopupModal: React.FC<PopupModalProps> = ({ 
  open, 
  message, 
  onClose, 
  onConfirm, 
  confirmText = "확인", 
  cancelText = "취소" 
}) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg p-6 min-w-[260px] max-w-xs text-center">
        <div className="mb-4 text-lg text-gray-700">{message}</div>
        
        {onConfirm ? (
          // 확인/취소 모달
          <div className="flex space-x-3">
            <button
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={onClose}
            >
              {cancelText}
            </button>
            <button
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        ) : (
          // 단순 알림 모달
          <button
            className="mt-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            onClick={onClose}
          >
            {confirmText}
          </button>
        )}
      </div>
    </div>
  );
};

export default PopupModal;
export {}; 