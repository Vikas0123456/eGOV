import React, { useState, useEffect } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Form,
    Input,
    FormFeedback,
    ListGroup,
    ListGroupItem,
} from "reactstrap";
import { FaTrashAlt, FaSearch } from "react-icons/fa";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import SimpleBar from "simplebar-react";
const CreateGroupChat = ({
    isOpen,
    toggle,
    users,
    groupChatName,
    setGroupChatName,
    selectedUsersId,
    handleUserSelectForGroup,
    handleCreateGroupChat,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            setSearchTerm("");
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedUsers(
            users.filter((user) => selectedUsersId.includes(user.id))
        );
    }, [selectedUsersId, users]);

    const handleUserSelectToggle = (userId) => {
        const index = selectedUsers.findIndex((user) => user.id === userId);
        if (index === -1) {
            const userToAdd = users.find((user) => user.id === userId);
            setSelectedUsers([...selectedUsers, userToAdd]);
            handleUserSelectForGroup(userId);
        } else {
            Swal.fire({
                title: "Are you sure?",
                text: "Do you want to remove this user?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                confirmButtonText: "Yes, remove it!",
                cancelButtonText: "No, keep it",
            }).then((result) => {
                if (result.isConfirmed) {
                    setSelectedUsers(
                        selectedUsers.filter((user) => user.id !== userId)
                    );
                    handleUserSelectForGroup(userId);
                }
            });
        }
    };

    const validationSchema = Yup.object().shape({
        groupChatName: Yup.string()
            .required("Group Name is required")
            .min(3, "Group Name must be at least 3 characters"),
        selectedUsersId: Yup.array()
            .min(1, "At least one user must be selected")
            .required("At least one user must be selected"),
    });

    const formik = useFormik({
        initialValues: {
            groupChatName: groupChatName,
            selectedUsersId: selectedUsersId,
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            Swal.fire({
                title: "Are you sure?",
                text: "Do you want to create this group?",
                icon: "warning",
                showCancelButton: true,
                cancelButtonText: "No, Discard",
                confirmButtonText: "Yes, create it!",
            }).then((result) => {
                if (result.isConfirmed) {
                    handleCreateGroupChat();
                }
            });
        },
        enableReinitialize: true,
    });

    return (
        <Modal isOpen={isOpen} toggle={toggle}>
            <Form onSubmit={formik.handleSubmit}>
                <ModalHeader toggle={toggle}>Create Group Chat</ModalHeader>
                <ModalBody>
                    <SimpleBar
                        style={{
                            maxHeight: "calc(100vh - 350px)",
                            overflowX: "auto",
                        }}>
                        <div className="mx-3">
                            <div className="mt-3">
                                <Input
                                    type="text"
                                    name="groupChatName"
                                    placeholder="Group Name"
                                    value={formik.values.groupChatName}
                                    onChange={(e) => {
                                        formik.handleChange(e);
                                        setGroupChatName(e.target.value);
                                    }}
                                    onBlur={formik.handleBlur}
                                    invalid={
                                        formik.touched.groupChatName &&
                                        formik.errors.groupChatName
                                            ? true
                                            : false
                                    }
                                />
                                {formik.touched.groupChatName &&
                                formik.errors.groupChatName ? (
                                    <FormFeedback className="d-block">
                                        {formik.errors.groupChatName}
                                    </FormFeedback>
                                ) : null}
                            </div>
                            <div className="mt-3">
                                <Input
                                    type="text"
                                    placeholder="Search Users"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    style={{ borderRadius: "0.25rem" }}
                                />
                            </div>
                            {filteredUsers.length > 0 ? (
                                <ListGroup className="mt-3 ">
                                    {filteredUsers.map((user) => (
                                        <ListGroupItem
                                            className="bg-white text-black border-opacity-25 border-dark cursor-pointer"
                                            key={user.id}
                                            active={selectedUsers.some(
                                                (selUser) =>
                                                    selUser.id === user.id
                                            )}>
                                            <div
                                                className="d-flex align-items-center"
                                                onClick={() =>
                                                    handleUserSelectToggle(
                                                        user.id
                                                    )
                                                }>
                                                {selectedUsers.some(
                                                    (selUser) =>
                                                        selUser.id === user.id
                                                ) ? (
                                                    <FaTrashAlt className="me-2 text-danger cursor-pointer" />
                                                ) : (
                                                    <input
                                                        type="checkbox"
                                                        className="cursor-pointer"
                                                        checked={selectedUsers.some(
                                                            (selUser) =>
                                                                selUser.id ===
                                                                user.id
                                                        )}
                                                        style={{
                                                            marginRight: "10px",
                                                        }}
                                                    />
                                                )}
                                                <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                                                    <div className="avatar-xxs">
                                                        <img
                                                            src={
                                                                user?.imageData
                                                                    ?.documentPath
                                                            }
                                                            className="avatar-title rounded-circle bg-info userprofile"
                                                            alt={user.name}
                                                        />
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
                                <p className="mt-3">
                                    {" "}
                                    No Users in Your Department{" "}
                                </p>
                            )}
                        </div>
                    </SimpleBar>
                    {formik.touched.selectedUsersId &&
                    formik.errors.selectedUsersId ? (
                        <FormFeedback className="d-block ">
                            {formik.errors.selectedUsersId}
                        </FormFeedback>
                    ) : null}
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="secondary"
                        onClick={() => {
                            formik.resetForm();
                            formik.setErrors(null);
                            toggle();
                        }}>
                        Cancel
                    </Button>
                    <Button color="primary" type="submit">
                        Create Group
                    </Button>
                </ModalFooter>
            </Form>
        </Modal>
    );
};

export default CreateGroupChat;
