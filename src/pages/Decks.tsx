import Deck from "../components/Deck";
import ParticlesComponent from "../components/ParticlesBackground";
import { fetchDecks, updateFlashcards } from "../APIMethods";
import { useEffect, useRef, useState } from "react";
import AddDeck from "../components/AddDeck";
import Header from "../components/Header";
import Alert from "../components/Alert";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
// import Alert from "../components/Alert";

//this although is a page a child component of Menu
export default function Decks() {
  const [decks, setDecks] = useState<string[]>([]); // Stores fetched data
  const [isEditing, setEditState] = useState<boolean>(false); // Editing state
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching decks...");
        const response = await fetchDecks();
        console.log(response) 
        if (response.error?.message=="go back to auth"){
          console.log("Not logged in ,going back to auth")
          navigate("/authpage");
        }
        if (!response.error) {
          setDecks(response.data??[]);
        } else {
          console.error("Error fetching decks:", response.error);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    fetchData();
  }, [isEditing]);
  

  const inputRef = useRef<HTMLInputElement>(null);
  const handleCreateDeck = () => {
    const inputValue = inputRef.current?.value;
    if (!inputValue) {
      // I want in the future for these alerts to be text in the dialog box in red
      alert("Deck name cannot be empty");
      return;
    }
    updateFlashcards({ Deckname: inputValue ?? "" }).then((error) => {
      if (error) {
        if (error.message==="go back to auth"){
          navigate("/authpage");
        }
      } else {
        alert("Deck created successfully");
        window.location.reload()
      }
    });
  };
  return (
    <>
      <ParticlesComponent />
      <Header selectedPage="decks" />
      <h1 className="text-center">Decks Menu</h1>
      {isEditing && (
        <Alert onClose={()=>setEditState(false)}>
          <h1 style={{color:"black"}}>Créez un nouveau Deck</h1>
          <input
            style={{ margin: "2em" }}
            ref={inputRef}
            type="text"
            placeholder="Enter new deck name"
          />
          <div
            style={{ display: "flex", justifyContent: "center", gap: "10px" }}
          >
            <Button textContent="Create" onClick={handleCreateDeck} />
          </div>
        </Alert>
      )}
      <div className="container decks-container">
        {decks.length === 0 ? (
          <h1 style={{ textAlign: "center", paddingTop: "25%" }}>
            No decks found
          </h1>
        ) : (
          decks.map((deck, index) => <Deck key={index} title={deck} onDelete={()=>{setEditState(false)}} />)
        )}
        <AddDeck
          onClick={() => {
            setEditState(true);
          }}
        />
      </div>
    </>
  );
}
