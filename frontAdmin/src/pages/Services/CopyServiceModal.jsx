import React from "react";
import copyImage from "../../assets/images/copy-02.gif";
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Spinner,
} from "reactstrap";

const CopyServiceModal = ({
    show,
    toggleShow,
    data,
    copyService,
    copyServiceLoading,
}) => {
    return (
        <Modal isOpen={show} toggle={toggleShow} centered>
            {/* <ModalHeader toggle={toggleShow}></ModalHeader> */}
            <ModalBody className=" ">
                <div className=" text-center ">
                    <div>
                    <img src={ data ?.customerInfo ?.imageData ?.documentPath || copyImage } alt="" className="w-25 m-auto" />
                        <h5 className="mx-lg-5 mt-3">
                            A Duplicate service of{" "} <strong>{data?.serviceName}</strong> will be created.
                        </h5>
                    </div>
                </div>
            </ModalBody>
            <ModalFooter className="flex justify-content-center">
                <Button className="mb-3"
                    disabled={copyServiceLoading}
                    color="success"
                    type="button"
                    onClick={copyService}>
                    
                    Duplicate
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default CopyServiceModal;
