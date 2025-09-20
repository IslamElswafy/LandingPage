import React, { useState, useEffect } from "react";
import SimpleRichEditor from "./SimpleRichEditor";

const EditorExample: React.FC = () => {
  const [editorContent, setEditorContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Load saved content from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("richEditorContent");
    if (saved) {
      setEditorContent(saved);
      setSavedContent(saved);
    } else {
      // Default content with various styles to demonstrate preservation
      const defaultContent = `
        <h1>Welcome to the Rich Editor! 🎉</h1>
        <p>This editor preserves <span style="font-weight: bold;">all your formatting</span> exactly as you apply it.</p>
        
        <span style="font-family: Georgia; font-size: 18px; color: #007bff;">
          This text uses Georgia font, 18px size, and blue color.
        </span>
        
        <p>Try changing:
          <ul>
            <li><span style="font-size: 24px; color: #dc3545;">Font sizes</span></li>
            <li><span style="font-family: 'Times New Roman'; color: #28a745;">Font families</span></li>
            <li><span style="color: #ff6b35; font-weight: bold;">Colors and formatting</span></li>
          </ul>
        </p>
        
        <span style="font-family: 'Courier New'; font-size: 14px; color: #6c757d;">
          All your changes are automatically saved! 💾
        </span>
      `.trim();
      setEditorContent(defaultContent);
    }
  }, []);

  // Handle content changes and auto-save
  const handleContentChange = (newContent: string) => {
    setEditorContent(newContent);

    // Auto-save to localStorage
    localStorage.setItem("richEditorContent", newContent);

    console.log("Content saved with all styles preserved:", newContent);
  };

  // Manual save function
  const saveContent = () => {
    setSavedContent(editorContent);
    localStorage.setItem("richEditorContent", editorContent);
    alert("Content saved successfully! All your styles are preserved.");
  };

  // Load saved content
  const loadSavedContent = () => {
    if (savedContent) {
      setEditorContent(savedContent);
      alert(
        "Saved content loaded! All styles are restored exactly as they were."
      );
    }
  };

  // Clear all content
  const clearContent = () => {
    setEditorContent("");
    setSavedContent("");
    localStorage.removeItem("richEditorContent");
  };

  // Export content as HTML
  const exportAsHTML = () => {
    const blob = new Blob([editorContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rich-editor-content.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        Rich Editor with Style Preservation Demo
      </h1>

      {/* Control Panel */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #dee2e6",
        }}
      >
        <button
          onClick={saveContent}
          style={{
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          💾 Save Content
        </button>

        <button
          onClick={loadSavedContent}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
          }}
          disabled={!savedContent}
        >
          📂 Load Saved
        </button>

        <button
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          {isPreviewMode ? "✏️ Edit Mode" : "👀 Preview Mode"}
        </button>

        <button
          onClick={exportAsHTML}
          style={{
            padding: "8px 16px",
            backgroundColor: "#6f42c1",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          📤 Export HTML
        </button>

        <button
          onClick={clearContent}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          🗑️ Clear All
        </button>
      </div>

      {/* Instructions */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#e3f2fd",
          borderRadius: "8px",
          border: "1px solid #90caf9",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0", color: "#1565c0" }}>
          💡 How Style Preservation Works:
        </h3>
        <ul style={{ margin: "0", paddingLeft: "20px", color: "#1565c0" }}>
          <li>
            <strong>Font Family:</strong> Select text and choose a font from the
            dropdown
          </li>
          <li>
            <strong>Font Size:</strong> Select text and enter a size (8-72px)
          </li>
          <li>
            <strong>Colors:</strong> Select text and pick a color
          </li>
          <li>
            <strong>Formatting:</strong> Use bold, italic, underline buttons
          </li>
          <li>
            <strong>Emojis:</strong> Click the emoji button to add fun elements
          </li>
          <li>
            <strong>Auto-Save:</strong> Every change is automatically saved!
          </li>
        </ul>
      </div>

      {/* Editor or Preview */}
      {isPreviewMode ? (
        <div
          style={{
            minHeight: "400px",
            padding: "20px",
            border: "2px solid #28a745",
            borderRadius: "8px",
            backgroundColor: "white",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-12px",
              left: "20px",
              backgroundColor: "#28a745",
              color: "white",
              padding: "4px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            PREVIEW MODE - All Styles Preserved
          </div>
          <div dangerouslySetInnerHTML={{ __html: editorContent }} />
        </div>
      ) : (
        <SimpleRichEditor
          content={editorContent}
          onChange={handleContentChange}
          placeholder="Start typing and apply your styles! Everything will be saved exactly as you format it..."
          className="demo-editor"
        />
      )}

      {/* Content Info */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          border: "1px solid #dee2e6",
        }}
      >
        <h4 style={{ margin: "0 0 10px 0" }}>📊 Content Information:</h4>
        <div style={{ fontSize: "14px", color: "#6c757d" }}>
          <div>
            <strong>Content Length:</strong> {editorContent.length} characters
          </div>
          <div>
            <strong>HTML Elements:</strong>{" "}
            {(editorContent.match(/<[^>]+>/g) || []).length} tags
          </div>
          <div>
            <strong>Styled Elements:</strong>{" "}
            {(editorContent.match(/style="[^"]+"/g) || []).length} inline styles
          </div>
          <div>
            <strong>Auto-Save Status:</strong>{" "}
            <span style={{ color: "#28a745", fontWeight: "bold" }}>
              ✅ Active
            </span>
          </div>
        </div>
      </div>

      {/* Raw HTML Output (for debugging) */}
      <details style={{ marginTop: "20px" }}>
        <summary
          style={{
            cursor: "pointer",
            padding: "10px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            fontWeight: "500",
          }}
        >
          🔍 View Raw HTML Output (for developers)
        </summary>
        <pre
          style={{
            marginTop: "10px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            fontSize: "12px",
            overflow: "auto",
            maxHeight: "300px",
          }}
        >
          {editorContent || "No content yet..."}
        </pre>
      </details>
    </div>
  );
};

export default EditorExample;
