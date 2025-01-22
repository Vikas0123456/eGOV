import React, { useState, useEffect } from 'react';
import { decrypt } from "../../utils/encryptDecrypt/encryptDecrypt";
import SimpleBar from "simplebar-react";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import SettingModal from './SettingModal';
import { Col } from 'reactstrap'
import { hasCreatePermission, hasEditPermission, hasViewPermission } from '../../common/CommonFunctions/common';
import NotFound from '../../common/NotFound/NotFound';
import { LoaderSpin } from '../../common/Loader/Loader';
import useAxios from '../../utils/hook/useAxios';
const Settings = () => {
    const axiosInstance = useAxios()

    const userEncryptData = localStorage.getItem("userData");
    const userDecryptData = userEncryptData
        ? decrypt({ data: userEncryptData })
        : {};
    const userData = userDecryptData?.data;
    const departmentId = userDecryptData?.data?.departmentId;
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    
    const userId = userData?.id;
    const [data, setData] = useState([]);
    const [modalBackdrop, setModalBackdrop] = useState(false);
    const [editSetting, setEditSetting] = useState(null);
    const [selectedSettingId, setSelectedSettingId] = useState(null);
    const validationSchema = Yup.object().shape({
        settingValue: Yup.string().required('Value is required'),
    });

    const formik = useFormik({
        initialValues: {
            id: '',
            settingKey: '',
            settingValue: '',
            description: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setIsUpdating(true);
                const data = {
                    id: selectedSettingId,
                    settingValue: values.settingValue.trim(),
                    description: values.description.trim(),
                    departmentId:departmentId
                };

                let response;
                if (selectedSettingId) {
                    response = await axiosInstance.put(`userService/setting/update`, { data });
                    // console.log('Update Response:', response);
                } else {
                    response = await axiosInstance.post(`userService/setting/create`, { data });
                    // console.log('Create Response:', response);
                }

                if (response && response.data.success) {
                    fetchSettings();
                    setModalBackdrop(false);
                    formik.resetForm();
                    setIsUpdating(false);
                    // toast.success(selectedSettingId ? "Setting updated successfully." : "Setting created successfully.");
                } else {
                    setIsUpdating(false);
                    // toast.error("Something went wrong. Please check info and try again");
                }
            } catch (error) {
                setIsUpdating(false);
                console.log('Error:', error.response ? error.response.data : error.message);
                if (error.response) {
                    console.log('Error status:', error.response.status);
                    console.log('Error headers:', error.response.headers);
                }
                toast.error(error.response?.data?.message || "An error occurred. Please try again.");
            }
        },
    });

    const userPermissionsEncryptData = localStorage.getItem("userPermissions");
    const userPermissionsDecryptData = userPermissionsEncryptData
      ? decrypt({ data: userPermissionsEncryptData })
      : { data: [] };
    const EventPermissions =
      userPermissionsDecryptData &&
      userPermissionsDecryptData?.data?.find(
        (module) => module.slug === "generalsetting"
      );
    const viewPermissions = EventPermissions
      ? hasViewPermission(EventPermissions)
      : false;
    const createPermission = EventPermissions
      ? hasCreatePermission(EventPermissions)
      : false;
    const editPermission = EventPermissions
      ? hasEditPermission(EventPermissions)
      : false;
   

    const togBackdrop = () => {
        setModalBackdrop(!modalBackdrop);
    }

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.post(`userService/setting/get`, {});
            if (response) {
                setData(response.data.data);
                setLoading(false)
            }
        } catch (error) {
            setLoading(false)
            console.log('Error fetching settings:', error);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleEditIconClick = (setting) => {
        // console.log(setting.id)
        setSelectedSettingId(setting.id);
        formik.setValues({
            settingKey: setting.settingKey,
            settingValue: setting.settingValue,
            description: setting.description
        });
        togBackdrop();
        setModalBackdrop(true)
    };


    const handleClose = () => {
        setModalBackdrop(false);
        setEditSetting(null);
    };

    document.title = "Settings | eGov Solution";

    return (
        <>
            <div id="layout-wrapper">
                <div className="main-content">
                    <div className="page-content">
                        <div className="container-fluid">
                            <div className="row align-items-center mb-4">

                                <div className="col-6">
                                    <div className="page-title-box header-title d-sm-flex align-items-center justify-content-between pt-lg-4 pt-3">
                                        <h4 className="mb-sm-0">Settings</h4>
                                    </div>
                                </div>
                                {/* <div className="col-6 d-flex justify-content-end">
                                    <button
                                        title="Add Settings"
                                        className="btn btn-primary fs-14 mb-3"
                                        onClick={togBackdrop}>
                                        Add Setting
                                    </button>
                                </div> */}

                            </div>
                            <div className='row'>
                                <div className="col-12 ">
                                    <div className="card">
                                        <div className="card-body p-4">
                                            <div className="notify"></div>

                                           {
                                            loading ? (
                                                <LoaderSpin height={"500px"}/>
                                            ) : data.length === 0 ? (
                                                <NotFound heading="No Settings Found" message="Unfortunately, settings not available at the moment."/>
                                            ) : ( <form>
                                                <div className="row mt-3" >
                                                    {data.map((setting) => (
                                                        <div key={setting.id} className="col-md-6 mb-3">
                                                            <div className="cm-floating">
                                                                <label htmlFor={`setting_${setting.id}`} name={setting.settingKeyName} className="form-label">
                                                                    {setting.settingKeyName}
                                                                </label>
                                                                <div className="input-group">
                                                                    <input className="form-control"
                                                                        id={`setting_${setting.id}`}
                                                                        autoComplete="off"
                                                                        name={setting.settingKey}
                                                                        type="text"
                                                                        value={setting.settingValue}
                                                                        disabled aria-describedby="button-addon2" />
                                                                        {editPermission &&
                                                                      <button onClick={() => handleEditIconClick(setting)} className="btn btn-primary" type="button" id="button-addon2"><i
                                                                        role="button"
                                                                        title="Edit"
                                                                        className="fs-18 ri-pencil-line "
                                                                        
                                                                      ></i></button>}
                                                                </div>

                                                            </div>
                                                        </div>

                                                    ))}
                                                </div>
                                            </form>
                                            )
                                           }

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <SettingModal
                loading={isUpdating}
                togBackdrop={togBackdrop}
                modalBackdrop={modalBackdrop}
                setmodalBackdrop={setModalBackdrop}
                handleClose={handleClose}
                formik={formik}
                selectedSettingId={selectedSettingId}
            />
        </>
    );
};

export default Settings;
