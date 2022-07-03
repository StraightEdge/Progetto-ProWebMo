import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Table,
} from "react-bootstrap";

function ListProfCFUPage({ auth }) {
  const [docenti, setDocenti] = useState([]);
  const [errMessage, setErrMessage] = useState();
  const [ricerca, setRicerca] = useState("");
  const [message, setMessage] = useState({ error: false, text: "" });
  const [loaded, setLoaded] = useState(false);

  // scarico la lista dei docenti
  useEffect(() => {
    async function fetchData() {
      fetch("http://192.168.1.16:9000/admins/getProfsCFU", {
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
            setDocenti(res.docenti);

            let proferror = [];

            for (let prof of res.docenti) {
              if (prof.SommaCFU < 12) {
                proferror.push(prof.Nome + " " + prof.Cognome);
              }
            }

            console.log(proferror);

            if (proferror.length > 0) {
              setMessage({
                error: true,
                text: proferror,
              });
            }

            setLoaded(true);
          } else {
            setErrMessage(res.message);
          }
        });
    }
    fetchData();
  }, []);

  const ricercaDocente = (e) => {
    setRicerca(e.target.value.toLowerCase());
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
              <InputGroup.Text>Cerca Docente</InputGroup.Text>
              <Form.Control
                name="search"
                type="text"
                onChange={ricercaDocente}
              />
            </InputGroup>
          </Col>

          {message.error ? (
            <Alert
              variant="danger"
              onClose={() => setMessage({ error: false, text: "" })}
              dismissible
            >
              <p>
                Attenzione, questi docenti erogano meno di 12 CFU, aggiungili ad
                un CdS.
              </p>
              {message.text.map((docente) => (
                <p>{docente}</p>
              ))}
            </Alert>
          ) : (
            <></>
          )}

          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Matricola</th>
                <th>Cognome</th>
                <th>Nome</th>
                <th>Email</th>
                <th>SSD</th>
                <th>CFU Erogati</th>
              </tr>
            </thead>
            <tbody>
              {docenti.map((docente) =>
                (docente.Nome + docente.Cognome + docente.Email)
                  .toLowerCase()
                  .includes(ricerca) ? (
                  <>
                    <tr>
                      <td>{docente.Matricola}</td>
                      <td>{docente.Cognome}</td>
                      <td>{docente.Nome}</td>
                      <td>{docente.Email}</td>
                      <td>{docente.SSD}</td>
                      <td>{docente.SommaCFU}</td>
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

export default ListProfCFUPage;
