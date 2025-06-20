import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import * as api from './api';

// Mock the API module
jest.mock('./api', () => ({
  addRestaurant: jest.fn(),
  fetchRestaurants: jest.fn(),
  deleteRestaurant: jest.fn(),
  addVisit: jest.fn(),
  fetchVisits: jest.fn(),
  deleteVisit: jest.fn(),
}));
const mockedApi = api as jest.Mocked<typeof api>;

// Mock window.alert (더 이상 사용하지 않지만 테스트 호환성을 위해 유지)
const mockAlert = jest.fn();
Object.defineProperty(window, 'alert', {
  value: mockAlert,
  writable: true,
});

// Mock console methods
const mockConsoleLog = jest.fn();
const mockConsoleError = jest.fn();
Object.defineProperty(console, 'log', {
  value: mockConsoleLog,
  writable: true,
});
Object.defineProperty(console, 'error', {
  value: mockConsoleError,
  writable: true,
});

// Mock React Query
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Mock KakaoMap component
jest.mock('./components/KakaoMap', () => {
  return function MockKakaoMap({ onAddRestaurant }: { onAddRestaurant?: (place: any) => void }) {
    return (
      <div data-testid="kakao-map">
        <button
          data-testid="add-restaurant-btn"
          onClick={() => onAddRestaurant?.({
            place_name: '테스트 맛집',
            address_name: '서울시 강남구',
            y: '37.5665',
            x: '126.9780',
            category_group_name: '음식점',
            phone: '02-1234-5678'
          })}
        >
          맛집 추가
        </button>
        <button
          data-testid="add-duplicate-restaurant-btn"
          onClick={() => onAddRestaurant?.({
            place_name: '중복 맛집',
            address_name: '서울시 서초구',
            y: '37.4836',
            x: '127.0325',
            category_group_name: '음식점',
            phone: '02-9999-8888'
          })}
        >
          중복 맛집 추가
        </button>
      </div>
    );
  };
});

// Mock other components
jest.mock('./components/RecommendTab', () => () => <div data-testid="recommend-tab">Recommend Tab</div>);
jest.mock('./components/MyRestaurantsTab', () => () => <div data-testid="my-restaurants-tab">My Restaurants Tab</div>);
jest.mock('./components/VisitsTab', () => () => <div data-testid="visits-tab">Visits Tab</div>);

const renderApp = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
};

describe('App - 맛집 등록 기능', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlert.mockClear();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
  });

  test('맛집 등록 성공 시 성공 메시지 표시', async () => {
    mockedApi.addRestaurant.mockResolvedValueOnce({});

    renderApp();

    // 지도 탭 클릭
    fireEvent.click(screen.getByText('지도'));

    // 맛집 추가 버튼 클릭
    const addButton = screen.getByTestId('add-restaurant-btn');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockedApi.addRestaurant).toHaveBeenCalledWith({
        Name: '테스트 맛집',
        Address: '서울시 강남구',
        Latitude: 37.5665,
        Longitude: 126.9780,
        Category: '음식점',
        Phone: '02-1234-5678'
      });
    });

    // 팝업 모달이 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText('맛집이 등록되었습니다!')).toBeInTheDocument();
    });
  });

  test('중복 맛집 등록 시 중복 메시지 표시', async () => {
    const duplicateError = {
      response: {
        status: 409,
        data: { error: '이미 등록된 맛집입니다' }
      }
    };
    mockedApi.addRestaurant.mockRejectedValueOnce(duplicateError);

    renderApp();

    // 지도 탭 클릭
    fireEvent.click(screen.getByText('지도'));

    // 중복 맛집 추가 버튼 클릭
    const addDuplicateButton = screen.getByTestId('add-duplicate-restaurant-btn');
    fireEvent.click(addDuplicateButton);

    await waitFor(() => {
      expect(mockedApi.addRestaurant).toHaveBeenCalledWith({
        Name: '중복 맛집',
        Address: '서울시 서초구',
        Latitude: 37.4836,
        Longitude: 127.0325,
        Category: '음식점',
        Phone: '02-9999-8888'
      });
    });

    // 팝업 모달이 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText('이미 등록된 맛집입니다')).toBeInTheDocument();
    });

    expect(mockConsoleError).toHaveBeenCalledWith('맛집 등록 실패:', duplicateError);
  });

  test('일반 에러 발생 시 기본 에러 메시지 표시', async () => {
    const generalError = {
      response: {
        status: 500,
        data: { error: 'Internal Server Error' }
      }
    };
    mockedApi.addRestaurant.mockRejectedValueOnce(generalError);

    renderApp();

    // 지도 탭 클릭
    fireEvent.click(screen.getByText('지도'));

    // 맛집 추가 버튼 클릭
    const addButton = screen.getByTestId('add-restaurant-btn');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockedApi.addRestaurant).toHaveBeenCalled();
    });

    // 팝업 모달이 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText('맛집 등록에 실패했습니다.')).toBeInTheDocument();
    });

    expect(mockConsoleError).toHaveBeenCalledWith('맛집 등록 실패:', generalError);
  });

  test('네트워크 에러 발생 시 기본 에러 메시지 표시', async () => {
    const networkError = new Error('Network Error');
    mockedApi.addRestaurant.mockRejectedValueOnce(networkError);

    renderApp();

    // 지도 탭 클릭
    fireEvent.click(screen.getByText('지도'));

    // 맛집 추가 버튼 클릭
    const addButton = screen.getByTestId('add-restaurant-btn');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockedApi.addRestaurant).toHaveBeenCalled();
    });

    // 팝업 모달이 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByText('맛집 등록에 실패했습니다.')).toBeInTheDocument();
    });

    expect(mockConsoleError).toHaveBeenCalledWith('맛집 등록 실패:', networkError);
  });

  test('맛집 데이터 변환이 올바르게 수행됨', async () => {
    mockedApi.addRestaurant.mockResolvedValueOnce({});

    renderApp();

    // 지도 탭 클릭
    fireEvent.click(screen.getByText('지도'));

    // 맛집 추가 버튼 클릭
    const addButton = screen.getByTestId('add-restaurant-btn');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockedApi.addRestaurant).toHaveBeenCalledWith({
        Name: '테스트 맛집',
        Address: '서울시 강남구',
        Latitude: 37.5665,           // parseFloat 변환 확인
        Longitude: 126.9780,         // parseFloat 변환 확인
        Category: '음식점',
        Phone: '02-1234-5678'
      });
    });

    // 디버깅 로그도 출력되었는지 확인
    await waitFor(() => {
      expect(mockConsoleLog).toHaveBeenCalledWith('Adding restaurant:', expect.any(Object));
      expect(mockConsoleLog).toHaveBeenCalledWith('Restaurant data to send:', expect.any(Object));
    });
  });
});