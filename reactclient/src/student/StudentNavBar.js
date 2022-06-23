import React from "react";
import { Link } from "react-router-dom";
import { NavDropdown } from "react-bootstrap";

function StudentNavBar({ auth }) {
  // menu della navbar con le funzioni dell'admin
  // se l'utente è già iscritto ad un cds non può
  // iscriversi ad un altro cds
  return !auth?.data.cds ? (
    <NavDropdown.Item as={Link} to="/students/signCds" auth={auth}>
      Iscrizione Corso di Studi
    </NavDropdown.Item>
  ) : (
    <NavDropdown.Item disabled>Iscrizione Corso di Studi</NavDropdown.Item>
  );
}
export default StudentNavBar;
