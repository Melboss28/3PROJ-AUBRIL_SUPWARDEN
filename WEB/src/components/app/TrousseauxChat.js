import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

const TrousseauxChat = ({ socket, username, room, messageHistory }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Utilisez useEffect pour mettre à jour l'état des messages lorsque l'historique des messages change
  useEffect(() => {
    if (messageHistory) {
      setMessages(messageHistory);
    }
  }, [messageHistory]);

  // Écoutez l'événement "receive_message" pour recevoir de nouveaux messages
  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Nettoyez l'écouteur d'événements lors du démontage du composant
    return () => {
      socket.off("receive_message");
    };
  }, [socket]);

  // Utilisez une fonction pour comparer les noms d'utilisateur de manière insensible à la casse
  const isCurrentUser = (author) => {
    console.log('username', username.toLowerCase())
    console.log(author.toLowerCase())
    console.log(username.toLowerCase() === author.toLowerCase())
    return username.toLowerCase() === author.toLowerCase();
  };

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username, // Utilisez le nom d'utilisateur actuel comme l'auteur du message
        content: currentMessage,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };

      // Envoyez le message au serveur
      await socket.emit("send_message", messageData);

      // Ajoutez le message envoyé à la liste des messages
      setMessages((prevMessages) => [...prevMessages, messageData]);

      // Effacez le champ de message après l'envoi
      setCurrentMessage("");
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messages && messages.map((messageContent, index) => (
            <div
              key={index}
              className={`message ${isCurrentUser(messageContent.author) ? "you" : "other"}`}
            >
              <div>
                <div className="message-content">
                  <p>{messageContent.content}</p>
                </div>
                <div className="message-meta">
                  <p id="time">{messageContent.time}</p>
                  <p id="author">{messageContent.author}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
};

export default TrousseauxChat;