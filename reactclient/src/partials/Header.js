import React from "react";
import { Link } from "react-router-dom";

import { Carousel, Container } from "react-bootstrap";

function Header() {
  return (
    <Container fluid className="p-0">
      <Carousel
        slide
        fade
        className="d-none d-sm-block"
        pause={false}
        interval={2000}
        controls={false}
        indicators={false}
        variant="dark"
        as={Link}
        to={"/"}
      >
        <Carousel.Item>
          <img src="/images/logo-unipa.png" alt="UnipaLogo" />
          <Carousel.Caption>
            <h1>Portale Studenti Unipa</h1>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
      <Container className="d-block d-sm-none bg-white text-white text-center w-100">
        <img src="/images/logo-unipa.png" alt="UnipaLogo" />
      </Container>
    </Container>
  );
}

export default Header;
