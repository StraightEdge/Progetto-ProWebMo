import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Container, Table } from "react-bootstrap";

function StudentExamPage({ auth }) {
  const location = useLocation();
  const [loaded, setLoaded] = useState(false);
  const [insegnamento] = useState(location.state);
  const [esami, setEsami] = useState([]);
  const [message, setMessage] = useState({ error: false, text: "" });
  const navigate = useNavigate();

  // scarico la lista degli esami
  useEffect(() => {
    async function fetchData() {
      fetch("http://localhost:9000/students/getStudentExam", {
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
            setEsami(res.esami);
            setLoaded(true);
          }
        });
    }
    fetchData();
  }, []);

  // iscrizione studente all'esame
  const iscrizioneEsame = (esame) => {
    fetch("http://localhost:9000/students/signExam", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(esame),
    })
      .then((res) => res.json())
      .then((res) => {
        // se il server risponde con 200 aggiorno gli esami,
        // altrimenti mostro un errore
        if (res.status !== 200) {
          setMessage({ error: true, text: res.message });
        } else {
          setEsami(res.esami);
        }
      });
  };

  // annulla iscrizione studente al ricevimento
  const annullaIscrizione = (esame) => {
    fetch("http://localhost:9000/students/removeExam", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(esame),
    })
      .then((res) => res.json())
      .then((res) => {
        // se il server risponde con 200 aggiorno gli esami,
        // altrimenti mostro un errore
        if (res.status !== 200) {
          navigate("/error", {
            state: {
              status: res.status,
              message: res.message,
            },
          });
        } else {
          setEsami(res.esami);
        }
      });
  };

  // se non sono autenticato visualizzo l'errore con un link
  // alla pagina di login
  // se non sono uno studente visualizzo un messaggio di errore
  if (!auth) {
    return (
      <Container>
        <p className="lead text-uppercase mt-3">Non sei connesso, accedi</p>
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
      return (
        <Container className="my-3">
          <p className="lead text-uppercase mt-3">
            Lista esami {insegnamento.Denominazione}
          </p>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Data</th>
                <th>Sede</th>
                <th>Sessione</th>
                <th>Appello</th>
                <th>Iscritto</th>
              </tr>
            </thead>
            <tbody>
              {esami.map((esame) =>
                esame.IDIns === insegnamento.IDIns ? (
                  <>
                    <tr>
                      <td>{new Date(esame.Data).toLocaleString()}</td>
                      <td>{esame.Sede}</td>
                      <td>{esame.Sessione}</td>
                      <td>{esame.Appello}</td>
                      <td>
                        {esame.MatStudente ? (
                          <Button
                            variant="danger"
                            onClick={() => annullaIscrizione(esame)}
                          >
                            Annulla Iscrizione
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            onClick={() => iscrizioneEsame(esame)}
                          >
                            Iscriviti
                          </Button>
                        )}
                      </td>
                    </tr>
                  </>
                ) : (
                  <></>
                )
              )}
            </tbody>
          </Table>

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

export default StudentExamPage;
