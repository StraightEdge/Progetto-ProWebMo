import React from "react";
import { Button, ButtonGroup, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

function HomePage({ auth, setAuth }) {
  return (
    <Container>
      <h1 className="display-1 text-center">Benvenuto!</h1>
      <Container className="text-justify">
        Questo è il portale dell'Università di Palermo per la gestione
        dell'attività didattica e della carriera degli studenti dell'Ateneo.
        <br /> <br />
        Gli studenti registrati possono iscriversi ad un Corso di Studi tra
        quelli erogati in Ateneo, consultare la lista degli insegnamenti erogati
        ed iscriversi ad Esami e Ricevimenti. <br />
        Per usufruire dei servizi di Ateneo, è necessario pagare le tasse
        corrispondenti alla propria fascia di reddito.
        <br /> <br />
        I docenti possono consultare gli insegnamenti che erogano per creare
        Ricevimenti, Esami o caricare la scheda di trasparenza. <br />
        Per iscriversi come docenti abilitati contattare l'amministrazione del
        Portale.
        <br /> <br />
        Gli amministratori del Portale possono creare o modificare Corsi di
        Studio, aggiungere Docenti e validare il pagamento delle tasse e i
        tirocini degli Studenti.
      </Container>
      {!auth ? (
        <Container fluid className="mt-3 text-center">
          <ButtonGroup>
            <Link to="/accedi">
              <Button>Accedi</Button>
            </Link>
            <Link to="/registrati">
              <Button>Registrati</Button>
            </Link>
          </ButtonGroup>
        </Container>
      ) : (
        <></>
      )}{" "}
    </Container>
  );
}

export default HomePage;
