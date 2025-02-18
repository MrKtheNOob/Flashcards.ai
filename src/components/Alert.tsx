import { ReactNode, useEffect, useRef, useState } from "react";
import "../styles/App.css"
interface AlertProps {
  onClose?: () => void;
  children: ReactNode;
}
export default function Alert({ children, onClose }: AlertProps) {
  const [showed, changeShow] = useState(true);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const backgroundRef=useRef<HTMLDivElement | null>(null);
  //I don't entirelly understand the useEffect function but it changes the background when the alert is closed 
  useEffect(() => {
    document.body.style.backgroundColor = showed ? "gray" : "white";
    return () => {
      document.body.style.backgroundColor = "white";
    };
  }, [showed]);
  const handleClickOutside = (event: MouseEvent) => {
    if (
      elementRef.current &&
      !elementRef.current.contains(event.target as Node)
    ) {
      changeShow(false); // Handle the outside click
      if (onClose) onClose()
    }
  };
  const handleCloseButton = () => {
    if (onClose) {
      onClose();
    }
    changeShow(false);
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  

  useEffect(() => {
    // Scroll to the target component when it becomes visible
    if (showed && backgroundRef.current) {
      backgroundRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showed]);
  return (
    <>
      {showed && (
        <>
          <div ref={backgroundRef} className="alert-container"
            style={{
              background: "rgba(49,49,49,0.8)",
              width: "100vw",
              height: "1000px",
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            <div
              ref={elementRef}
              className="card"
              style={{
                height: "auto",
                width: "auto",
                position: "absolute",
                left: "50%",
                zIndex: 10,
                transform: "translateX(-50%)",
                top: "30%",
              }}
            >
        
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseButton}
                style={{ position: "relative", left: "90%" }}
              ></button>
              <div className="card-body" style={{textAlign:"center"}}>{children}</div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
