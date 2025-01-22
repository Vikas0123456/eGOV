import React from "react";
import { Col, Container, Row } from "reactstrap";
import NetcluesLogo from "../assets/images/netclues.gif";
import FooterLogo from "../assets/images/footer-logo.jpg";

const Footer = () => {
  return (
    <React.Fragment>
      <footer className="footer">
        <Container fluid>
          <Row>
            <Col sm={6} className="text-center text-sm-start">
              {new Date().getFullYear()} © eGOV by Netclues.
              <a
                href="https://www.netclues.ky/"
                title="Netclues!"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', verticalAlign: 'middle' }}
              >
                <img
                  className="ms-2"
                  src={NetcluesLogo}
                  alt="netclues"
                  style={{ height: 24 }}
                />
              </a>
            </Col>
            {/* <Col sm={6}>
              <div className="text-sm-end d-none d-sm-block">
              <img
                className="ms-2"
                src={FooterLogo}
                alt="Netclues"
                height="24"
              />
              </div>
            </Col> */}
          </Row>
        </Container>
      </footer>
    </React.Fragment>
  );
};

export default Footer;
