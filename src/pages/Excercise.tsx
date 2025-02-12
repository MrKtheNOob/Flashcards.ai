import { fetchFlashcards, Flashcard } from "../APIMethods";
import Header from "../components/Header";
import FlipCard from "../components/FlipCard";
import Alert from "../components/Alert";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import ParticlesComponent from "../components/ParticlesBackground";
import { useEffect, useState } from "react";


const getDataAndUpdateState = async (
  setFetch: React.Dispatch<React.SetStateAction<boolean>>,
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>,
  navigate:NavigateFunction,
  deckname:string
) => {
  await fetchFlashcards(deckname).then((result) => {
    if (result.error?.message=="go back to auth"){
      console.log("Not logged in ,going back to auth")
      navigate("/authpage");
    }
    if (result.data !== null){
      setFlashcards(result.data);
      setFetch(true);
    }
  }).catch(()=>{setFetch(false)});
};
export default function Exercise() {
  const {id}=useParams()
<<<<<<< HEAD
  //replace the alert by an infinit loading loop
=======
>>>>>>> 5a02aca (stable version with authentiaction working)
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [fetched, setFetch] = useState(false);
  const navigate=useNavigate()
  if (!fetched){
    getDataAndUpdateState(setFetch, setFlashcards,navigate,id??"");
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
      <h2 className="text-center" style={{color:"white",fontSize:"1em",margin:"30px"}}>Maîtrisez les concepts en feuilletant des flashcards : testez vos connaissances, renforcez votre mémoire et suivez vos progrès une carte à la fois !</h2>
      {fetched ? (
        <>
          <FlipCard
            front={flashcards[count].Front}
            back={flashcards[count].Back}
            onChange={ChangeCard}
          />
        </>
      ) : (
        
        <Alert onClose={()=>{setFetch(false)}}>
          <h1 style={{color:"black"}}>Error:Could not fetch flashcards</h1>
        </Alert>
      )}
      </div>
    </>
  );
}
