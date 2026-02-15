const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let connectedUsers = {}; // userId => { socketId, name }

io.on("connection", (socket) => {
  console.log(" Socket connecté :", socket.id);

  // Connexion utilisateur
  socket.on("user_connected", ({ id, name }) => {
    connectedUsers[id] = {
      socketId: socket.id,
      name: name,
    };
    console.log(`  Utilisateur connecté : ${name} (${id})`);

    // Met à jour la liste des utilisateurs connectés
    updateUserList();
  });

  // Rejoindre le groupe de discussion
  socket.on("join_group", ({ user_id, user_name }) => {
    socket.join('group_chat');
    console.log(`  ${user_name} a rejoint le groupe de discussion`);
    
    // Notifier les autres que quelqu'un a rejoint
    socket.to('group_chat').emit('user_joined_group', {
      user_id: user_id,
      user_name: user_name,
      message: `${user_name} a rejoint la discussion`
    });
  });

  // Messages privés
  socket.on("private-message", (data) => {
    console.log(`  Message privé de ${data.sender_name} à ${data.receiver_id}`);
    const receiver = connectedUsers[data.receiver_id];
    if (receiver) {
      io.to(receiver.socketId).emit("private-message", data);
      console.log(`  Message envoyé à ${receiver.name}`);
    } else {
      console.log(`  Destinataire ${data.receiver_id} non connecté`);
    }
  });

  // NOUVEAU : Messages de groupe
  socket.on("group-message", (data) => {
    console.log(`  Message groupe de ${data.sender_name}: ${data.content.substring(0, 50)}...`);
    
    // Diffuser à tous les membres du groupe (y compris l'émetteur)
    io.to('group_chat').emit("group-message", data);
    console.log(`  Message groupe diffusé à tous les membres`);
  });

  // Typing indicator pour messages privés
  socket.on("typing", ({ from, to }) => {
    console.log(`  ${from} écrit à ${to}`);
    const receiver = connectedUsers[to];
    if (receiver) {
      io.to(receiver.socketId).emit("typing", { from, to });
    }
  });

  socket.on("stopTyping", ({ from, to }) => {
    const receiver = connectedUsers[to];
    if (receiver) {
      io.to(receiver.socketId).emit("stopTyping", { from, to });
    }
  });

  // NOUVEAU : Typing indicator pour groupe
  socket.on("group_typing", ({ from }) => {
    console.log(`  ${from} écrit dans le groupe`);
    // Diffuser à tous les membres du groupe sauf l'émetteur
    socket.to('group_chat').emit("group_typing", { from });
  });

  socket.on("group_stop_typing", ({ from }) => {
    socket.to('group_chat').emit("group_stop_typing", { from });
  });

  // Déconnexion
  socket.on("disconnect", () => {
    const disconnectedUserId = Object.keys(connectedUsers).find(
      (key) => connectedUsers[key].socketId === socket.id
    );

    if (disconnectedUserId) {
      const userName = connectedUsers[disconnectedUserId].name;
      console.log(`  Utilisateur déconnecté : ${userName} (${disconnectedUserId})`);
      
      // Notifier le groupe si l'utilisateur était dans le groupe
      socket.to('group_chat').emit('user_left_group', {
        user_id: disconnectedUserId,
        user_name: userName,
        message: `${userName} a quitté la discussion`
      });
      
      delete connectedUsers[disconnectedUserId];
    }

    updateUserList();
  });

  // Fonction pour mettre à jour la liste des utilisateurs
  function updateUserList() {
    const userList = Object.entries(connectedUsers).map(([id, user]) => ({
      id: parseInt(id),
      name: user.name,
    }));

    io.emit("update_user_list", userList);
    console.log(`  Liste utilisateurs mise à jour: ${userList.length} connectés`);
  }

  // Gestion des erreurs
  socket.on("error", (error) => {
    console.error("  Erreur Socket:", error);
  });
});

// Route de santé pour vérifier que le serveur fonctionne
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    connectedUsers: Object.keys(connectedUsers).length,
    message: "Serveur Socket.io fonctionnel"
  });
});

// Route pour voir les utilisateurs connectés (debug)
app.get("/users", (req, res) => {
  res.json({
    connectedUsers: Object.entries(connectedUsers).map(([id, user]) => ({
      id: parseInt(id),
      name: user.name,
      socketId: user.socketId
    }))
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`  Serveur WebSocket lancé sur http://localhost:${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/health`);
  console.log(`  Users list: http://localhost:${PORT}/users`);
});