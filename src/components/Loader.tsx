

import Image from 'next/image';



const LoaderSVG = () => {
  return (  
    <>
      <Image 
          src="/loader.webp"
          alt=''
          width="350"
          height="250"
          
      />
      <p style={{ fontSize: "15px" }}>Идет проверка...</p>  
    </>  
  );
}

// const LoaderSVG = () => {
//   return (
//     <video width="320" height="240" controls preload="none">
//       <source src="/loader.mp4" type="video/mp4" />
//     </video>
//   )
// }


export default LoaderSVG;





