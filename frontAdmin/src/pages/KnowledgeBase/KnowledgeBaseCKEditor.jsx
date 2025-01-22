import { useState, useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import "ckeditor5/ckeditor5.css";

import {
  ClassicEditor,
  Alignment,
  Bold,
  Italic,
  Link,
  List,
  BlockQuote,
  Undo,
  Essentials,
  Paragraph,
  FontSize,
} from "ckeditor5";

const KnowledgeBaseCKEditor = ({ value, onChange, onBlur, placeholder }) => {
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editorRef.current && !editorRef.current.contains(event.target)) {
        onBlur(value);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [value, onBlur]);

  const editorConfig = {
    toolbar: {
      items: [
        "bold",
        "italic",
        "link",
        "alignment:left",
        "alignment:center",
        "alignment:right",
        "bulletedList",
        "numberedList",
        "blockQuote",
        "undo",
        "redo",
        "|",
        "fontSize",
      ],
      shouldNotGroupWhenFull: true,
    },
    plugins: [
      Essentials,
      Alignment,
      Bold,
      Italic,
      Link,
      List,
      BlockQuote,
      Undo,
      Paragraph,
      FontSize,
    ],
    alignment: {
      options: ["left", "center", "right"],
    },
    placeholder: placeholder,
  };

  return (
    <div>
      <div className="main-container">
        <div
          className="editor-container editor-container_classic-editor editor-container_include-style editor-container_include-block-toolbar"
          ref={editorContainerRef}
          style={{
            width: "100%",
            border: "dashed 1px green",
            margin: "auto",
            display: "block",
          }}
        >
          <div className="editor-container__editor">
            <div ref={editorRef}>
              {isLayoutReady && (
                <CKEditor
                  editor={ClassicEditor}
                  data={value}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    onChange(data);
                  }}
                  onBlur={(event, editor) => {
                    const data = editor.getData();
                    onBlur(data);
                  }}
                  config={editorConfig}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseCKEditor;
