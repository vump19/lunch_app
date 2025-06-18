package models

import "gorm.io/gorm"

// Restaurant represents a restaurant in the application
type Restaurant struct {
	gorm.Model
	Name      string
	Address   string
	Phone     string
	Category  string
	Latitude  float64
	Longitude float64
	Reviews   []Review
	Bookmarks []Bookmark
}
