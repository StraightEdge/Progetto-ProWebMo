import React from "react";
import { Button, ButtonGroup, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <Container>
      <h1 className="display-1">Home Page</h1>
      <Row>
        <Container className="col-sm-6 text-justify">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
          dictum libero eu purus gravida, at suscipit enim dictum. Donec id
          ligula a urna maximus congue ac eu libero. Ut imperdiet a lacus nec
          aliquet. Nullam vitae ante sit amet felis auctor gravida egestas sit
          amet ante. Fusce et leo sapien. Sed tristique non mi non rutrum.
          Nullam venenatis elit vulputate leo faucibus consequat. Pellentesque
          congue eleifend est at suscipit. Quisque ex eros, euismod quis massa
          sit amet, ultrices laoreet lacus. Nam scelerisque cursus sapien, eget
          convallis tellus tincidunt id. Quisque tortor magna, volutpat in est
          at, venenatis vulputate lacus. Cras suscipit quis nisl at luctus.
          Donec dignissim in dui mattis dapibus. Interdum et malesuada fames ac
          ante ipsum primis in faucibus. Nam facilisis, odio sed imperdiet
          fringilla, mauris risus eleifend erat, elementum fringilla lacus magna
          sit amet ligula. Phasellus aliquam nibh non sem porttitor
          pellentesque. Nullam nec ipsum condimentum, dapibus ipsum eu, ultrices
          tortor. Donec a mattis ex, in suscipit est. Phasellus pellentesque
          arcu at ipsum porta luctus non sit amet nibh. Donec commodo urna ac
          erat pellentesque porttitor. Ut iaculis nisi nec aliquam dignissim.
          Morbi luctus tellus eu ultricies accumsan. Aliquam sit amet vulputate
          augue, et pellentesque diam. Suspendisse egestas pharetra arcu et
          vulputate. Curabitur rutrum pulvinar neque, et condimentum sapien
          faucibus sed.
        </Container>
        <Container className="col-sm-6 text-justify">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
          dictum libero eu purus gravida, at suscipit enim dictum. Donec id
          ligula a urna maximus congue ac eu libero. Ut imperdiet a lacus nec
          aliquet. Nullam vitae ante sit amet felis auctor gravida egestas sit
          amet ante. Fusce et leo sapien. Sed tristique non mi non rutrum.
          Nullam venenatis elit vulputate leo faucibus consequat. Pellentesque
          congue eleifend est at suscipit. Quisque ex eros, euismod quis massa
          sit amet, ultrices laoreet lacus. Nam scelerisque cursus sapien, eget
          convallis tellus tincidunt id. Quisque tortor magna, volutpat in est
          at, venenatis vulputate lacus. Cras suscipit quis nisl at luctus.
          Donec dignissim in dui mattis dapibus. Interdum et malesuada fames ac
          ante ipsum primis in faucibus. Nam facilisis, odio sed imperdiet
          fringilla, mauris risus eleifend erat, elementum fringilla lacus magna
          sit amet ligula. Phasellus aliquam nibh non sem porttitor
          pellentesque. Nullam nec ipsum condimentum, dapibus ipsum eu, ultrices
          tortor. Donec a mattis ex, in suscipit est. Phasellus pellentesque
          arcu at ipsum porta luctus non sit amet nibh. Donec commodo urna ac
          erat pellentesque porttitor. Ut iaculis nisi nec aliquam dignissim.
          Morbi luctus tellus eu ultricies accumsan. Aliquam sit amet vulputate
          augue, et pellentesque diam. Suspendisse egestas pharetra arcu et
          vulputate. Curabitur rutrum pulvinar neque, et condimentum sapien
          faucibus sed.
        </Container>
      </Row>
      <Container fluid className="text-center">
        <ButtonGroup>
          <Link to="/accedi">
            <Button>Accedi</Button>
          </Link>
          <Link to="/registrati">
            <Button>Registrati</Button>
          </Link>
        </ButtonGroup>
      </Container>
    </Container>
  );
}

export default HomePage;
