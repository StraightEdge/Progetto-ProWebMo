import React from "react";
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
          <p>
            <i className="fas fa-envelope"></i>
            <a
              href="mailto:pippo@topolinia.disney.com "
              style={{ marginLeft: "5px" }}
            >
              pippo@topolinia.disney.com
            </a>
          </p>
          <p className="lead">Seguici su</p>
          <p>
            <a href="# ">
              <i
                className="fab fa-facebook-square"
                style={{ fontSize: "24px", color: "#3b5998" }}
              ></i>
            </a>
            <a href="# ">
              <i
                className="fab fa-twitter-square"
                style={{
                  fontSize: "24px",
                  color: "#1da1f2",
                  marginLeft: "5px",
                }}
              ></i>
            </a>
            <a href="# ">
              <i
                className="fab fa-instagram"
                style={{
                  fontSize: "24px",
                  color: "#e56969",
                  marginLeft: "5px",
                }}
              ></i>
            </a>
          </p>
        </Container>
        <Container className="col-sm-6 text-justify">
          <p className="lead">I nostri partner</p>
          <ListGroup>
            <ListGroup.Item>
              <img
                src="/images/ibm_icon_130909.png"
                width={"40px"}
                alt="Partner 1"
              />
              <h5>Partner 1</h5>
              <span className="text-info">Azienda specializzata in ...</span>
            </ListGroup.Item>
            <ListGroup.Item>
              <img
                src="/images/google_logo_icon.png"
                width={"40px"}
                alt="Partner 2"
              />
              <h5>Partner 2</h5>
              <span className="text-info">Leader nel settore ...</span>
            </ListGroup.Item>
            <ListGroup.Item>
              <img
                src="/images/intel_2120.png "
                width={"40px"}
                alt="Partner 3"
              />
              <h5>Partner 3</h5>
              <span className="text-info">Azienda leader ...</span>
            </ListGroup.Item>
          </ListGroup>
          <p className="font-italic mt-3" style={{ fontSize: "1.1rem" }}>
            &copy; Roberto Pirrone
          </p>
        </Container>
      </Row>
    </Container>
  );
}

export default Footer;
