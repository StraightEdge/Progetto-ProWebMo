import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert,
  Button,
  ButtonGroup,
  Container,
  Form,
  Table,
} from "react-bootstrap";

function MyTeachingsPage({ auth }) {
  const [insegnamenti, setInsegnamenti] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [errMessage, setErrMessage] = useState();
  const [showalert, setShowAlert] = useState();
  const [opzioniinsegnamento, setOpzioniInsegnamento] = useState();
  const [file, setFile] = useState();
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState({ error: false, text: "" });

  const refalert = useRef(null);

  // controllo che il token sia valido
  useEffect(() => {
    async function fetchData() {
      fetch("http://192.168.1.16:9000/professors/getProfTeachings", {
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
            setInsegnamenti(res.insegnamenti);
            setLoaded(true);
          } else {
            setErrMessage(res.message);
          }
        });
    }
    fetchData();
  }, []);

  // quando clicco su un insegnamento mostro l'alert di opzioni
  const selectInsegnamento = (insegnamento) => {
    setOpzioniInsegnamento(insegnamento);
    setShowAlert(true);
  };

  // quando clicco su un insegmento scorro verso l'alert
  useEffect(() => {
    refalert.current?.scrollIntoView({ behavior: "smooth" });
  }, [opzioniinsegnamento]);

  const saveFile = (e) => {
    setFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
  };

  const uploadFile = (e) => {
    if (file.type !== "application/pdf") {
      console.log("Il file deve essere un pdf");
    } else {
      const richiesta = new FormData();
      richiesta.append("file", file);
      richiesta.append("fileName", fileName);
      richiesta.append("insegnamento", opzioniinsegnamento.IDIns);
      fetch("http://192.168.1.16:9000/professors/uploadScheda", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "include",
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: richiesta,
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.status === 200) {
            setInsegnamenti(res.insegnamenti);
            setShowAlert(false);
          } else {
            setMessage({ error: true, text: res.message });
          }
        });
    }
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
  } else if (!auth?.isProfessor) {
    return (
      <Container>
        <p className="lead text-uppercase mt-3">Non sei un Docente</p>
      </Container>
    );
  } else {
    if (loaded) {
      // popolo la tabella con i dati che ricevo dal server
      return (
        <Container className="my-3">
          <Table striped hover responsive>
            <thead>
              <tr>
                <th>Corso</th>
                <th>Anno Accademico</th>
                <th>Denominazione</th>
                <th>CFU</th>
                <th>Anno</th>
                <th>A Scelta</th>
                <th>Scheda di trasparenza</th>
              </tr>
            </thead>
            <tbody>
              {insegnamenti.map((insegnamento) => (
                <>
                  <tr onClick={() => selectInsegnamento(insegnamento)}>
                    <td>{insegnamento.Corso}</td>
                    <td>{insegnamento.AnnoAccademico}</td>
                    <td>{insegnamento.Denominazione}</td>
                    <td>{insegnamento.CFU}</td>
                    <td>{insegnamento.Anno}</td>
                    <td>{insegnamento.aScelta ? "Sì" : ""}</td>
                    <td>
                      {insegnamento.SchedaTrasparenza
                        ? insegnamento.SchedaTrasparenza
                        : "---"}
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          </Table>

          {showalert ? (
            <Alert variant="info" ref={refalert}>
              <p>Insegnamento {opzioniinsegnamento.Denominazione}</p>

              <Form.Group className="mb-3">
                <Form.Label>Carica scheda di trasparenza</Form.Label>
                <Form.Control type="file" onChange={saveFile} />
                <Button onClick={uploadFile}>Upload </Button>
              </Form.Group>

              <ButtonGroup>
                <Button
                  as={Link}
                  to={"/professors/listCounselling"}
                  state={opzioniinsegnamento}
                >
                  Lista Ricevimenti
                </Button>
                <Button
                  as={Link}
                  to={"/professors/listExam"}
                  state={opzioniinsegnamento}
                >
                  Lista Esami
                </Button>
              </ButtonGroup>
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

export default MyTeachingsPage;
