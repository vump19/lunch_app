package routes

import (
	"lunch_app/backend/internal/handlers"

	"github.com/gin-gonic/gin"
)

func Setup(router *gin.Engine) {
	// Health check endpoint (outside API group for simplicity)
	router.GET("/health", handlers.HealthCheck)
	
	api := router.Group("/api")
	{
		// Restaurant routes
		restaurantRoutes := api.Group("/restaurants")
		{
			restaurantRoutes.GET("/", handlers.GetAllRestaurants)
			restaurantRoutes.GET("/:id", handlers.GetRestaurantByID)
			restaurantRoutes.POST("/", handlers.CreateRestaurant)
			restaurantRoutes.DELETE("/:id", handlers.DeleteRestaurant)
		}

		// Visit routes - 추가
		visitRoutes := api.Group("/visits")
		{
			visitRoutes.GET("/", handlers.GetAllVisits)
			visitRoutes.POST("/", handlers.CreateVisit)
			visitRoutes.PUT("/:id", handlers.UpdateVisit)
			visitRoutes.DELETE("/:id", handlers.DeleteVisit)
		}
	}
}
