interface ButtonProps {
  textContent?: string;
  children?: React.ReactNode;
  type?: "normal" | "add" | "red" |"submit";
  onClick: () => void ;
}
export default function Button({ textContent,children, onClick, type }: ButtonProps) {
  if (!type){
    type="normal"
  }
  switch (type) {
    case "normal" :
      return (
        <>
          <button
          style={{minWidth:"150px"}}
            className="btn btn-primary"
            onClick={onClick}
          >
           {textContent?textContent:children}
          </button>
        </>
      );
      case "submit" :
        return (
          <>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ minWidth: "150px" }}
              onClick={onClick}
            >
             {textContent?textContent:children}
            </button>
          </>
        );
    case "red":
      return (
        <button
          className="btn btn-danger"
          style={{ minWidth: "150px" }}
          onClick={onClick}
        >
          {textContent?textContent:children}
        </button>
      );

    default:
      break;
  }
}
