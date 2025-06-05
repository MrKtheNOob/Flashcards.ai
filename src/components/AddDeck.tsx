import { CSSProperties } from "react";

interface AddDeckProps{
  onClick: ()=>void;
  style?:CSSProperties;
}

export default function AddDeck({onClick,style}:AddDeckProps) {
  return (
    <>
      <div
        className="card hoverable-card"
        onClick={onClick}
        style={style}
      >
        <div className="deck">
          <div className="card-body" style={{ display: "flex" }}>
            <h5 className="card-title" style={{ margin: "auto" }}>
              <span style={{ fontSize: "2.6em" }}>+</span>
            </h5>
          </div>
        </div>
      </div>
      
    </>
  );
}
