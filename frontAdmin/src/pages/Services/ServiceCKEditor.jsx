import { useState, useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import "ckeditor5/ckeditor5.css";
import {
  ClassicEditor,
  Essentials,
  Bold,
  Italic,
  Underline,
  Paragraph,
  Table,
  TableToolbar,
  RemoveFormat,
  Undo,
  HtmlEmbed,
} from "ckeditor5";

export default function CKEditorModelTemplate({ data, onChange, onBlur, disabled }) {
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  // Function to clean the pasted content
  const cleanPastedContent = (editor) => {
    editor.plugins.get("Clipboard").on("inputTransformation", (evt, data) => {
      const viewFragment = data.content; // This is the pasted content in view format
      editor.model.change((writer) => {
        // Clean up the pasted content
        const walker = viewFragment.getWalker();
        for (const node of walker) {
          if (node.item.is("element")) {
            // Remove style attributes from each element
            writer.removeAttribute("style", node.item);
          }
        }
      });
    });
  };

  const editorConfig = {
    plugins: [
      Essentials,
      Bold,
      Italic,
      Underline,
      Paragraph,
      Table,
      TableToolbar,
      RemoveFormat,
      Undo,
      HtmlEmbed,
    ],
    toolbar: [
      "bold",
      "italic",
      "underline",
      "|",
      "undo",
      "redo",
      "|",
      "insertTable",
      "|",
      "removeFormat",
      "|",
      'htmlEmbed',
    ],
    table: {
      contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
    },
    disallowedContent: "*{*}", // Disallow all inline styles
    allowedContent: "p h1 h2 h3 strong em ul ol li table tr th td",
  };

  return (
    <div>
      <div className="main-container">
        <div
          ref={editorContainerRef}
        >
          <div >
            <div ref={editorRef}>
              {isLayoutReady && (
                <CKEditor
                  data={data}
                  editor={ClassicEditor}
                  config={editorConfig}
                  onReady={(editor) => {
                    // Add the paste event listener when editor is ready
                    cleanPastedContent(editor);
                  }}
                  onChange={(event, editor) =>
                    onChange(event, editor.getData())
                  }
                  onBlur={onBlur}
                  disabled={disabled}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
