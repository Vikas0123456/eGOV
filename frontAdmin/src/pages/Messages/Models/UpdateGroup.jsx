import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  ListGroup,
  ListGroupItem,
  Form,
  FormFeedback,
} from "reactstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { FaTrashAlt } from "react-icons/fa";

const UpdateGroup = ({
  isOpen,
  toggle,
  users,
  groupChatName,
  setGroupChatName,
  selectedUsersId,
  handleUserSelectForGroup,
  updateChatSubmit,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (selectedUsers) {
      setSelectedUsers(
        users.filter((user) => selectedUsersId.includes(user.id))
      );
    }
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
        confirmButtonColor: "#d33",
        showCancelButton: true,
        confirmButtonText: "Yes, remove it!",
        cancelButtonText: "No, keep it",
      }).then((result) => {
        if (result.isConfirmed) {
          setSelectedUsers(selectedUsers.filter((user) => user.id !== userId));
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
        text: "Do you want to update this group?",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: "No, Discard",
        confirmButtonText: "Yes, update it!",
      }).then((result) => {
        if (result.isConfirmed) {
          updateChatSubmit();
        }
      });
    },
    enableReinitialize: true,
  });

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <Form onSubmit={formik.handleSubmit}>
        <ModalHeader toggle={toggle}>Edit Group</ModalHeader>
        <ModalBody>
          <Input type="text" name="groupChatName" placeholder="Group Name"
            value={formik.values.groupChatName}
            onChange={(e) => { formik.handleChange(e); setGroupChatName(e.target.value); }}
            onBlur={formik.handleBlur}
            invalid={formik.touched.groupChatName && formik.errors.groupChatName ? true : false}
          />
          {formik.touched.groupChatName && formik.errors.groupChatName ? (
            <FormFeedback>{formik.errors.groupChatName}</FormFeedback>
          ) : null}
          <Input type="text" placeholder="Search Users" className="mt-3" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <ListGroup className="mt-3">
            {filteredUsers.map((user) => (
              <ListGroupItem className="cursor-pointer text-black" key={user.id} active={selectedUsers.some((selUser) => selUser.id === user.id)}
                style={{ backgroundColor: selectedUsers.some((selUser) => selUser.id === user.id) ? "#f8f9fa" : "white", }}>
                <div className="d-flex align-items-center">
                  {selectedUsers.some((selUser) => selUser.id === user.id) ? (
                    <FaTrashAlt className="me-2 text-danger cursor-pointer" onClick={() => handleUserSelectToggle(user.id)} />
                  ) : (
                    <input type="checkbox"
                      checked={selectedUsers.some((selUser) => selUser.id === user.id)}
                      onChange={() => handleUserSelectToggle(user.id)}
                      style={{ marginRight: "10px" }}
                    />
                  )}
                  <div className="flex-shrink-0 chat-user-img online align-self-center me-2 ms-0">
                    <div className="avatar-xxs">
                      <img src={user?.imageData?.documentPath} className="rounded-circle img-fluid userprofile" alt={user.name} />
                    </div>
                  </div>
                  <div className="flex-grow-1 overflow-hidden">
                    <p className="text-truncate mb-0">{user?.name}</p>
                  </div>
                </div>
              </ListGroupItem>
            ))}
          </ListGroup>
          {formik.touched.selectedUsersId && formik.errors.selectedUsersId ? (
            <FormFeedback className="d-block">
              {formik.errors.selectedUsersId}
            </FormFeedback>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggle}>
            Cancel
          </Button>
          <Button color="primary" type="submit">
            Edit Group
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default UpdateGroup;
