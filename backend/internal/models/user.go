package models

import "gorm.io/gorm"

// User represents a user in the application
type User struct {
	gorm.Model
	Email        string `gorm:"unique;not null"`
	Nickname     string
	ProfileImage string
	Provider     string
	Reviews      []Review
	Bookmarks    []Bookmark
}
