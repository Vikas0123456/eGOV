import React, { useEffect, useState } from "react";
import { Button, Spinner, Tooltip, OverlayTrigger, Card, Tab, Nav } from "react-bootstrap";
import CKEditorModel from "../../common/CKEditor/CKEditor";
import { useNavigate, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { IoChevronBack } from "react-icons/io5";
import CustomButtons from "./CustomButtons";
import ScrollToTop from "../../common/ScrollToTop/ScrollToTop";
import Select from "react-select";
import SimpleBar from "simplebar-react";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import useAxios from "../../utils/hook/useAxios";

const KnowledgeBaseModal = () => {
    const axiosInstance = useAxios()
    const location = useLocation();
    const knowledgeBaseData = location?.state;
    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const navigate = useNavigate();
    const [selectedDept, setSelectedDept] = useState(0);
    const [departmentList, setDepartmentList] = useState([]);
    const [loading, setLoading] = useState(false);

    const tooltipText = (
        <Tooltip id="tooltip">
            Public articles will be publicly available in your public
            knowledgebase URL.
            <br />
            <br />
            Private articles are only accessible by your team.
        </Tooltip>
    );

    const handleClose = () => {
        navigate("/knowledge-base");
    };

    const listOfDepartments = async () => {
        try {
            const response = await axiosInstance.post(
                `serviceManagement/department/view`,
                {}
            );
            if (response?.data) {
                const { rows } = response?.data?.data;
                setDepartmentList(rows);
            }
        } catch (error) {
            console.error("No results found for the given search query.");
        }
    };

    useEffect(() => {
        listOfDepartments();
    }, []);

    const addKnowledgeBase = async (values) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post(
                `userService/knowledgebase/create`,
                {
                    ...values,
                }
            );
            if (response) {
                toast.success("KnowledgeBase added successfully.");
                handleClose();
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            console.error(
                error,
                "Something went wrong while add new KnowledgeBase"
            );
        }
    };

    const updateKnowledgeBase = async (values) => {
        try {
            const knowledgebaseId = knowledgeBaseData.id;
            setLoading(true);
            const response = await axiosInstance.put(
                `userService/knowledgebase/update`,
                {
                    knowledgebaseId: knowledgebaseId,
                    ...values,
                }
            );
            if (response?.data) {
                toast.success("KnowledgeBase updated successfully.");
                handleClose();
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            toast.error("No changes were made.");
            console.error("Something went wrong while update KnowledgeBase");
        }
    };

    const validationSchema = Yup.object().shape({
        title: Yup.string()
            .min(5, "Please enter title 5 charcter long")
            .required("Please enter title"),
        slug: Yup.string().required("Please enter slug"),
        departmentId: Yup.number(),
        authors: Yup.string().required("Please enter author name"),
        visibility: Yup.string().required("Please select visibility"),
        status: Yup.string().required("Please select status"),
    });

    const formik = useFormik({
        initialValues: {
            title: knowledgeBaseData?.title || "",
            slug: knowledgeBaseData?.slug || "",
            description: knowledgeBaseData?.description || "",
            shortDescription: knowledgeBaseData?.shortDescription || "",
            block: knowledgeBaseData?.block
                ? JSON.parse(knowledgeBaseData.block)
                : [],
            departmentId: knowledgeBaseData?.departmentId || null,
            authors: knowledgeBaseData?.authors || "",
            visibility: knowledgeBaseData?.visibility || "0",
            status: knowledgeBaseData?.status || "1",
        },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            const knowledgebaseId = knowledgeBaseData?.id;
            const updatedValues = {
                ...values,
                block: JSON.stringify(values.block),
            };
            if (knowledgebaseId) {
                updateKnowledgeBase(updatedValues);
            } else {
                addKnowledgeBase(updatedValues);
            }
        },
    });

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[\s\W-]+/g, "-")
            .replace(/^-+|-+$/g, "");
    };

    const isSlugUnique = (slug, existingSlugs) => {
        return !existingSlugs.includes(slug);
    };

    const existingSlugs = ["existing-slug-1", "existing-slug-2"];

    const handleTitleBlur = (event) => {
        formik.handleBlur(event);
        if (!formik.values.slug && formik.values.title) {
            let newSlug = generateSlug(formik.values.title);
            let counter = 1;

            while (!isSlugUnique(newSlug, existingSlugs)) {
                newSlug = `${generateSlug(formik.values.title)}-${counter}`;
                counter++;
            }
            formik.setFieldValue("slug", newSlug);
        }
    };

    const handleEditorChange = (event, editor) => {
        const data = editor.getData();
        formik.setFieldValue("description", data);
    };
    useEffect(() => {
        if (userData?.isCoreTeam === "0") {
            formik.setFieldValue("departmentId", userData?.departmentId);
        }
    }, [userData?.isCoreTeam]);

    const handleDepartmentSearch = (event) => {
        const selectedId = event.target.value;
        setSelectedDept(selectedId.toString());
        formik.setFieldValue("departmentId", parseInt(selectedId));
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    const statusOptions = [
        { value: "0", label: "Published" },
        { value: "1", label: "Draft" },
        { value: "2", label: "Archived" },
    ];

    const departmentOptions =
        departmentList &&
        departmentList.map((department) => ({
            value: department.id,
            label: department.departmentName,
        }));

    return (
        <div className="page-content">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <form onSubmit={formik.handleSubmit}>
                            <div className="row gx-4">
                                <div className="col-12 col-lg-4 col-xxl-3 d-flex flex-column">
                                    <div className="card flex-grow-1  p-4 pt-lg-5 left-panel-card scrollbar-style mb-0 overflow-auto">
                                        <div className="d-flex justify-content-between mb-4">
                                            <div className="left-part">
                                                <Button
                                                    className="btn btn-soft-primary d-inline-flex align-items-center back-btn"
                                                    title="Back"
                                                    onClick={handleBackClick}>
                                                    <IoChevronBack size={16} />
                                                    <span className="flex-grow-1 ms-2"> Back </span>
                                                </Button>
                                            </div>
                                            <div className="right-part">
                                                <Button className="btn btn-success ms-2" type="submit" disabled={loading}>
                                                    {loading ? (
                                                        <>
                                                            <Spinner animation="border" size="sm" aria-hidden="true" />
                                                            <span > Saving... </span>
                                                        </>
                                                    ) : (
                                                        <span > {" "} Save </span>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                        <Tab.Container defaultActiveKey="docTab">
                                            <Card className="card-light">
                                                <Card.Header className="p-0">
                                                    <Nav variant="tabs" id="l-panel" className="nav-panel ">
                                                        <Nav.Item className="flex-grow-1">
                                                            <Nav.Link eventKey="docTab" className="fs-16  border-top-0 border-start-0 border-end-0 border-primary border-opacity-10 rounded-0 text-center w-100 py-3 fw-bold">
                                                                Articles
                                                            </Nav.Link>
                                                        </Nav.Item>
                                                        {/* <Nav.Item className="flex-grow-1">
                                                            <Nav.Link eventKey="blockTab" className="fs-16 border-top-0 border-start-0 border-end-0 border-primary border-opacity-10 rounded-0 text-center w-100 py-3 fw-bold">
                                                                Block
                                                            </Nav.Link>
                                                        </Nav.Item> */}
                                                    </Nav>
                                                </Card.Header>
                                                <Card.Body>
                                                    <Tab.Content>
                                                        <Tab.Pane eventKey="docTab">
                                                            <div className="mb-3">
                                                                <label htmlFor="slug" className="form-label fw-bold">Slug</label>
                                                                <div className="form-icon">
                                                                    <input
                                                                        type="text"
                                                                        className="form-control form-control-icon"
                                                                        placeholder="Slug"
                                                                        value={formik.values.slug}
                                                                        onChange={formik.handleChange}
                                                                        onBlur={formik.handleBlur}
                                                                        name="slug"
                                                                    />

                                                                    <i className="ri-links-line"></i>
                                                                </div>
                                                                {formik.errors.slug && formik.touched.slug && (
                                                                    <div className="text-danger">{formik.errors.slug}</div>
                                                                )}
                                                                <div className="mt-2">
                                                                    <a href={`https://${formik.values.slug}`} target="_blank" rel="noopener noreferrer">
                                                                        {`https://${formik.values.slug}`}
                                                                    </a>
                                                                </div>
                                                            </div>
                                                            <div className="mb-3">
                                                                <label htmlFor="checkStatus" className="form-label fw-bold">Status</label>
                                                                <div className="input-light">
                                                                    <Select
                                                                        classNamePrefix="select"
                                                                        name="status"
                                                                        value={statusOptions.find(option => option.value === formik.values.status) || null}
                                                                        onChange={selectedOption =>
                                                                            formik.setFieldValue('status', selectedOption ? selectedOption.value : '')
                                                                        }
                                                                        onBlur={formik.handleBlur}
                                                                        options={statusOptions}
                                                                        placeholder="Select Status"
                                                                        styles={{
                                                                            control: provided => ({ ...provided, cursor: 'pointer' }),
                                                                            menu: provided => ({ ...provided, cursor: 'pointer' }),
                                                                            option: provided => ({ ...provided, cursor: 'pointer' }),
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="mb-3">
                                                                <label htmlFor="visibility" className="form-label fw-bold">Visibility</label>
                                                                <div className="d-flex align-items-center">
                                                                    <div className="form-check form-radio-primary mb-3 flex-grow-1">
                                                                        <input
                                                                            className="form-check-input"
                                                                            type="radio"
                                                                            name="visibility"
                                                                            id="public"
                                                                            checked={formik.values.visibility === '0'}
                                                                            onChange={() => formik.setFieldValue('visibility', '0')}
                                                                        />
                                                                        <label className="form-check-label" htmlFor="public">Public</label>
                                                                    </div>
                                                                    <div className="form-check form-radio-primary mb-3 flex-grow-1">
                                                                        <input
                                                                            className="form-check-input"
                                                                            type="radio"
                                                                            name="visibility"
                                                                            id="private"
                                                                            checked={formik.values.visibility === '1'}
                                                                            onChange={() => formik.setFieldValue('visibility', '1')}
                                                                        />
                                                                        <label className="form-check-label" htmlFor="private">Private</label>
                                                                    </div>
                                                                    <OverlayTrigger placement="top" overlay={tooltipText}>
                                                                        <div className="infoTooltip mb-3">
                                                                            <div className="icon text-success cursor-pointer">
                                                                                <i className="ri-information-line"></i>
                                                                            </div>
                                                                        </div>
                                                                    </OverlayTrigger>
                                                                </div>
                                                            </div>

                                                            <div className="mb-3">
                                                                <label htmlFor="author" className="form-label fw-bold">Author</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    placeholder="Author"
                                                                    value={formik.values.authors}
                                                                    onChange={formik.handleChange}
                                                                    onBlur={formik.handleBlur}
                                                                    name="authors"
                                                                />
                                                                {formik.errors.authors && formik.touched.authors && (
                                                                    <div className="text-danger">{formik.errors.authors}</div>
                                                                )}
                                                            </div>
                                                        </Tab.Pane>
                                                        <Tab.Pane eventKey="blockTab">
                                                            <div className="text-center">Please select a block type.</div>
                                                        </Tab.Pane>
                                                    </Tab.Content>
                                                </Card.Body>
                                            </Card>
                                        </Tab.Container>
                                    </div>
                                </div>
                                <div className="col-12 col-lg-8 col-xxl-9 d-flex flex-column">
                                    <div className="card flex-grow-1 right-panel-card mb-0">
                                        <div className="card-header p-4 border-0">
                                            <h5 className="mb-0"> {knowledgeBaseData ? "Update Article" : "Add Article"} </h5>
                                        </div>
                                        <SimpleBar style={{ maxHeight: 'calc(100vh - 50px)', overflowX: 'auto' }}>
                                            <div className="card-body p-4 border border-dashed border-bottom-0 border-start-0 border-end-0">
                                                <div className="row gy-4">
                                                    <div className="col-12">
                                                        <label htmlFor="title"> Title </label>
                                                        <input type="text" className="form-control" placeholder="Title" value={formik.values.title} onChange={formik.handleChange} onBlur={handleTitleBlur} name="title" />
                                                        {formik.errors.title &&
                                                            formik.touched
                                                                .title && (
                                                                <div className="text-danger" >
                                                                    {formik.errors.title}
                                                                </div>
                                                            )}
                                                    </div>

                                                    <div className="col-12">
                                                            <label htmlFor="title"> Department </label>
                                                            <Select
                                                                classNamePrefix="select"
                                                                className="bg-light"
                                                                name="departmentId"
                                                                value={
                                                                    userData?.isCoreTeam === "0"
                                                                        ? departmentOptions.find(option => option.value == userData.departmentId) || ""
                                                                        : departmentOptions.find(option => option.value == formik.values.departmentId) || ""
                                                                }
                                                                onChange={(selectedOption) => {
                                                                    if (userData?.isCoreTeam !== "0") {
                                                                        formik.setFieldValue("departmentId", selectedOption?.value);
                                                                        handleDepartmentSearch({
                                                                            target: { value: selectedOption?.value },
                                                                        });
                                                                    }
                                                                }}
                                                                onBlur={formik.handleBlur}
                                                                options={departmentOptions}
                                                                placeholder="Select Department"
                                                                isDisabled={userData?.isCoreTeam === "0"}
                                                                styles={{
                                                                    control: (provided) => ({ ...provided, cursor: userData?.isCoreTeam === "0" ? "not-allowed" : "pointer", }),
                                                                    menu: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                    option: (provided) => ({ ...provided, cursor: "pointer", }),
                                                                }}
                                                            />
                                                            </div>
                                                        <div className="col-12">
                                                            <label htmlFor="shortDescription"> Short Description </label>
                                                            <textarea
                                                                className="form-control w-100"
                                                                id="shortDescription"
                                                                name="shortDescription"
                                                                rows="3"
                                                                placeholder="Short Description"
                                                                value={formik.values.shortDescription}
                                                                onChange={formik.handleChange}
                                                                onBlur={formik.handleBlur}
                                                                style={{ resize: 'vertical', overflowY: 'auto',marginTop: '0.15rem' }}>
                                                            </textarea>
                                                        </div>
                                                        <div className="col-12">
                                                            <label>Description</label>
                                                            <CKEditorModel
                                                                data={formik?.values?.description}
                                                                onChange={(event, editorData) => formik.setFieldValue("description", editorData)}
                                                            />
                                                        </div>
                                                        <CustomButtons
                                                            formik={formik}
                                                            knowledgeBaseData={knowledgeBaseData}
                                                        />
                                                    
                                                </div>
                                            </div>
                                        </SimpleBar>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <ScrollToTop />
        </div>
    );
};

export default KnowledgeBaseModal;
