package models

import "gorm.io/gorm"

// Bookmark represents a user's bookmark for a restaurant
type Bookmark struct {
	gorm.Model
	UserID       uint `gorm:"primaryKey"`
	RestaurantID uint `gorm:"primaryKey"`
}
