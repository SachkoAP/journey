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

// Карусель тем: CSS scroll-snap + синхронизация активной карточки без второго программного скролла
function initCarousel(container) {
  const getTiles = () => [...container.querySelectorAll('.theme-tile')];

  const syncActiveFromViewport = () => {
    const tiles = getTiles();
    if (!tiles.length) return;

    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    let closest = null;
    let closestDist = Infinity;

    tiles.forEach((tile) => {
      const tr = tile.getBoundingClientRect();
      const tcx = tr.left + tr.width / 2;
      const d = Math.abs(centerX - tcx);
      if (d < closestDist) {
        closestDist = d;
        closest = tile;
      }
    });

    if (!closest) return;

    const active = container.querySelector('.theme-tile.active');
    if (active === closest) return;

    tiles.forEach((t) => t.classList.remove('active'));
    closest.classList.add('active');
  };

  const tiles = getTiles();
  if (tiles.length > 0) {
    setActiveTheme(tiles[0], container, false);
  }

  let idleTimer = null;
  const scheduleSync = () => {
    syncActiveFromViewport();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(syncActiveFromViewport, 120);
  };

  container.addEventListener('scroll', scheduleSync, { passive: true });
  container.addEventListener('scrollend', syncActiveFromViewport);
}

// Установка активной темы (прокрутка только через scrollIntoView — совместимо со scroll-snap)
function setActiveTheme(tile, container, scrollToCenter = true) {
  const tiles = container.querySelectorAll('.theme-tile');

  tiles.forEach((t) => t.classList.remove('active'));
  tile.classList.add('active');

  if (scrollToCenter) {
    tile.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
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
    
    // Получаем первую тему статьи
    const articleTheme = a.themes && a.themes.length > 0 ? a.themes[0] : 'Без темы';
    
    d.innerHTML = `
      <div class="article-header">
        <div class="article-title">${escapeHtml(a.title)}</div>
        <div class="article-theme">${escapeHtml(articleTheme)}</div>
      </div>
      ${a.image ? `<img src="${a.image}" alt="${a.title}" loading="lazy">` : ""}
      <div class="article-body">
        <p>${escapeHtml(previewText)}</p>
      </div>
      <div class="article-footer">
        <button class="read-btn" onclick="event.stopPropagation(); window.location.href='article.html?id=${index}'">ЧИТАТЬ</button>
      </div>
    `;
    
    // Добавляем обработчик клика для расширенного просмотра
    d.onclick = (e) => {
      if (e.target.classList.contains('read-btn')) return;
      showFullArticle(index);
    };
    
    articlesWrap.appendChild(d);
  });
}

// Показ полной статьи (объявляем глобально для onclick)
window.showFullArticle = function(index) {
  const article = articles[index];
  if (!article) return;
  
  const articleElements = document.querySelectorAll('.article');
  const articleElement = articleElements[index];
  
  if (!articleElement) return;
  
  const pElement = articleElement.querySelector('p');
  const readBtn = articleElement.querySelector('.read-btn');
  
  if (!pElement) return;
  
  const currentText = pElement.innerText;
  const isExpanded = !currentText.includes('...') && currentText.length > 160;
  
  if (!isExpanded) {
    // Показываем полный текст
    pElement.innerText = article.text;
    if (readBtn) readBtn.textContent = 'СВЕРНУТЬ';
    articleElement.style.transform = "scale(1.02)";
    setTimeout(() => {
      articleElement.style.transform = "";
    }, 200);
  } else {
    // Сворачиваем текст
    const previewText = article.text.length > 150 
      ? article.text.substring(0, 150) + "..." 
      : article.text;
    pElement.innerText = previewText;
    if (readBtn) readBtn.textContent = 'ЧИТАТЬ';
  }
};


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

// Глобальные переменные для загруженных файлов
let uploadedImage = null;
let uploadedFiles = [];

// Обработка загрузки изображения
window.handleImageUpload = function(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    alert('Пожалуйста, выберите изображение');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedImage = e.target.result;
    const preview = document.getElementById('imagePreview');
    if (preview) {
      preview.innerHTML = `
        <div class="preview-item">
          <img src="${uploadedImage}" alt="Preview" class="preview-image" />
          <button type="button" class="remove-btn" onclick="removeImage()">×</button>
        </div>
      `;
    }
  };
  reader.readAsDataURL(file);
};

window.removeImage = function() {
  uploadedImage = null;
  const preview = document.getElementById('imagePreview');
  if (preview) preview.innerHTML = '';
  const imageInput = document.getElementById('imageUpload');
  if (imageInput) imageInput.value = '';
};

// Обработка загрузки файлов
window.handleFileUpload = function(event) {
  const files = Array.from(event.target.files);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        url: e.target.result,
        data: e.target.result
      });
      
      updateFilesList();
    };
    reader.readAsDataURL(file);
  });
};

function updateFilesList() {
  const filesList = document.getElementById('filesList');
  if (!filesList) return;
  
  if (uploadedFiles.length === 0) {
    filesList.innerHTML = '';
    return;
  }
  
  filesList.innerHTML = uploadedFiles.map((file, index) => `
    <div class="preview-file-item">
      <span class="file-icon">📎</span>
      <span class="file-name">${escapeHtml(file.name)}</span>
      <button type="button" class="remove-btn" onclick="removeFile(${index})">×</button>
    </div>
  `).join('');
}

window.removeFile = function(index) {
  uploadedFiles.splice(index, 1);
  updateFilesList();
};

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
      image: uploadedImage,
      files: uploadedFiles.length > 0 ? uploadedFiles : null
    };
    
    // Очистка загруженных файлов
    uploadedImage = null;
    uploadedFiles = [];
    
    // Добавление в массив
    articles.unshift(newArticle);
    
    // Сохранение в localStorage
    localStorage.setItem("articles", JSON.stringify(articles));
    
    // Анимация успешного добавления
    const submitBtn = addForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "✓ Добавлено!";
    submitBtn.style.background =
      "linear-gradient(135deg, #c4a574 0%, #9d7f52 100%)";
    submitBtn.style.color = "#141210";
    
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
