// import "./TrousseauxChatApp.css";
import React, { useState, useEffect } from "react";
import Chat from "./TrousseauxChat.js";
import io from "socket.io-client";
import { useParams } from "react-router-dom";
import { accountService } from '../../_services/account.service';
import chatpng from '../../img/chat.png';

const socket = io.connect("http://localhost:3001");

const TrousseauxChatApp = () => {
    const theusername = accountService.getTokenInfo().pseudo;
    const id = useParams().id;
    const theroom = id;
    const [username, setUsername] = useState(theusername);
    const [room, setRoom] = useState(theroom);
    const [showChat, setShowChat] = useState(false);
    const [messageHistory, setMessageHistory] = useState([]);

    useEffect(() => {
    
        socket.on("message_history", (history) => {
            setMessageHistory(history);
        });
    
        return () => {
            socket.off("message_history");
        };
    }, []);

    const joinRoom = () => {
        if (showChat) {
            setShowChat(false);
            return;
        }
        if (username !== "" && room !== "") {
          socket.emit("join_room", { room: room });
          setShowChat(true);
        }
    };

    return (
        <>
            {!showChat ? (
            <img onClick={joinRoom} src={chatpng} className='icon' alt="Chat" />
            ) : (
            <>
                <img onClick={joinRoom} src={chatpng} className='icon' alt="Chat" />
                <Chat socket={socket} username={username} room={room} messageHistory={messageHistory} />
            </>
            )}
        </>
    )
}

export default TrousseauxChatApp