import Button from "./Button";

interface MultipleChoiceCardProps{
    question:string;
    answers:string[];
    correctAnswer:string;
    onCorrect:()=>void;
    onWrong:()=>void;
}
export default function MultipleChoiceCard({question,answers,correctAnswer,onCorrect,onWrong}:MultipleChoiceCardProps){
    function shuffledAnswers():[number, number, number]  {
        const indices :number[]= [];
        while (indices.length < 3) {
          const randomIndex = Math.floor(Math.random() * 3);
          // Ensure the index is not already in the array
          if (!indices.includes(randomIndex)) {
            indices.push(randomIndex);
          }
        }
        return indices as [number, number, number];
      }
    return (<>
    <div className="card">{question}</div>
    <div className="answers">
        {shuffledAnswers().map((index) => (
            <Button textContent={answers[index]} onClick={answers[index]===correctAnswer?onCorrect:onWrong} key={index}></Button>
        ))}
    </div>
    </>)
}