import React, { useState } from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const Filepond = ({ onFilesUpdate, name }) => {
    const [files, setFiles] = useState([]);

    const handleUpdateFiles = (fileItems) => {
        setFiles(fileItems);
        const selectedFiles = fileItems.map((fileItem) => fileItem.file);
        if (onFilesUpdate) {
            onFilesUpdate(selectedFiles);
        }
    };

    return (
        <FilePond
            files={files}
            onupdatefiles={handleUpdateFiles}
            allowMultiple={false}
            name={name}
            className="filepond filepond-input-circle"
            stylePanelAspectRatio="1:1"
            stylePanelLayout="circle"
            styleButtonRemoveItemPosition="bottom"
            styleLoadIndicatorPosition="center"
        />
    );
};

export default Filepond;
