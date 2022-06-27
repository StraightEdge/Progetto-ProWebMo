import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Container, Table } from "react-bootstrap";

function StudentCounsellingPage({ auth }) {
  const location = useLocation();
  const [loaded, setLoaded] = useState(false);
  const [insegnamento] = useState(location.state);
  const [ricevimenti, setRicevimenti] = useState([]);
  const navigate = useNavigate();

  // scarico la lista dei ricevimenti
  useEffect(() => {
    async function fetchData() {
      fetch("http://192.168.1.16:9000/students/getStudentCounselling", {
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
            setRicevimenti(res.ricevimenti);
            setLoaded(true);
          }
        });
    }
    fetchData();
  }, []);

  // iscrizione studente al ricevimento
  const iscrizioneRicev = (ricevimento) => {
    fetch("http://192.168.1.16:9000/students/signCounselling", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(ricevimento),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        // se il server risponde con 200 aggiorno i ricevimenti,
        // altrimenti mostro un errore
        if (res.status !== 200) {
          console.log("Impossibile iscriversi");
        } else {
          setRicevimenti(res.ricevimenti);
        }
      });
  };

  // annulla iscrizione studente al ricevimento
  const annullaIscrizione = (ricevimento) => {
    fetch("http://192.168.1.16:9000/students/removeCounselling", {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(ricevimento),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        // se il server risponde con 200 aggiorno i ricevimenti,
        // altrimenti mostro un errore
        if (res.status !== 200) {
          navigate("/error", {
            state: {
              status: res.status,
              message: res.message,
            },
          });
        } else {
          setRicevimenti(res.ricevimenti);
        }
      });
  };

  // se non sono autenticato visualizzo l'errore con un link
  // alla pagina di login
  // se non sono un admin visualizzo un messaggio di errore
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
            Lista ricevimenti {insegnamento.Denominazione}
          </p>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Data</th>
                <th>Sede</th>
                <th>Durata</th>
                <th>Posti disponibili</th>
                <th>Iscritto</th>
              </tr>
            </thead>
            <tbody>
              {ricevimenti.map((ricevimento) =>
                ricevimento.IDIns === insegnamento.IDIns ? (
                  <>
                    <tr>
                      <td>{new Date(ricevimento.Data).toLocaleString()}</td>
                      <td>{ricevimento.Sede}</td>
                      <td>{ricevimento.Durata} ora/e</td>
                      <td>
                        {ricevimento.NumStudenti - ricevimento.NumIscritti}
                      </td>
                      <td>
                        {ricevimento.MatStudente ? (
                          <Button
                            variant="danger"
                            onClick={() => annullaIscrizione(ricevimento)}
                          >
                            Annulla Iscrizione
                          </Button>
                        ) : (
                          <Button
                            variant="success"
                            onClick={() => iscrizioneRicev(ricevimento)}
                            disabled={
                              ricevimento.NumStudenti -
                                ricevimento.NumIscritti ===
                              0
                            }
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
        </Container>
      );
    }
  }
}

export default StudentCounsellingPage;
