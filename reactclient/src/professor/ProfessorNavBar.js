import React from "react";
import { Link } from "react-router-dom";
import { NavDropdown } from "react-bootstrap";

function ProfessorNavBar() {
  // menu della navbar con le funzioni dell'admin
  return (
    <>
      <NavDropdown.Item as={Link} to="/professors/myTeachings">
        Miei Insegnamenti
      </NavDropdown.Item>
    </>
  );
}
export default ProfessorNavBar;
