interface AddDeckProps{
  onClick: ()=>void;
}

export default function AddDeck({onClick}:AddDeckProps) {
  
  return (
    <>
      <div
        className="card hoverable-card"
        onClick={onClick}
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
