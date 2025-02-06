import { ReactNode, useCallback, useEffect, useState } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import CardEditor from "../components/CardEditor";
import "../App.css";
import {
  Flashcard,
  deleteFlashcard,
  fetchFlashcards,
  updateFlashcards,
} from "../APIMethods";
import Alert from "../components/Alert";
import Header from "../components/Header";
import { useNavigate, useParams } from "react-router-dom";
import AddCard from "../components/AddCard";
import ParticlesComponent from "../components/ParticlesBackground";

export default function Menu() {
  const { id } = useParams();
  const [flashcardData, setFlashcardData] = useState<Flashcard[]>([]);
  const [fetched, setfetch] = useState<boolean>(false);
  const [selected, changeSelected] = useState<boolean>(false);
  const [isEditing, changeEditState] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<boolean>(false);
  const [cards,setCards]   = useState<ReactNode[]>([]);
  const navigate = useNavigate();
  const goToImportWithJsonPage = () => {
    navigate("/importwithjson");
  };
  const update = (newFlashcard: Flashcard) => {
    updateFlashcards({ deckname: id, flashcard: newFlashcard }).then(
      (error) => {
        if (error) console.log(error);
      }
    ); //make this an alert in the future
  };
  if (!fetched)
    fetchFlashcards(id ? id : "").then((result) => {
      if (result.data) {
        setFlashcardData([...result.data]);
      } else console.log(result);
      setfetch(true);
    });
  const handleAddCard = (front: string, back: string) => {
    // Add a new flashcard with default content
    if (front === "" || back === "") {
      changeEditState(false);
      return;
    }
    const newCard: Flashcard = { Front: front,Back: back };
    setFlashcardData([...flashcardData, newCard]);
    update(newCard);
    changeEditState(false);
  };
  const handleEditedCard = useCallback(() => {
    changeSelected(true);
    if (selected) {
      document.body.style.backgroundColor = "white";
    } else {
      document.body.style.backgroundColor = "black";
    }
  }, [selected]);
  const handleDeleteCard = useCallback((flashcardToRemove: Flashcard) => {
    //send delete request
    deleteFlashcard({FlashcardToRemove:flashcardToRemove,deckname:id??""}).then((error) => {
      if (error) {
        console.log(error);
        setErrorState(true);
        return;
      }
    });

    setFlashcardData(
      flashcardData.filter(
      (flashcard: Flashcard) =>
        flashcard.Front !== flashcardToRemove.Front &&
        flashcard.Back !== flashcardToRemove.Back
      )
    );
  }, [flashcardData, id]);

  //TODO:add a round button centered horizontaly at the bottom of the screen that should say
  //  to start the exercice
  
  const mapFlashcards = useCallback(() => {
    const newCards = flashcardData.map((flashcard,index) => (
      <Card
        key={index} // Assuming each flashcard has a unique id
        front={flashcard.Front}
        back={flashcard.Back}
        deckname={String(id)}
        onChange={handleEditedCard}
        onDelete={handleDeleteCard}
      />
    ));
    setCards(newCards);
  }, [flashcardData, handleEditedCard, handleDeleteCard, id]);

  useEffect(() => {
    mapFlashcards();
  }, [mapFlashcards]);

  return (
    <>
      <Header selectedPage="decks" />
      <ParticlesComponent />
      {isEditing && <CardEditor textLabel="Add card" onSave={handleAddCard} />}
      {errorState && (
        <Alert
          onClose={() => {
            setErrorState(false);
          }}
        >
          <h1>Resquest error</h1>
        </Alert>
      )}
      <h1 className="text-center" style={{color:"white"}}>{id} Flashcards</h1>
      <>
        <div style={{ textAlign: "center" }}>
          <Button
            type="normal"
            textContent="Importer Flashcards avec json"
            onClick={goToImportWithJsonPage}
          />
          <Button
            type="normal"
            textContent="Cree flashcard avec l'IA"
            onClick={()=>{window.location.href="/flashcards/ai-generated"}}
          />
        </div>
        {flashcardData.length >0 && (
          <div className="to-exercice">
          <Button
            textContent="Start Exercice"
            type="normal"
            onClick={() => {
              navigate("/decks/" + id + "/learn");
            }}
          />
        </div>
        )}
        

        <br />

        <div className="flashcard-grid">
          {cards.length == 0 ? <h1>There are No cards</h1> : cards}
          <AddCard onClick={() => changeEditState(true)} />
        </div>
      </>
    </>
  );
}
