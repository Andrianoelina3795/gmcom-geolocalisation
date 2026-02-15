import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DeleteConversation = ({ receiverId, onDeleteSuccess, token, setReceiverId, setMessages }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
   const [ unreadCount, setUnreadCount] = useState(0); // compteur global


  // Ferme le menu si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDelete = async () => {
    setOpen(false);

    const confirm = window.confirm("Voulez-vous vraiment supprimer cette conversation ?");
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:8000/api/conversations/delete-with/${receiverId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Vide les messages et réinitialise la conversation
      setMessages([]);
      setReceiverId(null);

      // Callback optionnel
      if (onDeleteSuccess) onDeleteSuccess();

    } catch (error) {
      console.error("Erreur lors de la suppression de la conversation :", error);
      alert("Une erreur est survenue lors de la suppression.");
    }
  };

    //Marquer tous les messages comme lu
  const markAllMessagesAsRead = async () => {
  try {
    await axios.post('http://localhost:8000/api/messages/mark-all-as-read', {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    // Optionnel : mettre à jour l’état local
    toast.success('Tous les messages ont été marqués comme lus.');
    setUnreadCount(0); // si tu utilises un compteur global
  } catch (error) {
    toast.error('Erreur lors de la mise à jour des messages.');
    console.error(error);
  }
};

  return (
    <div style={{ position: "relative", display: "inline-block" }} ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Options"
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "5px",
          fontSize: "20px",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        &#8942;
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            background: "#fff",
            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
            borderRadius: "6px",
            zIndex: 1000,
            minWidth: "180px",
            padding: "6px 0",
          }}
        >
          <button
            onClick={handleDelete}
            style={{
              padding: "8px 12px",
              backgroundColor: "transparent",
              border: "none",
              width: "105%",
              textAlign: "left",
              marginRight:"110px",
              cursor: "pointer",
              color: "#d32f2f",
              fontWeight: 600,
              fontSize: "14px",
              transition: "background-color 0.2s ease-in-out",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#f9f9f9")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
          >
            🗑️ Supprimer la conversation
          </button>

          {/*Marquer tous les messages comme Lu*/}
            <button onClick={markAllMessagesAsRead} style={{
              padding: "8px 12px",
              backgroundColor: "transparent",
              border: "none",
              width: "105%",
              textAlign: "left",
              marginRight:"110px",
              cursor: "pointer",
              color: "Black",
              fontWeight: 600,
              fontSize: "14px",
              transition: "background-color 0.2s ease-in-out",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#f9f9f9")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}>
            Tout marquer comme lu
            </button>
        </div>
      )}
    </div>
  );
};

export default DeleteConversation;
