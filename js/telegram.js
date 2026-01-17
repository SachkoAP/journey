// ============================================
// Интеграция с Telegram Web App
// ============================================

const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  
  // Настройка цветовой схемы Telegram - бирюзовый фон
  tg.setHeaderColor('#00d4aa');
  tg.setBackgroundColor('#00d4aa');
  
  // Расширение на весь экран
  tg.expand();
  
  // Включение закрытия по свайпу
  tg.enableClosingConfirmation();
  
  // Проверка владельца для показа кнопки добавления
  const OWNER_USERNAME = "ifuje";
  const addBtn = document.getElementById("addBtn");
  
  if (tg.initDataUnsafe?.user?.username === OWNER_USERNAME && addBtn) {
    addBtn.classList.remove("hidden");
    
    // Плавное появление кнопки
    setTimeout(() => {
      addBtn.style.opacity = "0";
      addBtn.style.transform = "scale(0.8)";
      addBtn.style.transition = "all 0.3s ease";
      
      requestAnimationFrame(() => {
        addBtn.style.opacity = "1";
        addBtn.style.transform = "scale(1)";
      });
    }, 100);
  }
  
  // Обработка изменения размера окна
  tg.onEvent('viewportChanged', () => {
    // Адаптация под размер экрана
    document.documentElement.style.setProperty(
      '--tg-viewport-height', 
      `${tg.viewportHeight}px`
    );
  });
  
  // Вибрация при взаимодействии (опционально)
  function hapticFeedback(type = 'light') {
    if (tg.HapticFeedback) {
      tg.HapticFeedback.impactOccurred(type);
    }
  }
  
  // Добавляем вибрацию к кнопкам
  document.addEventListener('click', (e) => {
    if (e.target.matches('button, .theme-tile, .article')) {
      hapticFeedback('light');
    }
  });
}
