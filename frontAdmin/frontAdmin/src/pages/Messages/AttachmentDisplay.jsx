import React from 'react';
import { FaFile, FaImage, FaVideo, FaMusic } from 'react-icons/fa';

const AttachmentDisplay = ({ attachmentPath, attachmentType, viewDocumentName }) => {
  const getIcon = () => {
    if (attachmentType.startsWith('image/')) {
      return <FaImage />;
    } else if (attachmentType.startsWith('video/')) {
      return <FaVideo />;
    } else if (attachmentType.startsWith('audio/')) {
      return <FaMusic />;
    } else {
      return <FaFile />;
    }
  };

  return (
    <div className="attachment-display">
      {attachmentType.startsWith('image/') ? (
        <>
        <img src={attachmentPath} alt={viewDocumentName} style={{maxWidth: '100%', height: 'auto'}} />
        <p>{viewDocumentName}</p>
        </>
      ) : (
        <a href={attachmentPath} target="_blank" rel="noopener noreferrer" className="attachment-link">
          {getIcon()}
          <span>{viewDocumentName}</span>
        </a>
      )}
    </div>
  );
};

export default AttachmentDisplay;