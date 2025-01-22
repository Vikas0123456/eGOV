import { useState, useEffect, useRef } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import "ckeditor5/ckeditor5.css";
import useAxios from "../../utils/hook/useAxios";
import {
  ClassicEditor,
  AccessibilityHelp,
  Alignment,
  AutoImage,
  AutoLink,
  Autosave,
  BalloonToolbar,
  BlockQuote,
  BlockToolbar,
  Bold,
  CloudServices,
  Code,
  CodeBlock,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  ImageBlock,
  ImageInsertViaUrl,
  ImageToolbar,
  ImageUpload,
  MediaEmbed,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  Paragraph,
  RemoveFormat,
  SelectAll,
  ShowBlocks,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Style,
  Subscript,
  Superscript,
  Underline,
  Undo,
} from "ckeditor5";

export default function CKEditorModel({ data, onChange, onBlur, disabled }) {
  const axiosInstance = useAxios();
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    setIsLayoutReady(true);

    return () => setIsLayoutReady(false);
  }, []);

  class CustomUploadAdapter {
    constructor(loader) {
      this.loader = loader;
    }

    upload() {
      return this.loader.file.then((file) => {
        const maxFileSize = 50 * 1024 * 1024;
        if (file.size > maxFileSize) {
          alert('File size exceeds the maximum allowed limit of 50MB.');
          return;
        }

        const formData = new FormData();
        formData.append("documentFile", file);

        return axiosInstance
          .post("documentService/uploading", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((response) => {
            const fileUrl = response?.data?.data[0]?.documentPath;
            return { default: fileUrl };
          })
          .catch((error) => {
            console.error("Image upload failed:", error);
            return Promise.reject(error);
          });
      });
    }

    abort() { }
  }

  function CustomUploadAdapterPlugin(editor) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
      return new CustomUploadAdapter(loader);
    };
  }

  const editorConfig = {
    extraPlugins: [CustomUploadAdapterPlugin],
    toolbar: {
      items: [
        "undo",
        "redo",
        "|",
        "showBlocks",
        "selectAll",
        "|",
        "heading",
        "style",
        "|",
        "fontSize",
        "fontFamily",
        "fontColor",
        "fontBackgroundColor",
        "|",
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "subscript",
        "superscript",
        "code",
        "removeFormat",
        "|",
        "specialCharacters",
        "horizontalLine",
        "link",
        "highlight",
        "blockQuote",
        "codeBlock",
        "|",
        "alignment",
        "|",
        "bulletedList",
        "numberedList",
        "outdent",
        "indent",
        "|",
        "accessibilityHelp",
        "|",
        "imageUpload",
        "mediaEmbed",
      ],
      shouldNotGroupWhenFull: true,
    },
    plugins: [
      AccessibilityHelp,
      Alignment,
      AutoImage,
      AutoLink,
      Autosave,
      BalloonToolbar,
      BlockQuote,
      BlockToolbar,
      Bold,
      CloudServices,
      Code,
      CodeBlock,
      Essentials,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      GeneralHtmlSupport,
      Heading,
      Highlight,
      HorizontalLine,
      ImageBlock,
      ImageInsertViaUrl,
      ImageToolbar,
      ImageUpload,
      MediaEmbed,
      Indent,
      IndentBlock,
      Italic,
      Link,
      List,
      Paragraph,
      RemoveFormat,
      SelectAll,
      ShowBlocks,
      SpecialCharacters,
      SpecialCharactersArrows,
      SpecialCharactersCurrency,
      SpecialCharactersEssentials,
      SpecialCharactersLatin,
      SpecialCharactersMathematical,
      SpecialCharactersText,
      Strikethrough,
      Style,
      Subscript,
      Superscript,
      Underline,
      Undo,
    ],
    balloonToolbar: [
      "bold",
      "italic",
      "|",
      "link",
      "|",
      "bulletedList",
      "numberedList",
    ],
    blockToolbar: [
      "fontSize",
      "fontColor",
      "fontBackgroundColor",
      "|",
      "bold",
      "italic",
      "|",
      "link",
      "|",
      "bulletedList",
      "numberedList",
      "outdent",
      "indent",
    ],
    fontFamily: {
      supportAllValues: true,
    },
    fontSize: {
      options: [10, 12, 14, "default", 18, 20, 22],
      supportAllValues: true,
    },
    heading: {
      options: [
        {
          model: "paragraph",
          title: "Paragraph",
          class: "ck-heading_paragraph",
        },
        {
          model: "heading1",
          view: "h1",
          title: "Heading 1",
          class: "ck-heading_heading1",
        },
        {
          model: "heading2",
          view: "h2",
          title: "Heading 2",
          class: "ck-heading_heading2",
        },
        {
          model: "heading3",
          view: "h3",
          title: "Heading 3",
          class: "ck-heading_heading3",
        },
        {
          model: "heading4",
          view: "h4",
          title: "Heading 4",
          class: "ck-heading_heading4",
        },
        {
          model: "heading5",
          view: "h5",
          title: "Heading 5",
          class: "ck-heading_heading5",
        },
        {
          model: "heading6",
          view: "h6",
          title: "Heading 6",
          class: "ck-heading_heading6",
        },
      ],
    },
    htmlSupport: {
      allow: [
        {
          name: /^.*$/,
          styles: true,
          attributes: true,
          classes: true,
        },
      ],
    },
    image: {
      toolbar: ["imageTextAlternative"],
    },
    mediaEmbed: {
      previewsInData: true,
    },
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: "https://",
      decorators: {
        toggleDownloadable: {
          mode: "manual",
          label: "Downloadable",
          attributes: {
            download: "file",
          },
        },
      },
    },
    placeholder: "Type or paste your content here!",
    style: {
      definitions: [
        {
          name: "Article category",
          element: "h3",
          classes: ["category"],
        },
        {
          name: "Title",
          element: "h2",
          classes: ["document-title"],
        },
        {
          name: "Subtitle",
          element: "h3",
          classes: ["document-subtitle"],
        },
        {
          name: "Info box",
          element: "p",
          classes: ["info-box"],
        },
        {
          name: "Side quote",
          element: "blockquote",
          classes: ["side-quote"],
        },
        {
          name: "Marker",
          element: "span",
          classes: ["marker"],
        },
        {
          name: "Spoiler",
          element: "span",
          classes: ["spoiler"],
        },
        {
          name: "Code (dark)",
          element: "pre",
          classes: ["fancy-code", "fancy-code-dark"],
        },
        {
          name: "Code (bright)",
          element: "pre",
          classes: ["fancy-code", "fancy-code-bright"],
        },
      ],
    },
  };

  return (
    <div>
      <div className="main-container">
        <div
          className="editor-container editor-container_classic-editor editor-container_include-style editor-container_include-block-toolbar"
          ref={editorContainerRef}
        >
          <div className="editor-container__editor knowledge-editor">
            <div ref={editorRef}>
              {isLayoutReady && (
                <CKEditor
                  data={data}
                  editor={ClassicEditor}
                  config={editorConfig}
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
