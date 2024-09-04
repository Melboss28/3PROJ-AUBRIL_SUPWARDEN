import React, { useState, useEffect } from "react";
import Chat from "../../components/app/Chat";
import io from "socket.io-client";
import axios from 'axios';
import VerticalNavbar from '../../components/VerticalNavbar';
import { accountService } from '../../_services/account.service';
import './chatApp.css';

const socket = io.connect("http://localhost:3001");

const ChatApp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const theUserId = accountService.getTokenInfo().userId;
  const [username, setUsername] = useState(accountService.getTokenInfo().pseudo);
  const [userId, setUserId] = useState(theUserId);
  const [room, setRoom] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [newConversationUser, setNewConversationUser] = useState('');
  const [refreshConversations, setRefreshConversations] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    socket.emit("get_conversations", userId);

    socket.on("conversations", (conversations) => {
      setConversations(conversations);
    });

    return () => {
      socket.off("conversations");
    };
  }, [refreshConversations]);

  const joinRoom = (otherUserId) => {
    const newRoom = userId < otherUserId ? `${userId}_${otherUserId}` : `${otherUserId}_${userId}`;
    setRoom(newRoom);
    socket.emit("join_room", { room: newRoom });
    setShowChat(true);
  };

  const createConversation = async () => {
    try {
      // Fetch the user by pseudo
      const response = await axios.get(`http://localhost:3001/api/user/by-pseudo/${newConversationUser}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const otherUser = response.data;

      if (otherUser._id) {
        // Check if a conversation already exists
        const conversationResponse = await axios.post('http://localhost:3001/api/user/conversation', {
          userId,
          otherUserId: otherUser._id
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        const conversation = conversationResponse.data;
        if (conversation._id) {
          setRefreshConversations(!refreshConversations);
          joinRoom(otherUser._id);
        } else {
          setMessage('Conversation déjà existante');
        }
      } else {
        setMessage('Utilisateur non trouvé');
      }
    } catch (err) {
      console.error("Erreur création conversation :", err);
      setMessage(err.response?.data?.message || "Erreur lors de la création de la conversation");
    }
  };

  return (
    <div className="page">
      <VerticalNavbar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`main-content ${isOpen ? 'open' : 'closed'}`}>
        <div className="chatAppContainer">
          <div className="conversationsList">
            <h1>Conversations</h1>
            <input
              type="text"
              placeholder="Enter username"
              value={newConversationUser}
              onChange={(e) => setNewConversationUser(e.target.value)}
            />
            <a className="error">{message}</a>
            <button onClick={createConversation}>Create New Conversation</button>
            <div className="conversations">
              {conversations.map((conversation) => {
                const otherParticipant = conversation.participants.find(p => p._id !== userId);

                // Ensure otherParticipant is found before accessing its properties
                if (!otherParticipant) {
                  console.error('No valid participant found in conversation:', conversation);
                  return null; // or display a placeholder, or handle this case appropriately
                }

                return (
                  <button key={conversation._id} onClick={() => joinRoom(otherParticipant._id)}>
                    {otherParticipant.pseudo}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="chatContainer">
            {showChat ? <Chat socket={socket} username={username} userId={userId} room={room} /> : <p>Select a conversation to start chatting</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatApp;
