import React from "react";
import { Link } from "react-router-dom";

import { Col, Container, ListGroup, Row } from "react-bootstrap";

function Footer() {
  return (
    <Container fluid className="bg-light rounded-3 py-3 mt-5">
      <Row>
        <Col sm={6} xs={12} className="text-justify">
          <p className="lead">Università degli Studi di Palermo</p>
          <p>Piazza Marina, 61</p>
          <p>
            90133 - PALERMO Codice Fiscale 80023730825, Partita IVA 00605880822
          </p>
          <p></p>
        </Col>
        <Col sm={6} xs={0} className="d-none d-sm-block text-justify">
          <p className="lead">Sviluppatori</p>
          <ListGroup>
            <ListGroup.Item>
              <h5>Pietro Lo Iacono</h5>
              <Link to="mailto:pietro.loiacono@community.unipa.it">
                pietro.loiacono@community.unipa.it{" "}
              </Link>
            </ListGroup.Item>
            <ListGroup.Item>
              <h5>Calogero Giorgio Curiale</h5>
              <Link to="mailto:">
                calogerogiorgio.curiale@community.unipa.it
              </Link>
            </ListGroup.Item>
            <ListGroup.Item>
              <h5>Giuseppe Aloi</h5>
              <Link to="mailto:">giuseppe.aloi@community.unipa.it</Link>
            </ListGroup.Item>
            <ListGroup.Item>
              <h5>Mirko Russo</h5>
              <Link to="mailto:">mirko.russo01@community.unipa.it</Link>
            </ListGroup.Item>
          </ListGroup>
        </Col>
      </Row>
    </Container>
  );
}

export default Footer;
