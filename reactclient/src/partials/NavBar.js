import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";

import StudentNavBar from "../student/StudentNavBar";
import ProfessorNavBar from "../professor/ProfessorNavBar";
import AdminNavBar from "../admin/AdminNavBar";

function NavBar({ auth, setAuth }) {
  const navigate = useNavigate();

  // funzione di logout che annulla il token
  const logout = () => {
    fetch("http://192.168.1.16:9000/users/logout", {
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
          document.cookie =
            "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure=true;";
          setAuth(null);
          navigate({
            pathname: "/",
          });
        }
      });
  };

  // la navbar crea un menù diverso che dipende dal tipo di utente
  // se non si è autenticati invece c'è il pulsante accedi
  return (
    <Navbar bg="dark" variant="dark">
      <Container fluid>
        <Nav className="ml-auto">
          {auth?.nomeutente ? (
            <>
              <Navbar.Brand as={NavDropdown} title={auth?.nomeutente}>
                <NavDropdown.Item as={Link} to="/profile">
                  Profilo
                </NavDropdown.Item>
                {auth?.isStudent ? <StudentNavBar auth={auth} /> : <></>}
                {auth?.isProfessor ? <ProfessorNavBar auth={auth} /> : <></>}
                {auth?.isAdmin ? <AdminNavBar auth={auth} /> : <></>}
                <NavDropdown.Item as={Link} to="/">
                  Home
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout}>Esci</NavDropdown.Item>
              </Navbar.Brand>
            </>
          ) : (
            <Navbar.Brand as={Link} to="/accedi">
              Accedi
            </Navbar.Brand>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default NavBar;
