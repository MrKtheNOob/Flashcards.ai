import { fetchFlashcards, Flashcard } from "../APIMethods";
import Header from "../components/Header";
import FlipCard from "../components/FlipCard";
import Alert from "../components/Alert";
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import ParticlesComponent from "../components/ParticlesBackground";
import { useCallback, useEffect, useMemo, useState } from "react";
import Loading from "../components/Loading";


const getDataAndUpdateState = async (
  setFetch: React.Dispatch<React.SetStateAction<boolean>>,
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>,
  navigate: NavigateFunction,
  setLoading:React.Dispatch<React.SetStateAction<boolean>>,
  deckname: string
) => {
  await fetchFlashcards(deckname).then((result) => {
    if (result.error?.message == "go back to auth") {
      console.log("Not logged in ,going back to auth")
      navigate("/authpage");
    }
    if (result.data !== null) {
      setFlashcards(result.data);
      setFetch(true);
    }
  }).catch(() => { setFetch(false) });
  setLoading(false)
};
export default function Exercise() {
  const { id } = useParams()
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [fetched, setFetch] = useState(false);
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  if (!fetched) {
    getDataAndUpdateState(setFetch, setFlashcards, navigate,setLoading, id ?? "");
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
  }, [fetched,flashcards]);
//renders the flipcard with the flashcardata
const ChangeCard = useCallback((next: boolean) => {
  const newIndex = next ? count + 1 : count - 1;
  if (newIndex < 0) changeCount(flashcards.length - 1)
  if (newIndex > flashcards.length - 1) changeCount(0)
  if (newIndex >= 0 && newIndex < flashcards.length) {
    changeCount(newIndex);
    console.log(flashcards[count]);
  }
},[count,flashcards]);

const renderFlipCard = useMemo(() => {
  if (loading) {
    return <div style={{ textAlign: "center" }}><Loading type="circle" /></div>
  } else if (!loading && flashcards.length > 0) {
    return <FlipCard
      front={flashcards[count].Front}
      back={flashcards[count].Back}
      onChange={ChangeCard}
    />
  } else {
    <Alert onClose={() => { setFetch(false) }}>
      <h1 style={{ color: "black" }}>Error:Could not get flashcards</h1>
    </Alert>
  }
}, [loading,flashcards,ChangeCard,count])

return (
  <>
    <Header selectedPage="decks" />
    <ParticlesComponent />
    <h2 className="text-center" style={{ color: "white", fontSize: "1em", margin: "30px" }}>Maîtrisez les concepts en feuilletant des flashcards : testez vos connaissances, renforcez votre mémoire et suivez vos progrès une carte à la fois !</h2>
    <div style={{ overflow: "hidden", textAlign: "center" }} >
      {renderFlipCard}
    </div>
  </>
);
}
