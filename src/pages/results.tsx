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

const parseCustomParams2 = (paramString: string) => {
  return paramString.split(':').reduce((acc: Record<string, string>, pair) => {
    const [key, value] = pair.split('-');
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {});
};

export default function ResultsPage() {

  const router = useRouter();
  // const { eventId } = router.query; // Получаем параметр из URL

  const startParam = router.query.tgWebAppStartParam as string;

  const params = new URLSearchParams(startParam);
  console.log('PARAMS:', params);
  const eventId = params.get('event_id');

  
  const [winners, setWinners] = useState<Winner[]>([]);
  // const [action, setAction] = useState<string>('');
  const [eventID, setEventId] = useState('');

  useEffect(() => {
      const startParam = router.query.tgWebAppStartParam as string;
      const params = parseCustomParams2(startParam);
      if (params.event_id) {
        // setAction(params.action);
        setEventId(params.event_id);
        
      }
  
    },[router]);
  
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Шаг 1: Получение eventId из URL
        if (eventId && typeof eventId === 'string') {
          localStorage.setItem('event_id', eventId);
          setEventId(eventId);
        } else {
          // throw new Error('Event ID not found in URL');
          console.log('faild to load eventId')
        }
  
        // Шаг 2: Получение userID из Telegram
        if (typeof window.Telegram?.WebApp !== 'undefined') {
          const tg = window.Telegram.WebApp;
          await tg.ready();
          tg.expand(); // Растягивает приложение на весь экран
          
          const user = tg.initDataUnsafe.user;
          const userId = user?.id?.toString();
          
          if (!userId) throw new Error('Telegram user ID not found');
          
          localStorage.setItem('user_id', userId);
        } else {
          throw new Error('Not running in Telegram context');
        }
  
      } catch (error) {
        console.error('Initialization error:', error);
        
      }
    };
  
    initializeData();
  }, [eventId]); // Зависимость от eventId
  

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
  
  }, [eventID]);



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
