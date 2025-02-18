// import { useRef } from "react";
import { Link } from "react-router-dom";
import "../header.css";

interface HeaderProps {
  selectedPage: "home" | "decks" | "404" | "feedback";
}
export default function Header({ selectedPage }: HeaderProps) {
  return (
    <>
      <nav className="navbar" style={{ width: "100%" }}>
        <h1 className="title">
          <Link to="/" style={{paddingLeft:"11px"}}>
            Flashcards.ai
            <span style={{ fontSize: "20px", color: "blue",position:"absolute" }}>Beta</span>
          </Link>
        </h1>
        <div className="navbar-content">
          <div style={{ display: "flex", gap: "1em" }}>
            <Link
              to="/decks"
              className={`links ${selectedPage === "decks" ? "selected" : ""}`}
            >
              Menu
            </Link>
            <Link to="/feedback"
              className={`links ${selectedPage === "feedback" ? "selected" : ""}`}
            >Critique</Link>
          </div>
        </div>
      </nav>
    </>
  );
}
