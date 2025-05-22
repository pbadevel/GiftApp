import { useState, useEffect } from 'react';
import styles from '../styles/captcha.module.css';
import { CaptchaData } from '@/utils/api';



interface CaptchaProps {
  onSuccess: () => void;
  fetchCaptcha: () => Promise<CaptchaData>;
}

const Captcha = ({ onSuccess, fetchCaptcha }: CaptchaProps) => {
  const [captcha, setCaptcha] = useState<CaptchaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загрузка новой капчи
  const loadCaptcha = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchCaptcha();
      setCaptcha(data);
    } catch (err) {
      setError('Не удалось загрузить капчу');
    } finally {
      setLoading(false);
    }
  };

  // Первоначальная загрузка
  useEffect(() => {
    loadCaptcha();
  }, []);

  // Обработка выбора ответа
  const handleAnswer = (selected: string) => {
    if (!captcha) return;

    if (selected === captcha.right) {
      onSuccess();
    } else {
      loadCaptcha(); // Перезагружаем капчу при неверном ответе
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>Загрузка капчи...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <button 
          onClick={loadCaptcha}
          className={styles.retryButton}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>Подтвердите, что вы не робот</div>
      
      {captcha?.image && (
        <img 
          src={captcha.image} 
          alt="Captcha" 
          className={styles.captchaImage}
        />
      )}

      <div className={styles.buttonsContainer}>
        {captcha?.answers.map((answer, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(answer)}
            className={styles.answerButton}
          >
            {answer}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Captcha;