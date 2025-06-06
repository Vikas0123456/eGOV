import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoaderSpin } from "../common/Loader/Loader";
const Spinner = ({ path = "" }) => {
  const [count, setCount] = useState(2);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevValue) => --prevValue);
    }, 400);
    count === 0 &&
      navigate(`/${path}`, {
        state: location.pathname,
      });
    return () => clearInterval(interval);
  }, [count, navigate, location, path]);

  return (
    <>
     
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: "100vh" }} >
         <LoaderSpin/>
          {/* <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div> */}
      </div>
    </>
  );
};

export default Spinner;
