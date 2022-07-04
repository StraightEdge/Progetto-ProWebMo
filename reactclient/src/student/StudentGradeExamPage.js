import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  Row,
  Table,
} from "react-bootstrap";

function StudentGradeExamPage({ auth }) {
  const [esami, setEsami] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [esameconvalida, setEsameConvalida] = useState();
  const [showalert, setShowAlert] = useState();
  const [formValues, setFormValues] = useState({});
  const [validated, setValidated] = useState(false);
  const [message, setMessage] = useState({ error: false, text: "" });

  const refalert = useRef(null);

  // scarico la lista degli esami da sottoscrivere
  useEffect(() => {
    async function fetchData() {
      fetch("http://localhost:9000/students/getExamGrade", {
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

  // quando clicco su uno studente mostro l'alert di convalida
  const selectEsame = (esame) => {
    setEsameConvalida(esame);
    setFormValues((prevState) => ({ ...prevState, esame: esame }));
    setShowAlert(true);
  };

  // quando clicco su uno studente scorro verso l'alert
  useEffect(() => {
    refalert.current?.scrollIntoView({ behavior: "smooth" });
  }, [esameconvalida]);

  // salvo i dati da inviare al server
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevState) => ({ ...prevState, [name]: value }));
  };

  // controllo se il form è valido
  const handleSubmit = (event) => {
    const form = event.currentTarget;
    setValidated(true);
    event.preventDefault();
    event.stopPropagation();

    if (form.checkValidity() === true) {
      submitForm(event);
    }
  };

  // invio i dati al server
  const submitForm = (e) => {
    fetch("http://localhost:9000/students/signGrade", {
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
        // se il server risponde con 200 aggiorno gli esami,
        // altrimenti mostro un errore
        if (res.status === 403) {
          setMessage({
            error: true,
            text: "Password errata",
          });
        } else if (res.status !== 200) {
          setMessage({
            error: true,
            text: "Impossibile sottoscrivere esame",
          });
        } else {
          setEsami(res.esami);

          // rimuovo l'alert e pulisco il form
          setShowAlert(false);
          setFormValues({
            esame: null,
            pass: null,
          });
          window.scrollTo(0, 0);
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
      if (esami.length === 0) {
        return (
          <Container>
            <p className="lead text-uppercase mt-3">
              Non ci sono esami da sottoscrivere
            </p>
          </Container>
        );
      } else {
        return (
          <Container className="my-3">
            <p className="lead text-uppercase mt-3">
              Lista Esami da sottoscrivere
            </p>
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Insegnamento</th>
                  <th>CFU</th>
                  <th>Docente</th>
                  <th>Data Esame</th>
                  <th>Esito</th>
                </tr>
              </thead>
              <tbody>
                {esami.map((esame) => (
                  <>
                    <tr onClick={() => selectEsame(esame)}>
                      <td>{esame.Insegnamento}</td>
                      <td>{esame.CFU}</td>
                      <td>
                        {esame.CognomeDocente} {esame.NomeDocente}
                      </td>
                      <td>{new Date(esame.Data).toLocaleString()}</td>
                      <td>{esame.Esito}</td>
                    </tr>
                  </>
                ))}
              </tbody>
            </Table>

            {showalert ? (
              <Alert variant="info" ref={refalert}>
                <p>
                  Esame {esameconvalida.Insegnamento} - Esito:{" "}
                  {esameconvalida.Esito}
                </p>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Row>
                    <Col xs={5}>
                      <Form.Group className="mb-3">
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
                    </Col>
                  </Row>

                  <Button
                    variant="primary"
                    type="submit"
                    className="mt-3"
                    name="ok"
                    id="ok"
                  >
                    Sottoscrivi
                  </Button>
                </Form>
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
}

export default StudentGradeExamPage;
