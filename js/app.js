// ============================================
// Основная логика приложения
// ============================================

const themesRow = document.getElementById("themesRow");
const articlesWrap = document.getElementById("articles");
const themesGrid = document.getElementById("themesGrid");
const addForm = document.getElementById("addForm");
const themeSelect = document.getElementById("themeSelect");

// Инициализация тем с каруселью
if (themesRow) {
  renderThemes(themesRow, true);
  
  // Добавляем кнопку "Ещё"
  const more = document.createElement("div");
  more.className = "theme-tile";
  more.innerText = "Ещё";
  more.onclick = () => {
    more.style.transform = "scale(0.95)";
    setTimeout(() => {
      location.href = "themes.html";
    }, 150);
  };
  themesRow.appendChild(more);
  
  // Инициализация карусели
  initCarousel(themesRow);
}

// Инициализация сетки тем на странице themes.html
if (themesGrid) {
  renderThemes(themesGrid, false);
}

// Функция рендеринга тем
function renderThemes(container, isRow = true) {
  themes.forEach((t, index) => {
    const d = document.createElement("div");
    d.className = "theme-tile";
    d.innerText = t;
    d.dataset.theme = t;
    d.style.animationDelay = `${index * 0.05}s`;
    d.style.animation = "fadeIn 0.4s ease-out both";
    
    d.onclick = () => {
      // Анимация клика
      d.style.transform = "scale(0.95)";
      setTimeout(() => {
        d.style.transform = "";
        // Активируем карточку в карусели
        if (isRow && container === themesRow) {
          setActiveTheme(d, container);
        }
        filterByTheme(t);
      }, 150);
    };
    
    container.appendChild(d);
  });
}

// Инициализация карусели с liquid glass эффектом
function initCarousel(container) {
  const tiles = container.querySelectorAll('.theme-tile');
  
  // Устанавливаем первую карточку как активную
  if (tiles.length > 0) {
    setActiveTheme(tiles[0], container);
  }
  
  // Обработка прокрутки для центрирования
  let isScrolling = false;
  container.addEventListener('scroll', () => {
    if (isScrolling) return;
    
    // Находим ближайшую карточку к центру
    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;
    
    let closestTile = null;
    let closestDistance = Infinity;
    
    tiles.forEach(tile => {
      const tileRect = tile.getBoundingClientRect();
      const tileCenterX = tileRect.left + tileRect.width / 2;
      const distance = Math.abs(centerX - tileCenterX);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestTile = tile;
      }
    });
    
    if (closestTile) {
      setActiveTheme(closestTile, container, false);
    }
  });
  
  // Плавная прокрутка при клике
  tiles.forEach(tile => {
    const originalClick = tile.onclick;
    tile.onclick = (e) => {
      if (originalClick) originalClick.call(tile, e);
      
      // Прокручиваем к центру
      isScrolling = true;
      const containerRect = container.getBoundingClientRect();
      const tileRect = tile.getBoundingClientRect();
      const scrollLeft = container.scrollLeft;
      const tileLeft = tile.offsetLeft;
      const containerCenter = containerRect.width / 2;
      const targetScroll = tileLeft - containerCenter + tileRect.width / 2;
      
      container.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
      
      setTimeout(() => {
        isScrolling = false;
      }, 500);
    };
  });
}

// Установка активной темы
function setActiveTheme(tile, container, scrollToCenter = true) {
  const tiles = container.querySelectorAll('.theme-tile');
  
  // Убираем активный класс со всех карточек
  tiles.forEach(t => t.classList.remove('active'));
  
  // Добавляем активный класс к выбранной
  tile.classList.add('active');
  
  // Прокручиваем к центру, если нужно
  if (scrollToCenter) {
    const containerRect = container.getBoundingClientRect();
    const tileRect = tile.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;
    const tileLeft = tile.offsetLeft;
    const containerCenter = containerRect.width / 2;
    const targetScroll = tileLeft - containerCenter + tileRect.width / 2;
    
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  }
}

// Фильтрация статей по теме
function filterByTheme(theme) {
  if (!articlesWrap) return;
  
  const filtered = articles.filter(a => 
    a.themes && a.themes.includes(theme)
  );
  
  // Анимация исчезновения
  articlesWrap.style.opacity = "0";
  articlesWrap.style.transform = "translateY(10px)";
  
  setTimeout(() => {
    articlesWrap.innerHTML = "";
    if (filtered.length === 0) {
      articlesWrap.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
          <p>Нет статей по теме "${theme}"</p>
        </div>
      `;
    } else {
      renderArticles(filtered);
    }
    
    // Анимация появления
    articlesWrap.style.opacity = "1";
    articlesWrap.style.transform = "translateY(0)";
  }, 300);
  
  // Обновление активного состояния тем в карусели
  if (themesRow) {
    const tiles = themesRow.querySelectorAll(".theme-tile");
    tiles.forEach(tile => {
      if (tile.dataset.theme === theme || tile.innerText === theme) {
        setActiveTheme(tile, themesRow);
      }
    });
  }
}

// Рендеринг статей
function renderArticles(articlesToRender = articles) {
  if (!articlesWrap) return;
  
  articlesToRender.forEach((a, index) => {
    const d = document.createElement("div");
    d.className = "article";
    d.style.animationDelay = `${index * 0.1}s`;
    
    // Форматирование даты
    const dateStr = a.date || new Date().toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Обрезка текста для превью
    const previewText = a.text.length > 150 
      ? a.text.substring(0, 150) + "..." 
      : a.text;
    
    d.innerHTML = `
      ${a.image ? `<img src="${a.image}" alt="${a.title}" loading="lazy">` : ""}
      <div class="article-body">
        <h3>${escapeHtml(a.title)}</h3>
        <small>${dateStr}</small>
        <p>${escapeHtml(previewText)}</p>
      </div>
    `;
    
    // Добавляем обработчик клика для расширенного просмотра
    d.onclick = () => {
      d.style.transform = "scale(0.98)";
      setTimeout(() => {
        // Здесь можно добавить модальное окно или переход на детальную страницу
        showArticleDetails(a);
      }, 150);
    };
    
    articlesWrap.appendChild(d);
  });
}

// Показ деталей статьи (можно улучшить модальным окном)
function showArticleDetails(article) {
  // Простая реализация - можно улучшить модальным окном
  const fullText = article.text;
  const articleElement = event.currentTarget;
  const pElement = articleElement.querySelector('p');
  
  if (pElement.innerText.includes('...')) {
    pElement.innerText = fullText;
    articleElement.style.transform = "scale(1.02)";
    setTimeout(() => {
      articleElement.style.transform = "";
    }, 200);
  } else {
    const previewText = fullText.length > 150 
      ? fullText.substring(0, 150) + "..." 
      : fullText;
    pElement.innerText = previewText;
  }
}

// Экранирование HTML для безопасности
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Инициализация статей на главной странице
if (articlesWrap && articles.length > 0) {
  renderArticles();
} else if (articlesWrap) {
  articlesWrap.innerHTML = `
    <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
      <p style="font-size: 18px; margin-bottom: 8px;">Пока нет статей</p>
      <p style="font-size: 14px;">Добавьте первую статью, чтобы начать вести журнал</p>
    </div>
  `;
}

// ============================================
// Обработка формы добавления статьи
// ============================================

if (addForm) {
  // Заполнение селекта тем
  if (themeSelect) {
    themes.forEach(theme => {
      const option = document.createElement("option");
      option.value = theme;
      option.textContent = theme;
      themeSelect.appendChild(option);
    });
  }
  
  addForm.onsubmit = (e) => {
    e.preventDefault();
    
    const titleInput = document.getElementById("title");
    const textInput = document.getElementById("text");
    
    if (!titleInput || !textInput) return;
    
    const title = titleInput.value.trim();
    const text = textInput.value.trim();
    const selectedThemes = Array.from(themeSelect.selectedOptions).map(opt => opt.value);
    
    if (!title || !text) {
      // Анимация ошибки
      const inputs = [titleInput, textInput];
      inputs.forEach(input => {
        if (!input.value.trim()) {
          input.style.borderColor = "#ef4444";
          input.style.animation = "shake 0.5s ease";
          setTimeout(() => {
            input.style.borderColor = "";
            input.style.animation = "";
          }, 500);
        }
      });
      return;
    }
    
    // Создание новой статьи
    const newArticle = {
      title,
      text,
      date: new Date().toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      themes: selectedThemes,
      image: null
    };
    
    // Добавление в массив
    articles.unshift(newArticle);
    
    // Сохранение в localStorage
    localStorage.setItem("articles", JSON.stringify(articles));
    
    // Анимация успешного добавления
    const submitBtn = addForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "✓ Добавлено!";
    submitBtn.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
    
    setTimeout(() => {
      // Переход на главную страницу
      window.location.href = "index.html";
    }, 800);
  };
}

// Анимация тряски для ошибок
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;
document.head.appendChild(style);

// Плавная прокрутка при загрузке
window.addEventListener('load', () => {
  document.body.style.opacity = "0";
  setTimeout(() => {
    document.body.style.transition = "opacity 0.3s ease";
    document.body.style.opacity = "1";
  }, 50);
});
