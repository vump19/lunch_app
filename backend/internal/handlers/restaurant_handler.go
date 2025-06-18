package handlers

import (
	"lunch_app/backend/internal/database"
	"lunch_app/backend/internal/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetAllRestaurants godoc
// @Summary Get all restaurants
// @Description Get a list of all restaurants
// @Tags restaurants
// @Produce json
// @Success 200 {array} models.Restaurant
// @Router /restaurants [get]
func GetAllRestaurants(c *gin.Context) {
	var restaurants []models.Restaurant
	database.DB.Find(&restaurants)
	c.JSON(http.StatusOK, restaurants)
}

// GetRestaurantByID godoc
// @Summary Get a restaurant by ID
// @Description Get details of a specific restaurant by its ID
// @Tags restaurants
// @Produce json
// @Param id path int true "Restaurant ID"
// @Success 200 {object} models.Restaurant
// @Router /restaurants/{id} [get]
func GetRestaurantByID(c *gin.Context) {
	id := c.Param("id")
	var restaurant models.Restaurant
	if err := database.DB.First(&restaurant, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Restaurant not found"})
		return
	}
	c.JSON(http.StatusOK, restaurant)
}

// CreateRestaurant godoc
// @Summary Create a new restaurant
// @Description Add a new restaurant to the database
// @Tags restaurants
// @Accept json
// @Produce json
// @Param restaurant body models.Restaurant true "Restaurant object"
// @Success 201 {object} models.Restaurant
// @Failure 400 {object} gin.H
// @Failure 500 {object} gin.H
// @Router /restaurants [post]
func CreateRestaurant(c *gin.Context) {
	var restaurant models.Restaurant
	if err := c.ShouldBindJSON(&restaurant); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 데이터 검증
	if restaurant.Name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "맛집 이름은 필수입니다"})
		return
	}
	if restaurant.Address == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "맛집 주소는 필수입니다"})
		return
	}
	if restaurant.Latitude == 0 && restaurant.Longitude == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "맛집 위치 정보는 필수입니다"})
		return
	}

	// 기본값 설정
	if restaurant.Category == "" {
		restaurant.Category = "음식점"
	}
	if restaurant.Phone == "" {
		restaurant.Phone = "전화번호 없음"
	}

	if err := database.DB.Create(&restaurant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create restaurant"})
		return
	}

	c.JSON(http.StatusCreated, restaurant)
}

// DeleteRestaurant 함수 추가
func DeleteRestaurant(c *gin.Context) {
	id := c.Param("id")

	// 먼저 해당 맛집이 존재하는지 확인
	var restaurant models.Restaurant
	if err := database.DB.First(&restaurant, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Restaurant not found"})
		return
	}

	// 맛집 삭제 (방문 기록은 유지됨)
	if err := database.DB.Delete(&restaurant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete restaurant"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Restaurant deleted successfully"})
}
