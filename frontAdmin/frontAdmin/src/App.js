import React from "react";
// import { UnseenMessageProvider } from './common/context/UnseenMessageContext';
//imoprt Routecommon
import Route from "./Routes";
import { ToastContainer } from "react-toastify";

function App() {
    return (
        <React.Fragment>
            <Route />
            <ToastContainer
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </React.Fragment>
    );
}

export default App;
