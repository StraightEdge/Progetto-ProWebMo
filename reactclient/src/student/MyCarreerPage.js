import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, ButtonGroup, Container, Table } from "react-bootstrap";

function MyCarreerPage({ auth }) {
  const [insegnamenti, setInsegnamenti] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [errMessage, setErrMessage] = useState();
  const [showalert, setShowAlert] = useState();
  const [opzioniinsegnamento, setOpzioniInsegnamento] = useState();

  const refalert = useRef(null);

  // controllo che il token sia valido
  useEffect(() => {
    async function fetchData() {
      fetch("http://192.168.1.16:9000/students/getCarriera", {
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
            console.log(res.carriera);
            setInsegnamenti(res.carriera);
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
  } else if (!auth?.isStudent) {
    return (
      <Container>
        <p className="lead text-uppercase mt-3">Non sei uno Studente</p>
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
                <th>Anno</th>
                <th>Denominazione</th>
                <th>CFU</th>
                <th>A Scelta</th>
                <th>Blocco</th>
                <th>Esito</th>
                <th>Scheda di trasparenza</th>
              </tr>
            </thead>
            <tbody>
              {insegnamenti.map((insegnamento) =>
                insegnamento.Denominazione !== "Tirocinio" &&
                insegnamento.Denominazione !== "Prova Finale" ? (
                  <>
                    <tr onClick={() => selectInsegnamento(insegnamento)}>
                      <td>{insegnamento.Anno}</td>
                      <td>{insegnamento.Denominazione}</td>
                      <td>{insegnamento.CFU}</td>
                      <td>{insegnamento.aScelta ? "Sì" : ""}</td>
                      <td>{insegnamento.Blocco}</td>
                      <td>{insegnamento.Esito ? insegnamento.Esito : ""}</td>
                      <td>{insegnamento.SchedaTrasparenza ? "Sì" : "No"}</td>
                    </tr>
                  </>
                ) : (
                  <>
                    <tr>
                      <td>3</td>
                      <td>{insegnamento.Denominazione}</td>
                      <td>{insegnamento.CFU}</td>
                      <td></td>
                      <td></td>
                      <td>{insegnamento.Esito ? insegnamento.Esito : ""}</td>
                      <td></td>
                    </tr>
                  </>
                )
              )}
            </tbody>
          </Table>

          {showalert ? (
            <Alert variant="info" ref={refalert}>
              <p>Insegnamento {opzioniinsegnamento.Denominazione}</p>
              <ButtonGroup>
                <Button
                  as={Link}
                  to={"/students/listCounselling"}
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

export default MyCarreerPage;
