import React, { useEffect, useState } from "react";

const networkStatus = () => {
    const [isOnline, setOnline] = useState(true);

    const updateNetworkStatus = () => {
        setOnline(navigator.onLine);
    };

    useEffect(() => {
        window.addEventListener("load", updateNetworkStatus);
        window.addEventListener("online", updateNetworkStatus);
        window.addEventListener("offline", updateNetworkStatus);

        return () => {
            window.removeEventListener("load", updateNetworkStatus);
            window.removeEventListener("online", updateNetworkStatus);
            window.removeEventListener("offline", updateNetworkStatus);
        };
    }, [navigator.onLine]);

    return isOnline;
};

export default networkStatus;
