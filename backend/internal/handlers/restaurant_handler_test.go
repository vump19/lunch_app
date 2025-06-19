package handlers

import (
	"bytes"
	"encoding/json"
	"lunch_app/backend/internal/database"
	"lunch_app/backend/internal/models"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB() {
	// 테스트용 메모리 DB 설정
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		panic("failed to connect to test database")
	}

	// 테이블 마이그레이션
	db.AutoMigrate(&models.Restaurant{}, &models.Visit{})
	
	database.DB = db
}

func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	return router
}

func TestMain(m *testing.M) {
	setupTestDB()
	code := m.Run()
	os.Exit(code)
}

func TestCreateRestaurant_Success(t *testing.T) {
	router := setupRouter()
	router.POST("/restaurants", CreateRestaurant)

	restaurant := models.Restaurant{
		Name:      "테스트 맛집",
		Address:   "서울시 강남구 테스트동",
		Category:  "한식",
		Phone:     "02-1234-5678",
		Latitude:  37.5665,
		Longitude: 126.9780,
	}

	jsonData, _ := json.Marshal(restaurant)
	req, _ := http.NewRequest("POST", "/restaurants", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var response models.Restaurant
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "테스트 맛집", response.Name)
	assert.Equal(t, "서울시 강남구 테스트동", response.Address)
}

func TestCreateRestaurant_Duplicate(t *testing.T) {
	router := setupRouter()
	router.POST("/restaurants", CreateRestaurant)

	// 첫 번째 맛집 등록
	restaurant := models.Restaurant{
		Name:      "중복 테스트 맛집",
		Address:   "서울시 서초구 중복동",
		Category:  "중식",
		Phone:     "02-9999-8888",
		Latitude:  37.4836,
		Longitude: 127.0325,
	}

	// 데이터베이스 초기화 (기존 데이터 삭제)
	database.DB.Exec("DELETE FROM restaurants")

	// 첫 번째 등록
	jsonData, _ := json.Marshal(restaurant)
	req1, _ := http.NewRequest("POST", "/restaurants", bytes.NewBuffer(jsonData))
	req1.Header.Set("Content-Type", "application/json")

	w1 := httptest.NewRecorder()
	router.ServeHTTP(w1, req1)
	assert.Equal(t, http.StatusCreated, w1.Code)

	// 동일한 맛집 다시 등록 시도
	req2, _ := http.NewRequest("POST", "/restaurants", bytes.NewBuffer(jsonData))
	req2.Header.Set("Content-Type", "application/json")

	w2 := httptest.NewRecorder()
	router.ServeHTTP(w2, req2)

	assert.Equal(t, http.StatusConflict, w2.Code)

	var response map[string]string
	err := json.Unmarshal(w2.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "이미 등록된 맛집입니다", response["error"])
}

func TestCreateRestaurant_ValidationErrors(t *testing.T) {
	router := setupRouter()
	router.POST("/restaurants", CreateRestaurant)

	tests := []struct {
		name           string
		restaurant     models.Restaurant
		expectedStatus int
		expectedError  string
	}{
		{
			name: "이름 없음",
			restaurant: models.Restaurant{
				Address:   "서울시 강남구",
				Latitude:  37.5665,
				Longitude: 126.9780,
			},
			expectedStatus: http.StatusBadRequest,
			expectedError:  "맛집 이름은 필수입니다",
		},
		{
			name: "주소 없음",
			restaurant: models.Restaurant{
				Name:      "테스트 맛집",
				Latitude:  37.5665,
				Longitude: 126.9780,
			},
			expectedStatus: http.StatusBadRequest,
			expectedError:  "맛집 주소는 필수입니다",
		},
		{
			name: "위치 정보 없음",
			restaurant: models.Restaurant{
				Name:    "테스트 맛집",
				Address: "서울시 강남구",
			},
			expectedStatus: http.StatusBadRequest,
			expectedError:  "맛집 위치 정보는 필수입니다",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			jsonData, _ := json.Marshal(tt.restaurant)
			req, _ := http.NewRequest("POST", "/restaurants", bytes.NewBuffer(jsonData))
			req.Header.Set("Content-Type", "application/json")

			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			var response map[string]string
			err := json.Unmarshal(w.Body.Bytes(), &response)
			assert.NoError(t, err)
			assert.Equal(t, tt.expectedError, response["error"])
		})
	}
}

func TestCreateRestaurant_DefaultValues(t *testing.T) {
	router := setupRouter()
	router.POST("/restaurants", CreateRestaurant)

	restaurant := models.Restaurant{
		Name:      "기본값 테스트 맛집",
		Address:   "서울시 종로구 기본동",
		Latitude:  37.5729,
		Longitude: 126.9794,
		// Category와 Phone은 비워둠
	}

	jsonData, _ := json.Marshal(restaurant)
	req, _ := http.NewRequest("POST", "/restaurants", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusCreated, w.Code)

	var response models.Restaurant
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "음식점", response.Category)      // 기본값
	assert.Equal(t, "전화번호 없음", response.Phone)     // 기본값
}