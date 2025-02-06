import { useEffect, useRef } from "react";
import Alert from "./Alert";
import Button from "./Button";
interface CardEditorProps {
  textLabel: string;
  currentFront?: string;
  currentBack?: string;
  onSave?: (front: string, back: string) => void;
}
export default function CardEditor({
  textLabel,
  currentFront,
  currentBack,
  onSave,
}: CardEditorProps) {
  const frontRef = useRef<HTMLInputElement | null>(null);
  const backRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (frontRef.current) {
      frontRef.current.value = currentFront ?? "";
    }
    if (backRef.current) {
      backRef.current.value = currentBack ?? "";
    }
  }, []);
  return (
    <>
      <Alert
        onClose={() => {
          if (onSave)
            onSave(frontRef.current?.value ?? "", backRef.current?.value ?? "");
        }}
      >
        <h1  style={{color:"black"}}>{textLabel}</h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            left: "50%",
            zIndex: 10,
            transform: "translateX(-50%)",
          }}
        >
          <input ref={frontRef} type="text" placeholder="front" name="front" />
          <br />
          <input ref={backRef} type="text" placeholder="back" name="back" />
          <Button
            type="normal"
            textContent="Save"
            onClick={() => {
              if (onSave)
                onSave(
                  frontRef.current?.value ?? "",
                  backRef.current?.value ?? ""
                );
            }}
          />
        </div>
      </Alert>
    </>
  );
}
