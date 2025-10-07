import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SimpleRichEditor from "../SimpleRichEditor";
import type { BlockData } from "../../types/app";
const BlockContentViewModal = ({
  block,
  isOpen,
  onClose,
  onEdit,
  onShare,
}: {
  block: BlockData | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onShare?: (blockId: string) => void;
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [tempContent, setTempContent] = useState("");
  const [tempJsonContent, setTempJsonContent] = useState<any>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    if (block && isOpen) {
      // Initialize editor with existing content or default
      const initialContent = block.title
        ? `<h1>${block.title}</h1><p>Add your content here...</p>`
        : "<p>Add your content here...</p>";
      setEditorContent(initialContent);
      setTempContent(initialContent);
      setIsEditing(false);
    }
  }, [block, isOpen]);

  if (!isOpen || !block) return null;

  const handleSave = () => {
    setEditorContent(tempContent);

    // Save JSON content to localStorage for image positioning data
    if (tempJsonContent) {
      console.log("Saving JSON to localStorage:", tempJsonContent);
      localStorage.setItem(
        "editor-content-json",
        JSON.stringify(tempJsonContent)
      );
    } else {
      console.log("No JSON content to save!");
    }

    // Enter Preview Mode after saving
    setIsPreviewMode(true);
    setIsEditing(false);

    // Here you would typically save to your backend/state management
    console.log("Saving content:", tempContent);
    console.log("Saving JSON content:", tempJsonContent);
  };

  const handleCancel = () => {
    setTempContent(editorContent);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsPreviewMode(false); // Exit preview mode when editing
  };

  const handlePreviewModeToggle = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const handleContentChange = (htmlContent: string, jsonContent?: any) => {
    setTempContent(htmlContent);
    if (jsonContent) {
      setTempJsonContent(jsonContent);
    }
  };

  return (
    <div
      className="admin-popup-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="admin-popup-content"
        style={{ width: "90vw", maxWidth: "1200px", height: "90vh" }}
      >
        <div className="admin-popup-header">
          <h3>
            {isEditing && !isPreviewMode
              ? `${t("Editing")}: ${block.title}`
              : isPreviewMode
              ? `👁️ ${t("Preview Mode")}: ${block.title}`
              : `${t("Viewing")}: ${block.title}`}
          </h3>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {!isEditing && onShare && (
              <button
                onClick={() => onShare(block.id)}
                style={{
                  background: "#34C759",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                🔗 {t("Share")}
              </button>
            )}
            {!isEditing && (
              <button
                onClick={handleEdit}
                style={{
                  background: "#007AFF",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                ✏️ {t("Edit")}
              </button>
            )}
            {isEditing && (
              <>
                <button
                  onClick={handleCancel}
                  style={{
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  💾 {t("Save")}
                </button>
              </>
            )}
            <button className="admin-popup-close" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div
          className="admin-popup-body"
          style={{
            height: "calc(100% - 80px)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Block Info Section */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "20px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "16px",
                fontSize: "14px",
              }}
            >
              <div>
                <strong>{t("ID")}:</strong>{" "}
                <code
                  style={{
                    background: "#f1f3f4",
                    padding: "2px 6px",
                    borderRadius: "3px",
                  }}
                >
                  {block.id}
                </code>
              </div>
              {block.backgroundColor && (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <strong>{t("Background")}:</strong>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: block.backgroundColor,
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  ></div>
                  <span>{block.backgroundColor}</span>
                </div>
              )}
              {block.width && block.height && (
                <div>
                  <strong>{t("Size")}:</strong> {block.width} × {block.height}px
                </div>
              )}
            </div>
          </div>

          {/* Content Editor/Viewer */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              borderRadius: "8px",
              overflow: "auto",
            }}
          >
            {isEditing ? (
              <SimpleRichEditor
                content={tempContent}
                onChange={handleContentChange}
                placeholder={`${t("Start writing content for")} "${
                  block.title
                }"...`}
                className="block-content-editor"
                autoSave={false}
                isPreviewMode={isPreviewMode}
                onPreviewModeToggle={handlePreviewModeToggle}
              />
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "12px 16px",
                    borderBottom: "1px solid #e5e7eb",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>👁️ {t("Preview Mode")}</span>
                  <span style={{ fontSize: "12px", color: "#6b7280" }}>
                    {t("Click Edit to modify content")}
                  </span>
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: "24px",
                    overflow: "auto",
                    backgroundColor: "white",
                    fontSize: "16px",
                    lineHeight: "1.6",
                  }}
                  className="item-content-display"
                  dangerouslySetInnerHTML={{ __html: editorContent }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockContentViewModal;





