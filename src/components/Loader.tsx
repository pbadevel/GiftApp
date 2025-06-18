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
    <video 
      ref={videoRef}
      width="320" 
      height="240" 
      muted
      playsInline
      loop
      preload="auto"
    >
      <source src="/loader.mp4" type="video/mp4" />
      Ваш браузер не поддерживает видео тег.
    </video>
  )
}

export default LoaderSVG;






// const LoaderSVG = () => {
//   return (  
//     <>
//       <Image 
//           src="/loader.webp"
//           alt=''
//           width="350"
//           height="250"
          
//       />
//       <br />
//       <p style={{ fontSize: "15px" }}>Идет проверка...</p>  
//     </>  
//   );
// }

// const LoaderSVG = () => {
//   return (
//     <video width="320" height="240" controls preload="none">
//       <source src="/loader.mp4" type="video/mp4" />
//     </video>
//   )
// }


// export default LoaderSVG;





