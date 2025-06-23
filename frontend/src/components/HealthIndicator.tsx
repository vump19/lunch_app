import React from 'react';
import { useHealthCheck } from '../hooks/useHealthCheck';

const HealthIndicator = (): JSX.Element => {
  const { healthStatus, performHealthCheck } = useHealthCheck();

  const getStatusColor = () => {
    switch (healthStatus.status) {
      case 'healthy':
        return 'text-green-500';
      case 'unhealthy':
        return 'text-red-500';
      case 'checking':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (healthStatus.status) {
      case 'healthy':
        return '●';
      case 'unhealthy':
        return '●';
      case 'checking':
        return '●';
      default:
        return '●';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div 
        className={`flex items-center space-x-2 bg-white rounded-lg shadow-lg px-3 py-2 border cursor-pointer ${getStatusColor()}`}
        onClick={performHealthCheck}
        title={`백엔드 상태: ${healthStatus.status}\n클릭하여 수동 체크`}
      >
        <span className={`text-lg ${getStatusColor()}`}>
          {getStatusIcon()}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {healthStatus.status === 'healthy' && '백엔드 연결됨'}
          {healthStatus.status === 'unhealthy' && '백엔드 연결 끊김'}
          {healthStatus.status === 'checking' && '상태 확인 중'}
        </span>
      </div>
      
      {healthStatus.lastCheck && (
        <div className="mt-1 text-xs text-gray-500 text-right">
          마지막 체크: {healthStatus.lastCheck.toLocaleTimeString()}
        </div>
      )}
      
      {healthStatus.error && (
        <div className="mt-1 text-xs text-red-500 text-right max-w-64 truncate">
          오류: {healthStatus.error}
        </div>
      )}
    </div>
  );
};

export default HealthIndicator;