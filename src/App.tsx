import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Error404 from "./pages/Error404";
import Decks from "./pages/Decks";
import Menu from "./pages/Menu";
import Exercise from "./pages/Excercise";
import GenerateFlashcards from "./pages/GenerateFlashcards";
import Quiz from "./pages/Quiz";
import AuthPage from "./pages/AuthPage";
import Feedback from "./pages/Feedback";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          {/* <Route path="/deck/:id" element/> */}
          <Route path="/decks" element={<Decks />} />
          <Route path="/decks/:id" element={<Menu />} />
          <Route path="/decks/:id/learn" element={<Exercise />} />
          <Route path="/decks/:id/quiz" element={<Quiz/>}/>
          <Route path="/flashcards/ai-generated" element={<GenerateFlashcards/>}/>
          <Route path="/feedback" element={<Feedback/>}/>
          <Route path="*" element={<Error404 />} />
          <Route path="/authpage" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
