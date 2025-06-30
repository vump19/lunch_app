package handlers

import (
	"lunch_app/backend/internal/database"
	"lunch_app/backend/internal/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// 방문 기록 생성
func CreateVisit(c *gin.Context) {
	var input struct {
		RestaurantID uint      `json:"RestaurantID" binding:"required"`
		VisitDate    time.Time `json:"VisitDate" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 레스토랑 존재 여부 확인
	var restaurant models.Restaurant
	if err := database.DB.First(&restaurant, input.RestaurantID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Restaurant not found"})
		return
	}

	// 한국 시간대로 변환하여 저장
	koreaLocation, _ := time.LoadLocation("Asia/Seoul")
	visitDateKST := input.VisitDate.In(koreaLocation)

	visit := models.Visit{
		RestaurantID: input.RestaurantID,
		VisitDate:    visitDateKST,
	}

	if err := database.DB.Create(&visit).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record visit"})
		return
	}

	// 레스토랑 정보와 함께 방문 기록 반환
	database.DB.Preload("Restaurant").First(&visit, visit.ID)
	c.JSON(http.StatusCreated, visit)
}

// 모든 방문 기록 조회
func GetAllVisits(c *gin.Context) {
	var visits []models.Visit

	// Restaurant 정보를 함께 가져오기 (삭제된 맛집도 포함)
	result := database.DB.Preload("Restaurant").Order("visit_date desc").Find(&visits)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch visits"})
		return
	}

	// 클라이언트에 보내기 쉬운 형태로 데이터 가공
	type VisitResponse struct {
		ID                uint   `json:"ID"`
		RestaurantID      uint   `json:"RestaurantID"`
		RestaurantName    string `json:"restaurantName"`
		RestaurantAddress string `json:"restaurantAddress"`
		Date              string `json:"date"`
		Time              string `json:"time"`
		IsDeleted         bool   `json:"isDeleted"`
	}

	var response []VisitResponse
	
	// 한국 시간대 설정
	koreaLocation, _ := time.LoadLocation("Asia/Seoul")
	
	for _, visit := range visits {
		// 한국 시간대로 변환 후 포맷팅
		koreaTime := visit.VisitDate.In(koreaLocation)
		date := koreaTime.Format("2006-01-02")
		timeStr := koreaTime.Format("15:04")

		// 맛집이 삭제되었는지 확인
		isDeleted := visit.Restaurant.ID == 0
		restaurantName := visit.Restaurant.Name
		restaurantAddress := visit.Restaurant.Address

		if isDeleted {
			restaurantName = "삭제된 맛집"
			restaurantAddress = "주소 정보 없음"
		}

		response = append(response, VisitResponse{
			ID:                visit.ID,
			RestaurantID:      visit.RestaurantID,
			RestaurantName:    restaurantName,
			RestaurantAddress: restaurantAddress,
			Date:              date,
			Time:              timeStr,
			IsDeleted:         isDeleted,
		})
	}

	c.JSON(http.StatusOK, response)
}

// 방문 기록 수정
func UpdateVisit(c *gin.Context) {
	id := c.Param("id")
	
	var input struct {
		VisitDate time.Time `json:"VisitDate" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 기존 방문 기록 찾기
	var visit models.Visit
	if err := database.DB.First(&visit, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Visit record not found"})
		return
	}

	// 방문 일자를 한국 시간대로 변환하여 업데이트
	koreaLocation, _ := time.LoadLocation("Asia/Seoul")
	visitDateKST := input.VisitDate.In(koreaLocation)
	visit.VisitDate = visitDateKST
	if err := database.DB.Save(&visit).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update visit record"})
		return
	}

	// 업데이트된 방문 기록을 레스토랑 정보와 함께 반환
	database.DB.Preload("Restaurant").First(&visit, visit.ID)
	
	// 응답 형태로 변환
	koreaTime := visit.VisitDate.In(koreaLocation)
	
	response := gin.H{
		"ID":                visit.ID,
		"RestaurantID":      visit.RestaurantID,
		"RestaurantName":    visit.Restaurant.Name,
		"RestaurantAddress": visit.Restaurant.Address,
		"Date":              koreaTime.Format("2006-01-02"),
		"Time":              koreaTime.Format("15:04"),
		"IsDeleted":         visit.Restaurant.ID == 0,
		"message":           "Visit record updated successfully",
	}

	c.JSON(http.StatusOK, response)
}

// 방문 기록 삭제
func DeleteVisit(c *gin.Context) {
	id := c.Param("id")

	if err := database.DB.Delete(&models.Visit{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete visit record"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Visit record deleted successfully"})
}
