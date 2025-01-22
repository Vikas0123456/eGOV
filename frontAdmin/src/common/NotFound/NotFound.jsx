import React from "react";
import errorImage from "../../assets/images/error.gif";

const NotFound = ({ heading, message }) => {
    return (
        <div className="col-md-6 mx-auto text-center my-4">
            <div className="error_image">
                <img src={errorImage} alt="Error Image" />
            </div>
            <h5 className="lh-base mb-0">{heading || "data not found."}</h5>
            <p className="text-muted">
                {message || "Unfortunately, data not available at the moment."}
            </p>
        </div>
    );
};

export default NotFound;
