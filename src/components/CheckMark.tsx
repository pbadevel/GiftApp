import { useRef, useEffect, useState } from 'react';

const Checkmark = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    const playVideo = async () => {
      if (videoRef.current && !videoEnded) {
        try {
          await videoRef.current.play();
        } catch (error) {
          console.error("Автовоспроизведение не сработало:", error);
          setTimeout(() => {
            if (videoRef.current && !videoEnded) {
              videoRef.current.play();
            }
          }, 1000);
        }
      }
    };

    playVideo();
  }, [videoEnded]);

  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px'
    }}>
      {!videoEnded && (
        <video 
          ref={videoRef}
          width="320" 
          height="240" 
          muted
          playsInline
          preload="auto"
          onEnded={handleVideoEnd}
          style={{
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0)'
          }}
        >
          <source src="/CheckMark.mp4" type="video/mp4" />
          Ваш браузер не поддерживает видео тег.
        </video>
      )}
    </div>
  )
}

export default Checkmark;