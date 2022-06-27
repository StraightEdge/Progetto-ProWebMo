import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, ButtonGroup, Container, Table } from "react-bootstrap";

function MyTeachingsPage({ auth }) {
  const [insegnamenti, setInsegnamenti] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [errMessage, setErrMessage] = useState();
  const [showalert, setShowAlert] = useState();
  const [opzioniinsegnamento, setOpzioniInsegnamento] = useState();

  const refalert = useRef(null);

  // controllo che il token sia valido
  useEffect(() => {
    async function fetchData() {
      fetch("http://192.168.1.16:9000/professors/getProfTeachings", {
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
            setInsegnamenti(res.insegnamenti);
            setLoaded(true);
          } else {
            setErrMessage(res.message);
          }
        });
    }
    fetchData();
  }, []);

  // quando clicco su un insegnamento mostro l'alert di opzioni
  const selectInsegnamento = (insegnamento) => {
    setOpzioniInsegnamento(insegnamento);
    setShowAlert(true);
  };

  // quando clicco su un insegmento scorro verso l'alert
  useEffect(() => {
    refalert.current?.scrollIntoView({ behavior: "smooth" });
  }, [opzioniinsegnamento]);

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
  } else if (!auth?.isProfessor) {
    return (
      <Container>
        <p className="lead text-uppercase mt-3">Non sei un Docente</p>
      </Container>
    );
  } else {
    if (loaded) {
      // popolo la tabella con i dati che ricevo dal server
      return (
        <Container className="my-3">
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Corso</th>
                <th>Anno Accademico</th>
                <th>Denominazione</th>
                <th>CFU</th>
                <th>Anno</th>
                <th>A Scelta</th>
                <th>Scheda di trasparenza</th>
              </tr>
            </thead>
            <tbody>
              {insegnamenti.map((insegnamento) => (
                <>
                  <tr onClick={() => selectInsegnamento(insegnamento)}>
                    <td>{insegnamento.Corso}</td>
                    <td>{insegnamento.AnnoAccademico}</td>
                    <td>{insegnamento.Denominazione}</td>
                    <td>{insegnamento.CFU}</td>
                    <td>{insegnamento.Anno}</td>
                    <td>{insegnamento.aScelta ? "Sì" : ""}</td>
                    <td>{insegnamento.SchedaTrasparenza ? "Sì" : "No"}</td>
                  </tr>
                </>
              ))}
            </tbody>
          </Table>

          {showalert ? (
            <Alert variant="info" ref={refalert}>
              <p>Insegnamento {opzioniinsegnamento.Denominazione}</p>
              <ButtonGroup>
                <Button disabled={opzioniinsegnamento.SchedaTrasparenza}>
                  Inserisci scheda di trasparenza
                </Button>
                <Button
                  as={Link}
                  to={"/professors/listCounselling"}
                  state={opzioniinsegnamento}
                >
                  Lista Ricevimenti
                </Button>
                <Button>Lista Esami </Button>
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

export default MyTeachingsPage;
