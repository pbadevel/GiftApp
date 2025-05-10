import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { apiService, Winner } from '@/utils/api';
import styles from '../styles/results.module.css';

import Trophy from '@/components/TrophySVG';

interface Props {
  winners: Winner[];
}

export default function ResultsPage({ winners }: Props) {
  return (
    <div className={styles.container}>
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={styles.trophyContainer}
      >
        
        <Trophy />

      </motion.div>

      <h1 className={styles.title}>Победители розыгрыша</h1>
      
      <div className={styles.winnersList}>
        {winners.map((winner, index) => (
          <motion.div
            key={winner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={styles.winnerCard}
          >
            <Image
              src={winner.image_url}
              alt={winner.name}
              width={80}
              height={80}
              className={styles.avatar}
            />
            <div className={styles.winnerInfo}>
              <h3>{winner.name}</h3>
              <p>Билет: {winner.ticket}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const winners = await apiService.getWinners('1');
    return { props: { winners } };
  } catch (error) {
    return { props: { winners: [] } };
  }
};