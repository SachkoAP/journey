// ============================================
// Страница статьи
// ============================================

const articlePage = document.getElementById("articlePage");

// Получаем ID статьи из URL
const urlParams = new URLSearchParams(window.location.search);
const articleId = parseInt(urlParams.get('id'));

if (articleId !== null && articles[articleId]) {
  const article = articles[articleId];
  
  // Форматирование даты
  const dateStr = article.date || new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Получаем темы статьи
  const articleThemes = article.themes && article.themes.length > 0 
    ? article.themes 
    : [];
  
  // Рендерим статью
  articlePage.innerHTML = `
    <div class="article-full">
      <div class="article-full-header">
        <h2>${escapeHtml(article.title)}</h2>
        <div class="article-meta">
          <span class="article-date">${dateStr}</span>
          ${articleThemes.map(theme => 
            `<span class="article-theme-tag">${escapeHtml(theme)}</span>`
          ).join('')}
        </div>
      </div>
      
      ${article.image ? `
        <div class="article-image-container">
          <img src="${article.image}" alt="${escapeHtml(article.title)}" class="article-full-image" />
        </div>
      ` : ''}
      
      <div class="article-full-content">
        <p>${escapeHtml(article.text).replace(/\n/g, '<br>')}</p>
      </div>
      
      ${article.files && article.files.length > 0 ? `
        <div class="article-files">
          <h3>Прикрепленные файлы</h3>
          <div class="files-list">
            ${article.files.map((file, idx) => `
              <div class="file-item">
                <a href="${file.url}" target="_blank" class="file-link">
                  <span class="file-icon">📎</span>
                  <span class="file-name">${escapeHtml(file.name)}</span>
                </a>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <div class="article-reactions">
        <h3>Реакции</h3>
        <div class="reactions-list" id="reactionsList">
          ${renderReactions(article.id || articleId)}
        </div>
        <div class="add-reaction">
          <button class="emoji-btn" onclick="showEmojiPicker(${articleId})">😀</button>
          <button class="emoji-btn" onclick="addReaction(${articleId}, '👍')">👍</button>
          <button class="emoji-btn" onclick="addReaction(${articleId}, '❤️')">❤️</button>
          <button class="emoji-btn" onclick="addReaction(${articleId}, '🔥')">🔥</button>
          <button class="emoji-btn" onclick="addReaction(${articleId}, '😊')">😊</button>
          <button class="emoji-btn" onclick="addReaction(${articleId}, '💭')">💭</button>
        </div>
      </div>
      
      <div class="article-comments">
        <h3>Комментарии</h3>
        <div class="comments-list" id="commentsList">
          ${renderComments(article.id || articleId)}
        </div>
        <div class="add-comment">
          <textarea 
            id="commentText" 
            placeholder="Напишите комментарий..." 
            rows="3"
          ></textarea>
          <button class="comment-submit-btn" onclick="addComment(${articleId})">Отправить</button>
        </div>
      </div>
    </div>
  `;
} else {
  articlePage.innerHTML = `
    <div class="error-message">
      <p>Статья не найдена</p>
      <button onclick="window.location.href='index.html'">Вернуться на главную</button>
    </div>
  `;
}

// Функции для реакций
function renderReactions(articleId) {
  const reactions = JSON.parse(localStorage.getItem(`reactions_${articleId}`)) || {};
  const reactionEntries = Object.entries(reactions);
  
  if (reactionEntries.length === 0) {
    return '<p class="no-reactions">Пока нет реакций</p>';
  }
  
  return reactionEntries.map(([emoji, count]) => `
    <div class="reaction-item">
      <span class="reaction-emoji">${emoji}</span>
      <span class="reaction-count">${count}</span>
    </div>
  `).join('');
}

function addReaction(articleId, emoji) {
  const reactions = JSON.parse(localStorage.getItem(`reactions_${articleId}`)) || {};
  reactions[emoji] = (reactions[emoji] || 0) + 1;
  localStorage.setItem(`reactions_${articleId}`, JSON.stringify(reactions));
  
  const reactionsList = document.getElementById('reactionsList');
  if (reactionsList) {
    reactionsList.innerHTML = renderReactions(articleId);
  }
  
  // Вибрация
  if (window.Telegram?.WebApp?.HapticFeedback) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

function showEmojiPicker(articleId) {
  // Простая реализация - можно улучшить
  const emojis = ['😀', '😂', '😍', '🤔', '😮', '😢', '😡', '👍', '❤️', '🔥', '💯', '🎉'];
  const picker = document.createElement('div');
  picker.className = 'emoji-picker';
  picker.innerHTML = emojis.map(emoji => 
    `<button class="emoji-picker-btn" onclick="addReaction(${articleId}, '${emoji}'); this.closest('.emoji-picker').remove();">${emoji}</button>`
  ).join('');
  
  document.body.appendChild(picker);
  setTimeout(() => picker.classList.add('show'), 10);
  
  // Закрытие при клике вне
  setTimeout(() => {
    document.addEventListener('click', function closePicker(e) {
      if (!picker.contains(e.target)) {
        picker.remove();
        document.removeEventListener('click', closePicker);
      }
    });
  }, 100);
}

// Функции для комментариев
function renderComments(articleId) {
  const comments = JSON.parse(localStorage.getItem(`comments_${articleId}`)) || [];
  
  if (comments.length === 0) {
    return '<p class="no-comments">Пока нет комментариев</p>';
  }
  
  return comments.map((comment, idx) => `
    <div class="comment-item">
      <div class="comment-author">
        <span class="comment-author-name">${escapeHtml(comment.author || 'Аноним')}</span>
        <span class="comment-date">${comment.date || ''}</span>
      </div>
      <div class="comment-text">${escapeHtml(comment.text)}</div>
    </div>
  `).join('');
}

function addComment(articleId) {
  const commentText = document.getElementById('commentText');
  if (!commentText || !commentText.value.trim()) return;
  
  const comments = JSON.parse(localStorage.getItem(`comments_${articleId}`)) || [];
  const tg = window.Telegram?.WebApp;
  const username = tg?.initDataUnsafe?.user?.username || 'Аноним';
  const firstName = tg?.initDataUnsafe?.user?.first_name || 'Пользователь';
  
  const newComment = {
    text: commentText.value.trim(),
    author: firstName,
    username: username,
    date: new Date().toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  
  comments.push(newComment);
  localStorage.setItem(`comments_${articleId}`, JSON.stringify(comments));
  
  commentText.value = '';
  
  const commentsList = document.getElementById('commentsList');
  if (commentsList) {
    commentsList.innerHTML = renderComments(articleId);
  }
  
  // Вибрация
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred('medium');
  }
}

// Экранирование HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Делаем функции глобальными
window.addReaction = addReaction;
window.showEmojiPicker = showEmojiPicker;
window.addComment = addComment;
