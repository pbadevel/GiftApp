import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

import { decodeTelegramParams } from '@/utils/DecodeUtils';
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
  // const { eventId } = router.query; // Получаем параметр из URL

  // const startParam = router.query.tgWebAppStartParam as string;
  const { tgWebAppStartParam } = router.query;


  // const params = new URLSearchParams(startParam);
  // console.log('PARAMS:', params);
  // const eventId = params.get('event_id');

  
  const [winners, setWinners] = useState<Winner[]>([]);
  // const [action, setAction] = useState<string>('');
  const [eventID, setEventId] = useState('');

  useEffect(() => {
    if (typeof tgWebAppStartParam === 'string') {
      const data = decodeTelegramParams(tgWebAppStartParam);
      
      if (data) {
        console.log('Decoded data:', data);
        setEventId(data.event_id)

        // Пример данных: { event_id: "123", mode: "raffle" }
      }
    }

  },[tgWebAppStartParam]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Шаг 1: Получение eventId из URL
        if (eventID && typeof eventID === 'string') {
          localStorage.setItem('event_id', eventID);
          setEventId(eventID);
          const winners = await apiService.getWinners(eventID);
          setWinners(winners);
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
        
          const _update = await apiService.SendDataToServer(userId, user?.username?.toString())
        
          if (! _update.ok) throw new Error('Failed to update User');
        
          localStorage.setItem('user_id', userId);
        } else {
          throw new Error('Not running in Telegram context');
        }
  
      } catch (error) {
        console.error('Initialization error:', error);
        
      }
    };
  
    initializeData();
  }, [eventID]); // Зависимость от eventId
  

  useEffect(() => {
    const fetchWinnerData = async () => {
      try {
        
      
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
