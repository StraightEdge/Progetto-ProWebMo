import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Alert, Button, Container, Table } from "react-bootstrap";

function ProfGradeExamPage({ auth }) {
  const location = useLocation();
  const [loaded, setLoaded] = useState(false);
  const [esame] = useState(location.state.esame);
  const [insegnamento] = useState(location.state.insegnamento);
  const [studenti, setStudenti] = useState([]);
  const [message, setMessage] = useState({ error: false, text: "" });

  // scarico la lista degli studenti iscritti all'esame
  useEffect(() => {
    async function fetchData() {
      fetch("http://192.168.1.16:9000/professors/getExamStudents", {
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
          if (res.status === 200) {
            setStudenti(res.studenti);
            setLoaded(true);
          }
        });
    }
    fetchData();
  }, []);

  // se non sono autenticato visualizzo l'errore con un link
  // alla pagina di login
  // se non sono un docente visualizzo un messaggio di errore
  if (!auth) {
    return (
      <Container>
        <p className="lead text-uppercase mt-3">Non sei connesso, accedi</p>
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
      return (
        <Container className="my-3">
          <p className="lead text-uppercase mt-3">
            Lista Studenti Esame {insegnamento}{" "}
            {new Date(esame.Data).toLocaleDateString()}
          </p>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Matricola</th>
                <th>Cognome</th>
                <th>Nome</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {studenti.map((studente) => (
                <>
                  <tr>
                    <td>{studente.Matricola}</td>
                    <td>{studente.Cognome}</td>
                    <td>{studente.Nome}</td>
                    <td>{studente.Email}</td>
                  </tr>
                </>
              ))}
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

export default ProfGradeExamPage;
