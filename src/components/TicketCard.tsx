import { useState, useEffect } from 'react';

import { Ticket, apiService } from '@/utils/api';

import styles from '../styles/main-page.module.css';



const Tickets = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);


    
    useEffect(() => {
        const fetchData = async () => {
        try {
            
            const userData = await apiService.getUserTickets('1060834219');
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