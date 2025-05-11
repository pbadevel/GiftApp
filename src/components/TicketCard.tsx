import { useState, useEffect } from 'react';

import { Ticket, apiService } from '@/utils/api';
import { getLocalStorage } from '@/utils/LocalStorageUtils';

import styles from '../styles/main-page.module.css';



const Tickets = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);

    const userID = getLocalStorage('user_id')
    const eventID = getLocalStorage('event_id')


    
    useEffect(() => {
        const fetchData = async () => {
        try {
            
            const userData = await apiService.getUserTickets(userID as string);
            setTickets(userData.tickets);

        } catch (error) {
            console.error(error);
        }
        };
        
        fetchData();
    }, []);
    
    return (
    <div className={styles.ticketsSection}>
        <h2 className={styles.sectionTitle}>🎟 Тикеты</h2>
        <div className={styles.ticketsList}>
            {tickets.map(ticket => (
            <div key={ticket.id} className={styles.ticketCard}>
                <div>Тикет: <span className={styles.ticketNumber}>{ticket.number}</span></div>
                <div className={styles.ticketDate}>Получен : {ticket.createdAt}</div>
            </div>
            ))}
        </div>
        </div>
    );
}

export default Tickets