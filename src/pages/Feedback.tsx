import { useRef, useState } from "react";
import { sendFeedback } from "../APIMethods";
import Button from "../components/Button";
import Header from "../components/Header";
import ParticlesComponent from "../components/ParticlesBackground";
import { useNavigate } from "react-router-dom";
import "../styles/feedback.css"
export default function Feedback() {
  const yesRef=useRef<HTMLInputElement>(null);
  const noRef=useRef<HTMLInputElement>(null);
  const feedbackRef=useRef<HTMLTextAreaElement>(null);
  const [sent,setSent]=useState<boolean>(false)
  const navigate=useNavigate()
  const handleSend=(event: React.FormEvent<HTMLFormElement>)=>{  
    event.preventDefault()
    const answer = yesRef.current?.checked
    ? "yes"
    : noRef.current?.checked
    ? "no"
    : null;

  // Get the textarea value
    const feedback = feedbackRef.current?.value;
    sendFeedback(answer??"",feedback??"").then(error=>{
      if (error==null){
        setSent(true)
      }else if (error.message=="go back to auth"){
        alert("Vous devez etre connecté à votre compte")
        navigate("/authpage")
      }
    })
  }
  
  return (
    
    <>
    <Header selectedPage="feedback"/>
    <ParticlesComponent/>
      <div id="feedback-container" style={{textAlign:"center"}} >
        <h1 style={{color: "white"}}>
          Critiquez,Signalez un bug,Commentez
        </h1>
        <h2 style={{color:"white"}}>Est ce que vous appreciez l'application ?</h2>
        {!sent ? (
        <form id="feedback-form" style={{ color: "white" }} onSubmit={handleSend}>
          <div
            className="boolean-answers"
            style={{
              display: "flex",
              transform: "scale(2)",
              justifyContent: "center",
              gap: "4em",
            }}
          >
            <label htmlFor="yesanswer">
              Oui
              <input
                type="radio"
                name="answer"
                value="yes"
                ref={yesRef}
                required
              />
            </label>
            <label htmlFor="noanswer">
              Non
              <input
                type="radio"
                name="answer"
                value="no"
                ref={noRef}
                required
              />
            </label>
          </div>
          <br />
          <br />
          <br />
          <label htmlFor="suggestion">
            <textarea
              name="feedback"
              placeholder="Dites ce que vous pensez"
              style={{ color: "black", width: "40em", height: "30em" }}
              ref={feedbackRef}
              required
            ></textarea>
          </label>
          <br />
          <Button type="submit" onClick={()=>{}}>
            Soumettre
          </Button>
        </form>
        ):<h2 style={{color:"white",marginTop:"5em"}}>Merci pour votre retour 👍🙏</h2>}
      </div>
    </>
  );
}

