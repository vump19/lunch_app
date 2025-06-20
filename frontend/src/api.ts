import axios from "axios";

// 상대 경로 사용 (프록시 설정이 있는 경우)
export const fetchRestaurants = async () => {
  try {
    const res = await axios.get("/api/restaurants/");
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
    const res = await axios.post("/api/restaurants/", body);
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
    const response = await axios.delete(`/api/restaurants/${id}/`);
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
    console.log("Fetching visits...");
    const response = await axios.get("/api/visits/");
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
    const body = {
      RestaurantID: restaurantId,
      VisitDate: new Date().toISOString(),
    };
    
    console.log("Sending visit request:", body);
    
    const response = await axios.post("/api/visits/", body);
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
    const response = await axios.delete(`/api/visits/${id}/`);
    return response.data;
  } catch (error) {
    console.error("Error deleting visit:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "방문 기록 삭제에 실패했습니다");
    }
    throw new Error("방문 기록 삭제에 실패했습니다");
  }
};