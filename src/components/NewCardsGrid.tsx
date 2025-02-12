import Card from "./Card";
import { motion } from "framer-motion";
import "../styles/App.css";
import { Flashcard } from "../APIMethods";
interface CardGridProps {
  cards: Flashcard[];
}
export default function CardGrid({ cards }: CardGridProps) {
  return (
    <div className="flashcard-grid">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.5, duration: 0.5 }}
        >
          <Card front={card.Front} back={card.Back} withEditButtons={false} onDelete={() => {}} />
        </motion.div>
      ))}
    </div>
  );
}
