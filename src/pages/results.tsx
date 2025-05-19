import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { apiService, Winner } from '@/utils/api';
import styles from '../styles/results.module.css';

import Trophy from '@/components/TrophySVG';

interface ResultsPageProps {
  event_id: string;
}


export default function ResultsPage( {event_id}: ResultsPageProps ) {

  
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        if (event_id) { // Используем пропс напрямую
          localStorage.setItem('event_id', event_id);
          const winners = await apiService.getWinners(event_id);
          setWinners(winners);
        }
      } catch (error) {
        console.error('Error loading winners:', error);
      }
    };
  
    initializeData();
  }, [event_id]); // Зависимость от пропса



  return (
    <div className={styles.container}>
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={styles.trophyContainer}
      >
        
        <Trophy />

      </motion.div>

      <h1 className={styles.title}>Победители розыгрыша</h1>
      
      <div className={styles.winnersList}>
        {winners.map((winner, index) => (
          <motion.div
            key={winner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={styles.winnerCard}
          >
            <Image
              src={winner.image_url}
              alt={winner.name}
              width={100}
              height={100}
              className={styles.avatar}
            />
            <div className={styles.winnerInfo}>
              <h3>{winner.name}</h3>
              <p>Билет: {winner.ticket}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
