import { io } from "socket.io-client";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteConversation from "./DeleteConvesation";
import './Chat.css';
import { FaReply, FaTrash, FaPaperPlane, FaUser, FaTimes, FaUsers, FaUserFriends } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";

const Chat = () => {
  // États React
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [receiverId, setReceiverId] = useState("");
  const [messages, setMessages] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [groupTypingUsers, setGroupTypingUsers] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [groupLoading, setGroupLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("private");

  // Références
  const socketRef = useRef(null);
  const audioRef = useRef(new Audio("/notif.mp3"));
  const messagesEndRef = useRef(null);
  const groupMessagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const groupTypingTimeoutRef = useRef(null);

  // Récupération des infos utilisateur
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData?.id;
  const userName = userData?.name || "Utilisateur";
  const token = localStorage.getItem("token") || "";

  // Connexion WebSocket
  useEffect(() => {
    if (!userData?.id) {
      toast.error("Utilisateur non connecté");
      return;
    }

    setUser(userData);
    const socket = io("http://localhost:3001");
    socketRef.current = socket;

    socket.emit("user_connected", { id: userId, name: userName });
    socket.emit("join_group", { user_id: userId, user_name: userName });

    // Événements Socket
    socket.on("private-message", (data) => {
      if (data.receiver_id === userId || data.sender_id === userId) {
        setMessages((prev) => [...prev, data]);
        if (data.sender_id !== userId && activeTab === "private") {
          toast.info(`${data.sender_name}: ${data.content.substring(0, 30)}...`);
          audioRef.current?.play().catch(console.error);
        }
      }
    });

    socket.on("group-message", (data) => {
      setGroupMessages((prev) => [...prev, data]);
      if (data.sender_id !== userId && activeTab === "group") {
        toast.info(`${data.sender_name}: ${data.content.substring(0, 30)}...`);
        audioRef.current?.play().catch(console.error);
      }
    });

    socket.on("update_user_list", (list) => setOnlineUsers(list || []));

    socket.on("typing", ({ from, to }) => {
      if (to === userId) {
        setTypingUsers((prev) => [...new Set([...prev, from])]);
      }
    });

    socket.on("stopTyping", ({ from, to }) => {
      if (to === userId) {
        setTypingUsers((prev) => prev.filter((name) => name !== from));
      }
    });

    socket.on("group_typing", ({ from }) => {
      setGroupTypingUsers((prev) => [...new Set([...prev, from])]);
    });

    socket.on("group_stop_typing", ({ from }) => {
      setGroupTypingUsers((prev) => prev.filter((name) => name !== from));
    });

    socket.on("connect_error", (error) => {
      console.error("Erreur de connexion Socket.IO:", error);
      toast.error("Connexion au chat interrompue");
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, userName, activeTab]);

  // Chargement des messages privés
  useEffect(() => {
    if (!receiverId || !userId || activeTab !== "private") return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:8000/api/messages/${receiverId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          },
        });

        if (Array.isArray(res.data)) {
          setMessages(res.data);
        } else {
          setMessages([]);
        }
      } catch (error) {
        console.error("Erreur chargement messages privés:", error);
        
        // Si erreur 500, on initialise vide
        if (error.response?.status === 500) {
          setMessages([]);
          toast.info("Les messages historiques ne sont pas disponibles pour le moment");
        } else {
          toast.error("Erreur lors du chargement des messages");
          setMessages([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [receiverId, token, userId, activeTab]);

  // Chargement des messages de groupe
  useEffect(() => {
    if (activeTab !== "group") return;

    const loadGroupMessages = async () => {
      setGroupLoading(true);
      try {
        const res = await axios.get(`http://localhost:8000/api/group-messages`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json'
          },
        });

        if (Array.isArray(res.data)) {
          setGroupMessages(res.data);
        } else {
          setGroupMessages([]);
        }
      } catch (error) {
        console.error("Erreur chargement messages groupe:", error);
        setGroupMessages([]);
      } finally {
        setGroupLoading(false);
      }
    };

    loadGroupMessages();
  }, [activeTab, token]);

  // Scroll automatique
  useEffect(() => {
    if (activeTab === "private") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      groupMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, groupMessages, typingUsers, groupTypingUsers, activeTab]);

  // Gestion de la saisie
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (!socketRef.current) return;

    if (activeTab === "private" && receiverId) {
      socketRef.current.emit("typing", { 
        from: userName, 
        to: parseInt(receiverId)
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit("stopTyping", { 
          from: userName, 
          to: parseInt(receiverId)
        });
      }, 2000);
    } else if (activeTab === "group") {
      socketRef.current.emit("group_typing", { from: userName });

      if (groupTypingTimeoutRef.current) {
        clearTimeout(groupTypingTimeoutRef.current);
      }
      
      groupTypingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit("group_stop_typing", { from: userName });
      }, 2000);
    }
  };

  // Envoi de message privé
  const handleSendPrivate = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !receiverId || !socketRef.current) return;

    const messageContent = replyTo 
      ? `${replyTo.content}\n${newMessage}` 
      : newMessage;

    try {
      const response = await axios.post(
        "http://localhost:8000/api/messages",
        {
          sender_id: userId,
          receiver_id: parseInt(receiverId),
          content: messageContent
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      const sentMessage = response.data;
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");
      setReplyTo(null);
      
      socketRef.current.emit("private-message", sentMessage);
      socketRef.current.emit("stopTyping", { 
        from: userName, 
        to: parseInt(receiverId)
      });
      
    } catch (error) {
      console.error("Erreur envoi message privé:", error);
      
      // Fallback: créer un message local
      const localMessage = {
        id: Date.now(),
        sender_id: userId,
        sender_name: userName,
        receiver_id: parseInt(receiverId),
        content: messageContent,
        created_at: new Date().toISOString(),
        type: 'private'
      };
      
      setMessages((prev) => [...prev, localMessage]);
      setNewMessage("");
      setReplyTo(null);
      
      socketRef.current.emit("private-message", localMessage);
      socketRef.current.emit("stopTyping", { 
        from: userName, 
        to: parseInt(receiverId)
      });
      
      toast.info("Message envoyé (mode local)");
    }
  };

  // Envoi de message de groupe
  const handleSendGroup = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    const messageContent = replyTo 
      ? `${replyTo.content}\n${newMessage}` 
      : newMessage;

    try {
      const response = await axios.post(
        "http://localhost:8000/api/group-messages",
        {
          sender_id: userId,
          sender_name: userName,
          content: messageContent
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      const sentMessage = response.data;
      setGroupMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");
      setReplyTo(null);
      
      socketRef.current.emit("group-message", sentMessage);
      socketRef.current.emit("group_stop_typing", { from: userName });
      
    } catch (error) {
      console.error("Erreur envoi message groupe:", error);
      
      // Fallback: créer un message local
      const localMessage = {
        id: Date.now(),
        sender_id: userId,
        sender_name: userName,
        content: messageContent,
        created_at: new Date().toISOString(),
        type: 'group'
      };
      
      setGroupMessages((prev) => [...prev, localMessage]);
      setNewMessage("");
      setReplyTo(null);
      
      socketRef.current.emit("group-message", localMessage);
      socketRef.current.emit("group_stop_typing", { from: userName });
      
      toast.info("Message envoyé (mode local)");
    }
  };

  // Suppression de message
  const handleDelete = async (id, isGroup = false) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce message ?")) return;

    try {
      const endpoint = isGroup 
        ? `http://localhost:8000/api/group-messages/${id}`
        : `http://localhost:8000/api/messages/${id}`;

      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (isGroup) {
        setGroupMessages((prev) => prev.filter((msg) => msg.id !== id));
      } else {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      }
      
      toast.success("Message supprimé");
    } catch (err) {
      console.error("Erreur suppression:", err);
      
      // Suppression locale
      if (isGroup) {
        setGroupMessages((prev) => prev.filter((msg) => msg.id !== id));
      } else {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      }
      toast.success("Message supprimé (local)");
    }
  };

  // Récupération du nom de l'utilisateur en ligne
  const getReceiverName = () => {
    const receiver = onlineUsers.find(u => u.id === parseInt(receiverId));
    return receiver ? receiver.name : `ID: ${receiverId}`;
  };

  // Fonction d'envoi selon l'onglet actif
  const handleSend = activeTab === "private" ? handleSendPrivate : handleSendGroup;

  return (
    <div className="mt-4">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <div className="chat-page">
        <div className="chat-container">
          {/* En-tête */}
          <div className="chat-header">
            <h2>Gestion Messagerie GMCOM</h2>
            {user && (
              <div className="user-status">
                <FaUser className="me-2" />
                Connecté : <strong>{user.name}</strong>
                <span className="online-dot"></span>
              </div>
            )}
          </div>

          {/* Navigation par onglets */}
          <div className="chat-tabs">
            <button 
              className={`tab-button ${activeTab === "private" ? "active" : ""}`}
              onClick={() => setActiveTab("private")}
            >
              <FaUserFriends className="me-2" />
              Messages Privés
            </button>
            <button 
              className={`tab-button ${activeTab === "group" ? "active" : ""}`}
              onClick={() => setActiveTab("group")}
            >
              <FaUsers className="me-2" />
              Discussion Générale
            </button>
          </div>

          {/* Contenu selon l'onglet actif */}
          {activeTab === "private" ? (
            // === MESSAGES PRIVÉS ===
            <div className="private-chat">
              {/* Liste des utilisateurs en ligne */}
              <div className="online-users-section">
                <h4>Agents en ligne ({onlineUsers.filter(u => u.id !== userId).length})</h4>
                <div className="online-users-list">
                  {onlineUsers.filter(u => u.id !== userId).length === 0 ? (
                    <p className="text-muted">Aucun autre agent en ligne.</p>
                  ) : (
                    onlineUsers
                      .filter((u) => u.id != null && u.id !== userId)
                      .map((u) => (
                        <div
                          key={u.id}
                          className={`user-chip ${receiverId === u.id.toString() ? 'active' : ''}`}
                          onClick={() => setReceiverId(u.id.toString())}
                        >
                          <span className="user-dot"></span>
                          {u.name}
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Sélection du destinataire */}
              <div className="receiver-selector">
                <select
                  value={receiverId || ""}
                  onChange={(e) => setReceiverId(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Choisir un agent --</option>
                  {onlineUsers
                    .filter((u) => u.id !== userId)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Zone de conversation privée */}
              {receiverId && (
                <div className="conversation-section">
                  <div className="conversation-header">
                    <div className="conversation-info">
                      <h5>Conversation avec {getReceiverName()}</h5>
                      {typingUsers.length > 0 && (
                        <div className="typing-indicator">
                          <span className="typing-dots">
                            <span>.</span><span>.</span><span>.</span>
                          </span>
                          {typingUsers.join(", ")} écrit...
                        </div>
                      )}
                    </div>
                    <DeleteConversation
                      receiverId={receiverId}
                      token={token}
                      setReceiverId={setReceiverId}
                      setMessages={setMessages}
                      onDelete={() => {
                        setMessages([]);
                        setReceiverId("");
                        toast.success("Conversation supprimée");
                      }}
                    />
                  </div>

                  {/* Zone des messages privés */}
                  <div className="messages-container">
                    {loading ? (
                      <div className="loading-messages">
                        <div className="spinner-border spinner-border-sm me-2"></div>
                        Chargement des messages...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="no-messages">
                        <p>Aucun message échangé</p>
                        <small className="text-muted">Envoyez le premier message !</small>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <MessageBubble 
                          key={msg.id || `msg-${Date.now()}-${Math.random()}`} 
                          msg={msg} 
                          userId={userId}
                          onReply={setReplyTo}
                          onDelete={() => handleDelete(msg.id, false)}
                        />
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Indicateur de saisie privée */}
                  {typingUsers.length > 0 && (
                    <TypingIndicator users={typingUsers} />
                  )}

                  {/* Zone de saisie privée */}
                  <MessageForm
                    newMessage={newMessage}
                    onChange={handleInputChange}
                    onSubmit={handleSend}
                    replyTo={replyTo}
                    onCancelReply={() => setReplyTo(null)}
                    disabled={!receiverId}
                    placeholder={replyTo ? "Votre réponse..." : "Tapez votre message..."}
                  />
                </div>
              )}

              {!receiverId && (
                <div className="no-conversation">
                  <div className="empty-state">
                    <h5>Sélectionnez un agent</h5>
                    <p>Choisissez un destinataire pour commencer une conversation privée</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // === DISCUSSION GÉNÉRALE ===
            <div className="group-chat">
              <div className="conversation-section">
                <div className="conversation-header group-header">
                  <div className="conversation-info">
                    <h5>Discussion Générale</h5>
                    <span className="online-count">
                      {onlineUsers.length} membre(s) en ligne
                    </span>
                    {groupTypingUsers.length > 0 && (
                      <div className="typing-indicator">
                        <span className="typing-dots">
                          <span>.</span><span>.</span><span>.</span>
                        </span>
                        {groupTypingUsers.join(", ")} écrit...
                      </div>
                    )}
                  </div>
                </div>

                {/* Zone des messages de groupe */}
                <div className="messages-container">
                  {groupLoading ? (
                    <div className="loading-messages">
                      <div className="spinner-border spinner-border-sm me-2"></div>
                      Chargement des messages...
                    </div>
                  ) : groupMessages.length === 0 ? (
                    <div className="no-messages">
                      <p>Bienvenue dans la discussion générale</p>
                      <small className="text-muted">Soyez le premier à envoyer un message !</small>
                    </div>
                  ) : (
                    groupMessages.map((msg) => (
                      <MessageBubble 
                        key={msg.id || `group-msg-${Date.now()}-${Math.random()}`} 
                        msg={msg} 
                        userId={userId}
                        onReply={setReplyTo}
                        onDelete={() => handleDelete(msg.id, true)}
                        isGroup={true}
                      />
                    ))
                  )}
                  <div ref={groupMessagesEndRef} />
                </div>

                {/* Indicateur de saisie groupe */}
                {groupTypingUsers.length > 0 && (
                  <TypingIndicator users={groupTypingUsers} />
                )}

                {/* Zone de saisie groupe */}
                <MessageForm
                  newMessage={newMessage}
                  onChange={handleInputChange}
                  onSubmit={handleSend}
                  replyTo={replyTo}
                  onCancelReply={() => setReplyTo(null)}
                  disabled={false}
                  placeholder={replyTo ? "Votre réponse..." : "Message à tout le groupe..."}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant MessageBubble réutilisable
const MessageBubble = ({ msg, userId, onReply, onDelete, isGroup = false }) => {
  const isSender = msg.sender_id === userId;
  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className={`message-bubble ${isSender ? 'sent' : 'received'} ${isGroup ? 'group' : ''}`}>
      {/* En-tête pour les messages de groupe */}
      {isGroup && !isSender && (
        <div className="message-group-header">
          <strong>{msg.sender_name}</strong>
        </div>
      )}

      {/* Indicateur de réponse */}
      {msg.content && msg.content.startsWith('🗨️') && (
        <div className="reply-indicator">
          <FaReply className="me-1" />
          Réponse
        </div>
      )}

      <div className="message-content">
        {msg.content}
      </div>

      <div className="message-footer">
        <span className="message-time">
          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString() : 'Maintenant'}
        </span>
      </div>

      <div className="message-actions">
        <FaReply
          title="Répondre"
          className="action-btn reply-btn"
          onClick={() => onReply(msg)}
        />
        {(isSender || userData?.role === 'admin') && (
          <FaTrash
            title="Supprimer"
            className="action-btn delete-btn"
            onClick={onDelete}
          />
        )}
      </div>
    </div>
  );
};

// Composant TypingIndicator réutilisable
const TypingIndicator = ({ users }) => (
  <div className="typing-alert">
    <div className="typing-animation">
      <span></span>
      <span></span>
      <span></span>
    </div>
    {users.join(", ")} {users.length === 1 ? "est en train d'écrire" : "sont en train d'écrire"}...
  </div>
);

// Composant MessageForm réutilisable
const MessageForm = ({ 
  newMessage, 
  onChange, 
  onSubmit, 
  replyTo, 
  onCancelReply, 
  disabled, 
  placeholder 
}) => (
  <form onSubmit={onSubmit} className="message-form">
    {replyTo && (
      <div className="reply-preview">
        <div className="reply-content">
          <strong>Réponse à :</strong> {replyTo.content ? replyTo.content.slice(0, 50) : ''}...
        </div>
        <FaTimes
          className="cancel-reply"
          onClick={onCancelReply}
          title="Annuler la réponse"
        />
      </div>
    )}
    
    <div className="input-group">
      <input
        type="text"
        placeholder={placeholder}
        value={newMessage}
        onChange={onChange}
        disabled={disabled}
        className="message-input"
      />
      <button
        type="submit"
        disabled={!newMessage.trim() || disabled}
        className="send-btn"
      >
        <FaPaperPlane />
      </button>
    </div>
  </form>
);

export default Chat;