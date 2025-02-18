import { useRef, useState } from "react";
import Header from "../components/Header";
import ParticlesComponent from "../components/ParticlesBackground";
import Button from "../components/Button";
import "../styles/App.css";
import { loginRequest, registerRequest } from "../APIMethods";
import { NavigateFunction, useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
export default function AuthPage() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [loading, SetLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  return (
    <>
      <Header selectedPage="home" />
      <ParticlesComponent />
      <h1 className="text-center" style={{ color: "white" }}>
        Créer un compte ou connectez-vous pour accéder aux fonctionnalités du
        site
      </h1>
      <div
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
        <div className="card-body" style={{ padding: "40px" }}>
          <div className="entry" style={{ textAlign: "center" }}>
            {/* Toggle between Login and SignUp */}
            {isLogin ? (
              <>
                <Login
                  navigate={navigate}
                  loading={loading}
                  setLoading={SetLoading}
                />
                <button onClick={() => setIsLogin(!isLogin)}>
                  Pas de compte ? Cliquez ici
                </button>
              </>
            ) : (
              <>
                <SignUp loading={loading} setLoading={SetLoading} />
                {!loading && <button onClick={() => setIsLogin(!isLogin)}>
                  Vous avez déja un compte ? Connectez-vous
                </button>}

              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
interface LoginProps {
  navigate: NavigateFunction;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
// Login Component
function Login({ navigate, loading, setLoading }: LoginProps) {
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const handleLogin = () => {
    setLoading(true);
    console.log("handling login");
    const username = usernameRef.current?.value ?? "";
    const password = passwordRef.current?.value ?? "";
    loginRequest({ username: username, password: password })
      .then((statusCode) => {
        if (statusCode == 202) {
          navigate("/decks");
        }
      })
      .then(() => setLoading(false));
  };

  return (
    <>
      {loading ? (
        <Loading type="circle" />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault(); // Prevent default form submission
            handleLogin();
          }}
          style={{ display: "flex", flexDirection: "column", padding: "1.2em" }}
        >
          <h5 className="text-center">Login</h5>
          <label htmlFor="username">
            <input
              required
              ref={usernameRef}
              type="text"
              name="username"
              placeholder="Nom d'utilisateur"
              style={{ margin: "10px" }}
            />
          </label>

          <label htmlFor="password">
            <input
              required
              ref={passwordRef}
              type="password"
              name="password"
              placeholder="mot de passe"
              style={{ margin: "10px" }}
            />
          </label>
          <Button textContent="Login" type="normal" onClick={() => { }} />
          {/*There is no function binded to this button but it does trigger form submission*/}
        </form>
      )}
    </>
  );
}
interface SignupProps {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
// SignUp Component
function SignUp({ loading, setLoading }: SignupProps) {
  const emailRef = useRef<HTMLInputElement | null>(null);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const cpasswordRef = useRef<HTMLInputElement | null>(null);
  const handleRegister = () => {
    setLoading(true);
    //input validation goes here
    //no need to verify if inputs are empty since they have the "required" attribute
    const email = emailRef.current?.value ?? "";
    const username = usernameRef.current?.value ?? "";
    const password = passwordRef.current?.value ?? "";
    const cpassword = cpasswordRef.current?.value ?? "";
    //I want these messages to be displayed inside the input div in the future
    if (cpassword !== password) {
      alert("Confirm password field does not match password field");
    }
    if (username.length < 2) {
      alert("Le nom d'utilisateur doit etre long d'au moins 3 caractères");
      return;
    }
    if (password.length <= 8) {
      alert("Le mot de passe doit etre long d'au moins 8 caractères");
      return;
    }
    registerRequest({
      email: email,
      username: username,
      password: password,
      cpassword: cpassword,
    }).then((statusCode) => {
      if (statusCode == 201) {
        alert(`Bienvenue ${username}`);
        window.location.reload();
      }
    });
    setLoading(false);
  };

  return (
    <>
      {loading ? (
        <Loading type="circle" />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault(); // Prevent default form submission
            handleRegister();
          }}
          style={{ display: "flex", flexDirection: "column", padding: "1.2em" }}
        >
          <h5 className="text-center">Sign up</h5>
          <label htmlFor="email">
            <input
              ref={emailRef}
              required
              type="text"
              name="email"
              placeholder="Email"
              style={{ margin: "10px" }}
            />
          </label>
          <label htmlFor="username">
            <input
              ref={usernameRef}
              required
              type="text"
              name="username"
              placeholder="Nom d'utilisateur"
              style={{ margin: "10px" }}
            />
          </label>

          <label htmlFor="password">
            <input
              ref={passwordRef}
              required
              type="password"
              name="password"
              placeholder="Mot de passe"
              style={{ margin: "10px" }}
            />
          </label>
          <label htmlFor="password">
            <input
              ref={cpasswordRef}
              required
              type="password"
              name="cpassword"
              placeholder="Confirmer Mot de passe"
              style={{ margin: "10px" }}
            />
          </label>

          <Button textContent="Sign up" type="normal" onClick={() => { }} />
          {/*There is no function binded to this button but it does trigger form submission*/}
        </form>
      )}
    </>
  );
}
