package models

import (
	"time"

	"gorm.io/gorm"
)

type Visit struct {
	ID           uint           `json:"ID" gorm:"primarykey"`
	RestaurantID uint           `json:"RestaurantID"`
	Restaurant   Restaurant     `json:"Restaurant" gorm:"foreignKey:RestaurantID;constraint:OnDelete:SET NULL"`
	VisitDate    time.Time      `json:"VisitDate"`
	CreatedAt    time.Time      `json:"CreatedAt"`
	UpdatedAt    time.Time      `json:"UpdatedAt"`
	DeletedAt    gorm.DeletedAt `json:"DeletedAt" gorm:"index"`
}
