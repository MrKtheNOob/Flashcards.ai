package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"net/http"
	"os"

	"strings"

	"github.com/google/generative-ai-go/genai"
	"github.com/gorilla/sessions"
	"google.golang.org/api/option"
)

func HandlePreflightRequest(w http.ResponseWriter, r *http.Request) bool {
	fmt.Println("Handling preflight request")
	w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
	w.Header().Set("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS,PUT")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Access-Control-Allow-Credentials")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return true // Indicates the preflight request was handled
	}
	return false // Indicates the preflight request was not handled
}

// returns the result of the prompt from gemini
func GetFormatedResponse(resp *genai.GenerateContentResponse) string {
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
	client, err := genai.NewClient(ctx, option.WithAPIKey(""))
	if err != nil {
		return "", err
	}
	defer client.Close()
	model := client.GenerativeModel("gemini-1.5-flash")
	resp, err := model.GenerateContent(ctx, genai.Text(fmt.Sprintln(promptPrefix, input)))
	if err != nil {
		return "", err
	}
	response := GetFormatedResponse(resp)
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
	go func() {
		err = savePromptAndResponse(input, promptResponse)
		if err != nil {
			log.Println("Error saving prompt response")
		}
	}()
	// Formatting the response
	promptResponse = strings.Replace(promptResponse, "```json", "", 1)
	promptResponse = strings.Replace(promptResponse, "```", "", 1)
	// Converting it to JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(promptResponse))
	fmt.Println("Prompt request handled successfully")
}

// Handles creating and deleting deck
func handleUpdateDecks(w http.ResponseWriter, r *http.Request, db *DatabaseManager) {
	log.Println("Connection to api/flashcards/decks/update from", r.RemoteAddr)
	userID := r.Context().Value("userID").(int)
	//Parse the request payload
	var payload struct{ DeckName string }
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println(err)
		return
	}
	switch r.Method {
	case http.MethodDelete:
		err = db.DeleteDeck(payload.DeckName, userID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			log.Println(err.Error())
			return
		}
		log.Printf("Deck %s has been deleted\n/flashcards/decks/update success\n", payload.DeckName)
		fmt.Println("Update decks request handled successfully")
		return
	case http.MethodPost:
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
	}
}

// Didn't want to blend it in inside the previous function because they don't take the same data structure
func changeDeckNameHandler(w http.ResponseWriter, r *http.Request, db *DatabaseManager) {
	log.Println("Connection to api/flashcards/decks/update from", r.RemoteAddr)
	userID := r.Context().Value("userID").(int)

	var payload struct {
		OldName string
		NewName string
	}
	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		log.Println(err)
		return
	}
	err = db.ChangeDeckName(userID, payload.OldName, payload.NewName)
	if err != nil {
		log.Println(err)
		if err == errDeckDoesNotExist {
			http.Error(w, fmt.Sprintf("deck of name %s does not exist", payload.OldName), http.StatusNotFound)
			return
		}
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	log.Println("Put request handled successfully")
}
func updateFlashcardsHandler(w http.ResponseWriter, r *http.Request, db *DatabaseManager) {
	fmt.Println("Connection to /flashcards/update from", r.RemoteAddr)
	switch r.Method {
	case http.MethodPost:
		addFlashcardHandler(w, r, db)
	case http.MethodPut:
		fmt.Println("Handling edit flashcard")
		var payload struct {
			Deckname string
			old      struct {
				Front string
				Back  string
			}
			new struct {
				Front string
				Back  string
			}
		}
		err := json.NewDecoder(r.Body).Decode(&payload)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			log.Println(err)
			return
		}
		userID := r.Context().Value("userID").(int)
		err = db.EditFlashcard(userID, payload.Deckname, payload.old.Front, payload.old.Back, payload.new.Front, payload.new.Back)
		if err != nil {
			log.Println(err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		fmt.Printf("Flashcard {%s,%s} changed to {%s,%s}\n", payload.old.Front, payload.old.Back, payload.new.Front, payload.new.Back)
	}

}
func addFlashcardHandler(w http.ResponseWriter, r *http.Request, db *DatabaseManager) {
	fmt.Println("Handling add flashcard request")

	userID := r.Context().Value("userID").(int)

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
	fmt.Println("Connection to /flashcards/delete from", r.RemoteAddr)
	fmt.Println("Handling delete flashcard request")

	userID := r.Context().Value("userID").(int)

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

	log.Printf("flashcard %v successfully deleted\n", payload.FlashcardToRemove)

}

func handleGetFlashcards(w http.ResponseWriter, r *http.Request, db *DatabaseManager) {
	userID := r.Context().Value("userID").(int)

	deckName := r.PathValue("deckname")
	fmt.Println(deckName)
	if deckName == "" {
		http.Error(w, "deckname is not specified", http.StatusBadRequest)
	}
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
	log.Println("Connection to /flashcards/decks from", r.RemoteAddr)
	userID := r.Context().Value("userID").(int)

	decks, err := db.GetDecksByUserID(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		log.Println(err)
		return
	}
	fmt.Println(decks)
	var deckNames []string
	for _, deck := range decks {
		deckNames = append(deckNames, deck.Name)
	}
	response, err := json.Marshal(deckNames)
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

var store = sessions.NewCookieStore([]byte("your-secret-key"))

// Middleware to check if the user is authenticated
func Middleware(next http.HandlerFunc, db *DatabaseManager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if HandlePreflightRequest(w, r) {
			return // Exit early if the preflight request was handled
		}
		session, err := store.Get(r, "auth-session")
		if err != nil {
			log.Printf("Failed to get session: %v", err)
			http.Error(w, "Session error", http.StatusInternalServerError)
			return
		}

		fmt.Printf("Session values: %+v\n", session.Values)

		isAuthenticated := session.Values["authenticated"]
		if isAuthenticated == nil {
			fmt.Println("isAuthenticated is nil")
			http.Error(w, "User is not authenticated", http.StatusUnauthorized)
			return
		}

		fmt.Println(isAuthenticated)
		if !isAuthenticated.(bool) {
			fmt.Println("Not authenticated , redirecting to auth page")
			http.Error(w, "User is not authenticated", http.StatusUnauthorized)
			return
		}
		// Get the username and pass it as context to r if it exists
		username := session.Values["username"].(string)
		// Retrieve user ID from the database
		user, err := db.GetUserByUsername(username)
		if err != nil {
			http.Error(w, "User not found", http.StatusUnauthorized)
			return
		}
		// Attach user ID to the request context
		ctx := context.WithValue(r.Context(), "userID", user.ID)
		r = r.WithContext(ctx)

		// Call the next handler
		next(w, r)
	}
}

// Register Handler
func registerHandler(w http.ResponseWriter, r *http.Request, db *DatabaseManager) {
	if HandlePreflightRequest(w, r) {
		fmt.Println("Preflight request handled")
		return // Exit early if the preflight request was handled
	}
	log.Println("Connection to /register from", r.RemoteAddr)
	fmt.Println("Handling register request")

	var payload RegisterPayload

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		log.Println(err)
		return
	}
	//forgot the email ....
	err = db.CreateUser(payload.Username, payload.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	log.Printf("User %s registered successfully\n", payload.Username)
	fmt.Println("Register request handled successfully")
}

// Login Handler
func loginHandler(w http.ResponseWriter, r *http.Request, db *DatabaseManager) {
	if HandlePreflightRequest(w, r) {
		fmt.Println("Preflight request handled")
		return // Exit early if the preflight request was handled
	}
	log.Println("Connection to /login from", r.RemoteAddr)
	fmt.Println("Handling login request")

	var credentials struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	err := json.NewDecoder(r.Body).Decode(&credentials)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		log.Println(err)
		return
	}
	// Authenticate user with your database
	err = db.AuthenticateUser(credentials.Username, credentials.Password)
	switch err {
	case nil:
		//do nothing
	case errUserDoesNotExist:
		http.Error(w, "mot de passe ou nom d'utilisateur invalide", http.StatusUnauthorized)
		return
	default:
		http.Error(w, "mot de passe ou nom d'utilisateur invalide", http.StatusUnauthorized)
		return
	}

	// Create a new session
	session, _ := store.Get(r, "auth-session")
	session.Values["username"] = credentials.Username
	session.Values["authenticated"] = true
	fmt.Println("authenticated key", session.Values["authenticated"])
	fmt.Println("username key", session.Values["username"])
	// Save the session
	err = session.Save(r, w)
	if err != nil {
		http.Error(w, "Could not save session", http.StatusInternalServerError)
		log.Println(err)
		return
	}
	w.WriteHeader(http.StatusAccepted)
	fmt.Fprintf(w, "Hello, %s!.\n", credentials.Username)
	fmt.Println("Login request handled successfully")
}

// Logout Handler
func logoutHandler(w http.ResponseWriter, r *http.Request) {
	if HandlePreflightRequest(w, r) {
		fmt.Println("Preflight request handled")
		return // Exit early if the preflight request was handled
	}
	log.Println("Connection to /logout from", r.RemoteAddr)
	fmt.Println("Handling logout request")

	session, _ := store.Get(r, "session")
	// Invalidate the session
	session.Values["authenticated"] = false
	session.Save(r, w)

	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "You have been logged out.")
	fmt.Println("Logout request handled successfully")
}
func sendFeedbackHandler(w http.ResponseWriter, r *http.Request, db *DatabaseManager) {
	fmt.Println("Connection to /api/feedback from ", r.RemoteAddr) //idea: Put this print statement inside the middleware with r.RequestURI to show the uri
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Error parsing form data", http.StatusBadRequest)
		return
	}
	UserID := r.Context().Value("userID").(int)
	fmt.Println("UserID:", UserID)
	answer := r.FormValue("answer")
	fmt.Println("Answer:", answer)
	feedback := r.FormValue("feedback")
	fmt.Println("Feedback:", feedback)
	if len(answer) == 0 {
		http.Error(w, "answer was not specified", http.StatusBadRequest)
		return
	}
	if len(feedback) == 0 {
		http.Error(w, "feedback was not specified", http.StatusBadRequest)
		return
	}
	err = db.saveFeedback(answer, feedback, UserID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusAccepted)
	fmt.Fprintf(w, "Merci pour votre retour 👍🙏")
}
