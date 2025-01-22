import React from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Card,
  CardBody,
  ModalFooter,
} from "reactstrap";
import { formatDateLog } from "../../common/CommonFunctions/formateLogTime";
import SimpleBar from "simplebar-react";

const LoggedInSessionModal = ({
  modalLoginSession,
  loginSessionModalOpen,
  loginSessionList,
  deleteSession,
  token,
}) => {
  let ids = loginSessionList
    .filter((item) => item.token != token)
    .map((item) => item.id);

  return (
    <Modal isOpen={modalLoginSession} toggle={() => { loginSessionModalOpen(); }} className="modal-lg" id="staticBackdrop" centered >
      <SimpleBar style={{ maxHeight: 'calc(100vh - 150px)', overflowX: 'auto' }}>
        <ModalBody>
          <div className="">
            {loginSessionList.length > 0 ? (
              loginSessionList.map((session) => {
                let currentDevice = token == session.token;
                return (
                  <div className="card" key={session.id}>
                    <div className="card-body">
                      {!currentDevice && (
                        <div className="badge badge-soft-danger float-end cursor-pointer">
                          <span title="End Session" className="text-danger cursor-pointer"
                            onClick={() => deleteSession([session.id])} >
                            End Session
                          </span>
                        </div>
                      )}
                      <div className="d-flex">
                        <div className="avatar-sm flex-shrink-0">
                          <span className="avatar-title bg-info rounded-circle fs-2">
                            <i className="ri-windows-fill"></i>
                          </span>
                        </div>
                        <div className="ms-3 text-start">
                          <h5>{session.deviceName}</h5>
                          {currentDevice && (
                            <small className="text-primary mb-1 d-block">
                              CURRENT DEVICE
                            </small>
                          )}
                          <small className="d-block">
                            {formatDateLog(session.createdDate)}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No record found</p>
            )}

          </div>
        </ModalBody>
      </SimpleBar>
      <ModalFooter className="justify-content-center pt-3" >
        <div className="gap-2 hstack justify-content-center " >
          <Button type="button" className="btn w-sm btn-light" onClick={loginSessionModalOpen} >
            <i className="ri-close-line me-1 align-middle"></i> Close
          </Button>
          {loginSessionList.length > 1 && (
            <Button color="primary" type="button" className="btn w-sm btn-success" id="delete-record" onClick={() => deleteSession(ids)} >
              Logout from all devices/sessions
            </Button>
          )}
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default LoggedInSessionModal;
