interface DeckProps {
  title: string;
  onDelete?:()=>void;
}
import { useEffect, useRef, useState } from "react";
import "../styles/App.css";
import "../styles/DeckStyles.css"
import { deleteDeck } from "../APIMethods";

export default function Deck({ title ,onDelete}: DeckProps) {
  const [isEditing, changeEditState] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const btnref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (inputRef.current) inputRef.current.value = title;
    //editdeck function in the future
  }, [isEditing, title]);
  const handleOnChange = (condition: boolean) => {
    if (btnref.current)
      if (condition) {
        btnref.current.textContent = "cancel";
      } else {
        btnref.current.textContent = "validate";
      }
  };
  
  return (
    <>
      <div className="card hoverable-card">
        <div className="deck" onClick={()=>window.location.href='/decks/'+title}>
          <div className="card-body">
            {isEditing ? (
              <div onClick={(event)=>{event.stopPropagation()}}>
                <input
                  ref={inputRef}
                  id="deck-edit-input"
                  type="text"
                  onChange={() => {
                    handleOnChange(inputRef.current?.value === title);
                  }}
                />

                <button
                  ref={btnref}
                  onClick={() => {
                    changeEditState(false);
                  }}
                >
                  validate
                </button>
              </div>
            ) : (
              <h5 className="card-title">{title}</h5>
            )}
            <div className="edit-deck-btns">
            <button
              className="btn btn-primary"
              onClick={(event) =>{ 
                event.stopPropagation()
                changeEditState(true)}}
            >
              Edit
            </button>
            <button
              className="btn btn-danger"
              onClick={(event) =>{ 
                event.stopPropagation()
                if (confirm("Do you want to delete this deck?")){
                  deleteDeck(title)
                  if (onDelete) onDelete()
                  alert("Deck deleted")
                }}
              }
          >
              delete
            </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
