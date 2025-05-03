import { useState, useEffect } from 'react';

import { Channel, UserData, apiService } from '@/utils/api';

import styles from '../styles/main-page.module.css';



const InviteSection = () => {




    const [channels, setChannels] = useState<Channel[]>([]);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [referralLink, referralLinkData] = useState<string>("");
    const invitedFriends = 3;

    
    useEffect(() => {
        const fetchData = async () => {
        try {
            
            
        
            const channelsData = await apiService.getChannels('user-123');
            setChannels(channelsData);
            
            const userData = await apiService.getUserData('user-123');
            setUserData(userData);
            
            referralLinkData(userData.referralLink);

        } catch (error) {
            console.error(error);
        }
        };
        
        fetchData();
    }, []);


    const copyReferralLink = () => {
        // Создаем временное текстовое поле
        const tempInput = document.createElement('textarea');
        tempInput.value = referralLink;
        document.body.appendChild(tempInput);
        
        try {
          // Выделяем и копируем текст
          tempInput.select();
          tempInput.setSelectionRange(0, 99999); // Для мобильных устройств
          
          // Пытаемся использовать Clipboard API
          if (navigator.clipboard) {
            navigator.clipboard.writeText(referralLink)
              .then(() => showCopyFeedback())
              .catch(() => alert('Ваш браузер слишком старый!'));
          } else {
            // Fallback для старых браузеров
            document.execCommand('copy');
            showCopyFeedback();
          }
        } catch (err) {
            alert('Ваш браузер слишком старый!');
        } finally {
          // Удаляем временный элемент
          document.body.removeChild(tempInput);
        }
      };
      
      const showCopyFeedback = () => {
        // Вместо alert используем кастомное уведомление
        const feedback = document.createElement('div');
        feedback.textContent = 'Ссылка скопирована!';
        feedback.style.position = 'fixed';
        feedback.style.bottom = '20px';
        feedback.style.left = '50%';
        feedback.style.transform = 'translateX(-50%)';
        feedback.style.backgroundColor = '#34D399';
        feedback.style.color = 'white';
        feedback.style.padding = '10px 20px';
        feedback.style.borderRadius = '8px';
        feedback.style.zIndex = '1000';
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
          document.body.removeChild(feedback);
        }, 2000);
      };
      
    
    return (
        <div className={styles.inviteSection}>
            <h2 className={styles.sectionTitle}>👥 Пригласить друзей</h2>
            <div className={styles.referralBox}>
                <input
                type="text"
                value={referralLink}
                readOnly
                className={styles.referralInput}
                />
                <button onClick={copyReferralLink} className={styles.copyButton}>
                Скопировать
                </button>
            </div>
            <div className={styles.bonusInfo}>
                Получи тикет за приглашенного друга! (+{invitedFriends})
            </div>
            </div>
    )
}


export default InviteSection;