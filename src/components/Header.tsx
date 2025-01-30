// import { useRef } from "react";
import { Link } from "react-router-dom";
import "../header.css";

interface HeaderProps {
  selectedPage: "home" | "decks" | "404";
}
export default function Header({ selectedPage }: HeaderProps) {
  // Check if the screen width is above 500px

  return (
    <>
      <nav className="navbar" style={{ width: "100%" }}>
        <h1 className="title">
          <Link to="/" style={{ textDecoration: "none" }}>
            Flashcards.ai
          </Link>
        </h1>
        <div className="navbar-content">
          <div style={{ display: "flex", gap: "1em" }}>
            <Link
              to="/"
              className={`links ${selectedPage === "home" ? "selected" : ""}`}
            >
              Home
            </Link>

            <Link
              to="/decks"
              className={`links ${selectedPage === "decks" ? "selected" : ""}`}
            >
              Decks
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
