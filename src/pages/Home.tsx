import Header from "../components/Header";
import "../styles/App.css";
import "../HomeStyles.css";
import ParticlesComponent from "../components/ParticlesBackground";
import Button from "../components/Button";
import { Link } from "react-router-dom";
import iglogo from "../assets/iglogo.png"
export default function Home() {
  return (
    <>
      <header style={{ color: "white" }}>
        <Header selectedPage="home" />
        <ParticlesComponent />
        <h1 className="text-center p-5" style={{color:"white"}}>
          Utilisez le pouvoir de l'IA et des flashcards pour mémoriser rapidement
          vos cours
        </h1>
      </header>
      
        <div style={{textAlign:"center"}}><Link to="/decks"><Button type="normal" onClick={()=>{}}>Commencer</Button></Link></div>
        <br />
        <br />
        
      <main>
        <div className="features-div">
          <div className="feature">
            <h2>Un outil simple et efficace</h2>
            <p>
              Les flashcards sont idéales pour mémoriser des informations
              essentielles de manière rapide et visuelle. Elles s’adaptent
              parfaitement à divers besoins : apprendre du vocabulaire, réviser
              des formules ou se préparer à un examen. Leur format compact
              favorise une approche active de l’étude, en aidant à fixer
              l’attention sur des points précis.
            </p>
          </div>
          <div className="feature">
            <h2>La puissance de la répétition espacée</h2>
            <p>
              En utilisant la méthode de répétition espacée, les flashcards
              renforcent la mémoire à long terme. Cette technique consiste à
              revoir les cartes à des intervalles stratégiques, mettant l’accent
              sur les concepts moins maîtrisés. Elle optimise ainsi
              l’apprentissage et réduit l’oubli.
            </p>
          </div>
          <div className="feature">
            <h2>Une solution pratique et accessible</h2>
            <p>
              Qu'elles soient en papier ou numériques, les flashcards permettent
              de réviser à tout moment. Les applications mobiles offrent un
              accès illimité aux cartes et adaptent les révisions selon vos
              progrès, rendant cet outil indispensable pour un apprentissage
              flexible et efficace.
            </p>
          </div>
        </div>
      </main>
      
      <footer>
        <h1 style={{color:"white"}}>Contacts</h1>
        <a style={{color:"white"}} href="https://www.instagram.com/mr.bndiaye07/">
          <img src={iglogo} alt="Link to https://www.instagram.com/mr.bndiaye07/" />
        </a>
      </footer>
    </>
  );
}
