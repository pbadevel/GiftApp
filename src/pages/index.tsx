import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Checkmark from '@/components/CheckMark';
import RaffleTimer from '@/components/Timer';
import Tickets from '@/components/TicketCard';
import InviteSection from '@/components/InviteUser';
import LoaderSVG from '@/components/Loader';
import ResultsPage from './results';
import { apiService, Channel } from '@/utils/api';

import styles from '../styles/main-page.module.css';


export default function GiveawayInterface() {
  const router = useRouter();
  // const { eventId } = router.query; // Получаем параметр из URL
  const startParam = router.query.tgWebAppStartParam as string;

  const params = new URLSearchParams(startParam);

  console.log('PARAMS:', params);

  const eventId = params.get('event_id');
  const action = params.get('mode');

  console.log(router.query)

  const [userID, setUserId] = useState<string>('');
  const [eventID, setEventId] = useState<string>('');


  const [channels, setChannels] = useState<Channel[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [allSubscribed, setAllSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  // Загрузка начальных данных
  
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
          setUserId(userId);
        } else {
          throw new Error('Not running in Telegram context');
        }
  
      } catch (_error) {
        console.error('Initialization error:', _error);
        setError('Ошибка инициализации данных');

        setLoading(false);
      }
    };
  
    initializeData();
  }, [eventId]); // Зависимость от eventId
  
  // Эффект для загрузки данных после инициализации
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!userID || !eventID) return; // Ждем пока данные появятся
      
      try {
        setLoading(true);
        const subscriptionResponse = await apiService.checkSubscriptions(userID, eventID);
        
        setChannels(subscriptionResponse.details);
        setAllSubscribed(subscriptionResponse.allSubscribed);
        
      } catch (_err) {
        console.error(_err);
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };
  
    fetchInitialData();
  }, [userID, eventID]); // Срабатывает при изменении userID или eventID
  



  // Проверка подписок
  const checkSubscriptionsOnSite = async () => {
    setIsChecking(true);
    try {
      const result = await apiService.checkSubscriptions(
        userID,
        eventID
      );

      const updatedChannels = channels.map(channel => ({
        ...channel,
        isSubscribed: result.details.find(
          d => d.channelId === channel.channelId
        )?.isSubscribed || false
      }));

      setChannels(updatedChannels);
      setAllSubscribed(result.allSubscribed);

      if (result.allSubscribed) {
        router.reload();
      }
    } catch (_err) {
      console.error(_err)
      setError('Ошибка проверки подписок');
    } finally {
      setIsChecking(false);
    }
  };

  console.log(`userid=${userID}  eventid=${eventID}`)

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoaderSVG />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorText}>{error}</div>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (action == 'results') {
    return (
      <ResultsPage />
    )
  } 

  return (
    <div className={styles.container}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles.contentWrapper}
      >
        {/* <Link href="/admin" className={styles.adminLink}>
          Админ-панель
        </Link> */}

        {allSubscribed ? (
          <>
            <Checkmark />
            <div className={styles.headerSection}>
              <h1 className={styles.mainTitle}>Вы участвуете в розыгрыше!</h1>
              <div className={styles.warningBox}>
                ⚠️ Не отписывайтесь от каналов! Вы вылетите из розыгрыша!
              </div>
              <RaffleTimer />
              <div className={styles.subTitle}>До завершения</div>
            </div>
            
            {/* <a
            href=''
            className={styles.infoButton}>
              Подробнее о розыгрыше
            </a> */}
            
            <InviteSection />
            <Tickets />
          </>
        ) : (
          <div className={styles.channelsSection}>
            <h2>Для участия подпишитесь на все каналы:</h2>
            
            {channels.map((channel) => (
              !channel.isSubscribed && (
                <motion.div
                  key={channel.channelId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={styles.channelCard}
                >
                  <div className={styles.channelInfo}>
                      <Image
                        src={channel.image_data as string}
                        alt={channel.channelName}
                        width={80}
                        height={80}
                        className={styles.avatar}
                      />
                    <h3>{channel.channelName}</h3>
                  </div>
                  <a
                    className={styles.subscribeButton}
                    target='_blank'
                    href={channel.channelUrl}
                  >
                    {channel.isSubscribed ? '✓ Подписан' : 'Подписаться'}
                  </a>
                </motion.div>
              )
            ))}
            
            <button
              onClick={checkSubscriptionsOnSite}
              className={styles.checkButton}
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <span className={styles.spinner} />
                  Проверяем...
                </>
              ) : (
                'Проверить подписки'
              )}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}