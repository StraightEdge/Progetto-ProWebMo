import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Container, Form, InputGroup } from "react-bootstrap";

function SignCdSPage({ auth, setAuth }) {
  const [loaded, setLoaded] = useState(false);
  const [corsi, setCorsi] = useState([]);
  const [tipo, setTipo] = useState();
  const [insegnamenti, setInsegnamenti] = useState([]);
  const [insegnamentiascelta, setInsegnamentiAScelta] = useState([]);
  const [disabilitablocco, setDisbilitaBlocco] = useState([1, 1, 1]);
  const [formValues, setFormValues] = useState({
    nomeutente: auth?.nomeutente,
    scelti: [null, null, null],
  });
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  // quando si carica l'elemento scarico i dati dal server
  useEffect(() => {
    // scarico i corsi di studio e li salvo in corsi
    async function get_cds() {
      fetch("http://192.168.1.16:9000/users/getCds", {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 200) {
            setLoaded(true);
            setCorsi(res.corsi);
          }
        });
    }

    // scarico gli insegnamenti attivi e li salvo in insegnamenti
    async function get_cdsteachings() {
      fetch("http://192.168.1.16:9000/users/getCdsTeachings", {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 200) {
            setInsegnamenti(res.insegnamenti);
          }
        });
    }
    get_cds();
    get_cdsteachings();
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
    if (form.checkValidity() === true) {
      // se è valido invio il nome dell'utente da modificare
      setFormValues((prevState) => ({
        ...prevState,
        nomeutente: auth.nomeutente,
      }));
      submitForm(event);
    }
  };

  // invio i dati al server
  const submitForm = (e) => {
    e.preventDefault();
    fetch("http://192.168.1.16:9000/students/iscrizioneCds", {
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
        // se il server risponde con 200 renderizzo la pagina del profilo
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
              message: "Utente iscritto al CdS",
            },
          });
        }
      });
  };

  // quando seleziono un corso abilito solo i blocchi con le materie
  // a scelta di quel corso
  const selectCorso = (e) => {
    setDisbilitaBlocco([1, 1, 1]);
    if (loaded) {
      setFormValues((prevState) => ({
        ...prevState,
        cds: e.target.value,
      }));
      if (e.target.value !== "") {
        // recupero il tipo di corso
        for (let corso of corsi) {
          if (corso.IDCorso.toString() === e.target.value) {
            setTipo(corso.TipoCorso);
            break;
          }
        }

        // seleziono gli insegnamenti a scelta del corso selezionato
        let insegnamenti_scelta = [];
        let disabilita = [1, 1, 1];
        for (let insegnamento of insegnamenti) {
          if (insegnamento.aScelta) {
            if (insegnamento.IDCorso.toString() === e.target.value) {
              insegnamenti_scelta.push(insegnamento);
            }
            if (insegnamento.Blocco) {
              disabilita[insegnamento.Blocco - 1] = 0;
              setDisbilitaBlocco(disabilita);
            }
          }
        }
        setInsegnamentiAScelta(insegnamenti_scelta);
      } else {
        setTipo("");
      }
    }
  };

  // salvo gli insegnamenti scelti dallo studente da inviare al server
  const selectascelta = (e, blocco) => {
    let copiascelta = formValues.scelti;
    copiascelta[blocco] = e.target.value;
    setFormValues((prevState) => ({
      ...prevState,
      scelti: copiascelta,
    }));
  };

  // se non sono autenticato visualizzo l'errore con un link
  // alla pagina di login
  // se non sono uno studente o lo studente è già iscritto ad un CdS
  // visualizzo un messaggio di errore
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
        <p className="lead text-uppercase mt-3">Non sei uno studente</p>
      </Container>
    );
  } else if (auth?.data.cds !== null) {
    return (
      <Container>
        <p className="lead text-uppercase mt-3">Sei già iscritto ad un CdS</p>
      </Container>
    );
  } else {
    return (
      <Container>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <p className="lead mt-4">Iscrizione Corso:</p>
          <InputGroup className="mb-3">
            <InputGroup.Text>Corso di Studi&nbsp;</InputGroup.Text>
            <Form.Control
              name="cds"
              as="select"
              required
              custom
              defaultValue=""
              onChange={selectCorso}
            >
              <option key="" value=""></option>
              {corsi.map((corso) => (
                <option key={corso.IDCorso} value={corso.IDCorso}>
                  {corso.Denominazione + " " + corso.AnnoAccademico}
                </option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Selezionare il corso di studi
            </Form.Control.Feedback>
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text>Anno&nbsp;</InputGroup.Text>
            <Form.Control
              name="anno"
              as="select"
              required
              custom
              defaultValue=""
              onChange={handleChange}
            >
              <option key="" value=""></option>
              {tipo === "triennale" ? (
                <>
                  <option key="1">1</option>
                  <option key="2">2</option>
                  <option key="3">3</option>
                  <option key="6">Fuori Corso</option>
                </>
              ) : tipo === "magistrale" ? (
                <>
                  <option key="1">1</option>
                  <option key="2">2</option>
                  <option key="6">Fuori Corso</option>
                </>
              ) : tipo === "ciclo unico" ? (
                <>
                  <option key="1">1</option>
                  <option key="2">2</option>
                  <option key="3">3</option>
                  <option key="4">4</option>
                  <option key="5">5</option>
                  <option key="6">Fuori Corso</option>
                </>
              ) : (
                <></>
              )}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Inserire Anno
            </Form.Control.Feedback>
          </InputGroup>

          <p className="lead mt-4">Insegnamenti a scelta:</p>
          <InputGroup className="mb-3">
            <InputGroup.Text>Blocco 1&nbsp;</InputGroup.Text>
            <Form.Control
              as="select"
              disabled={disabilitablocco[0]}
              required
              custom
              defaultValue=""
              onChange={(e) => selectascelta(e, 0)}
            >
              <option key="" value=""></option>
              {insegnamentiascelta.map((insegnamento) =>
                insegnamento.Blocco === "1" ? (
                  <option key={insegnamento.IDIns} value={insegnamento.IDIns}>
                    {insegnamento.Denominazione}
                  </option>
                ) : (
                  <></>
                )
              )}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Selezionare insegnamento a scelta
            </Form.Control.Feedback>
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text>Blocco 2&nbsp;</InputGroup.Text>
            <Form.Control
              as="select"
              disabled={disabilitablocco[1]}
              required
              custom
              defaultValue=""
              onChange={(e) => selectascelta(e, 1)}
            >
              <option key="" value=""></option>
              {insegnamentiascelta.map((insegnamento) =>
                insegnamento.Blocco === "2" ? (
                  <option key={insegnamento.IDIns} value={insegnamento.IDIns}>
                    {insegnamento.Denominazione}
                  </option>
                ) : (
                  <></>
                )
              )}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Selezionare insegnamento a scelta
            </Form.Control.Feedback>
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text>Blocco 3&nbsp;</InputGroup.Text>
            <Form.Control
              as="select"
              disabled={disabilitablocco[2]}
              required
              custom
              defaultValue=""
              onChange={(e) => selectascelta(e, 2)}
            >
              <option key="" value=""></option>
              {insegnamentiascelta.map((insegnamento) =>
                insegnamento.Blocco === "3" ? (
                  <option key={insegnamento.IDIns} value={insegnamento.IDIns}>
                    {insegnamento.Denominazione}
                  </option>
                ) : (
                  <></>
                )
              )}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Selezionare insegnamento a scelta
            </Form.Control.Feedback>
          </InputGroup>

          <Button
            variant="primary"
            type="submit"
            className="mt-3"
            name="ok"
            id="ok"
          >
            Iscriviti
          </Button>
        </Form>
      </Container>
    );
  }
}

export default SignCdSPage;
