package database

import (
	"fmt"
	"lunch_app/backend/internal/models"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	var db *gorm.DB
	var err error

	// Render.com에서는 DATABASE_URL 환경변수로 PostgreSQL URL을 제공
	if databaseURL := os.Getenv("DATABASE_URL"); databaseURL != "" {
		// Production: PostgreSQL 사용
		fmt.Println("🗄️ PostgreSQL 데이터베이스에 연결 중...")
		db, err = gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
		if err != nil {
			panic("Failed to connect to PostgreSQL database: " + err.Error())
		}
		fmt.Println("✅ PostgreSQL 연결 성공!")
	} else {
		// Development: SQLite 사용  
		fmt.Println("🗄️ SQLite 데이터베이스에 연결 중...")
		db, err = gorm.Open(sqlite.Open("lunch_app.db"), &gorm.Config{})
		if err != nil {
			panic("Failed to connect to SQLite database: " + err.Error())
		}
		fmt.Println("✅ SQLite 연결 성공!")
	}

	// 데이터베이스 마이그레이션
	fmt.Println("🔄 데이터베이스 마이그레이션 실행 중...")
	err = db.AutoMigrate(
		&models.User{},
		&models.Restaurant{},
		&models.Review{},
		&models.ReviewImage{},
		&models.Bookmark{},
		&models.Visit{},
	)
	if err != nil {
		panic("Failed to migrate database: " + err.Error())
	}
	fmt.Println("✅ 데이터베이스 마이그레이션 완료!")

	DB = db
}
