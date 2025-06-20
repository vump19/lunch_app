import React from "react";

interface PopupModalProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

const PopupModal: React.FC<PopupModalProps> = ({ open, message, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg p-6 min-w-[260px] max-w-xs text-center">
        <div className="mb-4 text-lg text-gray-700">{message}</div>
        <button
          className="mt-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default PopupModal;
export {}; 