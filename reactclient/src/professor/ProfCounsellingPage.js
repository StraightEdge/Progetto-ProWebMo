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

function ProfCounsellingPage({ auth }) {
  const location = useLocation();
  const [loaded, setLoaded] = useState(false);
  const [insegnamento] = useState(location.state);
  const [ricevimenti, setRicevimenti] = useState([]);
  const [formValues, setFormValues] = useState({ idins: location.state.IDIns });
  const [validated, setValidated] = useState(false);
  const [message, setMessage] = useState({ error: false, text: "" });

  const refdate = useRef(null);

  // scarico la lista dei ricevimenti
  useEffect(() => {
    async function fetchData() {
      fetch("http://192.168.1.16:9000/professors/getProfCounselling", {
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

  // salvo i dati che inserisco nella form per poterli inviare al server
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

    // controllo se la data è nel futuro e se l'orario è compreso
    // tra le 8:00 e le 19:00

    let data = new Date(formValues.date);
    data.setHours(
      formValues.time.split(":")[0],
      formValues.time.split(":")[1],
      0
    );

    let ore8 = new Date(formValues.date);
    ore8.setHours(8, 0, 0);

    let ore19 = new Date(formValues.date);
    ore19.setHours(19, 0, 0);

    let datadurata = new Date(formValues.date);
    datadurata.setHours(
      parseInt(formValues.time.split(":")[0]) + parseInt(formValues.duration),
      formValues.time.split(":")[1],
      0
    );

    if (data < new Date()) {
      setMessage({ error: true, text: "La data non può essere nel passato" });
      return;
    } else if (data < ore8) {
      setMessage({
        error: true,
        text: "Il ricevimento non può svolgersi prima delle 8:00",
      });
      return;
    } else if (datadurata > ore19) {
      setMessage({
        error: true,
        text: "Il ricevimento non può durare oltre le 19:00",
      });
      return;
    }
    if (form.checkValidity() === true) {
      submitForm(event);
    }
  };

  // invio i dati al server
  const submitForm = (e) => {
    fetch("http://192.168.1.16:9000/professors/addCounselling", {
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
        // se il server risponde con 200 renderizzo aggiorno i ricevimenti,
        // altrimenti mostro un errore
        if (res.status !== 200) {
          setMessage({
            error: true,
            text: `Impossibile aggiungere Ricevimento`,
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
            Lista ricevimenti {insegnamento.Denominazione}
          </p>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Data</th>
                <th>Sede</th>
                <th>Durata</th>
                <th>Numero Studenti</th>
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
                      <td>{ricevimento.NumStudenti}</td>
                    </tr>
                  </>
                ) : (
                  <></>
                )
              )}
            </tbody>
          </Table>

          <p className="lead text-uppercase mt-3">Nuovo Ricevimento</p>

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

          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              <Col xs={5}>
                <InputGroup className="mb-3">
                  <InputGroup.Text>Data</InputGroup.Text>
                  <Form.Control
                    name="date"
                    required
                    type="date"
                    defaultValue=""
                    ref={refdate}
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Inserire Data
                  </Form.Control.Feedback>
                </InputGroup>
              </Col>
            </Row>

            <Row>
              <Col xs={5}>
                <InputGroup className="mb-3">
                  <InputGroup.Text>Orario</InputGroup.Text>
                  <Form.Control
                    name="time"
                    required
                    type="time"
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Inserire Orario
                  </Form.Control.Feedback>
                </InputGroup>
              </Col>
            </Row>

            <Row>
              <Col xs={5}>
                <InputGroup className="mb-3">
                  <InputGroup.Text>Sede&nbsp;&nbsp;</InputGroup.Text>
                  <Form.Control
                    name="location"
                    as="textarea"
                    rows={3}
                    required
                    defaultValue=""
                    maxLength="200"
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Inserire la Sede
                  </Form.Control.Feedback>
                </InputGroup>
              </Col>
            </Row>

            <Row>
              <Col xs={5}>
                <InputGroup className="mb-3">
                  <InputGroup.Text>Durata&nbsp;&nbsp;</InputGroup.Text>
                  <Form.Control
                    name="duration"
                    required
                    type="number"
                    min="1"
                    onChange={handleChange}
                  />
                  <InputGroup.Text>Ore&nbsp;&nbsp;</InputGroup.Text>
                  <Form.Control.Feedback type="invalid">
                    Inserire la durata
                  </Form.Control.Feedback>
                </InputGroup>
              </Col>
            </Row>

            <Row>
              <Col xs={5}>
                <InputGroup className="mb-3">
                  <InputGroup.Text>Numero Studenti&nbsp;&nbsp;</InputGroup.Text>
                  <Form.Control
                    name="numstudents"
                    required
                    type="number"
                    min="1"
                    onChange={handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Inserire il numero massimo di studenti
                  </Form.Control.Feedback>
                </InputGroup>
              </Col>
            </Row>

            <Button
              variant="primary"
              type="submit"
              className="mt-3"
              name="ok"
              id="ok"
            >
              Aggiungi Ricevimento
            </Button>
          </Form>
        </Container>
      );
    }
  }
}

export default ProfCounsellingPage;
