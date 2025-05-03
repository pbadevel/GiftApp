import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Checkmark from '@/components/CheckMark';
import RaffleTimer from '@/components/Timer';
import Tickets from '@/components/TicketCard';
import InviteSection from '@/components/InviteUser';
import { apiService, UserData, Channel, SubscriptionStatus } from '@/utils/api';

import styles from '../styles/main-page.module.css';
// import fstyles from '@/styles/follow.module.css'

interface Ticket {
  id: string;
  number: string;
  createdAt: string;
}

export default function GiveawayInterface() {
  const router = useRouter();
  const [channels, setChannels] = useState<Channel[]>([]);
//   const [userData, setUserData] = useState<UserData | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [allSubscribed, setAllSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загрузка начальных данных
  useEffect(() => {
    const fetchInitialData = async () => {
      try {

        const subscriptionResponse = await apiService.checkSubscriptions('123');

        console.log(subscriptionResponse)

        setChannels(subscriptionResponse.details);
        setAllSubscribed(subscriptionResponse.allSubscribed);
        // setUserData(userDataResponse);
      } catch (err) {
        console.error(err)
        setError('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);


  // Проверка подписок
  const checkSubscriptions = async () => {
    setIsChecking(true);
    try {
      const result = await apiService.checkSubscriptions(
        '123'
      );

      const updatedChannels = channels.map(channel => ({
        ...channel,
        isSubscribed: result.details.find(
          d => d.channelId === channel.id
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
                  key={channel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={styles.channelCard}
                >
                  <div className={styles.channelInfo}>
                    <h3>{channel.name}</h3>
                    <a
                      href={channel.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.channelLink}
                    >
                      Перейти к каналу
                    </a>
                  </div>
                  <button
                    // onClick={() => handleSubscribe(channel.id)}
                    className={styles.subscribeButton}
                    disabled={channel.isSubscribed}
                  >
                    {channel.isSubscribed ? '✓ Подписан' : 'Подписаться'}
                  </button>
                </motion.div>
              )
            ))}
            
            <button
              onClick={checkSubscriptions}
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