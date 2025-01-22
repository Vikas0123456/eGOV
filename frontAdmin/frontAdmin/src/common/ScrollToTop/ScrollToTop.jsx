import React, { useEffect } from "react";
import { Button } from "react-bootstrap";

const ScrollToTop = () => {
    useEffect(() => {
        const scrollFunction = () => {
            const element = document.getElementById("back-to-top");
            if (element) {
                if (
                    document.body.scrollTop > 100 ||
                    document.documentElement.scrollTop > 100
                ) {
                    element.style.display = "block";
                } else {
                    element.style.display = "none";
                }
            }
        };

        window.onscroll = scrollFunction;
        return () => {
            window.onscroll = null;
        };
    }, []);

    const toTop = () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    };

    return (
        <Button onClick={() => toTop()} id="back-to-top">
            <i className="ri-arrow-up-line fs-10"></i>
        </Button>
    );
};

export default ScrollToTop;
