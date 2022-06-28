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

function TaxValidationPage({ auth }) {
  const [studenti, setStudenti] = useState([]);
  const [errMessage, setErrMessage] = useState();
  const [ricerca, setRicerca] = useState("");
  const [showalert, setShowAlert] = useState();
  const [convalidastudente, setConvalidaStudente] = useState();
  const [loaded, setLoaded] = useState(false);

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
          console.log(res);
          if (res) {
            setStudenti(res);
            setLoaded(true);
          } else {
            setErrMessage(res.message);
          }
        });
    }
    fetchData();
  }, []);

  const ricercaStudente = (e) => {
    setRicerca(e.target.value);
  };

  const selectStudente = (studente) => {
    setConvalidaStudente(studente);
    setShowAlert(true);
  };

  // quando clicco su uno studente scorro verso l'alert
  useEffect(() => {
    refalert.current?.scrollIntoView({ behavior: "smooth" });
  }, [convalidastudente]);

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
                <th>Prima Rata</th>
                <th>Seconda Rata</th>
              </tr>
            </thead>
            <tbody>
              {studenti.map((studente) =>
                (studente.Nome + studente.Cognome + studente.Email).includes(ricerca) ? (
                  <>
                    <tr onClick={() => selectStudente(studente)}>
                      <td>{studente.Matricola}</td>
                      <td>{studente.Cognome}</td>
                      <td>{studente.Nome}</td>
                      <td>{studente.Email}</td>
                      <td>{studente.Reddito} Euro</td>
                      <td>{studente.PrimaRata ? "Pagata" : "Non Pagata"}</td>
                      <td>{studente.SecondaRata ? "Pagata" : "Non Pagata"}</td>
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
                <Button>Convalida Prima Rata</Button>
                <Button>Convalida Seconda Rata </Button>
              </ButtonGroup>
            </Alert>
          ) : (
            <></>
          )}
        </Container>
      );
    }
  }
}

export default TaxValidationPage;
