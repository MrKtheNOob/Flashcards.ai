package main

import (
	"database/sql"
	"errors"
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

var (
	errDeckAlreadyExists = errors.New("deck already exists")
	errDeckDoesNotExist  = errors.New("Deck does not exist")
	errUserAlreadyExists = errors.New("User already exists")
	errUserDoesNotExist  = errors.New("User does not exists")
	queryErrorPrefix     = fmt.Sprintln("SQL querry error :")
)

// create user - Done in CreateUser method
// create deck - Done in CreateDeck method
// add flashcard - Done in CreateFlashcard method
// modify deckname - Done in ChangeDeckName method
// remove deck - Done in DeleteDeck method
// remove flashcard - Done in DeleteFlashcard method
// modify username - Done in ChangeUsername method
// remove user - Done in EditFlashcard method
// modify flashcard - Done in EditFlashcard method
type DatabaseManager struct {
	DB *sql.DB
	// users map[string]string
}

func InitialiseDB(dsn string) (*DatabaseManager, error) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}
	if err := db.Ping(); err != nil {
		return nil, err
	}
	fmt.Println("Connceted successfully to database")
	return &DatabaseManager{DB: db}, nil
}

// Ping the database
func (*DatabaseManager) PingDB(db *DatabaseManager) error {
	return db.DB.Ping()
}
func (db *DatabaseManager) AuthenticateUser(username, password string) error {
	user, err := db.GetUserByUsernameAndPassword(username, password)
	if err != nil {
		return err
	}
	if user == nil {
		return errUserDoesNotExist
	}

	return nil

}
func (db *DatabaseManager) SaveToLogs(prompt, response string) error {
	query := "INSERT INTO Logs (prompt,response) VALUES (?,?)"
	_, err := db.DB.Exec(query, prompt, response)
	if err != nil {
		return err
	}
	return nil
}

// InserUser registers a new user into the db
func (db *DatabaseManager) CreateUser(username string, password string) error {
	user, err := db.GetUserByUsername(username)
	if err != nil {
		return errors.New("username already taken")
	}
	if user != nil {
		return errUserAlreadyExists
	}
	query := "INSERT INTO Users (username,password) VALUES (?, ?)"
	_, err = db.DB.Exec(query, username, password)
	return err
}

func (db *DatabaseManager) CreateDeck(userID int, deckname string) error {
	//Check if the user id provided belongs to an existing user
	user, err := db.GetUserByID(userID)
	if err != nil {
		log.Println(err)
		return err
	}
	if user == nil {
		return errDeckAlreadyExists
	}
	query := "INSERT INTO Decks (name,user_id) VALUES (?, ?)"
	_, err = db.DB.Exec(query, deckname, userID)
	if err != nil {
		return err
	}
	return nil
}

func (db *DatabaseManager) CreateFlashcard(deckID int, front string, back string) error {
	// Proceed with the insertion
	insertQuery := "INSERT INTO Flashcards (deck_id, front, back) VALUES (?, ?, ?)"
	_, err := db.DB.Exec(insertQuery, deckID, front, back)

	if err != nil {
		return fmt.Errorf("error inserting flashcard: %v", err)
	}
	return nil
}
func (db *DatabaseManager) DeleteFlashcard(deckID int, front string, back string) error {
	query := "DELETE FROM Flashcards WHERE deck_id=? AND front=? AND back=?"
	_, err := db.DB.Exec(query, deckID, front, back)
	if err != nil {
		return err
	}
	return nil
}

func (db *DatabaseManager) CheckIfUserExists(userID int) (*User, error) {
	user, err := db.GetUserByID(userID)
	if err != nil {
		return nil, fmt.Errorf("%s %s", queryErrorPrefix, err.Error())
	}
	return user, nil
}
func (db *DatabaseManager) GetUserByUsernameAndPassword(username string, password string) (*User, error) {

	query := "SELECT id,username, password,created_at FROM Users WHERE username = ? AND password= ?"
	row := db.DB.QueryRow(query, username, password)

	var user User
	err := row.Scan(&user.ID, &user.Username, &user.Password, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &user, nil
}
func (db *DatabaseManager) GetUserByID(userID int) (*User, error) {
	query := "SELECT id, username, password, created_at FROM Users WHERE id=?"
	row := db.DB.QueryRow(query, userID)

	var user User
	err := row.Scan(&user.ID, &user.Username, &user.Password, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (db *DatabaseManager) GetUserByUsername(username string) (*User, error) {
	query := "SELECT id, username, password, created_at FROM Users WHERE username = ?"
	row := db.DB.QueryRow(query, username)

	var user User
	err := row.Scan(&user.ID, &user.Username, &user.Password, &user.CreatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (db *DatabaseManager) DeleteUser(userID int) error {
	query := "DELETE FROM Users WHERE id = ?"
	_, err := db.DB.Exec(query, userID)
	if err != nil {
		return fmt.Errorf("%s %s", queryErrorPrefix, err.Error())
	}
	return nil
}

func (db *DatabaseManager) DeleteDeck(deckname string, userID int) error {
	user, err := db.CheckIfUserExists(userID)
	if err != nil {
		return fmt.Errorf("%s %s", queryErrorPrefix, err.Error())
	}
	if user == nil {
		return errUserDoesNotExist
	}
	deleteDeckQuery := "DELETE FROM Decks WHERE user_id = ? AND name= ?"
	_, err = db.DB.Exec(deleteDeckQuery, userID, deckname)
	if err != nil {
		return fmt.Errorf("%s %s", queryErrorPrefix, err.Error())
	}
	return nil
}
func (db *DatabaseManager) GetDecksByUserID(userID int) ([]Deck, error) {
	// Query to select all decks for the given user_id
	query := "SELECT * FROM Decks WHERE user_id = ?"
	rows, err := db.DB.Query(query, userID)
	if err != nil {
		return nil, fmt.Errorf("error querying decks: %v", err)
	}
	defer rows.Close()

	var decks []Deck
	for rows.Next() {
		var deck Deck
		err := rows.Scan(&deck.ID, &deck.Name, &deck.UserID, &deck.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("error scanning deck: %v", err)
		}
		decks = append(decks, deck)
	}

	// Check for errors from iterating over rows.
	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over rows: %v", err)
	}
	if len(decks) == 0 {
		return []Deck{}, nil
	}

	return decks, nil
}
func (db *DatabaseManager) GetFlashcardsFromDeck(deck *Deck, userID int) ([]Flashcard, error) {
	//check if the deck exists
	rows, err := db.DB.Query("SELECT id, front, back, deck_id FROM Flashcards WHERE deck_id = ?", deck.ID)
	if err != nil {
		return nil, fmt.Errorf("%s %s", queryErrorPrefix, err.Error())
	}
	defer rows.Close()
	var flashcards []Flashcard

	for rows.Next() {
		var flashcard Flashcard
		// Scan the current row into the struct fields
		err := rows.Scan(&flashcard.ID, &flashcard.Front, &flashcard.Back, &flashcard.DeckID)
		if err != nil {
			return nil, err
		}
		flashcards = append(flashcards, flashcard)
	}
	return flashcards, nil

}
func (db *DatabaseManager) GetDeckByName(deckname string, userID int) (*Deck, error) {
	query := "SELECT id, name, created_at, user_id FROM Decks WHERE name = ? AND user_id = ?"
	row := db.DB.QueryRow(query, deckname, userID)

	var deck Deck
	err := row.Scan(&deck.ID, &deck.Name, &deck.CreatedAt, &deck.UserID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &deck, nil
}

func (db *DatabaseManager) GetUsers() ([]User, error) {
	query := "SELECT * FROM Users"
	rows, err := db.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		if err := rows.Scan(&user.ID, &user.Username, &user.Password, &user.CreatedAt); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, rows.Err()
}
func (db *DatabaseManager) GetDecks() ([]Deck, error) {
	query := "SELECT * FROM Decks"
	rows, err := db.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []Deck
	for rows.Next() {
		var user Deck
		if err := rows.Scan(&user.ID, &user.Name, &user.CreatedAt, &user.UserID); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, rows.Err()
}

func (db *DatabaseManager) ChangeDeckName(deckID int, newName string) error {
	deck, err := db.GetDecksByUserID(deckID)
	if !(deck != nil && err != nil) {
		return errDeckDoesNotExist
	}
	query := "UPDATE Decks SET name = ? WHERE id= ?"
	_, err = db.DB.Exec(query, newName, deckID)
	if err != nil {
		return fmt.Errorf("%s %s", queryErrorPrefix, err.Error())
	}
	return nil
}
func (db *DatabaseManager) EditFlashcard(deckID int, front string, back string, newFront string, newBack string) error {
	// Check if the deck ID exists
	deck, err := db.GetDecksByUserID(deckID)
	if !(deck != nil && err != nil) {
		return errDeckDoesNotExist
	}
	// Update the flashcard
	query := "UPDATE Flashcards SET front = ?, back = ? WHERE deck_id = ? AND front = ? AND back = ?"
	_, err = db.DB.Exec(query, newFront, newBack, deckID, front, back)
	if err != nil {
		return fmt.Errorf("%s %s", queryErrorPrefix, err.Error())
	}
	return nil
}
func (db *DatabaseManager) ChangeUsername(userID int, newUsername string) error {
	user, err := db.CheckIfUserExists(userID)
	if err != nil {
		return fmt.Errorf("%s %s", queryErrorPrefix, err.Error())
	}
	if user == nil {
		return errUserDoesNotExist
	}
	query := "UPDATE Users SET username = ? WHERE id = ?"
	_, err = db.DB.Exec(query, newUsername, userID)
	if err != nil {
		return fmt.Errorf("%s %s", queryErrorPrefix, err.Error())
	}
	return nil
}
