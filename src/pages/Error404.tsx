import Header from "../components/Header";
export default function Error404() {
  return (
    <>
      <Header selectedPage="404"/>
      <div style={{position:"absolute",left:"50%",transform:"translateX(-50%)",top:"30%"}}>
      <h1 style={{color:"black"}}>Erreur 404:Cette page n'existe pas</h1>
      </div>
      
    </>
  );
}
