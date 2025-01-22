import React, { useEffect, useState } from "react";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import ScrollToTop from "../../common/ScrollToTop/ScrollToTop";
import { useLocation } from "react-router-dom";
import Folders from "../../assets/images/user-folader.svg";
import CyberSecurity from "../../assets/images/cyber-security.gif";
import Verify from "../../assets/images/verify-03.gif";
import useAxios from "../../utils/hook/useAxios";
import MembersProfile from "./TabComponent/MembersProfile";
import Documents from "./TabComponent/Documents";
import { LoaderSpin } from "../../common/Loader/Loader";
import ApplicationsForProfile from "./TabComponent/ApplicationsForProfile";
import CustomerPayment from "./TabComponent/CustomerPayments";
import TicketsForCustomer from "./TabComponent/TicketsTab";
import NotFound from "../../common/NotFound/NotFound";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Form, FormGroup, Label, Input, FormFeedback } from "reactstrap";
import { AiFillCheckCircle, AiOutlineUser, AiOutlineMail, AiOutlineKey, AiFillLock, AiOutlineMobile } from "react-icons/ai";
import './blur.css'
import { decrypt, encrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import { Stepper, Step, StepLabel, StepConnector, StepButton } from "@mui/material";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import UnverifiedComponent from "./UnverifiedComponent";
const BlankData = process.env.REACT_APP_BLANK;
export function stringAvatar(citizen) {
  return `${citizen?.firstName?.charAt(0).toUpperCase()}${citizen?.lastName
    ?.charAt(0)
    .toUpperCase()}`;
}
function getMonthName(date) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return months[date.getMonth()];
}
function formatDate(dateString) {
  // Parse the input date string
  const date = new Date(dateString);

  // Format the date in the desired format (08 Mar, 2024)
  const formattedDate = `${("0" + date.getDate()).slice(
    -2
  )} ${getMonthName(date)}, ${date.getFullYear()}`;

  // Get the hours and minutes
  let hours = date.getHours();
  let minutes = date.getMinutes();

  // AM or PM
  const ampm = hours >= 12 ? 'PM' : 'AM';

  // Convert hours to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Add leading zero to minutes if needed
  minutes = minutes < 10 ? '0' + minutes : minutes;

  const formattedTime = `${hours}:${minutes} ${ampm}`

  return (
    <div>
      <span>{formattedDate}</span>
    </div>
  );
}
const CitizensDetailedView = () => {
  const axiosInstance = useAxios()
  const location = useLocation()
  const getIpInfo = useSelector((state) => state?.Layout?.ipData);
  const ipAddress = getIpInfo?.ip;
  const userEncryptData = localStorage.getItem("userData");
  const userDecryptData = userEncryptData
    ? decrypt({ data: userEncryptData })
    : {};
  const userData = userDecryptData?.data;
  const userId = userData?.id
  const customerId = location?.state?.data
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [citizenData, setCitizenData] = useState([])
  const [parentDetails, setParentDetails] = useState()
  const [currentTab, setCurrentTab] = useState("application");
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [skippedFields, setSkippedFields] = useState({ email: false, mobileNumber: false });
  const [isVerified, setIsVerified] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [verificationStep, setVerificationStep] = useState(0);
  const [loadingFields, setLoadingFields] = useState({ nibNumber: false, email: false, mobileNumber: false, otp: false });
  const [verifiedFields, setVerifiedFields] = useState({ nibNumber: false, email: false, mobileNumber: false, otp: false });
  const [showErrors, setShowErrors] = useState({ nibNumber: false, email: false, mobileNumber: false, otp: false });
  const [useEmail, setUseEmail] = useState(true); // Toggle between email and mobile
  const [otpResendDisabled,setOtpResendDisabled]=useState(false)

  // Open and reset modal
  const toggleModal = () => {
    setModalOpen(!modalOpen);
    setFormData({});
    setVerificationStep(0);
    setVerifiedFields({ nibNumber: false, email: false, mobileNumber: false, otp: false });
    setUseEmail(true);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (showErrors[name]) setShowErrors((prev) => ({ ...prev, [name]: false }));
  };

  // Handle field verification
  const handleVerify = async (field) => {
    try {
      setLoadingFields((prev) => ({ ...prev, [field]: true }));

      let isValid = false;
      if (field === "nibNumber") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        isValid = formData?.nibNumber?.toLowerCase() == parentDetails?.nibNumber?.toLowerCase();
        if (isValid) {
          setVerifiedFields((prev) => ({ ...prev, nibNumber: true }));
          setVerificationStep((prev) => prev + 1);
        } else {
          setShowErrors((prev) => ({ ...prev, nibNumber: true }));
        }
      } else if (field === "email" || field === "mobileNumber") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        if (useEmail ? parentDetails?.email != formData?.email : parentDetails?.mobileNumber != formData?.mobileNumber) {
          setShowErrors((prev) => ({ ...prev, [field]: true }));
          setLoadingFields((prev) => ({ ...prev, [field]: false }));
          return;
        }
        const payload = useEmail
          ? { email: formData?.email }
          : { mobileNumber: formData?.mobileNumber };
        const response = await axiosInstance.post("userService/customer/profile-access-otp", {
          ...payload,
          userData: {
            userId: userData?.id,
            name: userData?.name,
            email: userData?.email
          },
          ipAddress,
        });
        isValid = response.data.data.otp;
        if (isValid) {
          setVerifiedFields((prev) => ({ ...prev, [field]: true }));
          setVerificationStep((prev) => prev + 1);
        } else {
          setShowErrors((prev) => ({ ...prev, [field]: true }));
        }
        // Disable OTP resend for 1 minute
        setOtpResendDisabled(true);

        // Automatically enable OTP resend after 1 minute
        setTimeout(() => {
          setOtpResendDisabled(false);
        }, 60000);  // 60000 ms = 1 minute
      } else if (field === "otp") {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const response = await axiosInstance.post("userService/customer/confirm-profile-access", {
          otp: JSON.parse(formData?.otp),
          email: formData?.email,
          mobileNumber: formData?.mobileNumber,
          userData: {
            userId: userData?.id,
            name: userData?.name,
            email: userData?.email
          },
          ipAddress,
        });
        isValid = response.data.data.otp;
        if (isValid) {
          setModalOpen(false);
          await new Promise((resolve) => setTimeout(resolve, 4000));

          setVerifiedFields((prev) => ({ ...prev, otp: true }));
          setVerificationStep((prev) => prev + 1);

          const expirationTime = new Date(new Date().getTime() + 10 * 60 * 1000);
          const newRecord = { userId, customerId, expiry: expirationTime };
          // Safely retrieve existing data from localStorage
          let existingData = [];
          try {
            const rawData = localStorage.getItem("profileData");
            const decryptData = rawData ? decrypt({ data: rawData }) : []
            existingData = decryptData?.data || [];
            if (!Array.isArray(existingData)) {
              existingData = []; // Reset to an empty array if the parsed data is invalid
            }
          } catch (error) {
            existingData = []; // Handle parsing errors gracefully
          }

          // Check if a matching record exists
          const recordIndex = existingData.findIndex(
            (item) => item.userId === userId && item.customerId === customerId
          );

          if (recordIndex !== -1) {
            // Update existing record
            existingData[recordIndex] = newRecord;
          } else {
            // Add new record
            existingData.push(newRecord);
          }

          // Save updated data back to localStorage
          try {
            const userData = encrypt({ data: existingData });
            localStorage.setItem("profileData", userData?.data);
          } catch (error) {
            console.error("Error saving profileData to localStorage:", error);
          }
          setIsVerified(true);
        } else {
          setShowErrors((prev) => ({ ...prev, otp: true }));
        }
      }

      setLoadingFields((prev) => ({ ...prev, [field]: false }));
    } catch (error) {
      console.error(error);
      setLoadingFields((prev) => ({ ...prev, [field]: false }));
    }
  };
  const resendOTP = async () => {
    try {
      setOtpResendDisabled(true);
      let isValid = false
      const payload = useEmail
      ? { email: formData?.email }
      : { mobileNumber: formData?.mobileNumber };
      const response = await axiosInstance.post("userService/customer/profile-access-otp", {
        ...payload,
        userData: {
          userId: userData?.id,
          name: userData?.name,
          email: userData?.email
        },
        ipAddress,
      });
      isValid = response.data.data.otp;
      if(isValid){
        toast.success("OTP resent successfully");
      }
    } catch (error) {
      console.log(error)
      toast.error("Failed to resend OTP");
    } finally {
      setTimeout(() => {
        setOtpResendDisabled(false);
      }, 60000);
    }
  };
  const handleClick = () => {
    if (!otpResendDisabled) {
      resendOTP();
    }
  };
  // Steps definition
  const steps = [
    { label: "Nib Number", icon: <AiOutlineUser size={24} /> },
    { label: useEmail ? "Email" : "Mobile Number", icon: useEmail ? <AiOutlineMail size={24} /> : <AiOutlineMobile size={24} /> },
    { label: "OTP", icon: <AiOutlineKey size={24} /> },
  ];


  useEffect(() => {
    // Retrieve data from localStorage
    const profileDataRaw = localStorage.getItem('profileData');
    const decryptData = profileDataRaw ? decrypt({ data: profileDataRaw }) : []
    let profileData = decryptData?.data || [];

    try {
      if (!Array.isArray(profileData)) {
        profileData = []; // Reset to an empty array if data is not valid
      }
    } catch (error) {
      console.error("Error parsing profileData from localStorage:", error);
      profileData = []; // Handle parsing errors gracefully
    }
    if (Array.isArray(profileData)) {
      const isMatch = profileData.some((data) => {
        if (data.userId === userId && data.customerId === parentDetails?.id) {
          const expiryTime = new Date(data.expiry);
          const currentTime = new Date();

          // Check if the expiry time is still valid
          return expiryTime > currentTime;
        }
        return false;
      });

      // Set isVerified to true if a valid match is found
      if (isMatch) {
        setIsVerified(true);
      }
    }
  }, [userId, parentDetails]);

  const handleTabSelect = (key) => {
    setCurrentTab(key);
    setSelectedCustomer(null)
  };
  const fetchProfileList = async () => {
    try {
      setIsLoading(true);
      const data = {
        id: customerId,
        page: 1,
        perPage: 20,
      };
      const response = await axiosInstance.post(
        `userService/profileCustomer/list`,
        data
      );

      if (response) {
        const { rows, count } = response?.data?.data;
        setIsLoading(false);
        const filterParent = rows?.find((data) => data.id == customerId)
        setParentDetails(filterParent)
        setCitizenData(rows);
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error?.message);
    }
  };
  useEffect(() => {
    fetchProfileList()
  }, [])

  const filteredMembers = citizenData?.filter((data) => data.id !== customerId);
  document.title = "Citizens Detailed View | eGov Solution";
  return (
    <>
      <div id="layout-wrapper" className={`${!isVerified ? "lock-overlay" : ""}`}>

        <div className="page-content application-profile">
          <div className="container-xl ">
            <div className="row">
              <div className="col-12">
                <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 ">
                  <h4 className="mb-sm-0"> Citizen Profile</h4>

                </div>
              </div>
            </div>
            {isVerified ?
            <div className="row">
              <div className="col-xl-12">
                <div className={`bg-transparent border-0 card bg-tra rounded-4 h-100 ${!isVerified ? "blur-content" : ""}`}>
                  {(parentDetails?.id && !isLoading) ?
                    <div className="p-0 card-body">

                      {/* border border-dashed border-start-0 border-end-0 border-top-0   pb-4 */}
                      <div className="row ">
                        <div className="col-xxl-2 col-xl-3 col-lg-4 col-md-4 mb-4 mb-md-0">
                          <div className="bg-white rounded-4 p-4 h-100  text-center d-flex flex-column justify-content-center align-items-center">
                            <div className="profile-user  position-relative d-inline-block mx-auto mb-3">

                              {parentDetails?.imageData?.documentPath ? (
                                <img
                                  src={
                                    parentDetails?.imageData?.documentPath
                                  }
                                  className="rounded-circle avatar-xl img-thumbnail user-profile-image material-shadow" alt="user-profile"
                                />
                              ) : (
                                <div className="rounded-circle avatar-lg img-thumbnail bg-warning-subtle d-flex justify-content-center align-items-center fs-36">{stringAvatar(parentDetails)}</div>
                              )}
                            </div>

                            <h5 className="fs-16 mb-0">{`${parentDetails?.firstName} ${parentDetails?.middleName} ${parentDetails?.lastName}`}</h5>
                            {parentDetails?.nibNumber && <p className="text-muted mb-0">NIB / {parentDetails?.nibNumber}</p>}
                          </div>
                        </div>

                        <div className="col-xxl-10 col-xl-9 col-lg-8 col-md-8">
                          <div className="bg-white rounded-4  p-4 p-xl-5 ">
                            <div className="row">
                              <div className="col-sm-6 col-md-6  col-lg-6 col-xl-4 col-xxl-3 mb-4">
                                <div className="border border-dashed border-primary rounded-3 py-2 px-3 border-opacity-25" >
                                  <p className="mb-1 text-uppercase fw-semibold fs-12 text-muted">
                                    Full Name</p>
                                  <h5 className="fs-14 mb-0 view-type ">{`${parentDetails?.firstName} ${parentDetails?.middleName} ${parentDetails?.lastName}`}</h5>
                                </div>
                              </div>


                              <div className="col-sm-6 col-md-6  col-lg-6 col-xl-4 col-xxl-3 mb-4 ">
                                <div className="border border-dashed border-primary rounded-3 py-2 px-3 border-opacity-25" >

                                  <p className="mb-1 text-uppercase fw-semibold fs-12 text-muted">Date of Birth</p>
                                  <h5 className="fs-14 mb-0 view-type">  {parentDetails?.dateOfBirth ? formatDate(parentDetails?.dateOfBirth) : BlankData}
                                  </h5>
                                </div>
                              </div>
                              <div className="col-sm-6 col-md-6  col-lg-6 col-xl-4 col-xxl-3 mb-4 ">
                                <div className="border border-dashed border-primary rounded-3 py-2 px-3 border-opacity-25" >
                                  <p className="mb-1 text-uppercase fw-semibold fs-12 text-muted">Place of Birth</p>
                                  <h5 className="fs-14 mb-0 view-postdate">  {parentDetails?.countryOfBirth?.name ||
                                    BlankData}</h5>
                                </div>
                              </div>
                              <div className="col-sm-6 col-md-6  col-lg-6 col-xl-4 col-xxl-3 mb-4 ">
                                <div className="border border-dashed border-primary rounded-3 py-2 px-3 border-opacity-25" >
                                  <p className="mb-1 text-uppercase fw-semibold fs-12 text-muted">Gender</p>
                                  <h5 className="fs-14 mb-0 view-experience">{parentDetails?.gender === "0"
                                    ? "Male"
                                    : "Female"}</h5>
                                </div>
                              </div>

                              <div className="col-sm-6 col-md-6  col-lg-6 col-xl-4 col-xxl-3 mb-4 mb-xxl-0 ">
                                <div className="border border-dashed border-primary rounded-3 py-2 px-3 border-opacity-25" >
                                  <p className="mb-1 text-uppercase fw-semibold fs-12 text-muted">Citizen</p>
                                  <h5 className="fs-14 mb-0 view-experience">{parentDetails?.countryOfCitizenship
                                    ?.name || BlankData}</h5>
                                </div>
                              </div>
                              <div className="col-sm-6 col-md-6  col-lg-6 col-xl-4 col-xxl-3 mb-4 mb-xxl-0 ">
                                <div className="border border-dashed border-primary rounded-3 py-2 px-3 border-opacity-25" >
                                  <p className="mb-1 text-uppercase fw-semibold fs-12 text-muted">Resident</p>
                                  <h5 className="fs-14 mb-0 view-experience">{parentDetails?.isResident === "0" ? "No" : "Yes"}</h5>
                                </div>
                              </div>
                              <div className="col-sm-6 col-md-6  col-lg-6 col-xl-4 col-xxl-3  mb-4  mb-sm-0">
                                <div className="border border-dashed border-primary rounded-3 py-2 px-3 border-opacity-25" >
                                  <p className="mb-1 text-uppercase fw-semibold fs-12 text-muted">Phone  </p>
                                  <h5 className="fs-14 mb-0 view-experience">{parentDetails?.mobileNumber || BlankData} </h5>
                                </div>
                              </div>
                              <div className="col-sm-6 col-md-6  col-lg-6 col-xl-4 col-xxl-3  mb-0 mb-md-0">
                                <div className="border border-dashed border-primary rounded-3 py-2 px-3 border-opacity-25" >
                                  <p className="mb-1 text-uppercase fw-semibold fs-12 text-muted"> Email</p>
                                  <h5 className="fs-14 mb-0 view-experience"> {parentDetails?.email || BlankData}</h5>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>


                    </div> :
                    <LoaderSpin />
                  }
                </div>
              </div>

              <div className="col-xl-12">
                {/* Card content */}
                <div className={`card-bg-fill card rounded-4 h-100 ${!isVerified ? "blur-content" : ""}`} >
                  <div className="p-4 card-body">
                    <Tabs activeKey={currentTab}
                      onSelect={handleTabSelect}
                      defaultActiveKey="profile" id="uncontrolled-tab-example" className="mb-3 nav-tabs-custom nav-primary mb-3 nav nav-tabs" >
                      <Tab eventKey="application" title="Application">
                        <ApplicationsForProfile customerId={customerId} />

                      </Tab>
                      <Tab eventKey="payments" title="Payments">
                        <CustomerPayment customerId={customerId} />
                      </Tab>
                      <Tab eventKey="documents" title="Documents" >
                        {!selectedCustomer ?
                          <div className="services">
                            <div className="service-wrapper mt-5 ">
                              <div className="row  ">
                                {citizenData.map((customer, index) => (
                                  <div
                                    className="col col-12 col-sm-6 col-md-4 col-xl-3 col-xxl-2 mb-4"
                                    onClick={() => setSelectedCustomer(customer?.id)}
                                    key={index}
                                  >
                                    <span
                                      role="button"
                                      className="listing bg-light h-100 p-3 rounded-3 d-flex flex-wrap align-items-center justify-content-center ff-open "
                                      title={`${customer?.firstName} ${customer?.middleName} ${customer?.lastName}`}

                                    >
                                      <div className="thumbnail-container">
                                        <div className="thumbnail">
                                          <img
                                            src={Folders}
                                            className="img-fluid"
                                            alt="alt"
                                          />
                                        </div>
                                      </div>
                                      <div className="title-listing fw-normal text-center">
                                        {`${customer?.firstName} ${customer?.middleName} ${customer?.lastName}`}

                                      </div>
                                    </span>
                                  </div>
                                ))}
                              </div></div></div>
                          :
                          <div className="row ">
                            <Documents customerId={selectedCustomer} />
                          </div>}
                      </Tab>
                      <Tab eventKey="tickets" title="Tickets" >
                        <TicketsForCustomer customerId={customerId} />
                      </Tab>
                      <Tab eventKey="memberprofile" title="Member profile" >
                        <div className="row mt-5">
                          {filteredMembers && filteredMembers.length > 0 ? (
                            filteredMembers.map((data) => (
                              <MembersProfile key={data?.id} profileData={data} />
                            ))
                          ) : (
                            <div>
                              <NotFound
                                heading="No member profiles found."
                                message="Unfortunately, no member profiles were found."
                              />

                            </div>
                          )}
                        </div>
                      </Tab>
                    </Tabs>
                  </div>
                </div>
              </div>

            </div>
            :
           <UnverifiedComponent/>
           }
          </div>
          {!isVerified && (
            <div className="confirm-verification bg-white rounded-4 border-1 border  m-auto d-flex flex-column justify-content-center align-items-center p-xl-5 p-md-4 p-3 text-center">
              {loadingFields?.otp ?
                <>
                  <div className="d-flex align-items-center justify-content-center mb-4" >
                    <img src={Verify} width={"120px"} alt="alt" />
                  </div>
                  <h4>Verification Confirmed</h4>
                </> : <>
                  <div>
                    <img src={CyberSecurity} width={"90px"} alt="alt" />
                  </div>
                  <p className="mt-4 text-muted fs-15 ">Please verify the provided NIB number carefully to ensure its accuracy and validity</p>
                  <button className="btn btn-primary mt-0" onClick={() => setModalOpen(true)} >
                    Confirm Verification
                  </button>
                </>}

            </div>
          )}
        </div>
       
             
      </div >

      <Modal centered isOpen={modalOpen} toggle={toggleModal} backdrop={"static"}>
        <ModalHeader className="border-1  border-bottom py-3 " toggle={toggleModal}>Dynamic Verification</ModalHeader>
        <ModalBody className="p-lg-5 p-4">
          <Stepper nonLinear activeStep={verificationStep}>
            {steps.map((step, index) => {
              // Handle the dynamic field completion for the second step
              const isSecondStep = index === 1;
              const secondStepCompleted = useEmail
                ? verifiedFields.email
                : verifiedFields.mobileNumber;

              return (
                <Step
                  key={index}
                  completed={isSecondStep ? secondStepCompleted : verifiedFields[Object.keys(verifiedFields)[index]]}
                  sx={{
                    "& .MuiStepLabel-root .Mui-completed": {
                      color: "#00bd9d"
                    },
                    "& .MuiStepLabel-label.Mui-completed.MuiStepLabel-alternativeLabel": {
                      color: "00bd9d"
                    },
                    "& .MuiStepLabel-root .Mui-active": {
                      color: "#303e4b"
                    },
                    "& .MuiStepLabel-label.Mui-active.MuiStepLabel-alternativeLabel": {
                      color: "#38a832"
                    },
                    // "& .MuiStepLabel-root .Mui-active .MuiStepIcon-text": {
                    //   fill: "#0e64ab"
                    // }
                  }}
                >
                  <StepButton className="py-0" color="inherit">{step?.icon}</StepButton>
                </Step>
              );
            })}
          </Stepper>


          {/* Nib Number */}
          {verificationStep === 0 && (
            <FormGroup className="mt-3 mt-xl-5">
              <Input
                type="text"
                name="nibNumber"
                value={formData.nibNumber || ""}
                onChange={handleInputChange}
                placeholder="Enter Nib Number"
                valid={verifiedFields.nibNumber}
                invalid={showErrors.nibNumber}
              />
              <FormFeedback>Nib Number is not verified.</FormFeedback>
              <Button
                color={verifiedFields.nibNumber ? "success" : "primary"}
                className="mt-4 w-100"
                onClick={() => handleVerify("nibNumber")}
                disabled={verifiedFields.nibNumber || loadingFields.nibNumber}
              >
                {loadingFields.nibNumber ? "Verifying..." : "Verify Nib Number"}
              </Button>
            </FormGroup>
          )}

          {/* Email or Mobile */}
          {verificationStep === 1 && (
            <FormGroup className="mt-lg-5 mt-4">
              <div className="d-flex ">
                <span title="Use mobile number for OTP" onClick={() => setUseEmail(false)} className={useEmail ? "btn btn-outline-success  material-shadow form-label me-3 mb-0 w-100" : "btn btn-success  material-shadow form-label me-3 mb-0 w-100"}>

                  <AiOutlineMobile className="me-1" size={22} />
                  Mobile
                </span>
                <span title="Use email for OTP" onClick={() => setUseEmail(true)} className={!useEmail ? "btn btn-outline-success  material-shadow form-label ms-2 mb-0 w-100" : "btn btn-success  material-shadow form-label ms-2  mb-0 w-100"} >
                  <AiOutlineMail className="me-1" size={22} />
                  Email
                </span>
              </div>
              <Input
                type={useEmail ? "email" : "text"}
                name={useEmail ? "email" : "mobileNumber"}
                value={useEmail ? formData.email || "" : formData.mobileNumber || ""}
                onChange={handleInputChange}
                placeholder={`Enter your ${useEmail ? "Email" : "Mobile Number"}`}
                valid={verifiedFields[useEmail ? "email" : "mobileNumber"]}
                invalid={showErrors[useEmail ? "email" : "mobileNumber"]}
                className="mt-3"
              />
              <FormFeedback>
                {`${verifiedFields[useEmail ? "email" : "mobileNumber"]
                  ? `${useEmail ? "Email" : "Mobile Number"} is verified.`
                  : `${useEmail ? "Email" : "Mobile Number"} is not verified.`
                  }`}
              </FormFeedback>
              <Button
                color={verifiedFields[useEmail ? "email" : "mobileNumber"] ? "success" : "primary"}
                className="mt-3"
                onClick={() => handleVerify(useEmail ? "email" : "mobileNumber")}
                disabled={verifiedFields[useEmail ? "email" : "mobileNumber"] || loadingFields[useEmail ? "email" : "mobileNumber"]}
              >
                {loadingFields[useEmail ? "email" : "mobileNumber"]
                  ? "Verifying..."
                  : `Verify ${useEmail ? "Email" : "Mobile Number"}`}
              </Button>

            </FormGroup>
          )}

          {/* OTP */}
          {verificationStep === 2 && (



            <FormGroup className="mt-lg-5 mt-4">
              <Input
                type="number"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="Enter OTP"
                valid={verifiedFields.otp}
                invalid={showErrors.otp}
              />
              <FormFeedback>OTP is not verified.</FormFeedback>
              <div className="mt-4 text-end">
                <p className="mb-0">
                  Didn't receive a code ?{" "}
                  {otpResendDisabled ? (
                    <span className="fw-semibold" style={{ cursor: "not-allowed", color: "#bdd3ff", }} > Resend </span>
                  ) : (
                    <span className={`fw-semibold text-primary text-decoration-underline cursor-pointer`} onClick={handleClick} > Resend </span>
                  )}
                </p>
              </div>
              <Button
                color={verifiedFields.otp ? "success" : "primary"}
                className="mt-3 w-100"
                onClick={() => handleVerify("otp")}
                disabled={verifiedFields.otp || loadingFields.otp}
              >
                {loadingFields.otp ? "Verifying..." : "Verify OTP"}
              </Button>
            </FormGroup>
          )}
        </ModalBody>
      </Modal >

      <ScrollToTop />
    </>
  );
};

export default CitizensDetailedView;
