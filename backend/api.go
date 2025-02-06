package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"math/rand"

	"github.com/google/generative-ai-go/genai"

	"google.golang.org/api/option"
)

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
	promptPrefix       = "Generate educational flashcards in french from the following content. Each flashcard should include:A 'front' field with a question summarizing a key concept.A 'back' field with a concise explanation or definition answering the question.Output the flashcards as a JSON array, with each flashcard as an object containing the 'front' and 'back' attributes. Use clear, factual language and keep the responses concise . Here is the content to process:"
	logsFilePath       = "./prompt_logs.json"
)

// var (
// 	sessionStore = make(map[string]string) // sessionID -> username
// 	mu           sync.Mutex
// )

func handlePreflightRequest(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Handling preflight request")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}
}

// returns the result of the prompt from gemini
func getFormatedResponse(resp *genai.GenerateContentResponse) string {
	var response []genai.Part
	for _, cand := range resp.Candidates {
		if cand.Content != nil {
			response = append(response, cand.Content.Parts...)
		}
	}

	var textParts []string
	for _, part := range response {
		textParts = append(textParts, fmt.Sprintf("%v", part))
	}
	return strings.Join(textParts, "")
}
func prompt(input string) (string, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey("AIzaSyAj4IBGWwyp_wsjdueKY4ssuvTpu_ylS5s"))
	if err != nil {
		return "", err
	}
	defer client.Close()
	model := client.GenerativeModel("gemini-1.5-flash")
	resp, err := model.GenerateContent(ctx, genai.Text(fmt.Sprintln(promptPrefix, input)))
	if err != nil {
		return "", err
	}
	response := getFormatedResponse(resp)
	fmt.Println(response)
	return response, nil
}

func savePromptAndResponse(text string, response string) error {
	var logs []Log
	rawData, err := os.ReadFile(logsFilePath)
	if err != nil {
		return err
	}
	err = json.Unmarshal(rawData, &logs)
	if err != nil {
		return err
	}
	newLog := Log{Prompt: text, Response: response}
	logs = append(logs, newLog)
	updatedLogs, _ := json.MarshalIndent(logs, " ", "")
	err = os.WriteFile(logsFilePath, updatedLogs, 0644)
	if err != nil {
		return err
	}
	return nil
}

func promptHandler(w http.ResponseWriter, r *http.Request) {
	handlePreflightRequest(w, r)
	log.Println("Connection to /flashcards/ai-generated from ", r.RemoteAddr)
	fmt.Println("Handling prompt request")
	// Parse the form data
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Error parsing form data", http.StatusBadRequest)
		return
	}

	input := r.FormValue("text")
	promptResponse, err := prompt(input)
	if err != nil {
		http.Error(w, "Error generating prompt response", http.StatusInternalServerError)
		return
	}
	err = savePromptAndResponse(input, promptResponse)
	if err != nil {
		http.Error(w, "Error saving prompt response", http.StatusInternalServerError)
		return
	}
	// Formatting the response
	promptResponse = strings.Replace(promptResponse, "```json", "", 1)
	promptResponse = strings.Replace(promptResponse, "```", "", 1)
	// Converting it to JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(promptResponse))
	fmt.Println("Prompt request handled successfully")
}

func handleUpdateDecks(w http.ResponseWriter, r *http.Request, db *DatabaseManager) {
	handlePreflightRequest(w, r)
	log.Println("Connection to /flashcards/decks/update from", r.RemoteAddr)
	fmt.Println("Handling update decks request")

	// userID := r.Context().Value("userID").(int)

	userID := 4
	var payload struct{ DeckName string }
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println(err)
		return
	}

	err = db.CreateDeck(userID, payload.DeckName)
	if err != nil {
		if err == errDeckAlreadyExists {
			http.Error(w, err.Error(), http.StatusConflict)
			log.Println(err.Error())
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			log.Println(err.Error())
		}
		return
	}

	w.WriteHeader(http.StatusCreated)
	log.Printf("Deck %s has been created\n/flashcards/decks/update success\n", payload.DeckName)
	fmt.Println("Update decks request handled successfully")
}

func addFlashcardHandler(w http.ResponseWriter, r *http.Request, db *DatabaseManager) {
	handlePreflightRequest(w, r)
	fmt.Println("Connection to /flashcards/update from", r.RemoteAddr)
	fmt.Println("Handling add flashcard request")

	// userID := r.Context().Value("userID").(int)
	userID := 4

	var payload Payload
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println(err)
		return
	}

	deck, err := db.GetDeckByName(payload.DeckName, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println(err)
		return
	}
	if deck == nil {
		http.Error(w, "Deck not found", http.StatusNotFound)
		return
	}

	err = db.CreateFlashcard(deck.ID, payload.Flashcard.Front, payload.Flashcard.Back)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println(err)
		return
	}

	w.WriteHeader(http.StatusOK)
	log.Println("/flashcards/update success")
	fmt.Println("Add flashcard request handled successfully")
}

func deleteFlashcardHandler(w http.ResponseWriter, r *http.Request, db *DatabaseManager) {
	handlePreflightRequest(w, r)
	fmt.Println("Connection to /flashcards/delete from", r.RemoteAddr)
	fmt.Println("Handling delete flashcard request")

	// userID := r.Context().Value("userID").(int)
	userID := 4

	var payload struct {
		FlashcardToRemove Flashcard
		Deckname          string
	}
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println(err)
		return
	}

	deck, err := db.GetDeckByName(payload.Deckname, userID)
	if err != nil {
		msg := fmt.Sprintf("Could not find deck of name %s;Error:%s\n", payload.Deckname, err.Error())
		log.Println(msg)
		http.Error(w, msg, http.StatusNotFound)
	}

	err = db.DeleteFlashcard(deck.ID, payload.FlashcardToRemove.Front, payload.FlashcardToRemove.Back)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println(err)
		return
	}

	w.WriteHeader(http.StatusOK)
	log.Println("/flashcards/delete success")

	log.Println("flashcard %v successfully deleted", payload.FlashcardToRemove)

}

func handleGetFlashcards(w http.ResponseWriter, r *http.Request, db *DatabaseManager) {
	handlePreflightRequest(w, r)
	fmt.Println("Handling get flashcards request")

	// userID := r.Context().Value("userID").(int)
	userID := 4

	deckName := r.PathValue("deckname")
	fmt.Printf("Connection to /flashcards/decks/%s from %v\n", deckName, r.RemoteAddr)
	deck, err := db.GetDeckByName(deckName, userID)
	if deck == nil {
		http.Error(w, fmt.Sprintf("Deck of name %s not found", deckName), http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	flashcards, err := db.GetFlashcardsFromDeck(deck, userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println(err)
		return
	}
	response, err := json.Marshal(flashcards)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(response)
	log.Printf("/flashcards/decks/%s success\n", deckName)
	fmt.Println("Get flashcards request handled successfully")
}

func getDecksHander(w http.ResponseWriter, r *http.Request, db *DatabaseManager) {
	handlePreflightRequest(w, r)
	log.Println("Connection to /flashcards/decks from", r.RemoteAddr)
	fmt.Println("Handling get decks request")

	// userID := r.Context().Value("userID").(int)
	userID := 4

	decks, err := db.GetDecksByUserID(userID)
	if err != nil {

		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println(err)
		return
	}
	fmt.Println(decks)
	var decknames []string
	for i := range decks {
		decknames = append(decknames, decks[i].Name)
	}
	response, err := json.Marshal(decknames)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(response)
	log.Println("/flashcards/decks success")
	fmt.Println("Get decks request handled successfully")
}

// Generate a Random Session ID
func generateSessionID() string {
	return strconv.FormatInt(rand.Int63(), 16)
}

// Middleware to check if the user is authenticated
// var store = sessions.NewCookieStore([]byte("your-secret-key"))

// Middleware to check if the user is authenticated
// func next http.HandlerFunc, db *DatabaseManager) http.HandlerFunc {
// 	return func(w http.ResponseWriter, r *http.Request) {
// 		handlePreflightRequest(w, r)
// 		session, err := store.Get(r, "session")
// 		if err != nil || session.Values["username"] == nil {
// 			http.Error(w, "Unauthorized", http.StatusUnauthorized)
// 			return
// 		}
// 		username := session.Values["username"].(string)
// 		// Retrieve user ID from the database
// 		user, err := db.GetUserByUsername(username)
// 		if err != nil {
// 			http.Error(w, "User not found", http.StatusUnauthorized)
// 			return
// 		}

// 		// Attach user ID to the request context
// 		ctx := context.WithValue(r.Context(), "userID", user.ID)
// 		r = r.WithContext(ctx)

// 		// Call the next handler
// 		next(w, r)
// 	}
// }

// Register Handler
// func registerHandler(w http.ResponseWriter, r *http.Request, db *DatabaseManager) {
// 	handlePreflightRequest(w, r)
// 	log.Println("Connection to /register from", r.RemoteAddr)
// 	fmt.Println("Handling register request")

// 	var payload RegisterPayload

// 	err := json.NewDecoder(r.Body).Decode(&payload)
// 	if err != nil {
// 		http.Error(w, "Invalid request payload", http.StatusBadRequest)
// 		log.Println(err)
// 		return
// 	}

// 	err = db.CreateUser(payload.Username, payload.Password)
// 	if err != nil {
// 		http.Error(w, err.Error(), http.StatusBadRequest)
// 		return
// 	}

// 	w.WriteHeader(http.StatusCreated)
// 	log.Printf("User %s registered successfully\n", payload.Username)
// 	fmt.Println("Register request handled successfully")
// }

// // Login Handler
// func loginHandler(w http.ResponseWriter, r *http.Request, db *DatabaseManager) {
// 	handlePreflightRequest(w, r)
// 	log.Println("Connection to /login from", r.RemoteAddr)
// 	fmt.Println("Handling login request")

// 	var credentials struct {
// 		Username string `json:"username"`
// 		Password string `json:"password"`
// 	}

// 	err := json.NewDecoder(r.Body).Decode(&credentials)
// 	if err != nil {
// 		http.Error(w, "Invalid request payload", http.StatusBadRequest)
// 		log.Println(err)
// 		return
// 	}

// 	// Authenticate user with your database
// 	err = db.AuthenticateUser(credentials.Username, credentials.Password)
// 	if err != nil {
// 		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
// 		log.Println(err)
// 		return
// 	}

// 	// Create a new session
// 	session, _ := store.Get(r, "session")
// 	session.Values["username"] = credentials.Username
// 	session.Options = &sessions.Options{
// 		Path:     "/",
// 		MaxAge:   86400, // 1 day
// 		HttpOnly: true,
// 	}

// 	// Save the session
// 	err = session.Save(r, w)
// 	if err != nil {
// 		http.Error(w, "Could not save session", http.StatusInternalServerError)
// 		log.Println(err)
// 		return
// 	}

// 	w.WriteHeader(http.StatusAccepted)
// 	fmt.Fprintf(w, "Hello, %s! You are authenticated.\n", credentials.Username)
// 	fmt.Println("Login request handled successfully")
// }

// // Logout Handler
// func logoutHandler(w http.ResponseWriter, r *http.Request) {
// 	handlePreflightRequest(w, r)
// 	log.Println("Connection to /logout from", r.RemoteAddr)
// 	fmt.Println("Handling logout request")

// 	session, _ := store.Get(r, "session")

// 	// Invalidate the session
// 	session.Options.MaxAge = -1
// 	session.Save(r, w)

// 	w.WriteHeader(http.StatusOK)
// 	fmt.Fprintln(w, "You have been logged out.")
// 	fmt.Println("Logout request handled successfully")
// }

func main() {
	db, err := InitialiseDB("avnadmin:AVNS_c_IbodfjxAQI1VglZrL@tcp(bamba-sdb-ahmadoubamba706-0e2.c.aivencloud.com:25451)/defaultdb?tls=skip-verify")
	if err != nil {
		log.Panicln("Could not connect to database")
	}
	log.Println("Server started")
	router := http.NewServeMux()

	router.HandleFunc("GET /api/flashcards/decks/{deckname}", func(w http.ResponseWriter, r *http.Request) {
		handleGetFlashcards(w, r, db)
	})
	router.HandleFunc("GET /api/flashcards/decks", func(w http.ResponseWriter, r *http.Request) {
		getDecksHander(w, r, db)
	})
	router.HandleFunc("OPTIONS /api/flashcards/decks", func(w http.ResponseWriter, r *http.Request) {
		getDecksHander(w, r, db)
	})
	router.HandleFunc("POST /api/flashcards/decks/update", func(w http.ResponseWriter, r *http.Request) {
		handleUpdateDecks(w, r, db)
	})

	router.HandleFunc("OPTIONS /api/flashcards/decks/update", func(w http.ResponseWriter, r *http.Request) {
		handleUpdateDecks(w, r, db)
	})
	router.HandleFunc("POST /api/flashcards/update", func(w http.ResponseWriter, r *http.Request) {
		addFlashcardHandler(w, r, db)
	})
	router.HandleFunc("OPTIONS /api/flashcards/update", func(w http.ResponseWriter, r *http.Request) {
		addFlashcardHandler(w, r, db)
	})
	router.HandleFunc("POST /api/flashcards/ai-generated", func(w http.ResponseWriter, r *http.Request) {
		promptHandler(w, r)
	})
	router.HandleFunc("OPTIONS /api/flashcards/ai-generated", func(w http.ResponseWriter, r *http.Request) {
		promptHandler(w, r)
	})
	router.HandleFunc("OPTIONS /api/flashcards/delete", func(w http.ResponseWriter, r *http.Request) {
		deleteFlashcardHandler(w, r, db)
	})
	router.HandleFunc("DELETE /api/flashcards/delete", func(w http.ResponseWriter, r *http.Request) {
		deleteFlashcardHandler(w, r, db)
	})
	// router.HandleFunc("POST /api/register", func(w http.ResponseWriter, r *http.Request) {
	// 	registerHandler(w, r, db)
	// })
	// router.HandleFunc("OPTIONS /api/register", func(w http.ResponseWriter, r *http.Request) {
	// 	registerHandler(w, r, db)
	// })
	// router.HandleFunc("POST /api/login", func(w http.ResponseWriter, r *http.Request) {
	// 	loginHandler(w, r, db)
	// })
	// router.HandleFunc("OPTIONS /api/login", func(w http.ResponseWriter, r *http.Request) {
	// 	loginHandler(w, r, db)
	// })
	// router.HandleFunc("POST /api/logout", logoutHandler)
	// router.HandleFunc("OPTIONS /api/logout", logoutHandler)

	// Define the path to the frontend folder
	frontendPath := "../frontend"

	router.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir(filepath.Join(frontendPath, "assets")))))

	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println(r.URL.Path, "Triggered")
		http.ServeFile(w, r, filepath.Join(frontendPath, "index.html"))
	})
	if err := http.ListenAndServe(":8080", router); err != nil {
		panic(err)
	}

}
