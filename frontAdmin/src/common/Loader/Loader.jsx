import React, { useState, useEffect } from 'react';
import './Loader.css';

const Loader = ({ isLoading, children }) => {
    // const [showLoader, setShowLoader] = useState(false);

    // useEffect(() => {
    //     let timer;
    //     if (isLoading) {
    //         setShowLoader(true);
    //     } else {
    //         timer = setTimeout(() => {
    //             setShowLoader(false);
    //         }, 300);
    //     }
    //     return () => clearTimeout(timer);
    // }, [isLoading]);

    return (
        <>
            {isLoading && (
                <div className="loader-overlay">
                    <div className="loader"></div>
                </div>
            )}
            {children}
        </>
    );
};

export const LoaderSpin = ({height}) => {
    return (
        <div className="loader-overlay-simple" style={{height: height ? height : "150px"}}>
            <div className="loader2">
            <div></div>
            <div></div>
            </div>
        </div>
    );
};



export default Loader;
