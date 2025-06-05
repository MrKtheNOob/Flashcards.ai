import "../styles/FlipCard.css";
import { useState,useMemo } from "react";
import Button from "./Button";
interface FlipCardProps {
  front?: string;
  back?: string;
  onChange: (next: boolean) => void;
}

// function useDirectionalKeys(onLeft: () => void, onRight: () => void, onSpace: () => void) {
//   useEffect(() => {
//     const onKeyDown = (event: KeyboardEvent) => {
//       const key = event.key;
//       switch (key) {
//         case "ArrowLeft":
//           onLeft();
//           break;
//         case "ArrowRight":
//           onRight();
//           break;
//         case " ":
//           onSpace();
//           break;
//         default:
//           break;
//       }
//     };
//     document.addEventListener("keydown", onKeyDown);
//     return () => {
//       document.removeEventListener("keydown", onKeyDown);
//     };
//   }, []);
// }

export default function FlipCard({ front, back, onChange }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const element: HTMLElement | null = document.getElementById("flip-card");
  const handleFlip = () => {
    setIsFlipped((isFlipped) => !isFlipped); // Toggle the flipped state
  };
  const slidePreviousAnimation = (element: HTMLElement) => {
    setTimeout(() => {
      element.classList.remove("slide-out-back");
      element.classList.add("slide-in-back");
      setTimeout(() => {
        element.classList.remove("slide-in-back");
      }, 400);
      onChange(false);
    }, 400);
  };
  const slideNextAnimation = (element: HTMLElement) => {
    setTimeout(() => {
      element.classList.remove("slide-out");
      element.classList.add("slide-in");
      setTimeout(() => {
        element.classList.remove("slide-in");
      }, 400);
      onChange(true);
    }, 400);
  };
  const handleSlideNext = () => {
    if (element) {
      if (element.classList.contains("flipped")) {
        //this kinda looks ridiculous , just check the state variable !
        setIsFlipped(false);
        setTimeout(() => {
          element.classList.add("slide-out");
        }, 200);
        slideNextAnimation(element);
      } else {
        element.classList.add("slide-out");
        slideNextAnimation(element);
      }
    }
  };
  const handleSlidePrevious = () => {
    if (element)
      if (element.classList.contains("flipped")) {
        setIsFlipped(false);
        setTimeout(() => {
          element.classList.add("slide-out-back");
        }, 200);
        slidePreviousAnimation(element);
      } else {
        element.classList.add("slide-out-back"); //slide out without giving time for the turn since there is no need
        slidePreviousAnimation(element);
      }
  };
  // useDirectionalKeys(handleSlidePrevious, handleSlideNext, handleFlip);
  const ArrowLeft = useMemo(() => {
    return (
      <svg
        style={{
          fill: "currentColor",
          overflow: "hidden",
        }}
        viewBox="0 0 1025 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M661.382503 851.553298c-11.395644 0-22.112712-4.44762-30.174484-12.502017L332.391378 540.21989c-8.231416-8.216665-12.738043-19.62706-12.406131-31.376743-0.331912-11.742307 4.167339-23.160078 12.398755-31.391495l292.517689-292.517689c8.061772-8.054397 18.771465-12.479889 30.167108-12.479889s22.105336 4.432868 30.167108 12.479889c8.054397 8.054397 12.487265 18.764089 12.487265 30.167108 0 11.395644-4.440244 22.112712-12.487265 30.167108L421.675693 508.843147l269.873918 269.866543c16.639852 16.632477 16.639852 43.709116 0 60.341592C683.495215 847.113054 672.778146 851.553298 661.382503 851.553298zM655.0688 198.269447c-4.499251 0-8.740348 1.74807-11.911951 4.927048L350.646535 495.699433c-3.311744 3.319119-5.045062 7.810995-4.838539 12.627406l0.014752 0.516307-0.014752 0.516307c-0.191771 4.809035 1.519419 9.286159 4.831163 12.597902l298.831392 298.838768c6.365334 6.365334 17.465944 6.365334 23.816526 0 6.579232-6.571857 6.579232-17.266797 0.007376-23.831278L385.172754 508.843147l281.815373-281.8375c3.178979-3.178979 4.927048-7.405324 4.927048-11.904575s-1.74807-8.732972-4.927048-11.911951C663.809148 200.017517 659.575427 198.269447 655.0688 198.269447z" />
        <path d="M512.01475 0C229.233144 0 0 229.233144 0 512.01475c0 282.759478 229.24052 511.985246 512.01475 511.985246 282.77423 0 511.999998-229.225768 511.999998-511.985246C1024.014748 229.233144 794.788979 0 512.01475 0zM512.01475 999.032842c-268.981444 0-487.032844-218.051399-487.032844-487.018092 0-268.981444 218.051399-487.032844 487.032844-487.032844 268.98882 0 487.032844 218.051399 487.032844 487.032844C999.047593 780.988818 781.00357 999.032842 512.01475 999.032842z" />
      </svg>
    );
  }, []);

  const ArrowRight = useMemo(() => {
    return (
      <svg
        style={{
          fill: "currentColor",
          overflow: "hidden",
        }}
        viewBox="0 0 1025 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M362.624869 172.446697c11.395644 0 22.112712 4.44762 30.174484 12.502017L691.615994 483.780106c8.231416 8.216665 12.738043 19.62706 12.406131 31.376743 0.331912 11.742307-4.167339 23.160078-12.398755 31.391495l-292.517689 292.517689c-8.061772 8.054397-18.771465 12.479889-30.167108 12.479889s-22.105336-4.432868-30.167108-12.479889c-8.054397-8.054397-12.487265-18.764089-12.487265-30.167108 0-11.395644 4.440244-22.112712 12.487265-30.167108l263.560216-263.574967L332.457761 245.290307c-16.639852-16.632477-16.639852-43.709116 0-60.341592C340.512157 176.886942 351.229225 172.446697 362.624869 172.446697zM368.938572 825.730549c4.499251 0 8.740348-1.74807 11.911951-4.927048l292.510313-292.502938c3.311744-3.319119 5.045062-7.810995 4.838539-12.627406l-0.014752-0.516307 0.014752-0.516307c0.191771-4.809035-1.519419-9.286159-4.831163-12.597902L374.53682 203.203872c-6.365334-6.365334-17.465944-6.365334-23.816526 0-6.579232 6.571857-6.579232 17.266797-0.007376 23.831278l288.1217 288.1217-281.815373 281.8375c-3.178979 3.178979-4.927048 7.405324-4.927048 11.904575s1.74807 8.732972 4.927048 11.911951C360.198224 823.982479 364.431945 825.730549 368.938572 825.730549z" />
        <path d="M511.992622 1023.999996c282.781605 0 512.022125-229.233144 512.022125-512.01475C1024.014748 229.225768 794.781603 0 511.992622 0 229.218393 0 0 229.225768 0 511.985246 0 794.766852 229.218393 1023.999996 511.992622 1023.999996zM511.992622 24.967154c268.98882 0 487.032844 218.051399 487.032844 487.018092 0 268.981444-218.051399 487.032844-487.032844 487.032844-268.98882 0-487.032844-218.051399-487.032844-487.032844C24.959779 243.011178 243.003802 24.967154 511.992622 24.967154z" />
      </svg>
    );
  }, []);
  return (
    <>
      <div className="flip-container" id="flip-container" onClick={handleFlip}>
        <div
          id="flip-card"
          className={`border border-4 border-black flip-card rounded ${
            isFlipped ? "flipped" : ""
          }`}
        >
          <div className="flip-card-front">
            <h5 style={{ fontSize: "3em" }}>{front}</h5>
          </div>
          <div className="flip-card-back">
            <p style={{ fontSize: "3em", textAlign: "center" }}>{back}</p>
          </div>
        </div>
      </div>
      <div className="buttons">
        <div id="button1">
          <Button onClick={handleSlidePrevious} type={"normal"}>
            {ArrowLeft}
          </Button>
        </div>
        <div id="button3">
          <Button onClick={handleSlideNext} type={"normal"}>
            {ArrowRight}
          </Button>
        </div>
        <div id="button2">
          <Button textContent="Tourner" onClick={handleFlip} type={"normal"} />
        </div>
        
      </div>
    </>
  );
}
