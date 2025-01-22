import React, { useEffect, useState } from "react";
import {
    Button,
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter,
    Input,
    
    UncontrolledTooltip,
} from "reactstrap";
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import {
    hasViewPermission,
    hasAssignPermission,
} from "../../common/CommonFunctions/common";
import { LoaderSpin } from "../../common/Loader/Loader";
import SimpleBar from "simplebar-react";
import { useNavigate,Link } from "react-router-dom";
import errorImage from "../../assets/images/error.gif";
import useAxios from "../../utils/hook/useAxios";

const DepartmentServices = ({
    allServices,
    selectedService,
    selectedServices,
    setSelectedServices,
    open,
    setOpen,
    setSelectedModalService,
    handleSelect,
}) => {
    const axiosInstance = useAxios();
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [perPageSize, setPerPageSize] = useState(25);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    // const [selectedServices, setSelectedServices] = useState([]); // Multiple selected services
    const totalPages = Math.ceil(totalCount / perPageSize);
    const navigate = useNavigate();

    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
        ? decrypt({ data: userPermissionsEncryptData })
        : { data: [] };

    const applicationPermissions = userPermissionsDecryptData?.data?.find(
        (module) => module.slug === "application"
    );
    const viewPermissions = applicationPermissions
        ? hasViewPermission(applicationPermissions)
        : false;
    const assignPermission = applicationPermissions
        ? hasAssignPermission(applicationPermissions)
        : false;

    const fetchDepartmentServiceList = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.post(
                `serviceManagement/department/departmentServices`,
                {
                    page: currentPage,
                    perPage: perPageSize,
                    departmentId:
                        userData?.isCoreTeam === "0"
                            ? (userData?.departmentId || "").split(',').map(id => id.trim())
                            : null,
                    searchQuery: searchQuery,
                }
            );

            if (response?.data) {
                setData(response?.data?.data);
                setTotalCount(response?.data?.totalCount || 0);
            }
        } catch (error) {
            console.error("Error fetching department services:", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!searchQuery) {
            fetchDepartmentServiceList();
        }
    }, [currentPage, perPageSize, searchQuery]);

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchQuery) {
                fetchDepartmentServiceList();
            }
        }, 500);
        return () => clearTimeout(delayedSearch);
    }, [currentPage, perPageSize, searchQuery]);

    // Handle individual service selection and deselection
    const handleServiceClick = (serviceSlug) => {
        setSelectedServices((prev) => {
            if (prev.includes(serviceSlug)) {
                return prev.filter((slug) => slug !== serviceSlug); // Deselect service
            } else {
                return [...prev, serviceSlug]; // Select service
            }
        });
        // handleSelect(serviceSlug); // Pass the selected service to parent component
    };

    // Handle selecting/deselecting all services in a department
    const handleDepartmentClick = (services) => {
        const allServiceSlugs = services.map((service) => service.slug);
        const newSelectedServices = allServiceSlugs.every((slug) =>
            selectedServices.includes(slug)
        )
            ? selectedServices.filter((slug) => !allServiceSlugs.includes(slug))
            : [...new Set([...selectedServices, ...allServiceSlugs])];

        setSelectedServices(newSelectedServices);
    };

    const handleAllServiceClick = () => {
        const allServiceSlugs = allServices?.map((service) => service.slug);
        const newSelectedServices = allServiceSlugs?.every((slug) =>
            selectedServices.includes(slug)
        )
            ? selectedServices.filter((slug) => !allServiceSlugs.includes(slug))
            : [...new Set([...selectedServices, ...allServiceSlugs])];

        setSelectedServices(newSelectedServices);
    };

    const hadndleSearch = () => {
        handleSelect(selectedServices);
    };

    return (
        <>
            <Modal
                size="md"
                centered
                isOpen={open}
                backdrop={selectedService?.length === 0 ? "static" : true}
                toggle={() => setOpen(false)}
                className="department-services-modal">
                <ModalHeader 
                toggle={data?.length === 0 && !isLoading ? () => setOpen(false) : null}
                className="modal-header pb-4 border-bottom">
                    <div className="d-flex justify-content-between align-items-center w-100">
                        <div className="d-flex align-items-center ">
                            <h5 className="mb-0 modal-title">Department Services</h5>
                            <span
                                className="cursor-pointer ms-2"
                              >
                                <i
                                    className="las la-info-circle fs-5"
                                    id="info-service"></i>
                            </span>
                            <UncontrolledTooltip
                                target="info-service"
                                placement="right-start">
                                The more services you select, the longer it will
                                take to retrieve the data.
                            </UncontrolledTooltip>
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="overflow-hidden  px-0 p-sm-4">
                    <>
                        <div className="row mx-2 pb-0 align-items-center">
                            <div className="col-lg-8 pb-4">
                                <div className="form-icon">
                                    <Input
                                        type="text"
                                        className="form-control form-control-icon"
                                        id="iconInput"
                                        placeholder="Search Services"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                    <i className="ri-search-line fs-5"></i>
                                </div>
                            </div>
                            {data.length > 0 && !isLoading && (
                                <div
                                    className="col-lg-4 pb-4"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleAllServiceClick()}>
                                    <div
                                        className="service_box  align-items-center"
                                        style={{ cursor: "pointer" }}>
                                        <div className="radio d-flex align-items-center">
                                            <input
                                                type="checkbox"
                                                className="form-check-input rounded-circle fs-16 ms-0 mt-0 per-check-all"
                                                value=""
                                                checked={allServices?.every(
                                                    (dept) =>
                                                        selectedServices?.includes(
                                                            dept?.slug
                                                        )
                                                )}
                                                onChange={() => {}}
                                                style={{ cursor: "pointer" }}
                                            />
                                            <h6 className="mb-0 ms-2">
                                                <span
                                                    role="button"
                                                    title="Select All Services"
                                                    style={{
                                                        cursor: "pointer",
                                                    }}>
                                                    Select All Services
                                                </span>
                                            </h6>
                                            <label
                                                className="radio-label"
                                                style={{
                                                    cursor: "pointer",
                                                }}></label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="">
                            {isLoading && <LoaderSpin />}
                            <SimpleBar
                                style={{
                                    maxHeight: "500px",
                                    overflowX: "auto",
                                }}>
                                {data.length > 0 &&
                                    data.map((department) => (
                                        <div
                                            className={
                                                isLoading
                                                    ? " mx-3 d-none"
                                                    : " mx-3"
                                            }
                                            key={department.id}>
                                            <div className="row p-0 align-items-center">
                                                <div className="col-lg-12 pb-4 ">
                                                    <div
                                                        className="service_box p-0 border-0 bg-light  cursor-pointer rounded-0  p-3 "
                                                        onClick={() =>
                                                            handleDepartmentClick(
                                                                department.services
                                                            )
                                                        }>
                                                        <div className="flex-shrink-0 me-3">
                                                            <img
                                                                src={
                                                                    department?.logo
                                                                }
                                                                alt=""
                                                                className="avatar-xs rounded-circle border"
                                                            />
                                                        </div>
                                                        <div className="flex-grow-1">
                                                            <h5 className="mb-0">
                                                                {
                                                                    department?.departmentName
                                                                }
                                                            </h5>
                                                        </div>
                                                        <div className="radio d-flex align-items-center me-3">
                                                            <input
                                                                type="checkbox"
                                                                className="form-check-input cursor-pointer rounded-circle fs-16 ms-0 mt-0 per-check-all"
                                                                value={""}
                                                                checked={department?.services?.every(
                                                                    (dept) =>
                                                                        selectedServices?.includes(
                                                                            dept?.slug
                                                                        )
                                                                )}
                                                                onChange={() => {}}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="pb-2">
                                                {department?.services.map(
                                                    (service) => (
                                                        <div
                                                            className="d-inline-flex mb-3"
                                                            key={service?.slug}>
                                                            <div
                                                                onClick={() =>
                                                                    handleServiceClick(
                                                                        service?.slug
                                                                    )
                                                                }
                                                                className="service_box me-3 d-flex align-items-center"
                                                                style={{
                                                                    cursor: "pointer",
                                                                }}>
                                                                <div className="radio d-flex align-items-center">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="form-check-input rounded-circle fs-16 ms-0 mt-0 per-check-all"
                                                                        value={
                                                                            service?.slug
                                                                        }
                                                                        checked={selectedServices.includes(
                                                                            service?.slug
                                                                        )}
                                                                        onChange={() => {}}
                                                                        style={{
                                                                            cursor: "pointer",
                                                                        }}
                                                                    />
                                                                    <h6 className="mb-0 ms-2">
                                                                        <span
                                                                            role="button"
                                                                            title={
                                                                                service?.serviceName
                                                                            }
                                                                            style={{
                                                                                cursor: "pointer",
                                                                            }}>
                                                                            {
                                                                                service?.serviceName
                                                                            }
                                                                        </span>
                                                                    </h6>
                                                                    <label
                                                                        className="radio-lable"
                                                                        style={{
                                                                            cursor: "pointer",
                                                                        }}></label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                {!isLoading && data?.length === 0 && (
                                    <div className="col-10 mx-auto text-center my-4">
                                        <div className="error_image">
                                            <img
                                                src={errorImage}
                                                alt="Error Image"
                                            />
                                        </div>
                                        <h5 className="lh-base mb-0">
                                            Department not Found
                                        </h5>
                                        <p className="text-muted">
                                            Unfortunately, no services available
                                            at the moment.
                                        </p>
                                    </div>
                                )}
                            </SimpleBar>
                        </div>
                    </>
                </ModalBody>
                <ModalFooter className="pt-3">
                    <div className="d-flex ">
                        <button
                            disabled={selectedServices?.length === 0}
                            className="btn btn-primary"
                            onClick={hadndleSearch}>
                            Search
                        </button>
                    </div>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default DepartmentServices;
