import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ContactMessage } from "../../types/app";
const ContactMessagesAdmin = ({
  messages,
  onDeleteMessage,
  onMarkAsRead,
  onReplyMessage,
  doubleCheckMessages,
}: {
  messages: ContactMessage[];
  onUpdateMessage: (id: number, status: string) => void;
  onDeleteMessage: (id: number) => void;
  onMarkAsRead: (id: number) => void;
  onReplyMessage: (id: number) => void;
  doubleCheckMessages: Set<number>;
}) => {
  const { t } = useTranslation();
  const [filterType] = useState("all");
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);

  const filteredMessages = messages.filter(
    (msg) =>
      filterType === "all" ||
      msg.type.toLowerCase() === filterType.toLowerCase()
  );

  const handleSelectAll = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(filteredMessages.map((msg) => msg.id));
    }
  };

  const handleSelectMessage = (id: number) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((msgId) => msgId !== id) : [...prev, id]
    );
  };

  return (
    <div className="contact-admin">
      <div className="admin-header">
        <div className="breadcrumbs">
          <span>{t("contact.contactUs")}</span>
        </div>
      </div>

      <div className="admin-content">
        <div className="tabs">
          <button className="tab active">{t("contact.messages")}</button>
        </div>

        <div className="messages-table">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      selectedMessages.length === filteredMessages.length &&
                      filteredMessages.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th>ID</th>
                <th>{t("contact.country")}</th>
                <th>{t("contact.type")}</th>
                <th>{t("contact.name")}</th>
                <th>{t("contact.mobile")}</th>
                <th>{t("contact.subject")}</th>
                <th>{t("contact.message")}</th>
                <th>{t("contact.date")}</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((message) => (
                <tr key={message.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedMessages.includes(message.id)}
                      onChange={() => handleSelectMessage(message.id)}
                    />
                  </td>
                  <td>{message.id}</td>
                  <td>
                    <div className="country-flag">🇸🇦</div>
                  </td>
                  <td>{message.type}</td>
                  <td>{message.name}</td>
                  <td>{message.mobile}</td>
                  <td>{message.subject}</td>
                  <td>{message.message}</td>
                  <td>{message.date}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn delete"
                        onClick={() => onDeleteMessage(message.id)}
                        title={t("ui.delete")}
                      >
                        🗑
                      </button>
                      <button
                        className="action-btn mark-read"
                        onClick={() => onMarkAsRead(message.id)}
                        title={t("contact.markAsRead")}
                      >
                        {doubleCheckMessages.has(message.id) ? "✓✓" : "✓"}
                      </button>
                      <button
                        className="action-btn reply"
                        onClick={() => onReplyMessage(message.id)}
                        title={t("ui.reply")}
                      >
                        ↩
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContactMessagesAdmin;


