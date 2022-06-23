import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Container, Table } from "react-bootstrap";

function ProfilePage({ auth, setAuth }) {
  const [user, setUser] = useState(null);
  const [tipo, setTipo] = useState(false);
  const [data, setData] = useState({});
  const [errMessage, setErrMessage] = useState();
  const navigate = useNavigate();

  // controllo che il token sia valido
  useEffect(() => {
    async function fetchData() {
      fetch("http://192.168.1.16:9000/users/profile", {
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
            setUser(res.token.nomeutente);
            if (res.token.isStudent) {
              setTipo("Studente");
            } else if (res.token.isTeacher) {
              setTipo("Docente");
            } else {
              setTipo("Admin");
            }
            setData(res.token.data);
          } else {
            setErrMessage(res.message);
          }
        });
    }
    fetchData();
  }, []);

  // funzione di logout che annulla il token e reindirizza alla home
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

  // se non sono autenticato visualizzo l'errore con un link
  // alla pagina di login
  if (!auth) {
    return (
      <Container>
        <p className="lead text-uppercase mt-3">{errMessage}</p>
        <Link to="/accedi">
          <Button variant="info">&nbsp;Accedi&nbsp;</Button>
        </Link>
      </Container>
    );
  } else {
    // popolo la tabella con i dati che ricevo dal server
    return (
      <Container>
        <Table style={{ width: "auto" }} striped hover responsive>
          <thead>
            <tr>
              <th>Utente:</th>
              <th>{user}</th>
            </tr>
            <tr>
              <th>Tipo account:</th>
              <th>{tipo}</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(data).map((element) => {
              return (
                <tr key={element}>
                  {element === "luogo_nascita" ? (
                    <td>Luogo di Nascita</td>
                  ) : element === "data_nascita" ? (
                    <td>Data di Nascita</td>
                  ) : (
                    <td>{element[0].toUpperCase() + element.slice(1)}</td>
                  )}
                  {element === "data_nascita" ? (
                    <td>{new Date(data[element]).toLocaleDateString()}</td>
                  ) : (
                    <td>{data[element]}</td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </Table>
        <Button variant="info" onClick={logout}>
          Logout
        </Button>
      </Container>
    );
  }
}

export default ProfilePage;
