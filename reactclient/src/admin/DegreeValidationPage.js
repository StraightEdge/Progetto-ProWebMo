import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Button,
  ButtonGroup,
  Col,
  Container,
  Form,
  InputGroup,
  Table,
} from "react-bootstrap";

function DegreeValidationPage({ auth }) {
  const [studenti, setStudenti] = useState([]);
  const [errMessage, setErrMessage] = useState();
  const [ricerca, setRicerca] = useState("");
  const [showalert, setShowAlert] = useState();
  const [convalidastudente, setConvalidaStudente] = useState();
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState({ error: false, text: "" });

  const refalert = useRef(null);

  // scarico la lista degli studenti
  useEffect(() => {
    async function fetchData() {
      fetch("http://192.168.1.16:9000/admins/getStudents", {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        redirect: "follow",
        referrerPolicy: "no-referrer",
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 200) {
            setStudenti(res.studenti);
            setLoaded(true);
          } else {
            setErrMessage(res.message);
          }
        });
    }
    fetchData();
  }, []);

  const ricercaStudente = (e) => {
    setRicerca(e.target.value.toLowerCase());
  };

  // quando clicco su uno studente salvo i suoi dati e mostro un alert
  const selectStudente = (studente) => {
    setConvalidaStudente(studente);
    setShowAlert(true);
  };

  // quando clicco su uno studente scorro verso l'alert
  useEffect(() => {
    refalert.current?.scrollIntoView({ behavior: "smooth" });
  }, [convalidastudente]);

  // convalida tirocinio studente
  const convalidaTirocinio = (matricola) => {
    let richiesta = { studente: matricola };
    fetch("http://192.168.1.16:9000/admins/validateInternship", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(richiesta),
    })
      .then((res) => res.json())
      .then((res) => {
        // se il server risponde con 200 aggiorno studenti
        if (res.status === 405 || res.status === 406) {
          setMessage({ error: true, text: res.message });
        } else if (res.status !== 200) {
          setMessage({
            error: true,
            text: "Impossibile validare tirocinio",
          });
        } else {
          setStudenti(res.studenti);

          for (let studente of res.studenti) {
            if (studente.Matricola === matricola) {
              setConvalidaStudente(studente);
              break;
            }
          }
        }
      });
  };

  // convalida prova finale studente
  const convalidaProvaFinale = (matricola) => {
    let richiesta = { studente: matricola };
    fetch("http://192.168.1.16:9000/admins/validateFinal", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(richiesta),
    })
      .then((res) => res.json())
      .then((res) => {
        // se il server risponde con 200 aggiorno studenti
        if (res.status === 405 || res.status === 406) {
          setMessage({ error: true, text: res.message });
        } else if (res.status !== 200) {
          setMessage({
            error: true,
            text: "Impossibile validare Prova Finale",
          });
        } else {
          setStudenti(res.studenti);

          for (let studente of res.studenti) {
            if (studente.Matricola === matricola) {
              setConvalidaStudente(studente);
              break;
            }
          }
        }
      });
  };

  // se non sono autenticato visualizzo l'errore con un link
  // alla pagina di login
  if (!auth) {
    return (
      <Container>
        <p className="lead text-uppercase mt-3">{errMessage}</p>
        <Link to="/accedi">
          <Button variant="info">&nbsp;Accedi&nbsp;</Button>
        </Link>
      </Container>
    );
  } else if (!auth?.isAdmin) {
    return (
      <Container>
        <p className="lead text-uppercase mt-3">Non sei un Admin</p>
      </Container>
    );
  } else {
    if (loaded) {
      // popolo la tabella con i dati che ricevo dal server
      return (
        <Container className="my-3">
          <Col xs={4}>
            <InputGroup>
              <InputGroup.Text>Cerca Studente</InputGroup.Text>
              <Form.Control
                name="search"
                type="text"
                onChange={ricercaStudente}
              />
            </InputGroup>
          </Col>

          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Matricola</th>
                <th>Cognome</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Reddito</th>
                <th>Tirocinio</th>
                <th>Prova Finale</th>
              </tr>
            </thead>
            <tbody>
              {studenti.map((studente) =>
                (studente.Nome + studente.Cognome + studente.Email)
                  .toLowerCase()
                  .includes(ricerca) ? (
                  <>
                    <tr onClick={() => selectStudente(studente)}>
                      <td>{studente.Matricola}</td>
                      <td>{studente.Cognome}</td>
                      <td>{studente.Nome}</td>
                      <td>{studente.Email}</td>
                      <td>{studente.Reddito} Euro</td>
                      <td>
                        {studente.Tirocinio ? "Sostenuto" : "Non Sostenuto"}
                      </td>
                      <td>
                        {studente.ProvaFinale ? "Sostenuta" : "Non Sostenuta"}
                      </td>
                    </tr>
                  </>
                ) : (
                  <></>
                )
              )}
            </tbody>
          </Table>

          {showalert ? (
            <Alert variant="info" ref={refalert}>
              <p>
                Studente: {convalidastudente.Cognome} {convalidastudente.Nome} -
                Matricola {convalidastudente.Matricola}
              </p>
              <ButtonGroup>
                <Button
                  disabled={convalidastudente.Tirocinio}
                  onClick={() =>
                    convalidaTirocinio(convalidastudente.Matricola)
                  }
                >
                  Convalida Tirocinio
                </Button>
                <Button
                  disabled={
                    !convalidastudente.Tirocinio ||
                    convalidastudente.ProvaFinale
                  }
                  onClick={() =>
                    convalidaProvaFinale(convalidastudente.Matricola)
                  }
                >
                  Convalida Prova Finale
                </Button>
              </ButtonGroup>
            </Alert>
          ) : (
            <></>
          )}

          {message.error ? (
            <Alert
              variant="danger"
              onClose={() => setMessage({ error: false, text: "" })}
              dismissible
            >
              <p>{message.text}</p>
            </Alert>
          ) : (
            <></>
          )}
        </Container>
      );
    }
  }
}

export default DegreeValidationPage;
