import "../styles/App.css";
interface AddCardProps{
  onClick:()=>void
}
export default function AddCard({onClick}:AddCardProps) {
  return (
    <>
      <div className="card add-btn" onClick={onClick}>
        <div
          className="card-body"
          style={{
            display: "flex",
          }}
        >
          <span style={{ fontSize: "10em", margin: "auto" }}>+</span>
        </div>
      </div>
    </>
  );
}
