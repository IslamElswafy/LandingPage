import React, { useState, useRef, useEffect } from "react";

interface SimpleRichEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

const SimpleRichEditor: React.FC<SimpleRichEditorProps> = ({
  content,
  onChange,
  placeholder = "Enter your content here...",
  className = "",
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();

    // Update button states
    setIsBold(document.queryCommandState("bold"));
    setIsItalic(document.queryCommandState("italic"));
    setIsUnderline(document.queryCommandState("underline"));

    // Trigger onChange
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      // Force LTR direction on all elements
      const allElements = editorRef.current.querySelectorAll("*");
      allElements.forEach((element: any) => {
        element.style.direction = "ltr";
        element.style.unicodeBidi = "normal";
      });

      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = () => {
    // Prevent RTL behavior on key press
    if (editorRef.current) {
      editorRef.current.style.direction = "ltr";
      editorRef.current.style.unicodeBidi = "normal";
    }
  };

  const insertHeading = (level: number) => {
    const heading = `<h${level}>Heading ${level}</h${level}>`;
    document.execCommand("insertHTML", false, heading);
    editorRef.current?.focus();
    handleInput();
  };

  const insertList = (ordered: boolean) => {
    const listType = ordered ? "insertOrderedList" : "insertUnorderedList";
    execCommand(listType);
  };

  return (
    <div className={`simple-rich-editor ${className}`}>
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => execCommand("bold")}
            className={`toolbar-btn ${isBold ? "is-active" : ""}`}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => execCommand("italic")}
            className={`toolbar-btn ${isItalic ? "is-active" : ""}`}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => execCommand("underline")}
            className={`toolbar-btn ${isUnderline ? "is-active" : ""}`}
            title="Underline"
          >
            <u>U</u>
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => insertHeading(1)}
            className="toolbar-btn"
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => insertHeading(2)}
            className="toolbar-btn"
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertHeading(3)}
            className="toolbar-btn"
            title="Heading 3"
          >
            H3
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => insertList(false)}
            className="toolbar-btn"
            title="Bullet List"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => insertList(true)}
            className="toolbar-btn"
            title="Numbered List"
          >
            1.
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => execCommand("justifyLeft")}
            className="toolbar-btn"
            title="Align Left"
          >
            ⬅
          </button>
          <button
            type="button"
            onClick={() => execCommand("justifyCenter")}
            className="toolbar-btn"
            title="Align Center"
          >
            ↔
          </button>
          <button
            type="button"
            onClick={() => execCommand("justifyRight")}
            className="toolbar-btn"
            title="Align Right"
          >
            ➡
          </button>
        </div>

        <div className="toolbar-group">
          <button
            type="button"
            onClick={() => execCommand("undo")}
            className="toolbar-btn"
            title="Undo"
          >
            ↶
          </button>
          <button
            type="button"
            onClick={() => execCommand("redo")}
            className="toolbar-btn"
            title="Redo"
          >
            ↷
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        dir="ltr"
        lang="en"
        style={{
          minHeight: "200px",
          padding: "12px",
          border: "1px solid #ddd",
          borderRadius: "0 0 8px 8px",
          outline: "none",
          fontSize: "14px",
          lineHeight: "1.6",
          color: "#333",
          backgroundColor: "white",
          textAlign: "left",
          direction: "ltr",
          unicodeBidi: "normal",
        }}
      />
    </div>
  );
};

export default SimpleRichEditor;
