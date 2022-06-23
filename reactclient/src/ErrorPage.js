import React from "react";
import { Link, useLocation } from "react-router-dom";

function ErrorPage() {
  const location = useLocation();

  // stampo l'errore ricevuto dal server
  return (
    <div>
      <h1 className="display-4">Hmm ... sembra che qualcosa non va</h1>
      <br />
      {location.state.status ? (
        <h1 className="display-6">
          HTTP Error: {location.state.status}
          <br />
          {location.state.message}
        </h1>
      ) : (
        <h1 className="display-6">{location.state.message}</h1>
      )}
      <br />
      <br />

      <Link to="/" className="text-info">
        Home Page
      </Link>
    </div>
  );
}

export default ErrorPage;
