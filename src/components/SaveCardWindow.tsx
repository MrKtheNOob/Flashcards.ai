import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Button from "./Button";
import {
  fetchDecks,
  Flashcard,
  updateFlashcards,
  UpdatePayload,
  updateMultipleFlashcards,
} from "../APIMethods";
import AddDeck from "./AddDeck";
import Alert from "./Alert";
import Loading from "./Loading";

interface SaveCardWindowProps {
  newCards: Flashcard[];
  onCreatedDeck: () => void;
}
export default function SaveCardWindow({newCards,onCreatedDeck}: SaveCardWindowProps) {
  const [decks, setDecks] = useState<ReactNode>();
  const [addingDeck, setAddingDeck] = useState<boolean>(false);
  const [loading,setLoading]=useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSelectDeck = useCallback(
      (deckname: string) => {
      const payload = newCards.map((flashcard) => {
        return { deckname: deckname, flashcard: flashcard };
      });
      setLoading(true)//put it here to avoid unknow undefined behavior if put at the beginning
      updateMultipleFlashcards(payload).then((response) => {
        if (response) {
          alert(response);
        } else {
          alert(`Flashcards enregistrées dans le set nommé ${deckname}`);
          window.location.href = "/decks";
        }
      });
    },
    [newCards]
  );

  useEffect(() => {
    //return a dialog box with the decks to choose from in order to save the cards there
    fetchDecks().then((response) => {
      const selectableDecks = (
        <>
          {response.data?.map((deckname, index) => {
            return (
              <Button
                key={index}
                textContent={deckname}
                onClick={() => {
                  handleSelectDeck(deckname);
                }}
              />
            );
          })}
        </>
      );
      setDecks(selectableDecks);
    });
  }, [handleSelectDeck, addingDeck]);
  const handleCreateDeck = () => {
    const inputValue = inputRef.current?.value;
    if (!inputValue) {
      // I want in the future for these alerts to be text in the dialog box in red
      alert("Deck name cannot be empty");
      return;
    }
    setLoading(true);
    //This function name is confusing
    updateFlashcards({ Deckname: inputValue ?? "" })
      .then((response) => {
        if (response) {
          alert(response);
        } else {
          onCreatedDeck();
        }
      })
      .then(() => {
        const cardsToAdd: UpdatePayload[] = newCards.map((newCard) => {
          return {
            deckname: inputValue ?? "",
            flashcard: {
              Front: newCard.Front,
              Back: newCard.Back,
            } as Flashcard,
          };
        });
        updateMultipleFlashcards(cardsToAdd);
      });
  };

  const returnIcon = useMemo(() => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-arrow-return-left"
        viewBox="0 0 16 16"
      >
        <path
          fill-rule="evenodd"
          d="M14.5 1.5a.5.5 0 0 1 .5.5v4.8a2.5 2.5 0 0 1-2.5 2.5H2.707l3.347 3.346a.5.5 0 0 1-.708.708l-4.2-4.2a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 8.3H12.5A1.5 1.5 0 0 0 14 6.8V2a.5.5 0 0 1 .5-.5"
        />
      </svg>
    );
  }, []);
  const saveToExistingDeckMenu = (
    <>
      <h1 style={{ color: "black" }}>
        Choisissez dans quel Set enregistrer les nouvelles flashcards
      </h1>
      <br />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          height: "fit-content",
          flexWrap: "wrap",
          gap: "10px",
          alignContent: "center",
        }}
      >
        {decks}
        <AddDeck
          onClick={() => {
            setAddingDeck(true);
          }}
          style={{ flexBasis: "100%" }}
        />
        {/*flex basis 100% makes the add deck button take the entire space in the backrank of the div*/}
      </div>
    </>
  );
  const createDeckMenu = (
    <>
      <h1 style={{ color: "black" }}>Ajouter un nouveau Set</h1>
      <input
        style={{ margin: "2em" }}
        ref={inputRef}
        type="text"
        placeholder="Entrer le nom du nouveau Set "
      />
      <br />
      <br />
      <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
        <Button textContent="Créer" onClick={handleCreateDeck} />
        <Button
          onClick={() => {
            setAddingDeck(false);
          }}
        >
          Annuler {returnIcon}
        </Button>
      </div>
    </>
  );
  return (
    <Alert>
      {/* when the add deck button is pressed ,everything in the alert is removed 
        to be replaced by the input and the submit button and also a return button to go back to the previous state*/}
      {/* I want a sliding animation between the 2 menus in the alert */}
      <div className="select-decks">
        {
          loading ?<Loading type={"circle"}/>:addingDeck ? <>{createDeckMenu}</> : <>{saveToExistingDeckMenu}</>
        }
      </div>
    </Alert>
  );
}
