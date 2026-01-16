const themesRow = document.getElementById("themesRow");
const articlesWrap = document.getElementById("articles");

if (themesRow) {
themes.forEach(t => {
const d = document.createElement("div");
d.className = "theme-tile";
d.innerText = t;
themesRow.appendChild(d);
});
const more = document.createElement("div");
more.className = "theme-tile";
more.innerText = "Ещё";
more.onclick = () => location.href = "themes.html";
themesRow.appendChild(more);
}

if (articlesWrap) {
articles.forEach(a => {
const d = document.createElement("div");
d.className = "article";
d.innerHTML = `
${a.image ? `<img src="${a.image}">` : ""}
<div class="article-body">
<h3>${a.title}</h3>
<small>${a.date}</small>
<p>${a.text}</p>
</div>
`;
articlesWrap.appendChild(d);
});
}
