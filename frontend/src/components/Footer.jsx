import { Col, Container, Row } from "react-bootstrap";

function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-dark text-white">
      <Container>
        <Row>
          <Col className="text-center py-3">
            <p>Foysal Store &copy; {currentYear}</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
