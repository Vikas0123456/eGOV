import React, { useState, useEffect } from "react";
import SimpleBar from "simplebar-react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    ListGroup,
    ListGroupItem,
} from "reactstrap";

const CreatePersonalChat = ({
    isOpen,
    toggle,
    users,
    handleCreateOneOnOneChat,
}) => {
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (isOpen) {
            setSearchTerm("");
        }
    }, [isOpen]);

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <ModalHeader toggle={toggle}>Start Personal Chat</ModalHeader>
            <ModalBody>
                {/* {filteredUsers.length === 0 && (
                    <p> No Users in Your Department </p>
                )} */}
                <SimpleBar style={{ maxHeight: "calc(100vh - 350px)", overflowX: "auto", }} >
                    <div className="mx-3">
                        <>
                            <Input type="text" placeholder="Search Users" className="mt-3" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            {filteredUsers.length > 0 ? (
                                <ListGroup className="mt-3"> {filteredUsers.map((user) => (
                                    <ListGroupItem key={user.id} onClick={() => handleCreateOneOnOneChat(user.id)} className="cursor-pointer" >
                                        <div className="d-flex align-items-center">
                                            <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                                                <div className="avatar-xxs">
                                                    <img src={user?.imageData?.documentPath} className="avatar-title rounded-circle bg-info userprofile" alt={user.name} />
                                                </div>
                                            </div>
                                            <div className="flex-grow-1 overflow-hidden">
                                                <p className="text-truncate mb-0">
                                                    {user?.name}
                                                </p>
                                            </div>
                                        </div>
                                    </ListGroupItem>
                                ))}
                                </ListGroup>

                            ) : (
                                <p className="mt-3"> No Users in Your Department </p>
                            )}
                        </>
                    </div>
                </SimpleBar>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}> Cancel </Button>
            </ModalFooter>
        </Modal>
    );
};

export default CreatePersonalChat;
