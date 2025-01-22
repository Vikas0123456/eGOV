import React from "react";
import { Container, Row, Col, Table, Card, CardHeader } from "reactstrap";

const CredentialDetails = () => {
    const users = [
        {
            department: "Core User",
            username: "Luis Henderson",
            email: "v1.netclues@gmail.com",
            password: "S@123456",
        },
        {
            department: "Registrar General's Department",
            username: "Kenneth Martin (Department Admin)",
            email: "v2.netclues@gmail.com",
            password: "S@123456",
        },
        {
            department: "Registrar General's Department",
            username: "Ivan Mccoy (Department Agent)",
            email: "v6.netclues@gmail.com",
            password: "S@123456",
        },
        {
            department: "Royal bahamas Police",
            username: "Vivien Bridges (Department Admin)",
            email: "v4.netclues@gmail.com",
            password: "S@123456",
        },
        {
            department: "Royal bahamas Police",
            username: "Charles Rodriguez (Department Agent)",
            email: "v5.netclues@gmail.com",
            password: "S@123456",
        },
        {
            department: "Department of Inland Revenue",
            username: "Duane lio (Department Admin)",
            email: "testbynetclues@gmail.com",
            password: "S@123456",
        },
        {
            department: "Department of Inland Revenue",
            username: "Brandon Cooper (Department Agent)",
            email: "v3.netclues@gmail.com",
            password: "S@123456",
        },
    ];

    const CustomerUsers = [
        {
            username: "Jordan Williamson",
            email: "demo1.netclues@gmail.com",
            password: "S@123456",
        },
        {
            username: "Chris Starc",
            email: "demo2.netclues@gmail.com",
            password: "S@123456",
        },
    ];

    const Links = [
        {
            name: "Admin",
            link: "https://egov.adminportal.netcluesdemo.com"
        },
        {
            name: "Customer",
            link: "https://egov.customerportal.netcluesdemo.com"
        }
    ]

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert(`Copied: ${text}`);
    };

    return (
        <Container className="page-content">
            <Row className="align-items-center">
                <Col xs="12">
                    <div className="text-center mb-4">
                        <a
                            href="https://egov.adminportal.netcluesdemo.com"
                            target="_blank"
                            title="Netclues">
                            <img
                                src="https://egov.api.netcluesdemo.com/document/documentFile-1732861710999.png"
                                alt="Netclues"
                                width="150"
                            />
                        </a>
                    </div>
                    <Card className="mt-5">
                        <Table striped>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Website</th>
                                    <th>Link</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Links.map((link, index) => (
                                    <tr key={index}>
                                        <td>
                                            <h5>{index + 1}.</h5>
                                        </td>
                                        <td>{link.name}</td>
                                        <td>
                                            <span className="me-2">
                                                {link.link}
                                            </span>
                                            <span
                                                className="cursor-pointer me-2"
                                                onClick={() =>
                                                    copyToClipboard(link.link)
                                                }>
                                                <svg
                                                    stroke="currentColor"
                                                    fill="currentColor"
                                                    stroke-width="0"
                                                    viewBox="0 0 448 512"
                                                    color="#f99f1e"
                                                    height="1em"
                                                    width="1em"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M433.941 65.941l-51.882-51.882A48 48 0 0 0 348.118 0H176c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48v-48h80c26.51 0 48-21.49 48-48V99.882a48 48 0 0 0-14.059-33.941zM266 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h74v224c0 26.51 21.49 48 48 48h96v42a6 6 0 0 1-6 6zm128-96H182a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h106v88c0 13.255 10.745 24 24 24h88v202a6 6 0 0 1-6 6zm6-256h-64V48h9.632c1.591 0 3.117.632 4.243 1.757l48.368 48.368a6 6 0 0 1 1.757 4.243V112z"></path>
                                                </svg>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                    <Card className="mt-5">
                        <CardHeader className="text-center">
                            <h4>Admin</h4>
                        </CardHeader>
                        <Table striped>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Department</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Password</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={index}>
                                        <td>
                                            <h5>{index + 1}.</h5>
                                        </td>
                                        <td>{user.department}</td>
                                        <td>{user.username}</td>
                                        <td>
                                            <span className="me-2">
                                                {user.email}
                                            </span>
                                            <span
                                                className="cursor-pointer me-2"
                                                onClick={() =>
                                                    copyToClipboard(user.email)
                                                }>
                                                <svg
                                                    stroke="currentColor"
                                                    fill="currentColor"
                                                    stroke-width="0"
                                                    viewBox="0 0 448 512"
                                                    color="#f99f1e"
                                                    height="1em"
                                                    width="1em"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M433.941 65.941l-51.882-51.882A48 48 0 0 0 348.118 0H176c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48v-48h80c26.51 0 48-21.49 48-48V99.882a48 48 0 0 0-14.059-33.941zM266 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h74v224c0 26.51 21.49 48 48 48h96v42a6 6 0 0 1-6 6zm128-96H182a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h106v88c0 13.255 10.745 24 24 24h88v202a6 6 0 0 1-6 6zm6-256h-64V48h9.632c1.591 0 3.117.632 4.243 1.757l48.368 48.368a6 6 0 0 1 1.757 4.243V112z"></path>
                                                </svg>
                                            </span>
                                        </td>
                                        <td>
                                            <span className="me-2">
                                                {user.password}
                                            </span>
                                            <span
                                                className="cursor-pointer me-2"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        user.password
                                                    )
                                                }>
                                                <svg
                                                    stroke="currentColor"
                                                    fill="currentColor"
                                                    stroke-width="0"
                                                    viewBox="0 0 448 512"
                                                    color="#f99f1e"
                                                    height="1em"
                                                    width="1em"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M433.941 65.941l-51.882-51.882A48 48 0 0 0 348.118 0H176c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48v-48h80c26.51 0 48-21.49 48-48V99.882a48 48 0 0 0-14.059-33.941zM266 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h74v224c0 26.51 21.49 48 48 48h96v42a6 6 0 0 1-6 6zm128-96H182a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h106v88c0 13.255 10.745 24 24 24h88v202a6 6 0 0 1-6 6zm6-256h-64V48h9.632c1.591 0 3.117.632 4.243 1.757l48.368 48.368a6 6 0 0 1 1.757 4.243V112z"></path>
                                                </svg>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                    <Card className="mt-5">
                        <CardHeader className="text-center">
                            <h4>Customer</h4>
                        </CardHeader>
                        <Table striped>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Password</th>
                                </tr>
                            </thead>
                            <tbody>
                                {CustomerUsers.map((user, index) => (
                                    <tr key={index}>
                                        <td>
                                        <h5>{index + 1}.</h5>
                                        </td>
                                        <td>{user.username}</td>
                                        <td>
                                            <span className="me-2">
                                                {user.email}
                                            </span>
                                            <span
                                                className="cursor-pointer me-2"
                                                onClick={() =>
                                                    copyToClipboard(user.email)
                                                }>
                                                <svg
                                                    stroke="currentColor"
                                                    fill="currentColor"
                                                    stroke-width="0"
                                                    viewBox="0 0 448 512"
                                                    color="#f99f1e"
                                                    height="1em"
                                                    width="1em"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M433.941 65.941l-51.882-51.882A48 48 0 0 0 348.118 0H176c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48v-48h80c26.51 0 48-21.49 48-48V99.882a48 48 0 0 0-14.059-33.941zM266 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h74v224c0 26.51 21.49 48 48 48h96v42a6 6 0 0 1-6 6zm128-96H182a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h106v88c0 13.255 10.745 24 24 24h88v202a6 6 0 0 1-6 6zm6-256h-64V48h9.632c1.591 0 3.117.632 4.243 1.757l48.368 48.368a6 6 0 0 1 1.757 4.243V112z"></path>
                                                </svg>
                                            </span>
                                        </td>
                                        <td>
                                            <span className="me-2">
                                                {user.password}
                                            </span>
                                            <span
                                                className="cursor-pointer me-2"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        user.password
                                                    )
                                                }>
                                                <svg
                                                    stroke="currentColor"
                                                    fill="currentColor"
                                                    stroke-width="0"
                                                    viewBox="0 0 448 512"
                                                    color="#f99f1e"
                                                    height="1em"
                                                    width="1em"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M433.941 65.941l-51.882-51.882A48 48 0 0 0 348.118 0H176c-26.51 0-48 21.49-48 48v48H48c-26.51 0-48 21.49-48 48v320c0 26.51 21.49 48 48 48h224c26.51 0 48-21.49 48-48v-48h80c26.51 0 48-21.49 48-48V99.882a48 48 0 0 0-14.059-33.941zM266 464H54a6 6 0 0 1-6-6V150a6 6 0 0 1 6-6h74v224c0 26.51 21.49 48 48 48h96v42a6 6 0 0 1-6 6zm128-96H182a6 6 0 0 1-6-6V54a6 6 0 0 1 6-6h106v88c0 13.255 10.745 24 24 24h88v202a6 6 0 0 1-6 6zm6-256h-64V48h9.632c1.591 0 3.117.632 4.243 1.757l48.368 48.368a6 6 0 0 1 1.757 4.243V112z"></path>
                                                </svg>
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CredentialDetails;
