import { fetchFlashcards, Flashcard } from "../APIMethods";
import Header from "../components/Header";
import FlipCard from "../components/FlipCard";
import Alert from "../components/Alert";
import { useParams } from "react-router-dom";
import ParticlesComponent from "../components/ParticlesBackground";
import { useEffect, useState } from "react";


const getDataAndUpdateState = async (
  setFetch: React.Dispatch<React.SetStateAction<boolean>>,
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>,
  deckname:string
) => {
  await fetchFlashcards(deckname).then((result) => {
    if (result.data !== null){
      setFlashcards(result.data);
      setFetch(true);
    }
  });
};
export default function Exercise() {
  const {id}=useParams()
  
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [fetched, setFetch] = useState(false);
  if (!fetched){
    getDataAndUpdateState(setFetch, setFlashcards, id??"");
  }
  const [count, changeCount] = useState<number>(0);
  const shuffleFlashcards = (flashcards: Flashcard[]): Flashcard[] => {
    for (let i = flashcards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flashcards[i], flashcards[j]] = [flashcards[j], flashcards[i]];
    }
    return flashcards;
  };

  useEffect(() => {
    if (fetched) {
      setFlashcards(shuffleFlashcards(flashcards));
    }
  }, [fetched]);
  const ChangeCard = (next: boolean) => {
    
    const newIndex = next ? count + 1 : count - 1;
    if (newIndex<0) changeCount(flashcards.length-1)  
    if (newIndex>flashcards.length-1) changeCount(0)
    if (newIndex >= 0 && newIndex < flashcards.length) {
      changeCount(newIndex);
      console.log(flashcards[count]);
    }
  };

  return (
    <>
      <Header selectedPage="decks" />
      <ParticlesComponent/>
      <div style={{overflow:"hidden"}}>
      <h2 className="text-center" style={{fontSize:"1em",margin:"30px"}}>Maîtrisez les concepts en feuilletant des flashcards : testez vos connaissances, renforcez votre mémoire et suivez vos progrès une carte à la fois !</h2>
      {fetched ? (
        <>
          <FlipCard
            front={flashcards[count].front}
            back={flashcards[count].back}
            onChange={ChangeCard}
          />
        </>
      ) : (
        <Alert onClose={()=>{setFetch(false)}}>
          <h1>Error:Could not fetch flashcards</h1>
        </Alert>
      )}
      </div>
    </>
  );
}
