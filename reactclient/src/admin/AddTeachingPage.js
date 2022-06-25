import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Container, Form, InputGroup } from "react-bootstrap";

function AddTeachingPage({ auth }) {
  const [loaded, setLoaded] = useState(false);
  const [aree, setAree] = useState([]);
  const [settori, setSettori] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  // riferimento al campo area in modo da poter leggere il suo valore
  const refarea = useRef(null);

  // quando si carica l'elemento scarico il file json degli ssd
  useEffect(() => {
    async function fetchSSD() {
      fetch("/javascripts/ssd.json")
        .then((res) => res.json())
        .then((result) => {
          setLoaded(true);
          setAree(result.area);
        });
    }
    fetchSSD();
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
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      submitForm(event);
    }
  };

  // invio i dati al server
  const submitForm = (e) => {
    e.preventDefault();
    fetch("http://192.168.1.16:9000/admins/addTeaching", {
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
        // se il server risponde con 200 renderizzo la pagina di successo
        // altrimenti renderizzo la pagina di errore
        if (res.status !== 200) {
          navigate("/error", {
            state: {
              status: res.status,
              message: res.message,
            },
          });
        } else {
          navigate("/landing", {
            state: {
              message: "Creato insegnamento " + res.teaching,
            },
          });
        }
      });
  };

  // quando seleziono un area popolo il campo successivo
  // con i settori
  const selectArea = (e) => {
    if (loaded) {
      if (e.target.value !== "") {
        for (let area of aree) {
          if (area.tipo === e.target.value) {
            setSettori(area.settori);
            break;
          }
        }
      } else {
        setSettori([]);
      }
    }
  };

  // quando seleziono un area popolo il campo successivo
  // con i settori
  const selectSettore = (e) => {
    if (loaded) {
      setFormValues((prevState) => ({
        ...prevState,
        ssd: e.target.value,
      }));
    }
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
  } else if (!auth?.isAdmin) {
    return (
      <Container>
        <p className="lead text-uppercase mt-3">Non sei un Admin</p>
      </Container>
    );
  } else {
    return (
      <Container>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <h2 className="text-center">Creazione Insegnamento</h2>
          <InputGroup >
            <InputGroup.Text>Denominazione</InputGroup.Text>
            <Form.Control
              name="name"
              required
              type="text"
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Inserire Denominazione
            </Form.Control.Feedback>
          </InputGroup>

          <InputGroup className="my-3">
            <InputGroup.Text>CFU&nbsp;&nbsp;</InputGroup.Text>
            <Form.Control
              name="cfu"
              as="select"
              required
              custom
              defaultValue=""
              onChange={handleChange}
            >
              <option key=""></option>
              <option key="3">3</option>
              <option key="6">6</option>
              <option key="9">9</option>
              <option key="12">12</option>
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Selezionare il numero di CFU
            </Form.Control.Feedback>
          </InputGroup>

          <p className="lead mt-4">Settore Scientifico-Disciplinare:</p>

          <InputGroup className="mb-3">
            <InputGroup.Text>Area&nbsp;&nbsp;</InputGroup.Text>
            <Form.Control
              name="area"
              as="select"
              required
              custom
              defaultValue=""
              ref={refarea}
              onChange={selectArea}
            >
              <option key="" value=""></option>
              {aree.map((area) => (
                <option key={area.numero}>{area.tipo}</option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Selezionare area disciplinare
            </Form.Control.Feedback>
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text>Settore&nbsp;&nbsp;</InputGroup.Text>
            <Form.Control
              name="ssd"
              as="select"
              required
              custom
              defaultValue=""
              onChange={selectSettore}
            >
              <option key=""></option>
              {settori.map((settore) => (
                <option key={settore}>{settore}</option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Selezionare il settore disciplinare
            </Form.Control.Feedback>
          </InputGroup>
          <Button
            variant="primary"
            type="submit"
            className="mt-3"
            name="ok"
            id="ok"
          >
            Aggiungi Insegnamento
          </Button>
        </Form>
      </Container>
    );
  }
}

export default AddTeachingPage;
