import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Container, Form } from "react-bootstrap";

function LoginPage({ auth, setAuth }) {
  const [wrongPass, setWrongPass] = useState(false);
  const [formValues, setFormValues] = useState({});
  const navigate = useNavigate();

  // salvo i dati che inserisco nella form per poterli inviare al server
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevState) => ({ ...prevState, [name]: value }));
  };

  // invio i dati al server
  const submitForm = (e) => {
    e.preventDefault();
    fetch("http://localhost:9000/users/login", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(formValues),
    })
      .then((res) => res.json())
      .then((res) => {
        // se il server risponde con 200 renderizzo la pagina del profilo
        // altrimenti renderizzo la pagina di errore
        // se l'errore è password o nome utente sbagliati faccio
        // visualizzare l'alert di errore
        if (res.status === 403 || res.status === 404) {
          setFormValues((prevState) => ({ ...prevState, pass: "" }));
          setWrongPass(true);
        } else if (res.status !== 200) {
          navigate("/error", {
            state: {
              status: res.status,
              message: res.message,
            },
          });
        } else {
          setAuth(res.token);
          navigate("/profile");
        }
      });
  };

  // se l'utente è già autenticato visualizzo un messaggio
  // con un link al profilo
  if (auth) {
    return (
      <Container>
        <p className="lead text-uppercase mt-3">
          Sei già connesso, controlla il profilo
        </p>
        <Link to="/profile">
          <Button variant="info">&nbsp;Profilo&nbsp;</Button>
        </Link>
      </Container>
    );
  } else {
    return (
      <Container>
        <Form onSubmit={submitForm}>
          {wrongPass ? (
            <Alert
              variant="danger"
              onClose={() => setWrongPass(false)}
              dismissible
            >
              <p>Nome utente o password errati</p>
            </Alert>
          ) : (
            <></>
          )}
          <p className="lead text-uppercase mt-3">Autenticazione</p>
          <Form.Group>
            <Form.Label>Nome Utente</Form.Label>
            <Form.Control
              required
              type="text"
              size="32"
              maxLength="40"
              name="user"
              value={formValues["user"] || ""}
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Inserire nome utente
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.Label>Password</Form.Label>
            <Form.Control
              required
              type="password"
              title="Almeno 8 caratteri, una lettera maiuscola e un numero"
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$"
              size="32"
              maxLength="40"
              name="pass"
              value={formValues["pass"] || ""}
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Almeno 8 caratteri di cui uno maiuscolo e un numero
            </Form.Control.Feedback>
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            className="mt-3"
            name="ok"
            id="ok"
          >
            Invia
          </Button>
        </Form>
      </Container>
    );
  }
}

export default LoginPage;
