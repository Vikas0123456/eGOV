import React, { useEffect, useCallback, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import {
  FaHeading,
  FaParagraph,
  FaImage,
  FaCode,
  FaVideo,
  FaMinus,
  FaTrash,
} from "react-icons/fa";
import { RxDragHandleDots2 } from "react-icons/rx";
import { RiQrScanFill } from "react-icons/ri";
import { RiDeleteBin6Line } from "react-icons/ri";
import CKEditorComponent from "./KnowledgeBaseCKEditor";
import useAxios from "../../utils/hook/useAxios";

const CustomButtons = ({ formik, knowledgeBaseData }) => {
  const axiosInstance = useAxios()
  const [imageFile, setImageFile] = useState(null);
  const [items, setItems] = useState([]);
  const [showButtonsLists, setShowButtonsLists] = useState([
    { id: 1, isShow: true },
  ]);
  const [videoFile, setVideoFile] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    if (knowledgeBaseData?.block) {
      const parsedBlock = JSON.parse(knowledgeBaseData.block);
      formik.setFieldValue("block", parsedBlock);
      const newButtons = parsedBlock.map((item, index) => ({
        id: index,
        isShow: false,
      }));
      setShowButtonsLists(newButtons);
    }
  }, []);

  const handleHeaderBlur = (index) => {};
  const handleParagraphBlur = (index) => {};
  const handleCodeBlur = (index) => {};

  const handleDividerClick = (index) => {
    addDivider(index);
  };

  // const deleteInputFields = (deleteId) => {
  //   const currentBlocks = formik.values.block;
    
  //   const updatedBlocks = currentBlocks.filter(
  //     (block, index) => block.id !== deleteId
  //   );
  //   formik.setFieldValue("block", updatedBlocks);
  // };

  const deleteInputFields = async (deleteId) => {
    const currentBlocks = formik.values.block;

    const blockToDelete = currentBlocks.find(block => block.id === deleteId);

    if (blockToDelete && (blockToDelete.type === 'image' || blockToDelete.type === 'video')) {
      try {
        const srcMatch = blockToDelete.content.match(/src="([^"]+)"/);
        const documentName = srcMatch ? srcMatch[1].split('/').pop() : null;

        await axiosInstance.post(
          `documentService/document/delete`,
          {
            documentName: documentName,
          }
        );

      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }

    const updatedBlocks = currentBlocks.filter(block => block.id !== deleteId);
    formik.setFieldValue("block", updatedBlocks);
  };

  const handleHeaderTextChange = (index, newText) => {
    const updatedInputs = [...formik.values.block];
    updatedInputs[index] = {
      ...updatedInputs[index],
      content: newText,
    };
    formik.setFieldValue("block", updatedInputs);
  };

  const handleParagraphTextChange = (index, newText) => {
    const updatedInputs = [...formik.values.block];
    updatedInputs[index] = {
      ...updatedInputs[index],
      content: newText,
    };
    formik.setFieldValue("block", updatedInputs);
  };

  const handleCodeTextChange = (index, newText) => {
    const updatedInputs = [...formik.values.block];
    updatedInputs[index] = {
      ...updatedInputs[index],
      content: newText,
    };
    formik.setFieldValue("block", updatedInputs);
  };

  const toggleHeaderInput = (index) => {
    const newShowButtonsLists = showButtonsLists.map((item, idx) => {
      if (idx === index) {
        return { ...item, isShow: false };
      }
      return item;
    });
    setShowButtonsLists(newShowButtonsLists);

    const newItem = {
      id: uuidv4(),
      type: "header",
      content: "",
      headerShow: true,
    };

    const updatedInputs = [...formik.values.block, newItem];

    formik.setFieldValue("block", updatedInputs);
    setEditingIndex(index);
  };

  const toggleParagraphInput = (index) => {
    const newShowButtonsLists = showButtonsLists.map((item, idx) => {
      if (idx === index) {
        return { ...item, isShow: false };
      }
      return item;
    });
    setShowButtonsLists(newShowButtonsLists);

    const newItem = {
      id: uuidv4(),
      type: "paragraph",
      content: "",
      paragraphShow: true,
    };

    const updatedInputs = [...formik.values.block, newItem];

    formik.setFieldValue("block", updatedInputs);
    setEditingIndex(index);
  };

  const toggleImageInput = (index) => {
    const newShowButtonsLists = showButtonsLists.map((item, idx) => {
      if (idx === index) {
        return { ...item, isShow: false };
      }
      return item;
    });
    setShowButtonsLists(newShowButtonsLists);

    const newItem = {
      id: uuidv4(),
      type: "image",
      content: "",
      imageShow: true,
    };

    const updatedInputs = [...formik.values.block, newItem];

    formik.setFieldValue("block", updatedInputs);
    setEditingIndex(index);
  };

  const toggleCodeInput = (index) => {
    const newShowButtonsLists = showButtonsLists.map((item, idx) => {
      if (idx === index) {
        return { ...item, isShow: false };
      }
      return item;
    });
    setShowButtonsLists(newShowButtonsLists);

    const newItem = {
      id: uuidv4(),
      type: "code",
      content: "",
      codeShow: true,
    };

    const updatedInputs = [...formik.values.block, newItem];

    formik.setFieldValue("block", updatedInputs);
    setEditingIndex(index);
  };

  const toggleVideoInput = (index) => {
    const newShowButtonsLists = showButtonsLists.map((item, idx) => {
      if (idx === index) {
        return { ...item, isShow: false };
      }
      return item;
    });
    setShowButtonsLists(newShowButtonsLists);

    const newItem = {
      id: uuidv4(),
      type: "video",
      content: "",
      videoShow: true,
    };

    const updatedInputs = [...formik.values.block, newItem];

    formik.setFieldValue("block", updatedInputs);
    setEditingIndex(index);
  };

  const addVideo = (videoFile, index) => {
    if (videoFile) {
      const updatedInputs = [...formik.values.block];
      const videoUrl = URL.createObjectURL(videoFile);

      updatedInputs[index] = {
        ...updatedInputs[index],
        content: `<video controls className="text-center editable"><source src="${videoUrl}" type="${videoFile.type}" /></video>`,
        isBlob: true,
        videoShow: true,
      };
      formik.setFieldValue("block", updatedInputs);
    }
  };

  const addImage = (imageFile, index) => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target.result;
        const updatedInputs = [...formik.values.block];
        updatedInputs[index] = {
          ...updatedInputs[index],
          content: `<div className="text-center"><img src="${base64Image}" alt="Uploaded" className="editable" /></div>`,
          imageShow: true,
        };
        formik.setFieldValue("block", updatedInputs);
      };
      reader.readAsDataURL(imageFile);
    }
  };

  // const addVideo = (videoFile, index) => {
  //   if (videoFile) {
  //     const reader = new FileReader();
  //     reader.onload = (event) => {
  //       const base64Video = event.target.result;
  //       const updatedInputs = [...formik.values.block];
  //       updatedInputs[index] = {
  //         ...updatedInputs[index],
  //         content: `<video controls className="text-center editable"><source src="${base64Video}" type=${videoFile.type} /></video>`,
  //         videoShow: true,
  //       };
  //       formik.setFieldValue("block", updatedInputs);
  //     };
  //     reader.readAsDataURL(videoFile);
  //   }
  // };

  const addDivider = (index) => {
    const newShowButtonsLists = showButtonsLists.map((item, idx) => {
      if (idx === index) {
        return { ...item, isShow: false };
      }
      return item;
    });
    setShowButtonsLists(newShowButtonsLists);
    const newItem = {
      id: uuidv4(),
      type: "divider",
      content: `<hr />`,
      dividerShow: true,
    };
    const updatedInputs = [...formik.values.block, newItem];
    formik.setFieldValue("block", updatedInputs);
  };

  const deleteItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
    formik.setFieldValue("block", newItems);
  };

  const hideButtonsList = (index) => {
    const newShowButtonsLists = [...showButtonsLists];
    newShowButtonsLists.splice(index, 1);
    setShowButtonsLists(newShowButtonsLists);
  };

  const addNewShowButtonsList = () => {
    setShowButtonsLists((prevList) => {
      const lastItem = prevList[prevList.length - 1];
      const lastId = lastItem ? lastItem.id : 0;
      const newId = lastId + 1;
      const newItem = { id: newId, isShow: true };
      return [...prevList, newItem];
    });
  };

  const handleChange = async (e, index) => {
    const { name, files } = e.target;

    if (files.length > 0) {
      const file = files[0];

      const allowedFormats = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'video/mp4', 'video/mpeg'];
      if (!allowedFormats.includes(file.type)) {
        alert('Invalid file format. Only JPEG, PNG, JPG, WEBP, MP4, and MPEG are allowed.');
        return;
      }

      const maxFileSize = 50 * 1024 * 1024;
      if (file.size > maxFileSize) {
        alert('File size exceeds the maximum allowed limit of 50MB.');
        return;
      }

      const formData = new FormData();
      formData.append('documentFile', file);

      try {
        const response = await axiosInstance.post(
          "documentService/uploading",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const fileUrl = response.data.data[0].documentPath;

        const updatedInputs = [...formik.values.block];
        if (name === 'image') {
          updatedInputs[index] = {
            ...updatedInputs[index],
            content: `<div className="text-center"><img src="${fileUrl}" alt="Uploaded" className="editable" /></div>`,
            imageShow: true,
          };
        } else if (name === 'video') {
          updatedInputs[index] = {
            ...updatedInputs[index],
            content: `<video controls className="text-center editable"><source src="${fileUrl}" type="${file.type}" /></video>`,
            videoShow: true,
          };
        }
        formik.setFieldValue('block', updatedInputs);
      } catch (error) {
        alert('File upload failed.');
        console.error(error);
      }
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(formik.values.block);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    formik.setFieldValue("block", items);
  };

  const renderItems = () => {
    return formik.values.block.map((item, index) => (
      <Draggable key={index} draggableId={`item-${index}`} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="position-relative mb-4 p-3 border rounded bg-light"
            // style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
          >
            <div title="Drag"
              className="drag-button"
              {...provided.dragHandleProps}
              style={{
                position: "absolute",
                
                cursor: "pointer",
                height: "22px",
                width:"22px",
                top: "10px",
                left: "50%",
                transform: "translate(-50%, -50%)",
                padding: "4px",
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                border:"1px solid #e9ebec",
                cursor:"grab",
              }}
            >
              <span style={{ cursor: "grab" }}>
                <RxDragHandleDots2 />
              </span>
            </div>
            <RiDeleteBin6Line title="Delete"
              onClick={() => deleteInputFields(formik.values.block[index].id)}
              style={{
                position: "absolute",
                right: 0,
                cursor: "pointer",
                height: "22px",
                width:"22px",
                top:"0",
                padding: "4px",
                borderRadius: "0 0 0 3px",
                borderLeft:"1px solid #e9ebec",
                borderBottom:"1px solid #e9ebec",
              }}
            />
            {formik.values.block[index].headerShow && (
              <div className="mt-3 text-center">
                <CKEditorComponent
                  value={formik.values.block[index]?.content}
                  onChange={(text) => handleHeaderTextChange(index, text)}
                  onBlur={() => handleHeaderBlur(index)}
                  placeholder="Enter header text"
                />
              </div>
            )}

            {formik.values.block[index].paragraphShow && (
              <div className="mt-3 text-center">
                <CKEditorComponent
                  value={formik.values.block[index]?.content}
                  onChange={(text) => handleParagraphTextChange(index, text)}
                  onBlur={() => handleParagraphBlur(index)}
                  placeholder="Enter paragraph text"
                />
              </div>
            )}

            {formik.values.block[index].codeShow && (
              <div className="mt-3">
                <CodeMirror
                  value={formik.values.block[index]?.content}
                  height="200px"
                  theme="light"
                  extensions={[javascript({ jsx: true })]}
                  onChange={(text) => handleCodeTextChange(index, text)}
                  onBlur={() => handleCodeBlur(index)}
                  placeholder="Enter code"
                  className="col-12"
                  style={{
                    width: "100%",  
                    margin: "auto",
                    display: "block",
                  }}
                />
              </div>
            )}

            {formik.values.block[index].imageShow && (
              <div className="mt-3 text-center img-upload">
                <input
                  type="file" className="form-control"
                  accept="image/*"
                  onChange={(e) => handleChange(e, index)}
                  name="image"
                  style={{
                    margin: "auto",
                    display: "block",
                  }}
                />
                {formik.values.block[index]?.content && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formik.values.block[index].content,
                    }}
                  />
                )}
              </div>
            )}

            {formik.values.block[index].videoShow && (
              <div className="mt-3 text-center video-upload">
                <input
                  type="file" className="form-control"
                  accept="video/*"
                  onChange={(e) => handleChange(e, index)}
                  name="video"
                  style={{
                    margin: "auto",
                    display: "block",
                    
                  }}
                />
                {formik.values.block[index]?.content && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formik.values.block[index].content,
                    }}
                  />
                )}
              </div>
            )}

            {formik.values.block[index].dividerShow && (
              <div
                className="mt-3 text-center"
                dangerouslySetInnerHTML={{
                  __html: formik.values.block[index].content,
                }}
              />
            )}
          </div>
        )}
      </Draggable>
    ));
  };

  return (
    <div className="col-12">
      <div className="card addElementerBlock mb-0 border-0 p-0">
        <div className="">
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {renderItems()}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {showButtonsLists.map((showButtonsList, index) => (
            <React.Fragment key={index}>
              {showButtonsList.isShow && (
                <div className="row justify-content-around elements-box">
                  <div className="col-12">
                    <div className="card addElementerBlock mb-0 p-0 form-control">
                      <div className="card-body">
                      <RiDeleteBin6Line title="Delete"
                        onClick={() => hideButtonsList(index)}
                        style={{
                          position: "absolute",
                          right: 0,
                          cursor: "pointer",
                          height: "22px",
                          width:"22px",
                          top:"0",
                          padding: "4px",
                          borderRadius: "0 0 0 3px",
                          borderLeft:"1px solid #e9ebec",
                          borderBottom:"1px solid #e9ebec",

                        }}
                      />
                      <div className="row justify-content-around g-4">
                        <div className="col-auto text-center">
                          <div
                            className="headerSectionBlock addblock cursor-pointer"
                            onClick={() => toggleHeaderInput(index)}
                          >
                            <div className="icon mb-2">
                              <FaHeading />
                            </div>
                            <div className="text">Header</div>
                          </div>
                        </div>
                        <div className="col-auto text-center">
                          <div
                            className="paragraphSectionBlock addblock cursor-pointer"
                            onClick={() => toggleParagraphInput(index)}
                          >
                            <div className="icon mb-2">
                              <FaParagraph />
                            </div>
                            <div className="text">Paragraph</div>
                          </div>
                        </div>
                        <div className="col-auto text-center">
                          <div
                            className="imageSectionBlock addblock cursor-pointer"
                            onClick={() => toggleImageInput(index)}
                          >
                            <div className="icon mb-2">
                              <FaImage />
                            </div>
                            <div className="text">Image</div>
                          </div>
                        </div>
                        <div className="col-auto text-center">
                          <div
                            className="codeSectionBlock addblock cursor-pointer"
                            onClick={() => toggleCodeInput(index)}
                          >
                            <div className="icon mb-2">
                              <FaCode />
                            </div>
                            <div className="text">Code</div>
                          </div>
                        </div>
                        <div className="col-auto text-center">
                          <div
                            className="videoSectionBlock addblock cursor-pointer"
                            onClick={() => toggleVideoInput(index)}
                          >
                            <div className="icon mb-2">
                              <FaVideo />
                            </div>
                            <div className="text">Video</div>
                          </div>
                        </div>
                        <div className="col-auto text-center">
                          <div
                            className="dividerSectionBlock addblock cursor-pointer"
                            onClick={() => handleDividerClick(index)}
                          >
                            <div className="icon mb-2">
                              <RiQrScanFill />
                            </div>
                            <div className="title">Divider</div>
                          </div>
                        </div>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}

          <div
            className="col-12 d-flex align-items-center justify-content-center mt-4 addElementer"
          >
            <button
              type="button"
              className="btn btn-soft-primary p-0 d-flex align-items-center justify-content-center plusElementer fs-18"
            >
              <i className="ri-add-line" onClick={() => addNewShowButtonsList()}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomButtons;
