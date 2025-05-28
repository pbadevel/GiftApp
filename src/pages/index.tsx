import { useState, useEffect } from 'react';
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
  const [messageCounter, setMessageCounter] = useState(0)


  const [channels, setChannels] = useState<Channel[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [allSubscribed, setAllSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  // Загрузка начальных данных
  
  useEffect(() => {
    if (typeof tgWebAppStartParam === 'string') {
      const data = decodeTelegramParams(tgWebAppStartParam);
      
      if (data) {
        console.log('Decoded data:', data);
        // Пример данных: { event_id: "123", mode: "raffle" }

        setEventId(data.event_id)
        setAction(data.mode)
        setReferrerId(data?.referrer_id)

      }
    }

  },[tgWebAppStartParam]);


  useEffect(() => {
    const initializeData = async () => {
      try {
          const tg = window.Telegram?.WebApp;
          
          if (!tg) {
            throw new Error('Telegram WebApp not available');
          }

          await tg.ready();

          await tg.expand(); // Растягивает приложение на весь экран
          
          const user = tg.initDataUnsafe.user;
          const TGuserId = user?.id?.toString();

          console.log(user)
          

          if (!TGuserId) throw new Error('Telegram user ID not found');
          
          localStorage.setItem('user_id', TGuserId);
          
          const _update = await apiService.SendUserToServer(
            user?.id?.toString(), 
            user?.first_name?.toString() + " " + user?.last_name?.toString(),
            user?.username?.toString())
          // if (! _update.ok) throw new Error('Failed to update User');

          setUserId(TGuserId);
          
        
  
      } catch (_error) {
        console.error('Initialization error:', _error);
        setError('Ошибка! Запустите приложение в боте @GiveRandomeBot!');
        setLoading(false);
      }
    };
  
    initializeData();
  }, [eventID]); // Зависимость от eventId
  
  // Эффект для загрузки данных после инициализации
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!userID || !eventID) return; // Ждем пока данные появятся
      
      try {
        setLoading(true);
        const eventData = await apiService.getEventData(eventID) 
        setCaptcha(eventData.use_captcha)
        setTikForInv(eventData.users_to_invite)
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

  const checkSubscriptionsOnSiteByReferral = async () => {
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
        const refResponse = await apiService.SendReferralToServer(
          userID,
          referrer_id,
          eventID
        )

        if (refResponse.ok && (messageCounter < 4) ){
          showToast(refResponse.message, "success")
          router.reload();
        } else if ((!refResponse.ok) && (messageCounter < 4) ){
          showToast(refResponse.message, "error")
        }
        
      }
    } catch (_err) {
      console.error(_err)
      setError('Ошибка проверки подписок');
    } finally {
      setIsChecking(false);
    }
  }

  console.log(`userid=${userID}  eventid=${eventID}`)

  if (loading) {
    let sleep = (ms: number) => new Promise(res=>setTimeout(res,ms));
    
    const prepareData = async () => {
      
      await sleep(2000);
      
    }

    prepareData();

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

  if (action == 'results') {
    return (
      <ResultsPage event_id={eventID}/>
    )
  } 

  else if (action=='ref') {
    console.log(referrer_id, action)
    if (!allSubscribed) {
       return (
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
              onClick={checkSubscriptionsOnSiteByReferral}
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
        )
    } else {
      const checkReferrer = async () => {
        const refResponse = await apiService.SendReferralToServer(
            userID,
            referrer_id,
            eventID
          )
  
          if (refResponse.ok){
            showToast(refResponse.message, "success")
            router.reload();
          } else {
            showToast(refResponse.message, "error")
            return (
              <div className={styles.errorContainer}>
                <ErrorMarkSvg />
                <button 
                  className={styles.retryButton}
                  onClick={() => router.reload()}
                >
                  Попробовать снова
                </button>
              </div>
            );
          }
      }
      checkReferrer();
    }
  }

  if (useCaptcha==1) {
    return (
      <Captcha 
        onSuccess={() => setCaptcha(0)}
        fetchCaptcha={async () => {
          // Пример реализации запроса капчи
          const response = await apiService.getCaptcha();
          return response;
        }}
      />
    )
  }

  return (
    <div className={styles.container}>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles.contentWrapper}
      >

        {allSubscribed ? (
          <>
            <Checkmark />
            <div className={styles.headerSection}>
              <h1 className={styles.mainTitle}>Вы участвуете в розыгрыше!</h1>
              <div className={styles.warningBox}>
                ⚠️ Не отписывайтесь от каналов до окончания розыгрыша, при определении победителя бот повторно проверяет подписку на каналы!
              </div>
              <RaffleTimer event_id={eventID} />
              <div className={styles.subTitle}>До завершения</div>
            </div>
            
            <InviteSection users_to_invite={tickets_to_invite} event_id={eventID}/>
            
            <Tickets event_id={eventID}/>
         
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