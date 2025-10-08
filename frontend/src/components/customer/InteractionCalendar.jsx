import React from 'react';
import styled from 'styled-components';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../../api';
import Swal from 'sweetalert2';

const CalendarContainer = styled.div`
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);

  .fc { 
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  .fc-event {
    cursor: pointer;
    border: none;
    padding: 5px;
  }
  .fc-event-main {
    font-size: 0.85rem;
    color: white;
  }
`;

const PageTitle = styled.h1`
  margin-bottom: 30px;
  color: #333;
  font-size: 2rem;
  border-bottom: 2px solid #4a90e2;
  padding-bottom: 10px;
`;

const InteractionCalendar = () => {

    const fetchEvents = async (fetchInfo, successCallback, failureCallback) => {
        try {
            const userId = sessionStorage.getItem('userId');
            if (!userId) {
                throw new Error("User not logged in");
            }
            // The backend endpoint now exists to handle this request
            const response = await api.get(`/customers/${userId}/calendar`, {
                params: {
                    start: fetchInfo.startStr,
                    end: fetchInfo.endStr
                }
            });

            const formattedEvents = response.data.map(interaction => ({
                id: interaction.id,
                title: interaction.subject,
                start: interaction.date,
                extendedProps: {
                    type: interaction.type,
                    notes: interaction.notes,
                    adminStatus: interaction.adminStatus,
                    customerStatus: interaction.customerStatus
                },
                backgroundColor: interaction.adminStatus === 'COMPLETED' ? '#2ecc71' : (interaction.adminStatus === 'SCHEDULED' ? '#3498db' : '#f39c12'),
                borderColor: interaction.adminStatus === 'COMPLETED' ? '#27ae60' : (interaction.adminStatus === 'SCHEDULED' ? '#2980b9' : '#d35400')
            }));
            successCallback(formattedEvents);
        } catch (error) {
            console.error("Failed to fetch calendar events:", error);
            Swal.fire('Error', 'Could not fetch calendar events.', 'error');
            if (failureCallback) failureCallback(error);
        }
    };

    const handleEventClick = (clickInfo) => {
        const { type, notes, adminStatus, customerStatus } = clickInfo.event.extendedProps;
        Swal.fire({
            title: clickInfo.event.title,
            html: `
                <div style="text-align: left; padding: 0 20px;">
                    <p><strong>Type:</strong> ${type}</p>
                    <p><strong>Admin Status:</strong> ${adminStatus || 'N/A'}</p>
                    <p><strong>My Status:</strong> ${customerStatus || 'N/A'}</p>
                    <p><strong>Notes:</strong> ${notes || 'No notes available.'}</p>
                </div>
            `,
            icon: 'info',
            confirmButtonColor: '#4a90e2'
        });
    };

    return (
        <div>
            <PageTitle>My Interaction Calendar</PageTitle>
            <CalendarContainer>
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={fetchEvents}
                    eventClick={handleEventClick}
                    height="70vh"
                    editable={false}
                    selectable={false}
                />
            </CalendarContainer>
        </div>
    );
};

export default InteractionCalendar;