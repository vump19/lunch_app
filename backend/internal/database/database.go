package database

import (
	"lunch_app/backend/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	db, err := gorm.Open(sqlite.Open("lunch_app.db"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database!")
	}

	err = db.AutoMigrate(
		&models.User{},
		&models.Restaurant{},
		&models.Review{},
		&models.ReviewImage{},
		&models.Bookmark{},
		&models.Visit{},
	)
	if err != nil {
		panic("Failed to migrate database!")
	}

	DB = db
}
