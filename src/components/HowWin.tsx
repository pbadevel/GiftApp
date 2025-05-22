import { useState, useEffect } from 'react';
import styles from '../styles/howwin.module.css';
import { Channel } from '@/utils/api';


export interface Winner {
  id: number;
  ticket: string;
  name: string;
  image_url: string;
}


  
interface WinnerModalProps {
winners: Winner[];
channels: Channel[];
onClose: () => void;
}



const LotteryProcessModal = ({ winners, channels, onClose }: WinnerModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const subscriptionCheckContent = (
    <div className={styles.simpleStep}>
      <h3 className={styles.miniTitle}>Проверка подписок</h3>
      <div className={styles.channelsList}>
        {channels.map(channel => (
          <span key={channel.channelId} className={styles.channelItem}>
            {channel.channelName}
            {channel.isSubscribed ? (
              <span className={styles.statusSuccess}> ✓</span>
            ) : (
              <span className={styles.statusError}> ✗</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );


  const steps = [
    { 
      content: (
        <div className={styles.loadingWrapper}>
          <span className={styles.plainText}>
            Загрузка участников... 
            <span className={styles.percentage}>{loadProgress}%</span>
          </span>
          <div className={styles.loadingBar}>
            <div 
              className={styles.loadingProgress} 
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      ), 
      delay: 3000 
    },
    { 
      content: <div className={styles.simpleStep}>
        <h3 className={styles.miniTitle}>Начало розыгрыша</h3>
        {winners.map((winner, index) => (
          <div key={winner.id} className={styles.ticketLine}>
            Билет {index + 1}: <strong>{winner.ticket}</strong> ({winner.name})
          </div>
        ))}
      </div>, 
      delay: 2000 
    },
    { 
      content: subscriptionCheckContent,
      delay: 2500 
    },
    { 
      content: <div className={styles.simpleStep}>
        <div className={styles.checkMark}>✓</div>
        <p>Все условия выполнены</p>
      </div>, 
      delay: 2500 
    },
    { 
      content: <div className={styles.simpleStep}>
        <h3 className={styles.resultTitle}>Победители</h3>
        {winners.map(winner => (
          <div key={winner.id} className={styles.winnerLine}>
            <span>{winner.name}</span>
            <span className={styles.ticketSmall}>{winner.ticket}</span>
          </div>
        ))}
      </div>, 
      delay: 1500 
    },
  ];

  useEffect(() => {
    if (currentStep === 0) {
      const interval = setInterval(() => {
        setLoadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 30);

      return () => clearInterval(interval);
    }
  }, [currentStep]);


  useEffect(() => {
    if (isOpen && currentStep < steps.length) {
        const timer = setTimeout(() => {
          setCurrentStep(prev => prev + 1);
        }, steps[currentStep].delay);
  
        return () => clearTimeout(timer);
    }
  }, [currentStep, isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.minimalContainer}>
      <div className={styles.minimalModal}>
        <button 
          onClick={handleClose} 
          className={styles.minimalClose}
          aria-label="Закрыть"
        >
          ×
        </button>

        <div className={styles.minimalContent}>
          {steps.slice(0, currentStep + 1).map((step, index) => (
            <div key={index} className={styles.step}>
              {step.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LotteryProcessModal;