package main

import (
	"fmt"
	"net/http"
	"path/filepath"
)

func SetupRoutes(router *http.ServeMux, db *DatabaseManager) {

	router.HandleFunc("GET /api/flashcards/decks/{deckname}", Middleware(func(w http.ResponseWriter, r *http.Request) {
		handleGetFlashcards(w, r, db)
	}, db))
	router.HandleFunc("OPTIONS /api/flashcards/decks", Middleware(func(w http.ResponseWriter, r *http.Request) {
		getDecksHander(w, r, db)
	}, db))
	router.HandleFunc("GET /api/flashcards/decks", Middleware(func(w http.ResponseWriter, r *http.Request) {
		getDecksHander(w, r, db)
	}, db))
	router.HandleFunc("POST /api/flashcards/decks/update", Middleware(func(w http.ResponseWriter, r *http.Request) {
		handleUpdateDecks(w, r, db)
	}, db))
	router.HandleFunc("PUT /api/flashcards/decks/update", Middleware(func(w http.ResponseWriter, r *http.Request) {
		changeDeckNameHandler(w, r, db)
	}, db))
	router.HandleFunc("DELETE /api/flashcards/decks/update", Middleware(func(w http.ResponseWriter, r *http.Request) {
		handleUpdateDecks(w, r, db)
	}, db))
	router.HandleFunc("OPTIONS /api/flashcards/decks/update", Middleware(func(w http.ResponseWriter, r *http.Request) {
		handleUpdateDecks(w, r, db)
	}, db))
	router.HandleFunc("POST /api/flashcards/update", Middleware(func(w http.ResponseWriter, r *http.Request) {
		updateFlashcardsHandler(w, r, db)
	}, db))
	router.HandleFunc("PUT /api/flashcards/update", Middleware(func(w http.ResponseWriter, r *http.Request) {
		updateFlashcardsHandler(w, r, db)
	}, db))
	router.HandleFunc("OPTIONS /api/flashcards/update", Middleware(func(w http.ResponseWriter, r *http.Request) {
		addFlashcardHandler(w, r, db)
	}, db))
	router.HandleFunc("POST /api/flashcards/ai-generated", Middleware(func(w http.ResponseWriter, r *http.Request) {
		promptHandler(w, r)
	}, db))
	router.HandleFunc("OPTIONS /api/flashcards/ai-generated", Middleware(func(w http.ResponseWriter, r *http.Request) {
		promptHandler(w, r)
	}, db))
	router.HandleFunc("DELETE /api/flashcards/delete", Middleware(func(w http.ResponseWriter, r *http.Request) {
		deleteFlashcardHandler(w, r, db)
	}, db))
	router.HandleFunc("OPTIONS /api/flashcards/delete", Middleware(func(w http.ResponseWriter, r *http.Request) {
		deleteFlashcardHandler(w, r, db)
	}, db))
	router.HandleFunc("POST /api/register", func(w http.ResponseWriter, r *http.Request) {
		registerHandler(w, r, db)
	})
	router.HandleFunc("OPTIONS /api/register", func(w http.ResponseWriter, r *http.Request) {
		registerHandler(w, r, db)
	})
	router.HandleFunc("POST /api/login", func(w http.ResponseWriter, r *http.Request) {
		loginHandler(w, r, db)
	})
	router.HandleFunc("OPTIONS /api/login", func(w http.ResponseWriter, r *http.Request) {
		loginHandler(w, r, db)
	})
	router.HandleFunc("POST /api/feedback", Middleware(func(w http.ResponseWriter, r *http.Request) {
		sendFeedbackHandler(w, r, db)
	}, db))
	router.HandleFunc("OPTIONS /api/feedback", func(w http.ResponseWriter, r *http.Request) {
		HandlePreflightRequest(w, r)
	})
	router.HandleFunc("POST /api/logout", Middleware(logoutHandler, db))
	router.HandleFunc("OPTIONS /api/logout", Middleware(logoutHandler, db))

	// Define the path to the frontend folder
	frontendPath := "../dist"

	router.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir(filepath.Join(frontendPath, "assets")))))

	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println(r.URL.Path, "Triggered")
		http.ServeFile(w, r, filepath.Join(frontendPath, "index.html"))
	})
}
