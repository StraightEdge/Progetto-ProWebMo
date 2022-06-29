import React from "react";
import { Link } from "react-router-dom";
import { NavDropdown } from "react-bootstrap";

function AdminNavBar() {
  // menu della navbar con le funzioni dell'admin
  return (
    <>
      <NavDropdown.Item as={Link} to="/admin/addProfessor">
        Aggiungi Docente
      </NavDropdown.Item>
      <NavDropdown.Item as={Link} to="/admin/addTeaching">
        Aggiungi Insegnamento
      </NavDropdown.Item>
      <NavDropdown.Item as={Link} to="/admin/addCdS">
        Crea Corso di Studi
      </NavDropdown.Item>
      <NavDropdown.Item as={Link} to="/admin/editCdS">
        Modifica Corso di Studi
      </NavDropdown.Item>
      <NavDropdown.Item as={Link} to="/admin/validateTax">
        Convalida Tasse Studenti
      </NavDropdown.Item>
    </>
  );
}
export default AdminNavBar;
