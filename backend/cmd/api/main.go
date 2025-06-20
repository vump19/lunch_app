package main

import (
	"lunch_app/backend/internal/database"
	"lunch_app/backend/internal/models"
	"lunch_app/backend/internal/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

func main() {
	// .env 파일 로드 (선택적 - 없어도 오류 발생하지 않음)
	godotenv.Load()

	// 데이터베이스 초기화 부분
	database.Connect()
	// 마이그레이션 추가
	database.DB.AutoMigrate(&models.Restaurant{}, &models.Visit{})

	// Insert test data
	insertTestData(database.DB)

	r := gin.Default()

	r.Use(cors.Default())

	routes.Setup(r)

	r.Run(":8080")
}

func insertTestData(db *gorm.DB) {
	// Check if data already exists
	var count int64
	db.Model(&models.Restaurant{}).Count(&count)
	if count > 0 {
		return
	}

	restaurants := []models.Restaurant{
		{Name: "고향집", Address: "서울시 강남구", Phone: "02-123-4567", Category: "한식", Latitude: 37.4979, Longitude: 127.0276},
		{Name: "차이나오", Address: "서울시 서초구", Phone: "02-987-6543", Category: "중식", Latitude: 37.4836, Longitude: 127.0325},
		{Name: "스시하나", Address: "서울시 종로구", Phone: "02-456-7890", Category: "일식", Latitude: 37.5729, Longitude: 126.9794},
	}

	for _, r := range restaurants {
		db.Create(&r)
	}
}
