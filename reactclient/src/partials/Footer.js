import React from "react";
import { Link } from "react-router-dom";

import { Container, ListGroup, Row } from "react-bootstrap";

function Footer() {
  return (
    <Container fluid className="bg-light rounded-3 py-3 mt-5">
      <Row>
        <Container className="col-sm-6 text-justify">
          <p className="lead">Università degli Studi di Palermo</p>
          <p>Piazza Marina, 61</p>
          <p>
            90133 - PALERMO Codice Fiscale 80023730825, Partita IVA 00605880822
          </p>
          <p></p>
        </Container>
        <Container className="col-sm-6 text-justify">
          <p className="lead">Sviluppatori</p>
          <ListGroup>
            <ListGroup.Item>
              <h5>Pietro Lo Iacono</h5>
              <Link to="mailto:pietro.loiacono@community.unipa.it">
                pietro.loiacono@community.unipa.it{" "}
              </Link>
            </ListGroup.Item>
            <ListGroup.Item>
              <h5>Calogero</h5>
              <Link to="mailto:">email1@community.unipa.it</Link>
            </ListGroup.Item>
            <ListGroup.Item>
              <h5>Giuseppe</h5>
              <Link to="mailto:">email2@community.unipa.it</Link>
            </ListGroup.Item>
            <ListGroup.Item>
              <h5>Mirko</h5>
              <Link to="mailto:">email3@community.unipa.it</Link>
            </ListGroup.Item>
          </ListGroup>
        </Container>
      </Row>
    </Container>
  );
}

export default Footer;
