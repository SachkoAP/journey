const themesRow=document.getElementById('themesRow');
const articlesWrap=document.getElementById('articles');
const themesGrid=document.getElementById('themesGrid');
const themeSelect=document.getElementById('themeSelect');

if(themesRow){
themes.forEach(t=>{
const d=document.createElement('div');
d.className='theme-tile';d.innerText=t;
themesRow.appendChild(d);
});
const more=document.createElement('div');more.className='theme-tile';more.innerText='Еще';more.onclick=()=>location.href='themes.html';
themesRow.appendChild(more);
}

if(articlesWrap){
articles.forEach(a=>{
const d=document.createElement('div');d.className='article';
d.innerHTML=`<h3>${a.title}</h3><small>${a.date}</small><p>${a.text}</p>`;
articlesWrap.appendChild(d);
});
}

if(themesGrid){
themes.forEach(t=>{
const d=document.createElement('div');d.className='theme-tile';d.innerText=t;
themesGrid.appendChild(d);
});
}

if(themeSelect){
themes.forEach(t=>{
const o=document.createElement('option');o.value=t;o.innerText=t;
themeSelect.appendChild(o);
});
}

const form=document.getElementById('addForm');
if(form){
form.onsubmit=e=>{
e.preventDefault();
articles.unshift({
title:title.value,
text:text.value,
date:new Date().toLocaleDateString()
});
localStorage.setItem('articles',JSON.stringify(articles));
location.href='index.html';
}
}
