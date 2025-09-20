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
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [textColor, setTextColor] = useState("#333333");

  const fontFamilies = [
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Georgia",
    "Verdana",
    "Courier New",
    "Monaco",
    "Comic Sans MS",
    "Impact",
    "Trebuchet MS",
    "Palatino",
    "Garamond",
    "Bookman",
    "Tahoma",
    "Lucida Grande",
  ];

  const popularEmojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "🤔",
    "🤨",
    "😐",
    "😑",
    "😶",
    "🙄",
    "😏",
    "😣",
    "😥",
    "😮",
    "🤐",
    "😯",
    "😪",
    "😫",
    "🥱",
    "😴",
    "😌",
    "😛",
    "😜",
    "😝",
    "🤤",
    "😒",
    "😓",
    "😔",
    "😕",
    "🙃",
    "🤑",
    "😲",
    "☹️",
    "🙁",
    "😖",
    "😞",
    "😟",
    "😤",
    "😢",
    "😭",
    "😦",
    "😧",
    "😨",
    "😩",
    "👍",
    "👎",
    "👌",
    "✋",
    "🤚",
    "🖐️",
    "✊",
    "👊",
    "🤛",
    "🤜",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🤝",
    "🙏",
    "✍️",
    "💪",
    "🦾",
    "🦿",
    "❤️",
    "💔",
    "💕",
    "💖",
    "💗",
    "💘",
    "💙",
    "💚",
    "💛",
    "🧡",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💯",
    "💢",
    "💥",
    "💫",
    "💦",
    "💨",
  ];

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      // Restore content with all preserved styling
      editorRef.current.innerHTML = content;

      // Update button states based on current cursor position after content loads
      setTimeout(() => {
        updateButtonStates();
      }, 0);
    }
  }, [content]);

  const applyFormat = (command: string, value?: string) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    if (command === "bold" || command === "italic" || command === "underline") {
      const span = document.createElement("span");
      if (command === "bold")
        span.style.fontWeight = isBold ? "normal" : "bold";
      if (command === "italic")
        span.style.fontStyle = isItalic ? "normal" : "italic";
      if (command === "underline")
        span.style.textDecoration = isUnderline ? "none" : "underline";

      try {
        range.surroundContents(span);
      } catch (e) {
        // If surroundContents fails, insert the span
        span.appendChild(range.extractContents());
        range.insertNode(span);
      }

      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      document.execCommand(command, false, value);
    }

    updateButtonStates();
    handleContentChange();
  };

  const updateButtonStates = () => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const element = range.commonAncestorContainer;
      const parentElement =
        element.nodeType === Node.TEXT_NODE
          ? element.parentElement
          : (element as Element);

      if (parentElement) {
        const computedStyle = window.getComputedStyle(parentElement);
        setIsBold(
          computedStyle.fontWeight === "bold" ||
            parseInt(computedStyle.fontWeight) >= 600
        );
        setIsItalic(computedStyle.fontStyle === "italic");
        setIsUnderline(computedStyle.textDecoration.includes("underline"));
      }
    }
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      // Ensure all formatting is properly preserved in the content
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handleInput = () => {
    handleContentChange();
    updateButtonStates();
  };

  const changeFontSize = (size: number) => {
    setFontSize(size);
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      span.style.fontSize = `${size}px`;
      span.style.display = "inline"; // Ensure proper inline display

      try {
        if (range.collapsed) {
          // If no text is selected, insert a placeholder and select it
          const placeholder = document.createTextNode("Text");
          range.insertNode(placeholder);
          range.selectNode(placeholder);
        }
        range.surroundContents(span);

        // Maintain selection
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } catch (e) {
        span.appendChild(range.extractContents());
        range.insertNode(span);
        range.selectNode(span);
      }

      handleContentChange();
    } else {
      // If no selection, apply to the whole editor's default font size
      if (editorRef.current) {
        editorRef.current.style.fontSize = `${size}px`;
        handleContentChange();
      }
    }
  };

  const changeFontFamily = (family: string) => {
    setFontFamily(family);
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      span.style.fontFamily = family;
      span.style.display = "inline"; // Ensure proper inline display

      try {
        if (range.collapsed) {
          // If no text is selected, insert a placeholder and select it
          const placeholder = document.createTextNode("Text");
          range.insertNode(placeholder);
          range.selectNode(placeholder);
        }
        range.surroundContents(span);

        // Maintain selection
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } catch (e) {
        span.appendChild(range.extractContents());
        range.insertNode(span);
        range.selectNode(span);
      }

      handleContentChange();
    } else {
      // If no selection, apply to the whole editor's default font family
      if (editorRef.current) {
        editorRef.current.style.fontFamily = family;
        handleContentChange();
      }
    }
  };

  const changeTextColor = (color: string) => {
    setTextColor(color);
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      span.style.color = color;
      span.style.display = "inline"; // Ensure proper inline display

      try {
        if (range.collapsed) {
          // If no text is selected, insert a placeholder and select it
          const placeholder = document.createTextNode("Text");
          range.insertNode(placeholder);
          range.selectNode(placeholder);
        }
        range.surroundContents(span);

        // Maintain selection
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } catch (e) {
        span.appendChild(range.extractContents());
        range.insertNode(span);
        range.selectNode(span);
      }

      handleContentChange();
    } else {
      // If no selection, apply to the whole editor's default text color
      if (editorRef.current) {
        editorRef.current.style.color = color;
        handleContentChange();
      }
    }
  };

  const insertEmoji = (emoji: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(emoji));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    } else if (editorRef.current) {
      editorRef.current.appendChild(document.createTextNode(emoji));
    }

    setShowEmojiPicker(false);
    editorRef.current?.focus();
    handleContentChange();
  };

  const insertHeading = (level: number) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const heading = document.createElement(`h${level}`);
      heading.textContent = `Heading ${level}`;
      heading.style.direction = "ltr";

      range.deleteContents();
      range.insertNode(heading);
      range.setStartAfter(heading);
      range.collapse(true);

      selection.removeAllRanges();
      selection.addRange(range);
    }

    editorRef.current?.focus();
    handleContentChange();
  };

  const insertList = (ordered: boolean) => {
    applyFormat(ordered ? "insertOrderedList" : "insertUnorderedList");
  };

  const toolbarStyle: React.CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #dee2e6",
    borderRadius: "8px 8px 0 0",
    borderBottom: "none",
  };

  const toolbarGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "4px",
    alignItems: "center",
    padding: "4px",
    backgroundColor: "white",
    borderRadius: "6px",
    border: "1px solid #e9ecef",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "6px 10px",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "32px",
    height: "32px",
  };

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: "#007bff",
    color: "white",
  };

  const selectStyle: React.CSSProperties = {
    padding: "4px 8px",
    border: "1px solid #dee2e6",
    borderRadius: "4px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
  };

  return (
    <div className={`modern-rich-editor ${className}`}>
      {/* Modern Toolbar */}
      <div style={toolbarStyle}>
        {/* Font Controls */}
        <div style={toolbarGroupStyle}>
          <select
            value={fontFamily}
            onChange={(e) => changeFontFamily(e.target.value)}
            style={selectStyle}
            title="Font Family"
          >
            {fontFamilies.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={fontSize}
            onChange={(e) => changeFontSize(parseInt(e.target.value) || 14)}
            min="8"
            max="72"
            style={{ ...selectStyle, width: "60px" }}
            title="Font Size"
          />
        </div>

        {/* Text Formatting */}
        <div style={toolbarGroupStyle}>
          <button
            type="button"
            onClick={() => applyFormat("bold")}
            style={isBold ? activeButtonStyle : buttonStyle}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => applyFormat("italic")}
            style={isItalic ? activeButtonStyle : buttonStyle}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => applyFormat("underline")}
            style={isUnderline ? activeButtonStyle : buttonStyle}
            title="Underline"
          >
            <u>U</u>
          </button>
        </div>

        {/* Color Controls */}
        <div style={toolbarGroupStyle}>
          <input
            type="color"
            value={textColor}
            onChange={(e) => changeTextColor(e.target.value)}
            style={{
              width: "32px",
              height: "32px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            title="Text Color"
          />
        </div>

        {/* Headings */}
        <div style={toolbarGroupStyle}>
          <button
            type="button"
            onClick={() => insertHeading(1)}
            style={buttonStyle}
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => insertHeading(2)}
            style={buttonStyle}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => insertHeading(3)}
            style={buttonStyle}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        {/* Lists */}
        <div style={toolbarGroupStyle}>
          <button
            type="button"
            onClick={() => insertList(false)}
            style={buttonStyle}
            title="Bullet List"
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => insertList(true)}
            style={buttonStyle}
            title="Numbered List"
          >
            1. List
          </button>
        </div>

        {/* Alignment */}
        <div style={toolbarGroupStyle}>
          <button
            type="button"
            onClick={() => applyFormat("justifyLeft")}
            style={buttonStyle}
            title="Align Left"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => applyFormat("justifyCenter")}
            style={buttonStyle}
            title="Align Center"
          >
            ↔
          </button>
          <button
            type="button"
            onClick={() => applyFormat("justifyRight")}
            style={buttonStyle}
            title="Align Right"
          >
            →
          </button>
        </div>

        {/* Emoji Picker */}
        <div style={{ ...toolbarGroupStyle, position: "relative" }}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={buttonStyle}
            title="Insert Emoji"
          >
            😀
          </button>

          {showEmojiPicker && (
            <div
              style={{
                position: "absolute",
                top: "40px",
                left: "0",
                width: "300px",
                maxHeight: "200px",
                backgroundColor: "white",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                padding: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                zIndex: 1000,
                display: "grid",
                gridTemplateColumns: "repeat(10, 1fr)",
                gap: "4px",
                overflowY: "auto",
              }}
            >
              {popularEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => insertEmoji(emoji)}
                  style={{
                    padding: "4px",
                    border: "none",
                    borderRadius: "4px",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8f9fa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Undo/Redo */}
        <div style={toolbarGroupStyle}>
          <button
            type="button"
            onClick={() => applyFormat("undo")}
            style={buttonStyle}
            title="Undo"
          >
            ↶
          </button>
          <button
            type="button"
            onClick={() => applyFormat("redo")}
            style={buttonStyle}
            title="Redo"
          >
            ↷
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onMouseUp={updateButtonStates}
        onKeyUp={updateButtonStates}
        data-placeholder={placeholder}
        dir="ltr"
        lang="en"
        style={{
          minHeight: "300px",
          padding: "16px",
          border: "1px solid #dee2e6",
          borderRadius: "0 0 8px 8px",
          outline: "none",
          fontSize: `${fontSize}px`,
          lineHeight: "1.6",
          color: textColor,
          backgroundColor: "white",
          fontFamily: fontFamily,
          textAlign: "left",
          direction: "ltr",
          unicodeBidi: "normal",
          overflow: "auto",
        }}
      />

      {/* Click outside to close emoji picker */}
      {showEmojiPicker && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 999,
          }}
          onClick={() => setShowEmojiPicker(false)}
        />
      )}
    </div>
  );
};

export default SimpleRichEditor;
