import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import api from '../../api'; // Assuming you have a configured axios instance

const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 80vh;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
`;

const PageTitle = styled.h1`
  margin-bottom: 20px;
  color: #333;
  font-size: 2rem;
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
    align-self: ${props => props.issender ? 'flex-end' : 'flex-start'};
    background-color: ${props => props.issender ? '#3498db' : '#ecf0f1'};
    color: ${props => props.issender ? 'white' : '#333'};
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
`;

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const stompClient = useRef(null);
    const userId = sessionStorage.getItem('userId');

    useEffect(() => {
        const socket = new SockJS(`${import.meta.env.VITE_APP_API_URL.replace('/api', '')}/ws`);
        stompClient.current = Stomp.over(socket);

        stompClient.current.connect({}, () => {
            // Subscribe to private messages for this user
            stompClient.current.subscribe(`/user/${userId}/queue/messages`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                setMessages(prev => [...prev, receivedMessage]);
            });
        });

        // Fetch initial chat history
        const fetchHistory = async () => {
            const response = await api.get(`/chat/history/1`); // Assuming admin ID is 1
            setMessages(response.data);
        };
        fetchHistory();

        return () => {
            if (stompClient.current) {
                stompClient.current.disconnect();
            }
        };
    }, [userId]);

    const sendMessage = () => {
        if (newMessage.trim() && stompClient.current) {
            const chatMessage = {
                senderId: userId,
                recipientId: 1, // Admin ID is assumed to be 1
                content: newMessage,
            };
            stompClient.current.send("/app/chat", {}, JSON.stringify(chatMessage));
            setNewMessage('');
            // Add message to local state immediately for better UX
            setMessages(prev => [...prev, { ...chatMessage, sender: { id: userId } }]);
        }
    };

    return (
        <div>
            <PageTitle>Chat with Admin</PageTitle>
            <ChatContainer>
                <MessageArea>
                    {messages.map((msg, index) => (
                        <Message key={index} issender={msg.sender.id == userId}>
                            {msg.content}
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

    
