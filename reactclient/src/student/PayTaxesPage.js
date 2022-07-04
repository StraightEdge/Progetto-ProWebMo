import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Container, Table } from "react-bootstrap";
import { useReactToPrint } from "react-to-print";

function PayTaxesPage({ auth, setAuth }) {
  const [utente, setUtente] = useState();
  const [importo, setImporto] = useState();
  const [loaded, setLoaded] = useState(false);

  const refbollettino = useRef(null);

  const stampa = useReactToPrint({ content: () => refbollettino.current });

  useEffect(() => {
    async function fetchData() {
      fetch("http://localhost:9000/users/profile", {
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
            setUtente(res.token);
            setLoaded(true);

            //calcolo tasse
            if (res.token.data.reddito < 12000) {
              setImporto(100);
            } else if (res.token.data.reddito < 36000) {
              setImporto(250);
            } else {
              setImporto(500);
            }
          }
        });
    }
    fetchData();
  }, []);

  const stampaBollettino = (rata) => {
    refbollettino.current.innerHTML = `
        <div class="container stampa">
            <div class="row">
                <div class="col-md-12">
                    <h1>Bollettino</h1>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <p>
                        <strong>Nome:</strong> ${utente.data.nome} ${utente.data.cognome}
                    </p>
                    <p>
                        <strong>Rata:</strong> ${rata}
                    </p>
                    <p>
                        <strong>Importo:</strong> ${importo} euro
                    </p>
                </div>
            </div>
        </div>`;
    stampa();
  };

  // se non sono autenticato visualizzo l'errore con un link
  // alla pagina di login
  if (!auth) {
    return (
      <Container>
        <p className="lead text-uppercase mt-3">Non sei autenticato</p>
        <Link to="/accedi">
          <Button variant="info">&nbsp;Accedi&nbsp;</Button>
        </Link>
      </Container>
    );
  } else {
    if (loaded) {
      return (
        <Container>
          <Table style={{ width: "auto" }} striped hover responsive>
            <thead>
              <tr>
                <th>Utente:</th>
                <th>{utente?.nomeutente}</th>
                <th></th>
              </tr>
              <tr>
                <th>Calcolo rata:</th>
                <th>{importo}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Prima Rata</td>
                <td>
                  {utente?.data.primarata === "Si" ? "Pagata" : "Da Pagare"}
                </td>
                {utente?.data.primarata === "Si" ? (
                  <td></td>
                ) : (
                  <td>
                    <Button variant="info" onClick={() => stampaBollettino(1)}>
                      Stampa Bollettino
                    </Button>
                  </td>
                )}
              </tr>
              <tr>
                <td>Seconda Rata: </td>
                <td>
                  {utente?.data.secondarata === "Si" ? "Pagata" : "Da Pagare"}
                </td>
                {utente?.data.secondarata === "Si" ? (
                  <td></td>
                ) : (
                  <td>
                    <Button variant="info" onClick={() => stampaBollettino(2)}>
                      Stampa Bollettino
                    </Button>
                  </td>
                )}
              </tr>
            </tbody>
          </Table>

          <div ref={refbollettino}></div>
        </Container>
      );
    }
  }
}
export default PayTaxesPage;
