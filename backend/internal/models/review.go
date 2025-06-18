package models

import "gorm.io/gorm"

// Review represents a user's review for a restaurant
type Review struct {
	gorm.Model
	UserID       uint
	RestaurantID uint
	Content      string
	Rating       float64
	Images       []ReviewImage
}

// ReviewImage represents an image attached to a review
type ReviewImage struct {
	gorm.Model
	ReviewID uint
	URL      string `gorm:"not null"`
}
