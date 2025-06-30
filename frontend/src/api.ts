import axios from "axios";

// API 기본 URL 설정
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';
console.log('🌐 API Base URL:', API_BASE_URL);

// 헬스체크 API
export const healthCheck = async () => {
  try {
    const url = `${API_BASE_URL}/health`;
    const response = await axios.get(url, { timeout: 5000 });
    return { 
      status: 'healthy', 
      data: response.data,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('헬스체크 실패:', error);
    return { 
      status: 'unhealthy', 
      error: axios.isAxiosError(error) ? error.message : '알 수 없는 오류',
      timestamp: new Date()
    };
  }
};
export const fetchRestaurants = async () => {
  try {
    const url = `${API_BASE_URL}/api/restaurants/`;
    console.log('📡 Fetching restaurants from:', url);
    const res = await axios.get(url);
    return res.data;
  } catch (error) {
    console.error("맛집 목록 조회 에러:", error);
    throw new Error("맛집 목록을 불러올 수 없습니다.");
  }
};

export const addRestaurant = async (place: any) => {
  const body = {
    Name: place.Name || place.place_name || '',
    Address: place.Address || place.address_name || '',
    Latitude: place.Latitude || parseFloat(place.y) || 0,
    Longitude: place.Longitude || parseFloat(place.x) || 0,
    Category: place.Category || place.category_group_name || place.category_name || '음식점',
    Phone: place.Phone || place.phone || '전화번호 없음'
  };
  
  console.log("Sending restaurant data:", body);
  
  // 데이터 검증
  if (!body.Name || !body.Address) {
    throw new Error("맛집 이름과 주소는 필수입니다.");
  }
  
  try {
    const url = `${API_BASE_URL}/api/restaurants/`;
    console.log('📡 Adding restaurant to:', url);
    const res = await axios.post(url, body);
    console.log("Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error adding restaurant:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "맛집 추가에 실패했습니다.");
    }
    throw new Error("맛집 추가에 실패했습니다.");
  }
};

// 맛집 삭제 API 함수 수정
export const deleteRestaurant = async (id: number) => {
  try {
    const url = `${API_BASE_URL}/api/restaurants/${id}`;
    console.log('📡 Deleting restaurant from:', url);
    const response = await axios.delete(url);
    return response.data;
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || '삭제 요청이 실패했습니다');
    }
    throw new Error('삭제 요청이 실패했습니다');
  }
};

// 방문 기록 관련 API 함수 추가
export const fetchVisits = async () => {
  try {
    const url = `${API_BASE_URL}/api/visits/`;
    console.log('📡 Fetching visits from:', url);
    const response = await axios.get(url);
    console.log("Visits response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching visits:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "방문 기록을 불러올 수 없습니다.");
    }
    throw new Error("방문 기록을 불러올 수 없습니다.");
  }
};

export const addVisit = async (restaurantId: number) => {
  try {
    // 현재 시간을 UTC로 전송 (백엔드에서 Seoul 시간대로 변환)
    const now = new Date();
    
    const body = {
      RestaurantID: restaurantId,
      VisitDate: now.toISOString(),
    };
    
    console.log("Sending visit request:", body);
    
    const url = `${API_BASE_URL}/api/visits/`;
    console.log('📡 Adding visit to:', url);
    const response = await axios.post(url, body);
    console.log("Visit response:", response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error adding visit:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || '방문 기록 추가에 실패했습니다');
    }
    throw new Error('방문 기록 추가에 실패했습니다');
  }
};

export const deleteVisit = async (id: number) => {
  try {
    const url = `${API_BASE_URL}/api/visits/${id}`;
    console.log('📡 Deleting visit from:', url);
    const response = await axios.delete(url);
    return response.data;
  } catch (error) {
    console.error("Error deleting visit:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "방문 기록 삭제에 실패했습니다");
    }
    throw new Error("방문 기록 삭제에 실패했습니다");
  }
};

export const updateVisit = async (id: number, visitDate: string) => {
  try {
    const body = {
      VisitDate: visitDate,
    };
    
    console.log("Updating visit:", { id, body });
    
    const url = `${API_BASE_URL}/api/visits/${id}`;
    console.log('📡 Updating visit at:', url);
    const response = await axios.put(url, body);
    console.log("Update visit response:", response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error updating visit:', error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || '방문 기록 수정에 실패했습니다');
    }
    throw new Error('방문 기록 수정에 실패했습니다');
  }
};