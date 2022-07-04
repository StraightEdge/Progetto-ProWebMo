import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Container, Form, InputGroup } from "react-bootstrap";

function RegistrationPage({ auth, setAuth }) {
  const [loaded, setLoaded] = useState(false);
  const [strong, setStrong] = useState(false);
  const [regioni, setRegioni] = useState([]);
  const [province, setProvince] = useState([]);
  const [comuni, setComuni] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  // riferimento ai campi del luogo di nascita per
  // poter leggere i loro valori
  const refregione = useRef(null);
  const refprovincia = useRef(null);

  // quando si carica l'elemento scarico il file json
  useEffect(() => {
    // scarico il file json con le regioni e lo salvo in regioni
    async function fetchData() {
      fetch("/javascripts/regioni_province_comuni.json")
        .then((res) => res.json())
        .then((result) => {
          setLoaded(true);
          setRegioni(result.regioni);
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
    fetch("http://localhost:9000/users/utenteregistrato", {
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
          setAuth(res.token);
          navigate("/landing", {
            state: {
              message: "Utente " + res.token.nomeutente + " registrato!!",
            },
          });
        }
      });
  };

  // controlla se la password è forte
  const checkPassword = (e) => {
    handleChange(e);
    const strongPass = new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}"
    );
    if (strongPass.test(e.target.value)) {
      setStrong(true);
    } else {
      setStrong(false);
    }
  };

  // controlla se le password sono uguali
  const samePassword = (e) => {
    if (formValues.pass !== e.target.value) {
      e.target.value = "";
      e.target.placeholder = "Password non coincidenti";
    }
  };

  // quando seleziono una regione popolo il campo successivo
  // con le province
  const selectRegion = (e) => {
    if (loaded) {
      if (e.target.value !== "") {
        for (let regione of regioni) {
          if (regione.nome === e.target.value) {
            setProvince(regione.province);
            setComuni([]);
            break;
          }
        }
      } else {
        setProvince([]);
        setComuni([]);
      }
    }
  };

  // quando seleziono una provincia popolo il campo successivo
  // con le città
  const selectState = (e) => {
    if (loaded) {
      if (e.target.value !== "") {
        for (let provincia of province) {
          if (provincia.nome === e.target.value) {
            setComuni(provincia.comuni);
            break;
          }
        }
      } else {
        setComuni([]);
      }
    }
  };

  // quando seleziono un comune salvo i dati nel formato
  // "Città, Provincia, Regione" da inviare al server
  const selectComune = (e) => {
    if (loaded) {
      setFormValues((prevState) => ({
        ...prevState,
        birthplace:
          e.target.value +
          ", " +
          refprovincia.current.value +
          ", " +
          refregione.current.value,
      }));
    }
  };

  // se l'utente è già autenticato visualizzo un messaggio
  // con un link al profilo
  if (auth) {
    return (
      <Container>
        <p className="lead text-uppercase mt-3">
          Sei già connesso, controlla il profilo
        </p>
        <Link to="/profile">
          <Button variant="info">&nbsp;Profilo&nbsp;</Button>
        </Link>
      </Container>
    );
  } else {
    return (
      <Container>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <p className="lead text-uppercase mt-3">Dati anagrafici</p>
          <Form.Group controlId="name">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              name="name"
              required
              type="text"
              maxLength="40"
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Inserire Nome
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="surname">
            <Form.Label>Cognome</Form.Label>
            <Form.Control
              name="surname"
              required
              type="text"
              maxLength="40"
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Inserire Cognome
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mt-2">
            <Form.Check name="gender" controlId="male">
              <Form.Check.Input
                required
                type="radio"
                name="gender"
                value="male"
                onChange={handleChange}
              />
              <Form.Check.Label>Uomo</Form.Check.Label>
            </Form.Check>
            <Form.Check name="gender" controlId="female">
              <Form.Check.Input
                required
                type="radio"
                name="gender"
                value="female"
                onChange={handleChange}
              />
              <Form.Check.Label>Donna</Form.Check.Label>
            </Form.Check>
            <Form.Check name="gender" controlId="other">
              <Form.Check.Input
                required
                type="radio"
                name="gender"
                value="other"
                onChange={handleChange}
              />
              <Form.Check.Label>Altro</Form.Check.Label>
              <Form.Control.Feedback className="ml-2" type="invalid">
                Inserire il genere
              </Form.Control.Feedback>
            </Form.Check>
          </Form.Group>

          <p className="lead mt-4">Nato a:</p>

          <InputGroup className="mb-3">
            <InputGroup.Text>Regione&nbsp;&nbsp;</InputGroup.Text>
            <Form.Control
              name="region"
              as="select"
              required
              custom
              defaultValue=""
              ref={refregione}
              onChange={selectRegion}
            >
              <option key=""></option>
              <option key="Abruzzo">Abruzzo</option>
              <option key="Basilicata">Basilicata</option>
              <option key="Calabria">Calabria</option>
              <option key="Campania">Campania</option>
              <option key="Emilia-Romagna">Emilia-Romagna</option>
              <option key="Friuli-Venezia Giulia">Friuli-Venezia Giulia</option>
              <option key="Lazio">Lazio</option>
              <option key="Liguria">Liguria</option>
              <option key="Lombardia">Lombardia</option>
              <option key="Marche">Marche</option>
              <option key="Molise">Molise</option>
              <option key="Piemonte">Piemonte</option>
              <option key="Puglia">Puglia</option>
              <option key="Sardegna">Sardegna</option>
              <option key="Sicilia">Sicilia</option>
              <option key="Toscana">Toscana</option>
              <option key="Trentino-Alto Adige">Trentino-Alto Adige</option>
              <option key="Umbria">Umbria</option>
              <option key="Valle d'Aosta">Valle d'Aosta</option>
              <option key="Veneto">Veneto</option>
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Selezionare la regione di nascita
            </Form.Control.Feedback>
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text>Provincia&nbsp;</InputGroup.Text>
            <Form.Control
              name="state"
              as="select"
              required
              custom
              defaultValue=""
              ref={refprovincia}
              onChange={selectState}
            >
              <option key=""></option>
              {province.map((provincia) => (
                <option key={provincia.nome}>{provincia.nome}</option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Selezionare la provincia di nascita
            </Form.Control.Feedback>
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text>Comune&nbsp;&nbsp;</InputGroup.Text>
            <Form.Control
              name="town"
              as="select"
              required
              custom
              defaultValue=""
              onChange={selectComune}
            >
              <option key=""></option>
              {comuni.map((comune) => (
                <option key={comune.nome}>{comune.nome}</option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Selezionare il comune di nascita
            </Form.Control.Feedback>
          </InputGroup>

          <Form.Group>
            <Form.Label>Data di Nascita</Form.Label>
            <Form.Control
              name="birthdate"
              required
              type="date"
              maxLength="40"
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Selezionare la data di nascita
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>Codice Fiscale</Form.Label>
            <Form.Control
              name="cf"
              required
              type="text"
              // l'espressione regolare per il cf, durante i test lo tolgo per non perdere tempo
              // pattern="^(?:[A-Z][AEIOU][AEIOUX]|[AEIOU]X{2}|[B-DF-HJ-NP-TV-Z]{2}[A-Z]){2}(?:[\dLMNP-V]{2}(?:[A-EHLMPR-T](?:[04LQ][1-9MNP-V]|[15MR][\dLMNP-V]|[26NS][0-8LMNP-U])|[DHPS][37PT][0L]|[ACELMRT][37PT][01LM]|[AC-EHLMPR-T][26NS][9V])|(?:[02468LNQSU][048LQU]|[13579MPRTV][26NS])B[26NS][9V])(?:[A-MZ][1-9MNP-V][\dLMNP-V]{2}|[A-M][0L](?:[1-9MNP-V][\dLMNP-V]|[0L][1-9MNP-V]))[A-Z]$"
              size="16"
              maxLength="16"
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Inserire Codice Fiscale
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>E-mail</Form.Label>
            <Form.Control
              name="email"
              required
              type="email"
              size="32"
              maxLength="40"
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Inserire indirizzo e-mail
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.Label>Reddito</Form.Label>
            <Form.Control
              name="income"
              required
              type="text"
              pattern="[0-9]*"
              size="32"
              maxLength="40"
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">
              Inserire Reddito
            </Form.Control.Feedback>
          </Form.Group>

          <p className="lead text-uppercase mt-3">Autenticazione</p>

          <Form.Group controlId="formPass">
            <Form.Label>Password</Form.Label>
            <Form.Control
              name="pass"
              required
              type="password"
              title="Almeno 8 caratteri, una lettera maiuscola e un numero"
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$"
              size="32"
              maxLength="40"
              onChange={checkPassword}
            />
            <Form.Control.Feedback type="invalid">
              Almeno 8 caratteri di cui uno maiuscolo e un numero
            </Form.Control.Feedback>
            {strong ? (
              <Form.Control.Feedback>Password forte</Form.Control.Feedback>
            ) : (
              <Form.Control.Feedback className="text-warning">
                Password media
              </Form.Control.Feedback>
            )}
          </Form.Group>
          <Form.Group>
            <Form.Label>Reinserisci password</Form.Label>
            <Form.Control
              required
              type="password"
              onBlur={samePassword}
              size="32"
              maxLength="40"
            />
            <Form.Control.Feedback type="invalid">
              Le password devono coincidere
            </Form.Control.Feedback>
          </Form.Group>
          <Button
            variant="primary"
            type="submit"
            className="mt-3"
            name="ok"
            id="ok"
          >
            Invia
          </Button>
        </Form>
      </Container>
    );
  }
}

export default RegistrationPage;
