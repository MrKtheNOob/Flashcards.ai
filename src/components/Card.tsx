import { useState } from "react";
import Button from "./Button";
import CardEditor from "./CardEditor";
import { EditFlashcard, Flashcard} from "../APIMethods";
import Alert from "./Alert";
import "../styles/App.css";
interface CardProps {
  front: string;
  back: string;
  deckname?: string;
  hoverEffect?: boolean;
  withEditButtons?: boolean;
  onChange?: () => void;
  onDelete: (flashcard: Flashcard) => void;
}

export default function Card({
  front,
  back,
  deckname,
  hoverEffect,
  withEditButtons,
  onChange,
  onDelete,
}: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [cardContent, setCardContent] = useState<Flashcard>({ Front:front,Back:back });
  const [confirmDeleteState, setConfirmDeleteState] = useState<boolean>(false);
  if (typeof hoverEffect === "undefined") hoverEffect = false;
  const handleEditClick = () => {
    setIsEditing(!isEditing);
    if (onChange) onChange();
  };

  const handleInputChange = (front: string, back: string) => {
    handleEditClick();
    if (front === "" || back === "") {
      return;
    }
    EditFlashcard({
      Deckname: deckname??"",
      old: { Front: cardContent.Front, Back: cardContent.Back },
      new:{Front:front,Back:back}
    });
    setCardContent({ Front:front,Back: back });
  };
  return (
    <>
      {confirmDeleteState && (
        <Alert
          onClose={() => {
            setConfirmDeleteState(false);
          }}
        >
          <h1 style={{ color: "black" }}>Do you want to delete this card</h1>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "40px",
            }}
          >
            <Button
              textContent="yes"
              type="red"
              onClick={() => {
                onDelete({ Front: cardContent.Front, Back: cardContent.Back });
                setConfirmDeleteState(false);
              }}
            />
            <Button
              textContent="no"
              type="normal"
              onClick={() => {
                setConfirmDeleteState(false);
              }}
            />
          </div>
        </Alert>
      )}
      {isEditing ? (
        <>
          <CardEditor
            textLabel="Edit card"
            currentFront={front}
            currentBack={back}
            onSave={handleInputChange}
          />
          <Button
            type="normal"
            textContent={isEditing ? "Save" : "Edit"}
            onClick={handleEditClick}
          />
        </>
      ) : (
        <div className="card">
          <div className="card-body" style={{ paddingBottom: "50px" }}>
            <h5 className="card-title">{cardContent.Front}</h5>
            <p className="card-text">{cardContent.Back}</p>
            {withEditButtons && (
              <div className="edit-btns">
                <Button
                  type="normal"
                  textContent={isEditing ? "Save" : "Edit"}
                  onClick={handleEditClick}
                />
                <Button
                  type="red"
                  textContent="Delete"
                  onClick={() => setConfirmDeleteState(true)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
