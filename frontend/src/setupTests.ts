import '@testing-library/jest-dom';

// Jest 타입 정의 확장 (필요한 경우)
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
  }
}