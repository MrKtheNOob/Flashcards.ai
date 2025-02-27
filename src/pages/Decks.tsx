import Deck from "../components/Deck";
import ParticlesComponent from "../components/ParticlesBackground";
import { fetchDecks, updateFlashcards } from "../APIMethods";
import { useEffect, useMemo, useRef, useState } from "react";
import AddDeck from "../components/AddDeck";
import Header from "../components/Header";
import Alert from "../components/Alert";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
// import Alert from "../components/Alert";

//this although is a page a child component of Menu
export default function Decks() {
  const [decks, setDecks] = useState<string[]>([]); // Stores fetched data
  const [isEditing, setEditState] = useState<boolean>(false); // Editing state
  const [loading, setLoading] = useState<boolean>(true)
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log("Fetching decks...");
        const response = await fetchDecks();
        console.log(response)
        setLoading(false)
        if (response.error?.message == "go back to auth") {
          console.log("Not logged in ,going back to auth")
          navigate("/authpage");
        }
        if (!response.error) {
          setDecks(response.data ?? []);
        } else {
          console.error("Error fetching decks:", response.error);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
    };

    fetchData();
  }, [isEditing]);

  const renderDecks = useMemo(() => {
    if (loading) {
      return <div style={{textAlign:"center"}}><Loading type="circle"/></div>
    } else if (!loading && decks.length > 0) {
      return <>
        {decks.map((deck, index) => <Deck key={index} title={deck} onDelete={async() => {window.location.reload()}} />)}
      </>
    } else {
      return <h1 style={{ textAlign: "center", paddingTop: "25%" }}></h1>
    }
  }, [loading, decks])
  const inputRef = useRef<HTMLInputElement>(null);
  const handleCreateDeck = () => {
    const inputValue = inputRef.current?.value;
    if (!inputValue) {
      // I want in the future for these alerts to be text in the dialog box in red
      alert("Le nom du set ne peut pas etre vide");
      return;
    }
    updateFlashcards({ Deckname: inputValue ?? "" }).then((error) => {
      if (error) {
        if (error.message === "go back to auth") {
          navigate("/authpage");
        }
      } else {
        alert("Vous avez créé un Set")
        window.location.reload()
      }
    });
  };
  return (
    <>
      <ParticlesComponent />
      <Header selectedPage="decks" />
      <h1 className="text-center" style={{ color: "white" }}>Sets</h1>
      {isEditing && (
        <Alert onClose={() => setEditState(false)}>
          <h1 style={{ color: "black" }}>Créez un nouveau Set de flashcards</h1>
          <input
            style={{ margin: "2em"}}
            ref={inputRef}
            type="text"
            placeholder="Enter new deck name"
          />
          <div
            style={{ display: "flex", justifyContent: "center", gap: "10px" }}
          >
            <Button textContent="Create" onClick={handleCreateDeck}></Button>
          </div>
        </Alert>
      )}
      <div className="container decks-container">
        {renderDecks}
        <AddDeck
          onClick={() => {
            setEditState(true);
          }}
        />
      </div>
    </>
  );
}
