import "../styles/FlipCard.css";

import { useState } from "react";
import Button from "./Button";
interface FlipCardProps {
  front?: string;
  back?: string;
  onChange: (next: boolean) => void;
}

export default function FlipCard({ front, back, onChange }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const element: HTMLElement | null = document.getElementById("flip-card");
  const handleFlip = () => {
    setIsFlipped(!isFlipped); // Toggle the flipped state
  };
  const slidePreviousAnimation = (element: HTMLElement) => {
    setTimeout(() => {
      element.classList.remove("slide-out-back");
      element.classList.add("slide-in-back");
      setTimeout(() => {
        element.classList.remove("slide-in-back");
      }, 400);
      onChange(false);
    }, 400);
  }
  const slideNextAnimation = (element: HTMLElement) => {
    setTimeout(() => {
      element.classList.remove("slide-out");
      element.classList.add("slide-in");
      setTimeout(() => {
        element.classList.remove("slide-in");
      }, 400);
      onChange(true);
    }, 400);
  }
  const handleSlideNext = () => {
    if (element) {
      if (element.classList.contains("flipped")) {
        setIsFlipped(false);

        setTimeout(() => {
          element.classList.add("slide-out");
        }, 200);
        slideNextAnimation(element)
      } else {
        element.classList.add("slide-out");
        slideNextAnimation(element)
      }
    }
  };
  const handleSlidePrevious = () => {
    if (element)
      if (element.classList.contains("flipped")) {
        setIsFlipped(false);
        setTimeout(() => {
          element.classList.add("slide-out-back");
        }, 200);
        slidePreviousAnimation(element)
      } else {
        element.classList.add("slide-out-back");//slide out without giving time for the turn since there is no need
        slidePreviousAnimation(element)
      }
  };
  return (
    <>
      <div className="flip-container" id="flip-container" onClick={handleFlip}>
        <div
          id="flip-card"
          className={`border border-4 border-black flip-card rounded ${isFlipped ? "flipped" : ""
            }`}
        >
          <div className="flip-card-front">
            <h5 style={{ fontSize: "3em" }}>{front}</h5>
          </div>
          <div className="flip-card-back">
            <p style={{ fontSize: "3em", textAlign: "center" }}>{back}</p>
          </div>
        </div>
      </div>
      <div className="buttons">
        <div id="button1">
          <Button
            textContent="<= Précédent"
            onClick={handleSlidePrevious}
            type={"normal"}
          />
        </div>
        <div id="button2">
          <Button textContent="Turn Card" onClick={handleFlip} type={"normal"} />
        </div>
        <div id="button3">
          <Button
            textContent="Suivant"
            onClick={handleSlideNext}
            type={"normal"}
          />
        </div>

      </div>
    </>
  );
}
