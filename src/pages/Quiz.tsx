import { useParams } from "react-router-dom";
import Header from "../components/Header";
import MultipleChoiceCard from "../components/MultipleChoiceCard";

export default function Quiz(){
    const {id}=useParams()

    const handleCorrect=()=>{
        console.log(id)
        console.log("Correct")
    }
    const handleWrong=()=>{
        console.log(id)
        console.log("Wrong")
    }
    return (<>
    <Header selectedPage="decks" />
    <MultipleChoiceCard question="Question" answers={["1","2","3",]} correctAnswer="1" onCorrect={handleCorrect} onWrong={handleWrong} />
    </>)
}