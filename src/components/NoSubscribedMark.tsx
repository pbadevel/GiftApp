import { useEffect, useRef } from 'react';

const NoChannelsVideo = () => {
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
        <source src="/nochannels.mp4" type="video/mp4" />
        Ваш браузер не поддерживает видео тег.
      </video>
    
  )
}

export default NoChannelsVideo;


