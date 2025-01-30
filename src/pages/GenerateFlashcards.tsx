import { useRef, useState } from "react";
import Header from "../components/Header";
import ParticlesComponent from "../components/ParticlesBackground";
import Button from "../components/Button";

import { Flashcard, promptRequest } from "../APIMethods";
import CardGrid from "../components/NewCardsGrid";

import Loading from "../components/Loading";
import SaveCardWindow from "../components/SaveCardWindow";

export default function GenerateFlashcards() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [newCards, setNewCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);

  const [saveWindow, setSaveWindow] = useState<boolean>(false);

  const handleSubmit = () => {
    setLoading(true);
    promptRequest(textareaRef.current?.value ?? "").then((response) => {
      if (response.error) {
        alert(response.error);
      } else {
        const result = response.data;
        console.log(result);
        setNewCards((JSON.parse(String(result)) as Flashcard[]) ?? []);
      }
      setLoading(false);
    });
  };
  function handleOnCreated(): void {
    setSaveWindow(false)
  }

  return (
    <>
      <Header selectedPage="decks" />
      <ParticlesComponent />
      <header className="text-center">
        <h1>Generate flashcards with AI</h1>
        {!newCards && <h2>Enter text or course</h2>}
      </header>
      <main className="text-center">
        {loading ? (
          <>
            <Loading type={"threedots"} />
            <p>Generating Flashcards...</p>
          </>
        ) : newCards.length > 0 ? (
          <CardGrid cards={newCards} />
        ) : (
          <textarea
            name="text"
            className="text-center"
            ref={textareaRef}
          ></textarea>
        )}
        <br />
        <div style={{ zIndex: 100 }}>
          {newCards.length > 0 ? (
            <Button
              textContent="Save Card"
              onClick={() => {
                setSaveWindow(true);
              }}
            />
          ) : (
            <Button textContent="Submit" onClick={handleSubmit} />
          )}
        </div>

        {saveWindow && (
          
            <SaveCardWindow newCards={newCards} onCreatedDeck={handleOnCreated}/>
          
        )}
      </main>
    </>
  );
}
