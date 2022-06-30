import React from "react";
import { Link } from "react-router-dom";
import { NavDropdown } from "react-bootstrap";

function StudentNavBar({ auth }) {
  // menu della navbar con le funzioni dello studente
  // se l'utente è già iscritto ad un cds non può
  // iscriversi ad un altro cds
  return !auth?.data.cds ? (
    <>
      <NavDropdown.Item disabled>Carriera Studente</NavDropdown.Item>
      <NavDropdown.Item as={Link} to="/students/signCds" auth={auth}>
        Iscrizione Corso di Studi
      </NavDropdown.Item>
      <NavDropdown.Item disabled>Sottoscrizione Esami</NavDropdown.Item>
      <NavDropdown.Item as={Link} to="/students/payTaxes" auth={auth}>
        Pagamento Tasse
      </NavDropdown.Item>
    </>
  ) : (
    <>
      <NavDropdown.Item as={Link} to="/students/myCarreer" auth={auth}>
        Carriera Studente
      </NavDropdown.Item>
      <NavDropdown.Item disabled>Iscrizione Corso di Studi</NavDropdown.Item>
      <NavDropdown.Item as={Link} to="/students/gradeExam" auth={auth}>
        Sottoscrizione Esami
      </NavDropdown.Item>
      <NavDropdown.Item as={Link} to="/students/payTaxes" auth={auth}>
        Pagamento Tasse
      </NavDropdown.Item>
    </>
  );
}
export default StudentNavBar;
