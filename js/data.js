const themes = ["Мысли","Философия","Жизнь","Наблюдения","Идеи"];
let articles = JSON.parse(localStorage.getItem("articles")) || [
{
title:"Почему мысли путаются",
text:"Иногда кажется, что мозг — это тарелка спагетти...",
date:"Сегодня",
image:null
}
];
