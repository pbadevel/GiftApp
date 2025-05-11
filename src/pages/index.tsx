import { useState, useEffect } from 'react';
import { motion, number } from 'framer-motion';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Checkmark from '@/components/CheckMark';
import RaffleTimer from '@/components/Timer';
import Tickets from '@/components/TicketCard';
import InviteSection from '@/components/InviteUser';
import { apiService, Channel } from '@/utils/api';

import styles from '../styles/main-page.module.css';


export default function GiveawayInterface() {
  const router = useRouter();
  const { eventId } = router.query; // Получаем параметр из URL
  const [userID, setUserId] = useState<string>('1');
  const [eventID, setEventId] = useState<string>('1');


  const [channels, setChannels] = useState<Channel[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [allSubscribed, setAllSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  // Загрузка начальных данных
  
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

      setUserId(userId);
    }
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {

        const subscriptionResponse = await apiService.checkSubscriptions(userID, eventID);

        setChannels(subscriptionResponse.details);
        setAllSubscribed(subscriptionResponse.allSubscribed);
        
      } catch (err) {
        console.error(err)
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [userID, eventId]);



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
    } catch (err) {
      setError('Ошибка проверки подписок');
    } finally {
      setIsChecking(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
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
            
            <button className={styles.infoButton}>
              Подробнее о розыгрыше
            </button>
            
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
                        src={channel.image_data}
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