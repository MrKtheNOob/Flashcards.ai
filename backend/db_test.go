package main

import (
	"fmt"
	"testing"
)

// func iteration(db *DatabaseManager, t *testing.T, i int, wg *sync.WaitGroup) {
// 	defer wg.Done()
// 	err := db.CreateFlashcard(1, "front"+fmt.Sprint(i), "back"+fmt.Sprint(i))
// 	if err != nil {
// 		fmt.Println(err)
// 		t.Failed()
// 		return
// 	}
// 	fmt.Println(fmt.Sprint(i) + "done")

// }
func TestCreateDeck(t *testing.T) {
	// var wg sync.WaitGroup
	db, _ := InitialiseDB("avnadmin:AVNS_c_IbodfjxAQI1VglZrL@tcp(bamba-sdb-ahmadoubamba706-0e2.c.aivencloud.com:25451)/defaultdb?tls=skip-verify")
	err := db.DeleteDeck("changeddeck", 3)
	if err != nil {
		fmt.Println(err)
		t.Failed()
	}

	// wg.Wait()
}
