import { ThreeDots } from "react-loader-spinner";
import "../App.css";
import { motion } from "framer-motion";
interface LoadingProps {
  type: "threedots" | "circle";
}
export default function Loading({ type }: LoadingProps) {
  switch (type) {
    case "threedots":
      return (
        <div className="loading">
          <ThreeDots
            visible={true}
            height="80"
            width="80"
            color="#ffffff"
            radius="9"
            ariaLabel="three-dots-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      );
    case "circle":
      return (
        <motion.div
        style={{
          width: 50,
          height: 50,
          border: "5px solid #e0e0e0", 
          borderTop: "5px solid #3498db", 
          borderRadius: "50%",
          display: "inline-block",
        }}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 0.6, // Adjust duration for speed
          ease: "linear",
        }}
      />
      );
  }
}
