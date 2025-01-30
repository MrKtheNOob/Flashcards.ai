package main

import (
	"bufio"
	"errors"
	"fmt"
	"net"
	"regexp"
	"strings"
	"time"
)

const (
	minPasswordLength = 8
	minUsernameLength = 2
)

type RegisterPayload struct {
	Email     string `json:"email"`
	Username  string `json:"username"`
	Password  string `json:"password"`
	CPassword string `json:"cPassword"`
}

func (*RegisterPayload) verifyEmailSMTP(email string) bool {
	atIndex := strings.LastIndex(email, "@")
	domain := email[atIndex+1:]

	// Perform MX record lookup
	mxRecords, err := net.LookupMX(domain)
	if err != nil || len(mxRecords) == 0 {
		fmt.Println("Failed to find MX records:", err)
		return false
	}
	mailServer := mxRecords[0].Host

	// Connect to the mail server with a timeout
	conn, err := net.DialTimeout("tcp", mailServer+":25", 5*time.Second)
	if err != nil {
		fmt.Println("Failed to connect to mail server:", err)
		return false
	}
	defer conn.Close()

	reader := bufio.NewReader(conn)
	_, _ = reader.ReadString('\n') // Read the initial server response

	// Simulate email conversation
	commands := []string{
		"HELO test.com\r\n",
		"MAIL FROM:<test@test.com>\r\n",
		fmt.Sprintf("RCPT TO:<%s>\r\n", email),
	}
	for _, cmd := range commands {
		_, err := conn.Write([]byte(cmd))
		if err != nil {
			fmt.Println("Error sending command:", err)
			return false
		}
		resp, err := reader.ReadString('\n')
		if err != nil {
			fmt.Println("Error reading response:", err)
			return false
		}
		if strings.HasPrefix(cmd, "RCPT TO:") && !strings.HasPrefix(resp, "250") {
			fmt.Println("Invalid email:", resp)
			return false
		}
	}

	fmt.Printf("Email %s is valid!\n", email)
	return true
}

// Helper function for email format validation
func (*RegisterPayload) isValidEmailFormat(email string) bool {
	re := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	return re.MatchString(email)
}
func (rp *RegisterPayload) Validate() error {
	if len(rp.Username) < minUsernameLength {
		return fmt.Errorf("username must be at least %d characters long", minUsernameLength)
	}
	if len(rp.Password) < minPasswordLength {
		return fmt.Errorf("password must be at least %d characters long", minPasswordLength)
	}
	if rp.Password != rp.CPassword {
		return errors.New("passwords do not match")
	}
	if !rp.isValidEmailFormat(rp.Email) {
		return errors.New("invalid email address")
	}
	if !rp.verifyEmailSMTP(rp.Email) {
		return errors.New("email does not exist")
	}
	return nil
}
