interface DeckProps {
  title: string;
  onDelete?: () => Promise<void>;//made it async for network requests
}
import { useRef, useState } from "react";
import "../styles/App.css";
import "../styles/DeckStyles.css"
import { changeDeckNameRequest, deleteDeck } from "../APIMethods";
import Loading from "./Loading";

export default function Deck({ title, onDelete }: DeckProps) {
  const [isEditing, changeEditState] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const btnref = useRef<HTMLButtonElement>(null);
  const deckNameRef = useRef<HTMLHeadingElement>(null);


  const handleChangeDeckname = (newDeckName: string) => {
    setLoading(true)

    changeDeckNameRequest(title, newDeckName)
      .then(error => {
        if (!error) {
          // changeEditState(false)
          window.location.reload()
          return
        }
        alert(error)
      })
  }

  return (
    <>
      <div className="card hoverable-card">
        <div className="deck" onClick={() => window.location.href = '/decks/' + title}>
          <div className="card-body">
            {!loading ?
            <>{isEditing ? (
              <div onClick={(event) => { event.stopPropagation() }}>
                <input
                  ref={inputRef}
                  id="deck-edit-input"
                  type="text"
                />
                <button
                  ref={btnref}
                  onClick={() => {
                    handleChangeDeckname(inputRef.current?.value ?? "")
                  }}
                >
                  valider
                </button>
                <button
                  ref={btnref}
                  onClick={() => {
                    changeEditState(false)
                  }}
                >
                  anuler
                </button>
              </div>
            ) : (
              <h5 ref={deckNameRef} className="card-title">{title}</h5>
            )}
              <div className="edit-deck-btns">
                <button
                  className="btn btn-primary"
                  onClick={(event) => {
                    event.stopPropagation()
                    changeEditState(true)
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={(event) => {
                    event.stopPropagation()
                    if (confirm("Do you want to delete this deck?")) {
                      deleteDeck(title)
                      if (onDelete) onDelete().then(() => {
                        alert("Set supprimé")
                      })
                    }
                  }
                  }
                >
                  delete
                </button>
              </div></>:<Loading type="circle"/>}
          </div>
        </div>
      </div>
    </>
  );
}
