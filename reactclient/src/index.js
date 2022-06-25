import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./partials/Header";
import NavBar from "./partials/NavBar";
import Footer from "./partials/Footer";

import HomePage from "./HomePage";
import LoginPage from "./LoginPage";
import RegistrationPage from "./RegistrationPage";
import ErrorPage from "./ErrorPage";
import ProfilePage from "./ProfilePage";
import LandingPage from "./LandingPage";
import SignCdSPage from "./student/SignCdSPage";
import MyCarreerPage from "./student/MyCarreerPage";
import MyTeachingsPage from "./professor/MyTeachingsPage";
import AddProfessorPage from "./admin/AddProfessorPage";
import AddTeachingPage from "./admin/AddTeachingPage";
import AddCdSPage from "./admin/AddCdSPage";
import EditCdSPage from "./admin/EditCdSPage";

import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [auth, setAuth] = useState();

  // recupero il profilo e lo salvo in Auth per autenticare l'utente
  useEffect(() => {
    function fetchData() {
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
            setAuth(res.token);
          } else {
            setAuth(null);
          }
        });
    }
    fetchData();
  }, []);

  return (
    <div>
      <Header />
      <NavBar auth={auth} setAuth={setAuth} />

      {/* Con routes renderizzo una sezione diversa nella zona centrale
       senza renderizzare tutta la pagina */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/accedi"
          element={<LoginPage auth={auth} setAuth={setAuth} />}
        />
        <Route
          path="/registrati"
          element={<RegistrationPage auth={auth} setAuth={setAuth} />}
        />
        <Route
          path="/profile"
          element={<ProfilePage auth={auth} setAuth={setAuth} />}
        />
        <Route
          path="/students/signCds"
          element={<SignCdSPage auth={auth} setAuth={setAuth} />}
        />
        <Route
          path="/students/myCarreer"
          element={<MyCarreerPage auth={auth} setAuth={setAuth} />}
        />
        <Route
          path="/professors/myTeachings"
          element={<MyTeachingsPage auth={auth} setAuth={setAuth} />}
        />
        <Route
          path="/admin/addProfessor"
          element={<AddProfessorPage auth={auth} />}
        />
        <Route
          path="/admin/addTeaching"
          element={<AddTeachingPage auth={auth} />}
        />
        <Route path="/admin/addCdS" element={<AddCdSPage auth={auth} />} />
        <Route path="/admin/editCdS" element={<EditCdSPage auth={auth} />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
