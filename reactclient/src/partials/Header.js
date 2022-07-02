import React from "react";
import { Carousel, Container } from "react-bootstrap";

function Header() {
  return (
    <Container fluid className="p-0">
      <Carousel
        slide
        fade
        className="d-none d-none d-sm-block"
        pause={false}
        interval={2000}
        controls={false}
        indicators={false}
        variant="dark"
      >
        <Carousel.Item>
          <img src="/images/logo-unipa-rainbow2.png" alt="UnipaLogo" />
          <Carousel.Caption>
            <h1>Portale Studenti Unipa</h1>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
      <Container className="d-block d-sm-none bg-white text-white text-center w-100">
        <img src="/images/logo-unipa-rainbow2.png" alt="UnipaLogo" />
      </Container>
    </Container>
  );
}

export default Header;
