import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import Navbar from '../common/Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock, faUserShield } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import loginBackground from '/src/assets/images/login-background.jpg'; // Correctly import the image

const LoginContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  /* Use the imported image variable */
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(${loginBackground});
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
`; [cite: 798, 799]

const LoginContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`; [cite: 799]

const LoginCard = styled.div`
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`; [cite: 800, 801, 802]

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 2rem;
`; [cite: 803]

const Tabs = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid #ddd;
`; [cite: 804]

const Tab = styled.button`
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: ${({ $active }) => ($active ? 'bold' : 'normal')};
  color: ${({ $active }) => ($active ? '#4a90e2' : '#666')};
  cursor: pointer;
  position: relative;
  transition: color 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 3px;
    background-color: ${({ $active }) => ($active ? '#4a90e2' : 'transparent')};
    transition: background-color 0.3s ease;
  }
`; [cite: 805, 806, 807, 808, 809]

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`; [cite: 809]

const FormGroup = styled.div`
  position: relative;
`; [cite: 809, 810]

const Input = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #4a90e2;
    outline: none;
  }
`; [cite: 810, 811]

const Icon = styled.span`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
`; [cite: 812]

const Button = styled.button`
  padding: 12px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #357abD;
  }
  
  &:disabled {
    background-color: #a0a0a0;
    cursor: not-allowed;
  }
`; [cite: 813, 814, 815]

const RegisterLink = styled.p`
  text-align: center;
  margin-top: 1.5rem;
  color: #666;

  a {
    color: #4a90e2;
    text-decoration: none;
    font-weight: bold;

    &:hover {
      text-decoration: underline;
    }
  }
`; [cite: 816, 817]

const Login = () => {
  const [activeTab, setActiveTab] = useState('customer'); [cite: 818]
  const [username, setUsername] = useState(''); [cite: 818]
  const [password, setPassword] = useState(''); [cite: 819]
  const [loading, setLoading] = useState(false); [cite: 819]
  const navigate = useNavigate(); [cite: 819]

  const handleSubmit = async (e) => {
    e.preventDefault(); [cite: 820]
    if (!username || !password) {
      Swal.fire({ icon: 'error', title: 'Validation Error', text: 'Please enter both username and password' }); [cite: 821]
      return; [cite: 822]
    }
    
    setLoading(true); [cite: 822]
    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/auth/login`, {
        username,
        password,
        role: activeTab
      }); [cite: 823]
      const { token, userId } = response.data; [cite: 824]
      
      sessionStorage.setItem('token', token); [cite: 824]
      sessionStorage.setItem('role', activeTab); [cite: 824]
      sessionStorage.setItem('userId', userId); [cite: 824]
      await Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: `Welcome back, ${username}!`,
        timer: 1500,
        showConfirmButton: false
      }); [cite: 825]
      navigate(activeTab === 'admin' ? '/admin/customers' : '/customer/profile'); [cite: 826]

    } catch (error) {
      console.error('Login error:', error); [cite: 826]
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.response?.data?.message || 'Invalid credentials or role. Please try again.',
      }); [cite: 827]
    } finally {
      setLoading(false); [cite: 828]
    }
  };

  return (
    <LoginContainer>
      <Navbar />
      <LoginContent>
        <LoginCard>
          <Title>Login to CRM</Title>
          <Tabs>
            <Tab $active={activeTab === 'customer'} onClick={() => setActiveTab('customer')}>Customer Login</Tab>
            <Tab $active={activeTab === 'admin'} onClick={() => setActiveTab('admin')}>Admin Login</Tab>
          </Tabs>
      
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Icon><FontAwesomeIcon icon={activeTab === 'admin' ? faUserShield : faUser} /></Icon>
              <Input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </FormGroup>
            <FormGroup>
              <Icon><FontAwesomeIcon icon={faLock} /></Icon>
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </FormGroup>
            <Button type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
          </Form>
          {activeTab === 'customer' && (
            <RegisterLink>Don't have an account? <Link to="/register">Register here</Link></RegisterLink>
          )}
        </LoginCard>
      </LoginContent>
    </LoginContainer>
  ); [cite: 829, 830, 831, 832, 833]
};

export default Login;