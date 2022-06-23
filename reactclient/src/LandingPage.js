import React from "react";
import { Link, useLocation } from "react-router-dom";

function LandingPage() {
  const location = useLocation();

  // se il server risponde correttamente visualizzo una pagina
  // di successo con un link al profilo
  return (
    <div>
      <h1 className="display-4 text-success">{location.state.message}</h1>
      <br />
      <br />
      <Link to="/profile" className="display-6 text-info">
        Profilo
      </Link>
    </div>
  );
}

export default LandingPage;
