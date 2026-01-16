const themes=["Мысли","Философия","Путешествия","Идеи"];
let articles=JSON.parse(localStorage.getItem('articles'))||[];

// =========================
// js/telegram.js
// =========================
const tg=window.Telegram.WebApp;tg.ready();
const OWNER_USERNAME="ТВОЙ_USERNAME";
if(tg.initDataUnsafe?.user?.username===OWNER_USERNAME){
document.getElementById('addBtn')?.classList.remove('hidden');
}
