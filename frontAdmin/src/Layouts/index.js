import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import withRouter from "../Components/Common/withRouter";

//import Components
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import RightSidebar from "../Components/Common/RightSidebar";

//import actions
import {
    changeLayout,
    changeSidebarTheme,
    changeLayoutMode,
    changeLayoutWidth,
    changeLayoutPosition,
    changeTopbarTheme,
    changeLeftsidebarSizeType,
    changeLeftsidebarViewType,
    changeSidebarVisibility,
} from "../slices/thunks";

//redux
import { useSelector, useDispatch } from "react-redux";
import { createSelector } from "reselect";
import SystemSupport from "../pages/Support/SystemSupport";

const Layout = (props) => {
    const [headerClass, setHeaderClass] = useState("");
    const dispatch = useDispatch();

    const [supportModalOpen, setSupportModalOpen] = useState(false);
    const toggleSupportModal = () => {
        setSupportModalOpen(!supportModalOpen);
    };

    const selectLayoutState = (state) => state.Layout;
    const selectLayoutProperties = createSelector(
        selectLayoutState,
        (layout) => ({
            layoutType: layout.layoutType,
            leftSidebarType: layout.leftSidebarType,
            layoutModeType: layout.layoutModeType,
            layoutWidthType: layout.layoutWidthType,
            layoutPositionType: layout.layoutPositionType,
            topbarThemeType: layout.topbarThemeType,
            leftsidbarSizeType: layout.leftsidbarSizeType,
            leftSidebarViewType: layout.leftSidebarViewType,
            leftSidebarImageType: layout.leftSidebarImageType,
            preloader: layout.preloader,
            sidebarVisibilitytype: layout.sidebarVisibilitytype,
        })
    );
    // Inside your component
    const {
        layoutType,
        leftSidebarType,
        layoutModeType,
        layoutWidthType,
        layoutPositionType,
        topbarThemeType,
        leftsidbarSizeType,
        leftSidebarViewType,
        leftSidebarImageType,
        preloader,
        sidebarVisibilitytype,
    } = useSelector(selectLayoutProperties);
    // class add remove in header
    useEffect(() => {
        window.addEventListener("scroll", scrollNavigation, true);
    });
    function scrollNavigation() {
        var scrollup = document.documentElement.scrollTop;
        if (scrollup > 50) {
            setHeaderClass("topbar-shadow");
        } else {
            setHeaderClass("");
        }
    }
    /*
    layout settings
    */
    useEffect(() => {
        if (
            layoutType ||
            leftSidebarType ||
            layoutModeType ||
            layoutWidthType ||
            layoutPositionType ||
            topbarThemeType ||
            leftsidbarSizeType ||
            leftSidebarViewType ||
            sidebarVisibilitytype
        ) {
            window.dispatchEvent(new Event("resize"));
            dispatch(changeLeftsidebarViewType(leftSidebarViewType));
            dispatch(changeLeftsidebarSizeType(leftsidbarSizeType));
            dispatch(changeSidebarTheme(leftSidebarType));
            dispatch(changeLayoutMode(layoutModeType));
            dispatch(changeLayoutWidth(layoutWidthType));
            dispatch(changeLayoutPosition(layoutPositionType));
            dispatch(changeTopbarTheme(topbarThemeType));
            dispatch(changeLayout(layoutType));
            dispatch(changeSidebarVisibility(sidebarVisibilitytype));
        }
    }, [
        layoutType,
        leftSidebarType,
        layoutModeType,
        layoutWidthType,
        layoutPositionType,
        topbarThemeType,
        leftsidbarSizeType,
        leftSidebarViewType,
        sidebarVisibilitytype,
        dispatch,
    ]);
    /*
    call dark/light mode
    */
    const onChangeLayoutMode = (value) => {
        if (changeLayoutMode) {
            dispatch(changeLayoutMode(value));
        }
    };

    useEffect(() => {
        if (
            sidebarVisibilitytype === "show" ||
            layoutType === "vertical" ||
            layoutType === "twocolumn"
        ) {
            document.querySelector(".hamburger-icon")?.classList.remove("open");
        } else {
            document.querySelector(".hamburger-icon")?.classList.add("open");
        }
    }, [sidebarVisibilitytype, layoutType]);

    return (
        <React.Fragment>
            <div id="layout-wrapper">
                <Header />
                <Sidebar />
                <div className="main-content">
                    {props.children}
                    <Footer />
                </div>
            </div>
            {/* <RightSidebar /> */}
            <div>
                <div id="chat-button" onClick={() => setSupportModalOpen(true)}>
                    <button
                        type="button"
                        id="button-body"
                        aria-label="Open chat widget"
                        title="App Store">
                        <i className="material-icons type1 for-closed active">
                            <svg
                                version="1.1"
                                viewBox="0 0 800 800"
                                className="tawk-min-chat-icon">
                                <path
                                    fill="#fff"
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M400 26.2c-193.3 0-350 156.7-350 350 0 136.2 77.9 254.3 191.5 312.1 15.4 8.1 31.4 15.1 48.1 20.8l-16.5 63.5c-2 7.8 5.4 14.7 13 12.1l229.8-77.6c14.6-5.3 28.8-11.6 42.4-18.7C672 630.6 750 512.5 750 376.2c0-193.3-156.7-350-350-350zm211.1 510.7c-10.8 26.5-41.9 77.2-121.5 77.2-79.9 0-110.9-51-121.6-77.4-2.8-6.8 5-13.4 13.8-11.8 76.2 13.7 147.7 13 215.3.3 8.9-1.8 16.8 4.8 14 11.7z"></path>
                            </svg>
                        </i>
                    </button>
                </div>
            </div>
            <SystemSupport
                open={supportModalOpen}
                toggleSupportModal={toggleSupportModal}
                setSupportModalOpen={setSupportModalOpen}
            />
        </React.Fragment>
    );
};

Layout.propTypes = {
    children: PropTypes.object,
};

export default withRouter(Layout);
