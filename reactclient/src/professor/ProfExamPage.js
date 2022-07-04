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

function ProfExamPage({ auth }) {
  const location = useLocation();
  const [loaded, setLoaded] = useState(false);
  const [insegnamento] = useState(location.state);
  const [esami, setEsami] = useState([]);
  const [formValues, setFormValues] = useState({ idins: location.state.IDIns });
  const [validated, setValidated] = useState(false);
  const [message, setMessage] = useState({ error: false, text: "" });

  const refdate = useRef(null);

  // scarico la lista degli esami
  useEffect(() => {
    async function fetchData() {
      fetch("http://localhost:9000/professors/getProfExam", {
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

    // controllo se l'orario è corretto
    if (data < new Date()) {
      setMessage({ error: true, text: "La data non può essere nel passato" });
      return;
    } else if (data < ore8) {
      setMessage({
        error: true,
        text: "L'esame non può svolgersi prima delle 8:00",
      });
      return;
    } else if (datadurata > ore19) {
      setMessage({
        error: true,
        text: "L'esame non può durare oltre le 19:00",
      });
      return;
    }

    //creo le date limite delle sessioni
    let invinizio = new Date(formValues.date);
    invinizio.setMonth(0);
    invinizio.setDate(7);

    let invfine = new Date(formValues.date);
    invfine.setMonth(2);
    invfine.setDate(1);

    let priminizio = new Date(formValues.date);
    priminizio.setMonth(3);
    priminizio.setDate(15);

    let primfine = new Date(formValues.date);
    primfine.setMonth(4);
    primfine.setDate(1);

    let estinizio = new Date(formValues.date);
    estinizio.setMonth(5);
    estinizio.setDate(7);

    let estfine = new Date(formValues.date);
    estfine.setMonth(6);
    estfine.setDate(16);

    let autinizio = new Date(formValues.date);
    autinizio.setMonth(10);
    autinizio.setDate(7);

    let autfine = new Date(formValues.date);
    autfine.setMonth(10);
    autfine.setDate(16);

    // controllo se la data è corretta
    if (formValues.session === "Invernale" && data < invinizio) {
      setMessage({
        error: true,
        text: "L'esame della sessione invernale non può svolgersi prima del 7 gennaio",
      });
      return;
    } else if (formValues.session === "Invernale" && data > invfine) {
      setMessage({
        error: true,
        text: "L'esame della sessione invernale non può svolgersi dopo il 29 febbraio",
      });
      return;
    } else if (formValues.session === "Primaverile" && data < priminizio) {
      setMessage({
        error: true,
        text: "L'esame della sessione primaverile non può svolgersi prima del 15 aprile",
      });
      return;
    } else if (formValues.session === "Primaverile" && data > primfine) {
      setMessage({
        error: true,
        text: "L'esame della sessione primaverile non può svolgersi dopo il 30 aprile",
      });
      return;
    } else if (formValues.session === "Estiva" && data < estinizio) {
      setMessage({
        error: true,
        text: "L'esame della sessione estiva non può svolgersi prima del 7 giugno",
      });
      return;
    } else if (formValues.session === "Estiva" && data > estfine) {
      setMessage({
        error: true,
        text: "L'esame della sessione estiva non può svolgersi dopo il 15 luglio",
      });
      return;
    } else if (formValues.session === "Autunnale" && data < autinizio) {
      setMessage({
        error: true,
        text: "L'esame della sessione autunno non può svolgersi prima del 7 novembre",
      });
      return;
    } else if (formValues.session === "Autunnale" && data > autfine) {
      setMessage({
        error: true,
        text: "L'esame della sessione autunno non può svolgersi dopo il 15 novembre",
      });
      return;
    }

    // controllo se esiste già un esame per quell'appello
    for (let esame of esami) {
      if (esame.Sessione === formValues.session) {
        if (esame.Appello === formValues.number) {
          setMessage({
            error: true,
            text: "Esame già esistente per l'appello selezionato",
          });
          return;
        }
      }
    }

    if (form.checkValidity() === true) {
      submitForm(event);
    }
  };

  // invio i dati al server
  const submitForm = (e) => {
    fetch("http://localhost:9000/professors/addExam", {
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
        // se il server risponde con 200 renderizzo aggiorno gli esami,
        // altrimenti mostro un errore
        if (res.status !== 200) {
          setMessage({
            error: true,
            text: "Impossibile aggiungere Esame",
          });
        } else {
          setEsami(res.esami);
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
            Lista esami {insegnamento.Denominazione}
          </p>
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Data</th>
                <th>Sede</th>
                <th>Sessione</th>
                <th>Appello</th>
                <th></th>
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
                        <Button
                          as={Link}
                          to={"/professors/gradeExam"}
                          state={{
                            esame: esame,
                            insegnamento: insegnamento,
                          }}
                          variant="success"
                        >
                          Verbalizzazione
                        </Button>
                      </td>
                    </tr>
                  </>
                ) : (
                  <></>
                )
              )}
            </tbody>
          </Table>

          <p className="lead text-uppercase mt-3">Nuovo Esame</p>

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
                  <InputGroup.Text>Sessione&nbsp;&nbsp;</InputGroup.Text>
                  <Form.Control
                    name="session"
                    as="select"
                    custom
                    defaultValue=""
                    required
                    onChange={handleChange}
                  >
                    <option key=""></option>
                    <option key="Autunnale">Autunnale</option>
                    <option key="Invernale">Invernale</option>
                    <option key="Primaverile">Primaverile</option>
                    <option key="Estiva">Estiva</option>
                  </Form.Control>
                  <Form.Control.Feedback type="invalid">
                    Inserire la sessione
                  </Form.Control.Feedback>
                </InputGroup>
              </Col>
            </Row>

            <Row>
              <Col xs={5}>
                <InputGroup className="mb-3">
                  <InputGroup.Text>Appello&nbsp;&nbsp;</InputGroup.Text>
                  <Form.Control
                    name="number"
                    as="select"
                    custom
                    defaultValue=""
                    required
                    onChange={handleChange}
                  >
                    <option key=""></option>
                    {formValues.session &&
                    formValues.session !== "Autunnale" &&
                    formValues.session !== "Primaverile" ? (
                      <>
                        <option key="1">Primo</option>
                        <option key="2">Secondo</option>
                        <option key="3">Terzo</option>
                      </>
                    ) : (
                      <></>
                    )}

                    <option key="Extra">Extra</option>
                  </Form.Control>
                  <Form.Control.Feedback type="invalid">
                    Inserire l'appello
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
              Aggiungi Esame
            </Button>
          </Form>
        </Container>
      );
    }
  }
}

export default ProfExamPage;
