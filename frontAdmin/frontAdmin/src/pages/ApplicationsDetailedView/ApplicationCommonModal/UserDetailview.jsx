import React from 'react';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup, Label, Input, Row, Col } from 'reactstrap';

const UserDetailModalView = ({ isOpen, toggle,data }) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>{data?.firstName}{" "}{data?.middleName}{" "}{data?.lastName}</ModalHeader>
      <ModalBody>
        <Form>
          <Row>
            <Col lg="6">
              <FormGroup>
                <Label for="firstnameInput">First Name</Label>
                <Input type="text" id="firstnameInput" placeholder="Enter your firstname" disabled value={data?.firstName} />
              </FormGroup>
            </Col>
            <Col lg="6">
              <FormGroup>
                <Label for="lastnameInput">Last Name</Label>
                <Input type="text" id="lastnameInput" placeholder="Enter your lastname" disabled value={data?.lastName} />
              </FormGroup>
            </Col>
            <Col lg="6">
              <FormGroup>
                <Label for="phonenumberInput">Phone Number</Label>
                <Input type="text" id="phonenumberInput" placeholder="Enter your phone number" disabled value={data?.mobileNumber} />
              </FormGroup>
            </Col>
            <Col lg="6">
              <FormGroup>
                <Label for="emailInput">Email Address</Label>
                <Input type="email" id="emailInput" placeholder="Enter your email" disabled value={data?.email} />
              </FormGroup>
            </Col>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default UserDetailModalView;