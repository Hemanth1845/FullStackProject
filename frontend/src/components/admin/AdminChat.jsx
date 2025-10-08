import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import api from '../../api';
import Swal from 'sweetalert2';

const PageTitle = styled.h1`
  margin-bottom: 20px;
  color: #333;
  font-size: 2rem;
  border-bottom: 2px solid #e74c3c;
  padding-bottom: 10px;
`;

const ChatLayout = styled.div`
    display: grid;
    grid-template-columns: 300px 1fr;
    height: 75vh;
    gap: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    overflow: hidden;
`;

const CustomerList = styled.div`
    border-right: 1px solid #eee;
    overflow-y: auto;
`;

const CustomerItem = styled.div`
    padding: 15px 20px;
    cursor: pointer;
    border-bottom: 1px solid #f0f0f0;
    background-color: ${props => props.$isActive ? '#f1f4f9' : 'transparent'};
    font-weight: ${props => props.$isActive ? 'bold' : 'normal'};
    transition: background-color 0.2s ease;
    &:hover {
        background-color: #f8f9fa;
    }
`;

const ChatPanel = styled.div`
    display: flex;
    flex-direction: column;
`;

const ChatHeader = styled.div`
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
    font-weight: bold;
    color: #333;
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
    background-color: ${props => props.$isSender ? '#e74c3c' : '#ecf0f1'};
    color: ${props => props.$isSender ? 'white' : '#333'};
`;

const Timestamp = styled.div`
    font-size: 0.75rem;
    color: ${props => props.$isSender ? '#f1f1f1' : '#888'};
    margin-top: 5px;
    text-align: right;
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
    background-color: #e74c3c;
    color: white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    flex-shrink: 0;
`;

const NoChatSelected = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #888;
    font-size: 1.2rem;
`;

const AdminChat = () => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const stompClient = useRef(null);
    const adminId = sessionStorage.getItem('userId');
    const messageAreaRef = useRef(null);

    useEffect(() => {
        // Scroll to bottom when messages update
        if (messageAreaRef.current) {
            messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchCustomers = useCallback(async () => {
        try {
            const response = await api.get('/admin/customers');
            setCustomers(response.data.content || []);
        } catch (error) {
            Swal.fire('Error', 'Could not fetch customer list.', 'error');
        }
    }, []);

    useEffect(() => {
        fetchCustomers();

        const socket = new SockJS(`${import.meta.env.VITE_APP_API_URL.replace('/api', '')}/ws`);
        stompClient.current = Stomp.over(() => socket);
        stompClient.current.reconnect_delay = 5000;

        stompClient.current.connect({}, (frame) => {
            console.log('Admin connected: ' + frame);
            stompClient.current.subscribe(`/user/${adminId}/queue/messages`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                // If the message is from the currently selected customer, add it to the view
                if (selectedCustomer && receivedMessage.senderId === selectedCustomer.id) {
                    setMessages(prev => [...prev, receivedMessage]);
                } else {
                    // Optional: show a notification for new messages from other customers
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'info',
                        title: `New message from ${receivedMessage.senderUsername}`,
                        showConfirmButton: false,
                        timer: 3000
                    });
                }
            });
        });

        return () => {
            if (stompClient.current?.connected) {
                stompClient.current.disconnect();
            }
        };
    }, [adminId, fetchCustomers, selectedCustomer]);
    
    const handleSelectCustomer = async (customer) => {
        setSelectedCustomer(customer);
        try {
            const response = await api.get(`/admin/chat/history/${customer.id}`);
            setMessages(response.data);
        } catch (error) {
            Swal.fire('Error', 'Could not fetch chat history.', 'error');
            setMessages([]);
        }
    };

    const sendMessage = () => {
        if (newMessage.trim() && selectedCustomer && stompClient.current?.connected) {
            const chatMessageDTO = {
                senderId: parseInt(adminId, 10),
                recipientId: selectedCustomer.id,
                content: newMessage,
            };
            stompClient.current.send("/app/chat", {}, JSON.stringify(chatMessageDTO));
            setNewMessage('');
        }
    };

    return (
        <div>
            <PageTitle>Chat with Customers</PageTitle>
            <ChatLayout>
                <CustomerList>
                    {customers.map(customer => (
                        <CustomerItem 
                            key={customer.id} 
                            onClick={() => handleSelectCustomer(customer)}
                            $isActive={selectedCustomer?.id === customer.id}
                        >
                            {customer.username}
                        </CustomerItem>
                    ))}
                </CustomerList>
                <ChatPanel>
                    {selectedCustomer ? (
                        <>
                            <ChatHeader>Chat with {selectedCustomer.username}</ChatHeader>
                            <MessageArea ref={messageAreaRef}>
                                {messages.map((msg, index) => (
                                    <Message key={index} $isSender={msg.senderId == adminId}>
                                        {msg.content}
                                        <Timestamp $isSender={msg.senderId == adminId}>
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
                                    placeholder={`Message ${selectedCustomer.username}...`}
                                />
                                <SendButton onClick={sendMessage}>
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                </SendButton>
                            </InputArea>
                        </>
                    ) : (
                        <NoChatSelected>
                            <FontAwesomeIcon icon={faUserCircle} style={{ marginRight: '10px' }} />
                            Select a customer to start chatting.
                        </NoChatSelected>
                    )}
                </ChatPanel>
            </ChatLayout>
        </div>
    );
};

export default AdminChat;