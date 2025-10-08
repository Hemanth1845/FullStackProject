import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import api from '../../api';

// --- STYLED COMPONENTS (No changes) ---
const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 75vh;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;
const PageTitle = styled.h1`
  margin-bottom: 20px;
  color: #333;
  font-size: 2rem;
  border-bottom: 2px solid #4a90e2;
  padding-bottom: 10px;
`;
const MessageArea = styled.div`
    flex-grow: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
`;
const Message = styled.div`
    max-width: 70%;
    padding: 10px 15px;
    border-radius: 18px;
    margin-bottom: 10px;
    align-self: ${props => props.$isSender ? 'flex-end' : 'flex-start'};
    background-color: ${props => props.$isSender ? '#3498db' : '#ecf0f1'};
    color: ${props => props.$isSender ? 'white' : '#333'};
`;
const InputArea = styled.div`
    display: flex;
    padding: 10px;
    border-top: 1px solid #ddd;
`;
const TextInput = styled.input`
    flex-grow: 1;
    border: 1px solid #ccc;
    border-radius: 20px;
    padding: 10px 15px;
    margin-right: 10px;
    outline: none;
`;
const SendButton = styled.button`
    border: none;
    background-color: #3498db;
    color: white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    flex-shrink: 0;
`;
const Timestamp = styled.div`
    font-size: 0.75rem;
    color: ${props => props.$isSender ? '#f1f1f1' : '#888'};
    margin-top: 5px;
    text-align: right;
`;

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const stompClient = useRef(null);
    const userId = sessionStorage.getItem('userId');
    const messageAreaRef = useRef(null);
    const ADMIN_ID = 1; // The admin's user ID is 1

    useEffect(() => {
        // Scroll to the bottom whenever messages change
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const socket = new SockJS(`${import.meta.env.VITE_APP_API_URL.replace('/api', '')}/ws`);
        stompClient.current = Stomp.over(() => socket);
        
        stompClient.current.reconnect_delay = 5000;

        stompClient.current.connect({}, (frame) => {
            console.log('Connected: ' + frame);
            stompClient.current.subscribe(`/user/${userId}/queue/messages`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                setMessages(prev => [...prev, receivedMessage]);
            });
        });

        const fetchHistory = async () => {
            try {
                const response = await api.get(`/chat/history/${ADMIN_ID}`);
                setMessages(response.data);
            } catch (error) {
                console.error("Failed to fetch chat history:", error);
                Swal.fire('Error', 'Could not load chat history.', 'error');
            }
        };
        fetchHistory();

        return () => {
            if (stompClient.current?.connected) {
                stompClient.current.disconnect();
            }
        };
    }, [userId]);

    const sendMessage = () => {
        if (newMessage.trim() && stompClient.current?.connected) {
            const chatMessageDTO = {
                senderId: parseInt(userId, 10),
                recipientId: ADMIN_ID,
                content: newMessage,
            };
            stompClient.current.send("/app/chat", {}, JSON.stringify(chatMessageDTO));
            setNewMessage('');
        } else if (!stompClient.current?.connected) {
            Swal.fire('Error', 'Not connected to chat service. Please refresh.', 'error');
        }
    };

    return (
        <div>
            <PageTitle>Chat with Admin</PageTitle>
            <ChatContainer>
                <MessageArea ref={messageAreaRef}>
                    {messages.map((msg, index) => (
                        <Message key={index} $isSender={msg.senderId == userId}>
                            {msg.content}
                             <Timestamp $isSender={msg.senderId == userId}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Timestamp>
                        </Message>
                    ))}
                </MessageArea>
                <InputArea>
                    <TextInput
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                    />
                    <SendButton onClick={sendMessage}>
                        <FontAwesomeIcon icon={faPaperPlane} />
                    </SendButton>
                </InputArea>
            </ChatContainer>
        </div>
    );
};

export default Chat;