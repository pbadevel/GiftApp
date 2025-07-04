import Image from 'next/image';
import { useEffect, useRef } from 'react';

const LoaderSVG = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Попытка воспроизвести видео при монтировании
    const playVideo = async () => {
      if (videoRef.current) {
        try {
          await videoRef.current.play();
        } catch (error) {
          console.error("Автовоспроизведение не сработало:", error);
          // Fallback: перезапуск видео через 1 секунду
          setTimeout(() => {
            if (videoRef.current) videoRef.current.play();
          }, 1000);
        }
      }
    };

    playVideo();
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px'
    }}>
      <video 
        ref={videoRef}
        width="320" 
        height="240" 
        muted
        playsInline
        loop
        preload="auto"
        style={{
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}
      >
        <source src="/loader.mp4" type="video/mp4" />
        Ваш браузер не поддерживает видео тег.
      </video>
      
      <p style={{
        fontSize: '18px',
        fontWeight: 500,
        color: '#555',
        textAlign: 'center',
        maxWidth: '320px'
      }}>
        Подождите, идет проверка подписок...
      </p>
    </div>
  )
}

export default LoaderSVG;


