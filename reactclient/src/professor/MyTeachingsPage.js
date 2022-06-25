import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Container, Table } from "react-bootstrap";

function MyTeachingsPage({ auth }) {
  const [insegnamenti, setInsegnamenti] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [errMessage, setErrMessage] = useState();

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
  } else {
    if (loaded) {
      // popolo la tabella con i dati che ricevo dal server
      return (
        <Container className="my-3">
          <Table style={{ width: "auto" }} striped hover responsive>
            <thead>
              <tr>
                <th>Corso</th>
                <th>Anno Accademico</th>
                <th>Denominazione</th>
                <th>CFU</th>
                <th>Anno</th>
                <th>A Scelta</th>
                <th>Scheda di trasparenza</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {insegnamenti.map((insegnamento) => (
                <>
                  <tr>
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
        </Container>
      );
    }
  }
}

export default MyTeachingsPage;
