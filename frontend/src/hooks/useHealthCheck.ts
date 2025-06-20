import { useState, useEffect, useCallback } from 'react';
import { healthCheck } from '../api';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'checking';
  lastCheck?: Date;
  error?: string;
  data?: any;
}

export const useHealthCheck = (intervalMs: number = 10000) => {
  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    status: 'checking'
  });

  const performHealthCheck = useCallback(async () => {
    const result = await healthCheck();
    setHealthStatus({
      status: result.status as 'healthy' | 'unhealthy',
      lastCheck: result.timestamp,
      error: result.error,
      data: result.data
    });
  }, []);

  useEffect(() => {
    // 즉시 첫 번째 헬스체크 실행
    performHealthCheck();

    // 10초 간격으로 헬스체크 실행
    const interval = setInterval(performHealthCheck, intervalMs);

    // 컴포넌트 언마운트 시 interval 정리
    return () => clearInterval(interval);
  }, [performHealthCheck, intervalMs]);

  return {
    healthStatus,
    performHealthCheck // 수동으로 헬스체크를 실행할 수 있는 함수
  };
};