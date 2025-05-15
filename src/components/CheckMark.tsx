import { motion } from 'framer-motion';

import styles from '@/styles/main-page.module.css'

const Checkmark = () => {
  // Варианты анимации для круга (появление, например, масштабирование)
  const circleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  };

  // Варианты анимации для пути галочки (рисование)
  const pathVariants = {
    hidden: { pathLength: 0 },
    visible: { pathLength: 1 },
  };

  // Переходы анимации
  const circleTransition = {
    duration: 0.5,
    ease: "easeOut",
  };

  const pathTransition = {
    duration: 0.8, // Длительность рисования галочки
    delay: 0.3, // Задержка перед началом рисования галочки (после появления круга)
    type: "spring", // Тип анимации (пружина)
    stiffness: 100, // Жесткость пружины
    damping: 10,    // Затухание пружины
  };


  return (
    // Обертка, если нужно применять стили из CSS-модуля
    // <div className={styles.checkmarkContainer}>
    <div className={styles.checkmarkContainer}>
      <motion.svg
        width="160" // Ширина SVG контейнера
        height="160" // Высота SVG контейнера
        viewBox="0 0 24 24" // Внутренняя система координат (для удобства рисования)
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        // Анимацию SVG контейнера убрали, т.к. анимируем элементы внутри
      >
        {/* Анимированный круг фона */}
        <motion.circle
          cx="12" // Центр круга по X в viewBox
          cy="12" // Центр круга по Y в viewBox
          r="12" // Радиус круга
          fill="#2f8867" // Зеленый цвет круга (можно использовать ваш #2f8867 или другой оттенок)
          initial="hidden"
          animate="visible"
          variants={circleVariants}
          transition={circleTransition}
        />

        <motion.circle
          cx="12" // Центр круга по X в viewBox
          cy="12" // Центр круга по Y в viewBox
          r="10" // Радиус круга
          fill="#4CAF50" // Зеленый цвет круга (можно использовать ваш #34D399 или другой оттенок)
          initial="hidden"
          animate="visible"
          variants={circleVariants}
          transition={circleTransition}
        />

        {/* Анимированный путь галочки */}
        <motion.path
          // Путь галочки, расположенный в центре viewBox (24x24)
          // M 6 12 - Начальная точка
          // L 10 16 - Первая точка изгиба
          // L 18 8 - Конечная точка
          d="M 6 12 L 10 16 L 18 8"
          stroke="#FFFFFF" // Белый цвет галочки
          strokeWidth="2"
          strokeLinecap="round" // Скругленные концы линии
          strokeLinejoin="round" // Скругленный угол линии
          fill="none" // Важно: путь не должен быть залит цветом, только обведен
          initial="hidden"
          animate="visible"
          variants={pathVariants}
          transition={pathTransition}
        />
      </motion.svg>
    </div>
  );
}

export default Checkmark;