import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, ButtonGroup, Container, Table } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";

function MyCarreerPage({ auth }) {
  const [insegnamenti, setInsegnamenti] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [errMessage, setErrMessage] = useState();
  const [showalert, setShowAlert] = useState();
  const [opzioniinsegnamento, setOpzioniInsegnamento] = useState();
  const [mediaaritmetica, setMediaAritmetica] = useState();
  const [mediaponderata, setMediaPonderata] = useState();
  const [votolaurea, setVotoLaurea] = useState();

  const refalert = useRef(null);
  const refcarriera = useRef(null);
  const refmanifesto = useRef(null);
  const reflaurea = useRef(null);

  const stampaCarriera = useReactToPrint({
    content: () => refcarriera.current,
  });

  const stampaManifesto = useReactToPrint({
    content: () => refmanifesto.current,
  });

  const stampaLaurea = useReactToPrint({
    content: () => reflaurea.current,
  });

  // scarico le info del corso di studi
  useEffect(() => {
    async function fetchData() {
      fetch("http://localhost:9000/students/getCarriera", {
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
            setInsegnamenti(res.carriera);

            let media = 0;
            let numeroesami = 0;
            for (let insegnamento of res.carriera) {
              if (
                insegnamento.Esito &&
                insegnamento.Denominazione !== "Tirocinio" &&
                insegnamento.Denominazione !== "Prova Finale"
              ) {
                media += insegnamento.Esito;
                numeroesami++;
              }
            }

            if (numeroesami) {
              media = media / numeroesami;
            } else {
              media = 0;
            }

            setMediaAritmetica(media.toFixed(2));

            media = 0;
            numeroesami = 0;

            for (let insegnamento of res.carriera) {
              if (
                insegnamento.Esito &&
                insegnamento.Denominazione !== "Tirocinio" &&
                insegnamento.Denominazione !== "Prova Finale"
              ) {
                media += insegnamento.Esito * insegnamento.CFU;
                numeroesami += insegnamento.CFU;
              }
            }

            if (numeroesami) {
              media = media / numeroesami;
            } else {
              media = 0;
            }

            setMediaPonderata(media.toFixed(2));

            setVotoLaurea(((media * 110) / 30).toFixed(2));

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
  } else if (!auth?.isStudent) {
    return (
      <Container>
        <p className="lead text-uppercase mt-3">Non sei uno Studente</p>
      </Container>
    );
  } else {
    if (loaded) {
      // popolo la tabella con i dati che ricevo dal server
      return (
        <Container className="my-3">
          <h5>Riepilogo Media Voto e Base Voto Laurea</h5>
          Media Aritmetica: {mediaaritmetica}
          <br />
          Media Ponderata: {mediaponderata}
          <br />
          Base Voto Laurea: {votolaurea}
          <h5 className="text-center">Elenco insegnamenti</h5>
          <Table striped hover responsive ref={refcarriera}>
            <thead>
              <tr>
                <th>Anno</th>
                <th>Denominazione</th>
                <th>CFU</th>
                <th>A Scelta</th>
                <th>Blocco</th>
                <th>Esito</th>
                <th>Scheda di trasparenza</th>
              </tr>
            </thead>
            <tbody>
              {insegnamenti.map((insegnamento) =>
                insegnamento.Matricola ? (
                  insegnamento.Denominazione !== "Tirocinio" &&
                  insegnamento.Denominazione !== "Prova Finale" ? (
                    <>
                      <tr onClick={() => selectInsegnamento(insegnamento)}>
                        <td>{insegnamento.Anno}</td>
                        <td>{insegnamento.Denominazione}</td>
                        <td>{insegnamento.CFU}</td>
                        <td>{insegnamento.aScelta ? "Sì" : ""}</td>
                        <td>{insegnamento.Blocco}</td>
                        <td>{insegnamento.Esito ? insegnamento.Esito : ""}</td>
                        <td>
                          {insegnamento.SchedaTrasparenza
                            ? insegnamento.SchedaTrasparenza
                            : "No"}
                        </td>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr>
                        <td>3</td>
                        <td>{insegnamento.Denominazione}</td>
                        <td>{insegnamento.CFU}</td>
                        <td></td>
                        <td></td>
                        <td>{insegnamento.Esito ? "Sostenuto" : ""}</td>
                        <td></td>
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
              <p>Insegnamento {opzioniinsegnamento.Denominazione}</p>
              <ButtonGroup>
                <Button
                  disabled={!opzioniinsegnamento.SchedaTrasparenza}
                  href={
                    "http://localhost:9000/schede/" +
                    opzioniinsegnamento.SchedaTrasparenza
                  }
                  target="_blank"
                >
                  Scarica Scheda
                </Button>
                <Button
                  as={Link}
                  to={"/students/listCounselling"}
                  state={opzioniinsegnamento}
                >
                  Lista Ricevimenti
                </Button>
                <Button
                  as={Link}
                  to={"/students/listExam"}
                  state={opzioniinsegnamento}
                >
                  Lista Esami
                </Button>
              </ButtonGroup>
            </Alert>
          ) : (
            <></>
          )}
          <Button variant="info" onClick={stampaCarriera} className="my-3">
            Stampa Carriera
          </Button>
          <Button variant="info" onClick={stampaManifesto} className="my-3">
            Stampa Manifesto
          </Button>
          <Button
            disabled={auth.data.provafinale !== "Si"}
            variant="info"
            onClick={stampaLaurea}
            className="my-3"
          >
            Stampa Certificato Laurea
          </Button>
          <TableManifesto
            insegnamenti={insegnamenti}
            corso={auth.data.cds}
            ref={refmanifesto}
          />
          <TableLaurea
            insegnamenti={insegnamenti}
            studente={auth.data}
            voto={votolaurea}
            ref={reflaurea}
          />
        </Container>
      );
    }
  }
}

// componente da stampare
const TableManifesto = React.forwardRef((props, ref) => {
  let insegnamenti = props.insegnamenti;
  let corso = props.corso;
  return (
    <div className="stampa mx-3" ref={ref}>
      <h2 className="text-center">Manifesto Corso di Studi {corso}</h2>
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Anno</th>
            <th>Denominazione</th>
            <th>CFU</th>
            <th>aScelta</th>
            <th>Blocco</th>
            <th>SSD</th>
            <th>Docente</th>
          </tr>
        </thead>
        <tbody>
          {insegnamenti.map((insegnamento) => (
            <>
              <tr>
                <td>{insegnamento.Anno}</td>
                <td>{insegnamento.Denominazione}</td>
                <td>{insegnamento.CFU}</td>
                <td>{insegnamento.aScelta ? "Sì" : ""}</td>
                <td>{insegnamento.Blocco}</td>
                <td>{insegnamento.SSD}</td>
                <td>
                  {insegnamento.CognomeDocente} {insegnamento.NomeDocente}
                </td>
              </tr>
            </>
          ))}
        </tbody>
      </Table>
    </div>
  );
});

// componente da stampare
const TableLaurea = React.forwardRef((props, ref) => {
  let insegnamenti = props.insegnamenti;
  let studente = props.studente;
  let voto = props.voto;
  return (
    <div className="stampa mx-3" ref={ref}>
      <h2 className="text-center">
        Certificato Laurea {studente.cognome} {studente.nome}
      </h2>
      Si certifica che {studente.cognome} {studente.nome} - Matricola{" "}
      {studente.matricola}
      <br />
      Nato a {studente.luogo_nascita} il{" "}
      {new Date(studente.data_nascita).toLocaleDateString()} ha conseguito in
      questa Università la laurea di dottore in {studente.cds}.
      <br />
      Con voto {Math.ceil(voto)}/110
      <h4 className="text-center">Esami sostenuti</h4>
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Anno</th>
            <th>Denominazione</th>
            <th>CFU</th>
            <th>Docente</th>
            <th>Esito</th>
          </tr>
        </thead>
        <tbody>
          {insegnamenti.map((insegnamento) =>
            insegnamento.Esito ? (
              <>
                <tr>
                  <td>{insegnamento.Anno}</td>
                  <td>{insegnamento.Denominazione}</td>
                  <td>{insegnamento.CFU}</td>
                  <td>
                    {insegnamento.CognomeDocente} {insegnamento.NomeDocente}
                  </td>
                  <td>{insegnamento.Esito}</td>
                </tr>
              </>
            ) : (
              <></>
            )
          )}
        </tbody>
      </Table>
    </div>
  );
});

export default MyCarreerPage;
