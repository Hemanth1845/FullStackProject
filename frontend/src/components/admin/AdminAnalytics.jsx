import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faHandshake, faChartLine } from '@fortawesome/free-solid-svg-icons';
import api from '../../api';
import Swal from 'sweetalert2';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Container = styled.div` padding: 20px; `;
const PageTitle = styled.h1`
  margin-bottom: 30px;
  color: #333;
  font-size: 2rem;
  border-bottom: 2px solid #e74c3c;
  padding-bottom: 10px;
`;
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;
const StatCard = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
`;
const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${props => props.bgColor || '#e74c3c'};
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  margin-right: 15px;
  flex-shrink: 0;
`;
const StatContent = styled.div` flex: 1; `;
const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;
const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
`;
const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 20px;
`;
const ChartCard = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: 400px;
`;
const ChartTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  font-size: 1.2rem;
`;
const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top: 4px solid #e74c3c;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;

const AdminAnalytics = () => {
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/admin/analytics');
        setStats(response.data);

        if (response.data.customerGrowth && response.data.customerGrowth.length > 0) {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            let cumulativeCustomers = 0;
            const formattedData = response.data.customerGrowth.map(item => {
                const [year, month] = item.date.split('-');
                const shortYear = year.substring(2);
                const monthName = monthNames[parseInt(month, 10) - 1];
                cumulativeCustomers += item.count;
                return { name: `${monthName} '${shortYear}`, total: cumulativeCustomers };
            });
            setChartData(formattedData);
        } else {
            setChartData([{ name: 'Start', total: 0 }]);
        }

        if (response.data.leaderboard) {
            setLeaderboardData(response.data.leaderboard);
        }

      } catch (error) {
        Swal.fire('Error', 'Failed to load analytics data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, []);
  
  if (loading) {
    return (
      <Container>
        <PageTitle>Analytics Dashboard</PageTitle>
        <LoadingSpinner><div className="spinner"></div></LoadingSpinner>
      </Container>
    );
  }
  
  return (
    <Container>
      <PageTitle>Analytics Dashboard</PageTitle>
      
      <StatsGrid>
        <StatCard>
          <StatIcon bgColor="#e74c3c"><FontAwesomeIcon icon={faUsers} /></StatIcon>
          <StatContent>
            <StatValue>{stats.totalCustomers ?? 0}</StatValue>
            <StatLabel>Total Customers</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon bgColor="#3498db"><FontAwesomeIcon icon={faUsers} /></StatIcon>
          <StatContent>
            <StatValue>{stats.activeCustomers ?? 0}</StatValue>
            <StatLabel>Active Customers</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon bgColor="#2ecc71"><FontAwesomeIcon icon={faHandshake} /></StatIcon>
          <StatContent>
            <StatValue>{stats.totalInteractions ?? 0}</StatValue>
            <StatLabel>Total Interactions</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon bgColor="#f39c12"><FontAwesomeIcon icon={faChartLine} /></StatIcon>
          <StatContent>
            <StatValue>{stats.conversionRate ?? 0}%</StatValue>
            <StatLabel>Conversion Rate</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>
      
      <ChartsGrid>
        <ChartCard>
          <ChartTitle>Customer Growth</ChartTitle>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" name="Total Customers" stroke="#e74c3c" activeDot={{ r: 8 }} strokeWidth={2}/>
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard>
            <ChartTitle>Top Customers by Interactions</ChartTitle>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={leaderboardData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="username" type="category" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="interactionCount" name="Total Interactions" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </ChartCard>
      </ChartsGrid>
    </Container>
  );
};

export default AdminAnalytics;

