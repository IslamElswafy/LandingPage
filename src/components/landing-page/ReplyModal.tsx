import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ContactMessage } from "../../types/app";
const ReplyModal = ({
  message,
  isOpen,
  onClose,
  onSendReply,
}: {
  message: ContactMessage | null;
  isOpen: boolean;
  onClose: () => void;
  onSendReply: (replyTitle: string, replyBody: string) => void;
}) => {
  const { t } = useTranslation();
  const [replyTitle, setReplyTitle] = useState("");
  const [replyBody, setReplyBody] = useState("");

  useEffect(() => {
    if (message && isOpen) {
      setReplyTitle(`Re: ${message.subject}`);
      setReplyBody("");
    }
  }, [message, isOpen]);

  const handleSend = () => {
    if (replyTitle.trim() && replyBody.trim()) {
      onSendReply(replyTitle, replyBody);
      setReplyTitle("");
      setReplyBody("");
      onClose();
    }
  };

  const handleCancel = () => {
    setReplyTitle("");
    setReplyBody("");
    onClose();
  };

  if (!isOpen || !message) return null;

  return (
    <div className="modal-overlay">
      <div className="reply-modal">
        <button className="modal-close" onClick={onClose}>
          ▲
        </button>

        <div className="modal-header">
          <h2>{t("contact.reply")}</h2>
        </div>

        <div className="message-details">
          <div className="detail-row">
            <span className="detail-label">{t("contact.type")}:</span>
            <span className="type-tag">{message.type}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t("contact.name")}:</span>
            <span className="detail-value">{message.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t("contact.email")}:</span>
            <span className="detail-value">{message.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t("contact.mobile")}:</span>
            <span className="detail-value">{message.mobile}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t("contact.body")}:</span>
            <span className="detail-value">{message.message}</span>
          </div>
        </div>

        <div className="reply-section">
          <h3>{t("contact.reply")}</h3>
          <div className="form-group">
            <label htmlFor="reply-title">{t("contact.title")}</label>
            <input
              id="reply-title"
              type="text"
              value={replyTitle}
              onChange={(e) => setReplyTitle(e.target.value)}
              placeholder={t("contact.replyPlaceholder")}
              className="reply-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="reply-body">{t("contact.body")}</label>
            <textarea
              id="reply-body"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder={t("contact.replyBodyPlaceholder")}
              className="reply-textarea"
              rows={6}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button className="send-btn" onClick={handleSend}>
            {t("ui.send")}
          </button>
          <button className="cancel-btn" onClick={handleCancel}>
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyModal;

