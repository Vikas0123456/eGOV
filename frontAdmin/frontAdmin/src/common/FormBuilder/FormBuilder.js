import React, { useCallback, useEffect, useState, useRef } from "react";
import $, { data } from "jquery";
import Loader from "../Loader/Loader";
window.jQuery = $;
window.$ = $;

const FormBuilder = ({
    prefilledData,
    fb,
    handleSaveSingleForm,
    viewPermissions,
    createPermission,
    editPermission,
}) => {
    const [isGridEnabled] = useState(true);
    const [isBootstrapEnabled] = useState(true);
    const [loading, setLoading] = useState(true);
    // const formBuilderContainer = useRef(null);
    const options = {
        disableFields: ["AutoComplete"],
        typeUserAttrs: {
            "*": {
                w: {
                    label: "w",
                    type: "text",
                    options: {
                        250: "xs",
                        360: "sm",
                        576: "md",
                        768: "lg",
                        992: "xl",
                        1200: "xxl",
                        1400: "xxxl",
                    },
                },
                validationMessage: {
                    label: "Validation Message",
                    type: "text",
                    value: "",
                },
            },
        },
    };

    // Add Bootstrap CSS
    // useEffect(() => {
    //     if (isBootstrapEnabled) {
    //         const bootstrapLink = document.createElement("link");
    //         bootstrapLink.id = "bootstrap-css";
    //         bootstrapLink.rel = "stylesheet";
    //         bootstrapLink.href =
    //             "https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css";
    //         fb.current.appendChild(bootstrapLink);
    //     } else {
    //         const bootstrapLink = document.getElementById("bootstrap-css");
    //         if (bootstrapLink) {
    //             bootstrapLink.remove();
    //         }
    //     }
    // }, [isBootstrapEnabled]);

    useEffect(() => {
        setLoading(true);
        // Initialize formBuilder with default data if no saved data exists
        const formData = prefilledData?.formData;
        const formBuilderOptions = {
            formData: formData,
            typeUserAttrs: options.typeUserAttrs,
            enableEnhancedBootstrapGrid: isGridEnabled,
        };
        if (
            (prefilledData?.id && editPermission) ||
            (!prefilledData?.id && createPermission)
        ) {
            $(fb.current).formBuilder(formBuilderOptions);
        } else {
            $(fb.current).formBuilder({
                ...formBuilderOptions,
                disableFields: [
                    "text",
                    "textarea",
                    "select",
                    "radio-group",
                    "checkbox-group",
                    "button",
                    "date",
                    "autocomplete",
                    "file",
                    "number",
                    "header",
                    "paragraph",
                    "hidden",
                ],
                showActionButtons: false,
            });
            $(fb.current).find(".checkbox-group, .radio-group").remove();
        }

        $(fb.current).on("fb:loaded", function() {
            setLoading(false);
        });
        // $(fb.current).formBuilder({
        //     formData: formData,
        //     typeUserAttrs: options.typeUserAttrs,
        //     enableEnhancedBootstrapGrid: isGridEnabled,
        // });

        $(fb.current).on("click", function (event) {
            const target = event.target;

            if (target.classList.contains("clear-all")) {
                // Handle the "Clear" button click
                $(fb.current).formBuilder("clearFields");
                // console.log("Clear button clicked");
            } else if (target.classList.contains("save-template")) {
                // console.log("Save button clicked");
                handleSaveSingleForm();
            }
        });

        const timeoutId = setTimeout(() => {
            setLoading(false);
        }, 1000);
    
        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <Loader isLoading={loading}>
            <div>
                <div id="fb-editor" ref={fb} />
            </div>
        </Loader>
    );
};

export default FormBuilder;
