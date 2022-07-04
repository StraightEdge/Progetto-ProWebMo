import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
  Table,
} from "react-bootstrap";

function ProfGradeExamPage({ auth }) {
  const location = useLocation();
  const [loaded, setLoaded] = useState(false);
  const [esame] = useState(location.state.esame);
  const [insegnamento] = useState(location.state.insegnamento);
  const [studenti, setStudenti] = useState([]);
  const [message, setMessage] = useState({ error: false, text: "" });
  const [showalert, setShowAlert] = useState();
  const [compilastudente, setCompilaStudente] = useState();
  const [validated, setValidated] = useState(false);
  const [formValues, setFormValues] = useState({
    esame: location.state.esame,
    insegnamento: location.state.insegnamento,
    studente: null,
  });

  const refalert = useRef(null);
  const refdomande = useRef(null);
  const refesito = useRef(null);

  // scarico la lista degli studenti iscritti all'esame
  useEffect(() => {
    async function fetchData() {
      fetch("http://localhost:9000/professors/getExamStudents", {
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
          }
        });
    }
    fetchData();
  }, []);

  // quando clicco su uno studente mostro l'alert di opzioni
  const selectStudente = (studente) => {
    setCompilaStudente(studente);
    setFormValues((prevState) => ({ ...prevState, studente: studente }));
    setShowAlert(true);
  };

  // quando clicco su uno studente scorro verso l'alert
  useEffect(() => {
    refalert.current?.scrollIntoView({ behavior: "smooth" });
  }, [compilastudente]);

  // salvo i dati che inserisco nella form per poterli inviare al server
  const handleChange = (e) => {
    console.log(formValues);
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
    fetch("http://localhost:9000/professors/gradeStudent", {
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
        // se il server risponde con 200 aggiorno i ricevimenti,
        // altrimenti mostro un errore
        if (res.status !== 200) {
          setMessage({
            error: true,
            text: res.message,
          });
        } else {
          // rimuovo l'alert e pulisco il form
          setShowAlert(false);
          setFormValues((prevState) => ({
            ...prevState,
            studente: null,
            questions: null,
            grade: null,
          }));
          refdomande.current.value = "";
          refesito.current.value = "";

          // aggiorno gli studenti validati
          let studentiaggiornati = JSON.parse(JSON.stringify(studenti));
          for (let studente of studentiaggiornati) {
            if (studente.Matricola === compilastudente.Matricola) {
              studente.Validato = true;
              break;
            }
          }
          setStudenti(studentiaggiornati);
          window.scrollTo(0, 0);
        }
      });
  };

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
            Lista Studenti Esame {insegnamento.Denominazione}{" "}
            {new Date(esame.Data).toLocaleDateString()}
          </p>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Matricola</th>
                <th>Cognome</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Validato</th>
              </tr>
            </thead>
            <tbody>
              {studenti.map((studente) =>
                studente.IDEsame === esame.IDEsame ? (
                  studente.Validato ? (
                    <>
                      <tr>
                        <td>{studente.Matricola}</td>
                        <td>{studente.Cognome}</td>
                        <td>{studente.Nome}</td>
                        <td>{studente.Email}</td>
                        <td>Sì</td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr onClick={() => selectStudente(studente)}>
                        <td>{studente.Matricola}</td>
                        <td>{studente.Cognome}</td>
                        <td>{studente.Nome}</td>
                        <td>{studente.Email}</td>
                        <td>No</td>
                      </tr>
                    </>
                  )
                ) : (
                  <></>
                )
              )}
            </tbody>
          </Table>

          {showalert ? (
            <Alert variant="info" ref={refalert}>
              <p>
                Studente: {compilastudente.Cognome} {compilastudente.Nome} -
                Matricola {compilastudente.Matricola}
              </p>
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Row>
                  <Col xs={5}>
                    <InputGroup className="mb-3">
                      <InputGroup.Text>Domande&nbsp;&nbsp;</InputGroup.Text>
                      <Form.Control
                        name="questions"
                        as="textarea"
                        rows={3}
                        required
                        maxLength="1000"
                        ref={refdomande}
                        onChange={handleChange}
                      />
                      <Form.Control.Feedback type="invalid">
                        Inserire le domande
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Col>
                </Row>

                <Row>
                  <Col xs={5}>
                    <InputGroup className="mb-3">
                      <InputGroup.Text>Esito&nbsp;&nbsp;</InputGroup.Text>
                      <Form.Control
                        name="grade"
                        as="select"
                        required
                        defaultValue=""
                        ref={refesito}
                        onChange={handleChange}
                      >
                        <option key=""></option>
                        <option key="18" value="18">
                          18
                        </option>
                        <option key="19" value="19">
                          19
                        </option>
                        <option key="20" value="20">
                          20
                        </option>
                        <option key="21" value="21">
                          21
                        </option>
                        <option key="22" value="22">
                          22
                        </option>
                        <option key="23" value="23">
                          23
                        </option>
                        <option key="24" value="24">
                          24
                        </option>
                        <option key="25" value="25">
                          25
                        </option>
                        <option key="26" value="26">
                          26
                        </option>
                        <option key="27" value="27">
                          27
                        </option>
                        <option key="28" value="28">
                          28
                        </option>
                        <option key="29" value="29">
                          29
                        </option>
                        <option key="30" value="30">
                          30
                        </option>
                        <option key="31" value="31">
                          30 e lode
                        </option>
                      </Form.Control>
                      <Form.Control.Feedback type="invalid">
                        Inserire l'esito
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Col>
                </Row>

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
                  Verbalizza
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

export default ProfGradeExamPage;
