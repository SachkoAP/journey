const tg = window.Telegram.WebApp;
tg.ready();
const OWNER_USERNAME = "ifuje";
if (tg.initDataUnsafe?.user?.username === OWNER_USERNAME) {
document.getElementById("addBtn")?.classList.remove("hidden");
}
