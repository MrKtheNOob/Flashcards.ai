package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gorilla/sessions"
)

// modals
type Deck struct {
	ID        int
	Name      string
	CreatedAt string
	UserID    int
}

type Flashcard struct {
	ID     int
	Front  string
	Back   string
	DeckID int
}

type User struct {
	ID        int
	Username  string
	Password  string
	CreatedAt string
}

type Payload struct {
	DeckName  string
	Flashcard Flashcard
}

type Log struct {
	Prompt   string
	Response string
}

const (
	flashcardsFilePath = "./FlashcardData.json"
	promptPrefix       = `	Generate educational flashcards in french from the following content. 
							Each flashcard should include:A field called 'Front' with a question summarizing a key concept.
							Another field called 'Back' with a concise explanation or definition answering the question.
							Output the flashcards as a JSON array, with each flashcard as an object containing the 'Front' 
							and 'Back' attributes. Use clear, factual language and keep the responses concise .
							Here is the content to process:`
	logsFilePath  = "./prompt_logs.json"
	allowedOrigin = "http://192.168.18.6:5173"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	db, err := InitialiseDB("avnadmin:AVNS_c_IbodfjxAQI1VglZrL@tcp(bamba-sdb-ahmadoubamba706-0e2.c.aivencloud.com:25451)/defaultdb?tls=skip-verify")
	if err != nil {
		log.Panicln("Could not connect to database")
	}
	log.Println("Server started")
	router := http.NewServeMux()
	SetupRoutes(router, db)
	store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   3600, //seconds
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   false,
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := http.ListenAndServe("192.168.18.6:"+port, router); err != nil {
		panic(err)
	}
}
