import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';

import { useToast } from '@/context/ToastContext';

import Image from 'next/image';
import Checkmark from '@/components/CheckMark';
import RaffleTimer from '@/components/Timer';
import Tickets from '@/components/TicketCard';
import InviteSection from '@/components/InviteUser';
import LoaderSVG from '@/components/Loader';
import Captcha from '@/components/Captcha';
import ErrorMarkSvg from '@/components/ErrorMark';

import ResultsPage from './results';

import { decodeTelegramParams } from '@/utils/DecodeUtils';
import { apiService, Channel } from '@/utils/api';

import styles from '../styles/main-page.module.css';

export default function GiveawayInterface() {
  const router = useRouter();
  const { tgWebAppStartParam } = router.query;

  const [userID, setUserId] = useState<string>('');
  const [eventID, setEventId] = useState<string>('');
  const [action, setAction] = useState<string>('');
  const [referrer_id, setReferrerId] = useState<string>('');
  const [useCaptcha, setCaptcha] = useState<number>(1);
  const [tickets_to_invite, setTikForInv] = useState<number>(0);

  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReferralProcessed, setIsReferralProcessed] = useState(false);


  const [channels, setChannels] = useState<Channel[]>([]);
  const [allSubscribed, setAllSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Декодирование параметров из URL
  useEffect(() => {
    if (typeof tgWebAppStartParam === 'string') {
      const data = decodeTelegramParams(tgWebAppStartParam);
      if (data) {
        setEventId(data.event_id);
        setAction(data.mode || '');
        setReferrerId(data?.referrer_id || '');
      }
    }
  }, [tgWebAppStartParam]);

  // Инициализация Telegram WebApp
  const initializeTelegram = useCallback(async () => {
    try {
      const tg = window.Telegram?.WebApp;
      if (!tg) throw new Error('Telegram WebApp not available');
      
      await tg.ready();
      tg.expand();

      const user = tg.initDataUnsafe.user;
      const TGuserId = user?.id?.toString();
      if (!TGuserId) throw new Error('Telegram user ID not found');
      
      localStorage.setItem('user_id', TGuserId);
      
      await apiService.SendUserToServer(
        TGuserId,
        `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
        user?.username || ''
      );

      setUserId(TGuserId);
      return TGuserId;
    } catch (error) {
      console.error('Initialization error:', error);
      setError('Ошибка! Запустите приложение в боте @GiveRandomeBot!');
      setLoading(false);
      return null;
    }
  }, []);

  // Загрузка данных события
  const fetchEventData = useCallback(async (userId: string, eventId: string) => {
    try {
      const eventData = await apiService.getEventData(eventId);
      setCaptcha(eventData.use_captcha);
      setTikForInv(eventData.users_to_invite);
      
      const subscriptionResponse = await apiService.checkSubscriptions(userId, eventId);
      setChannels(subscriptionResponse.details);
      setAllSubscribed(subscriptionResponse.allSubscribed);
    } catch (error) {
      console.error('Error loading event data:', error);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, []);

  // Основной эффект инициализации
  useEffect(() => {
    const initialize = async () => {
      const userId = await initializeTelegram();
      if (userId && eventID) {
        await fetchEventData(userId, eventID);
      }
    };

    if (eventID) {
      initialize();
    }
  }, [eventID, initializeTelegram, fetchEventData]);

  // Проверка подписок
  const checkSubscriptions = useCallback(async () => {
    if (!userID || !eventID) return;
    
    setIsProcessing(true);
    try {
      const result = await apiService.checkSubscriptions(userID, eventID);
      
      const updatedChannels = channels.map(channel => ({
        ...channel,
        isSubscribed: result.details.find(d => d.channelId === channel.channelId)?.isSubscribed || false
      }));
      
      setChannels(updatedChannels);
      setAllSubscribed(result.allSubscribed);
      return result.allSubscribed;
    } catch (error) {
      console.error('Subscription check error:', error);
      setError('Ошибка проверки подписок');
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [userID, eventID, channels]);

  // Обработка рефералов
  const processReferral = useCallback(async () => {
    if (!userID || !referrer_id || !eventID || isReferralProcessed) return false;
    
    setIsReferralProcessed(true); // Помечаем как обработанное
    try {
      const refResponse = await apiService.SendReferralToServer(
        userID,
        referrer_id,
        eventID
      );
      console.log(refResponse, isReferralProcessed)

      if (refResponse.ok) {
        showToast(refResponse.message, "success");
      setIsReferralProcessed(false);
        return true;
      } else {
        showToast(refResponse.message, "error");
      setIsReferralProcessed(false);
        return false;
      }
    } catch (error) {
      console.error('Referral processing error:', error);
      showToast('Ошибка обработки реферала', "error");
      return false;
    } finally {
      // Сбрасываем флаг обработки при неудаче для повторной попытки
      setIsReferralProcessed(false);
    }
    console.log('end:->', isReferralProcessed);
  }, [userID, referrer_id, eventID, showToast, isReferralProcessed]);

  // Эффект для обработки рефералов при загрузке
  useEffect(() => {
    const handleReferralAction = async () => {
      if (action === 'ref' && allSubscribed && !isProcessing && !isReferralProcessed) {
        const success = await processReferral();
        if (success) {
          // Обновляем данные вместо перезагрузки страницы
          const userId = localStorage.getItem('user_id') || userID;
          if (userId) {
            try {
              setLoading(true);
              const eventData = await apiService.getEventData(eventID);
              setTikForInv(eventData.users_to_invite);
              
              const subscriptionResponse = await apiService.checkSubscriptions(userId, eventID);
              setChannels(subscriptionResponse.details);
              setAllSubscribed(subscriptionResponse.allSubscribed);
            } catch (error) {
              console.error('Error updating data:', error);
            } finally {
              setLoading(false);
            }
          }
        }
      }
    };

    handleReferralAction();
  }, [action, allSubscribed, isProcessing, processReferral, userID, eventID, isReferralProcessed]);
  // Проверка подписок для рефералов
  const checkSubscriptionsForReferral = useCallback(async () => {
    const allSubscribed = await checkSubscriptions();
    if (allSubscribed) {
      await processReferral();
    }
  }, [checkSubscriptions, processReferral]);

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
          onClick={() => router.reload()}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (action === 'results') {
    return <ResultsPage event_id={eventID} />;
  }

  // Компонент каналов для подписки
  const renderChannelsSection = (onCheck: () => void) => (
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
        onClick={onCheck}
        className={styles.checkButton}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <span className={styles.spinner} />
            Проверяем...
          </>
        ) : (
          'Проверить подписки'
        )}
      </button>
    </div>
  );

  // Основной интерфейс розыгрыша
  const renderMainInterface = () => (
    <div className={styles.container}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles.contentWrapper}
      >
        <Checkmark />
        <div className={styles.headerSection}>
          <h1 className={styles.mainTitle}>Вы участвуете в розыгрыше!</h1>
          <div className={styles.warningBox}>
            ⚠️ Не отписывайтесь от каналов до окончания розыгрыша, при определении победителя бот повторно проверяет подписку на каналы!
          </div>
          <RaffleTimer event_id={eventID} />
          <div className={styles.subTitle}>До завершения</div>
        </div>
        
        <InviteSection 
          users_to_invite={tickets_to_invite} 
          event_id={eventID}
        />
        
        <Tickets event_id={eventID} />
      </motion.div>
    </div>
  );

  if (useCaptcha === 1) {
    return (
      <Captcha 
        onSuccess={() => setCaptcha(0)}
        fetchCaptcha={apiService.getCaptcha}
      />
    );
  }

  if (action === 'ref') {
    return allSubscribed 
      ? renderMainInterface()
      : renderChannelsSection(checkSubscriptionsForReferral);
  }

  return allSubscribed 
    ? renderMainInterface()
    : renderChannelsSection(checkSubscriptions);
}