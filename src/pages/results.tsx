import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { apiService, Winner } from '@/utils/api';
import styles from '../styles/results.module.css';

import Trophy from '@/components/TrophySVG';

// interface Props {
//   winners: Winner[];
// }

export default function ResultsPage() {

  const router = useRouter();
  const { eventId } = router.query; // Получаем параметр из URL
  
  const [winners, setWinners] = useState<Winner[]>([]);
  const [eventID, setEventId] = useState('');


  useEffect(() => {
    if (eventId) {
      // Сохраняем eventId в localStorage
      localStorage.setItem('event_id', eventId as string);
      setEventId(eventId as string)
    }
  }, [eventId]);
  
  useEffect(() => {
    // Проверяем, что приложение запущено внутри Telegram
    if (typeof window.Telegram?.WebApp !== 'undefined') {
      const tg = window.Telegram.WebApp;
      tg.ready(); // Инициализация интерфейса

      // Получаем данные пользователя
      const user = tg.initDataUnsafe.user;
      const userId = user?.id.toString();

      localStorage.setItem('user_id', userId);

    }
  }, []);

  useEffect(() => {
    const fetchWinnerData = async () => {
      try {
        const winners = await apiService.getWinners(eventID);
        setWinners(winners);
      
      } catch (error) {
        console.error(error)
      }
    }
      
    fetchWinnerData();
  
  }, []);



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
              width={80}
              height={80}
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
