// ============================================
// Страница статьи
// ============================================

const articlePage = document.getElementById("articlePage");

// Получаем ID статьи из URL
const urlParams = new URLSearchParams(window.location.search);
const articleIdParam = urlParams.get('id');
const articleId =
  articleIdParam !== null && articleIdParam !== ''
    ? parseInt(articleIdParam, 10)
    : NaN;

const REACTION_STORAGE_PREFIX = 'reactions_v2_';

function getVoterId() {
  const uid = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  if (uid != null && uid !== '') return `tg:${uid}`;
  let anon = localStorage.getItem('reader_voter_id');
  if (!anon) {
    anon = `anon:${crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36)}`;
    localStorage.setItem('reader_voter_id', anon);
  }
  return anon;
}

function loadReactionState(articleId) {
  const v2Key = `${REACTION_STORAGE_PREFIX}${articleId}`;
  const rawV2 = localStorage.getItem(v2Key);
  if (rawV2) {
    try {
      const data = JSON.parse(rawV2);
      if (data && typeof data.voters === 'object') {
        return {
          voters: { ...data.voters },
          seed: data.seed && typeof data.seed === 'object' ? { ...data.seed } : {},
        };
      }
    } catch (_) {}
  }

  const legacyKey = `reactions_${articleId}`;
  const rawLegacy = localStorage.getItem(legacyKey);
  const state = { voters: {}, seed: {} };
  let parsedLegacyOk = false;
  if (rawLegacy) {
    try {
      const legacy = JSON.parse(rawLegacy);
      parsedLegacyOk = true;
      if (legacy && typeof legacy.voters === 'object' && !Array.isArray(legacy)) {
        localStorage.setItem(v2Key, JSON.stringify(legacy));
        localStorage.removeItem(legacyKey);
        return {
          voters: { ...legacy.voters },
          seed: legacy.seed && typeof legacy.seed === 'object' ? { ...legacy.seed } : {},
        };
      }
      if (legacy && typeof legacy === 'object' && !legacy.voters) {
        state.seed = legacy;
      }
    } catch (_) {
      parsedLegacyOk = false;
    }
  }
  localStorage.setItem(v2Key, JSON.stringify(state));
  if (rawLegacy && parsedLegacyOk) localStorage.removeItem(legacyKey);
  return state;
}

function saveReactionState(articleId, state) {
  localStorage.setItem(`${REACTION_STORAGE_PREFIX}${articleId}`, JSON.stringify(state));
}

function aggregateReactionCounts(state) {
  const counts = {};
  Object.entries(state.seed || {}).forEach(([emoji, n]) => {
    const num = Number(n);
    if (!emoji || !Number.isFinite(num) || num <= 0) return;
    counts[emoji] = (counts[emoji] || 0) + Math.floor(num);
  });
  Object.values(state.voters || {}).forEach((emoji) => {
    if (!emoji) return;
    counts[emoji] = (counts[emoji] || 0) + 1;
  });
  return counts;
}

function getMyReaction(state) {
  return state.voters?.[getVoterId()] || null;
}

function renderReactions(articleId) {
  const state = loadReactionState(articleId);
  const counts = aggregateReactionCounts(state);
  const reactionEntries = Object.entries(counts).filter(([, n]) => n > 0);

  if (reactionEntries.length === 0) {
    return '<p class="no-reactions">Пока нет реакций</p>';
  }

  reactionEntries.sort((a, b) => b[1] - a[1]);

  return reactionEntries
    .map(
      ([emoji, count]) => `
    <div class="reaction-item">
      <span class="reaction-emoji">${emoji}</span>
      <span class="reaction-count">${count}</span>
    </div>
  `
    )
    .join('');
}

function syncReactionButtons(articleId) {
  const state = loadReactionState(articleId);
  const mine = getMyReaction(state);
  document.querySelectorAll('.add-reaction .emoji-btn[data-emoji]').forEach((btn) => {
    const em = btn.getAttribute('data-emoji');
    btn.classList.toggle('emoji-btn--picked', mine !== null && em === mine);
  });
}

function addReaction(articleId, emoji) {
  const state = loadReactionState(articleId);
  const vid = getVoterId();
  const prev = state.voters[vid];

  if (prev === emoji) {
    delete state.voters[vid];
  } else {
    state.voters[vid] = emoji;
  }

  saveReactionState(articleId, state);

  const reactionsList = document.getElementById('reactionsList');
  if (reactionsList) {
    reactionsList.innerHTML = renderReactions(articleId);
  }
  syncReactionButtons(articleId);

  if (window.Telegram?.WebApp?.HapticFeedback) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

function showEmojiPicker(articleId) {
  const emojis = ['😀', '😂', '😍', '🤔', '😮', '😢', '😡', '👍', '❤️', '🔥', '💯', '🎉'];
  const picker = document.createElement('div');
  picker.className = 'emoji-picker';
  picker.innerHTML = emojis
    .map(
      (emoji) =>
        `<button type="button" class="emoji-picker-btn" onclick="addReaction(${articleId}, '${emoji}'); this.closest('.emoji-picker').remove();">${emoji}</button>`
    )
    .join('');

  document.body.appendChild(picker);
  setTimeout(() => picker.classList.add('show'), 10);

  setTimeout(() => {
    document.addEventListener('click', function closePicker(e) {
      if (!picker.contains(e.target)) {
        picker.remove();
        document.removeEventListener('click', closePicker);
      }
    });
  }, 100);
}

if (Number.isFinite(articleId) && articles[articleId]) {
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
        <p class="reaction-hint">Одна реакция с устройства. Повторное нажатие снимает выбор.</p>
        <div class="reactions-list" id="reactionsList">
          ${renderReactions(articleId)}
        </div>
        <div class="add-reaction" id="addReactionBar">
          <button type="button" class="emoji-btn" onclick="showEmojiPicker(${articleId})" aria-label="Другие эмодзи">😀</button>
          <button type="button" class="emoji-btn" data-emoji="👍" onclick="addReaction(${articleId}, '👍')">👍</button>
          <button type="button" class="emoji-btn" data-emoji="❤️" onclick="addReaction(${articleId}, '❤️')">❤️</button>
          <button type="button" class="emoji-btn" data-emoji="🔥" onclick="addReaction(${articleId}, '🔥')">🔥</button>
          <button type="button" class="emoji-btn" data-emoji="😊" onclick="addReaction(${articleId}, '😊')">😊</button>
          <button type="button" class="emoji-btn" data-emoji="💭" onclick="addReaction(${articleId}, '💭')">💭</button>
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
  requestAnimationFrame(() => syncReactionButtons(articleId));
} else {
  articlePage.innerHTML = `
    <div class="error-message">
      <p>Статья не найдена</p>
      <button onclick="window.location.href='index.html'">Вернуться на главную</button>
    </div>
  `;
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
