var urlParams = new URLSearchParams(window.location.search);
var dialog_box = document.getElementById("dialog");

function slide_up() {
  var start = 25;
  var x = setInterval(function () {
    var distance = start--;
    dialog_box.setAttribute("style", `top:${distance}%;`);
    if (distance < -100) {
      clearInterval(x);
    }
  }, 2);
}

function slide_down() {
  var start = -100;
  var x = setInterval(function () {
    var distance = start++;
    dialog_box.setAttribute("style", `top:${distance}%;`);
    if (distance > 25) {
      clearInterval(x);
    }
  }, 2);
}

var levelsInfo = {
  1: {
    time: 80,
    points: 20,
    elements: data.slice(0, 20),
  },
  2: {
    time: 80,
    points: 50,
    elements: data.slice(0, 54),
  },
  3: {
    time: 150,
    points: 100,
    elements: data,
  },
};

const LEVEL = getLevel(urlParams.get("level"));
var POINTS = 0;
var TO_SCORE = levelsInfo[LEVEL]["points"];
var SECONDS = levelsInfo[LEVEL]["time"];
var ELEMENTS = levelsInfo[LEVEL]["elements"];
var points_container = document.getElementById("points");
var card_container = document.getElementById("card_holder");
var summary_container = document.getElementById("summary_holder");
dialog_box.innerHTML = `<div class="flybox-content"><p align="center" color="white">Đặt nguyên tố vào đúng vị trí trên Bảng tuần hoàn</p><h2>Level ${LEVEL},  ${TO_SCORE} Điểm trong ${SECONDS} giây, Nhấn nút Bắt đầu để chơi</h2><button onclick="startGame();">Bắt đầu</button></div>`;
slide_down();

function getLevel(level) {
  if (level == null) {
    return 1;
  } else if (level > 3) {
    return 3;
  }
  return level;
}

function performCalc(el, value) {
  if (el.innerHTML == value) {
    POINTS++;
    points_container.innerHTML = POINTS;
    el.style.background = "#03DAC6";
  } else {
    el.style.background = "#CF6679";
  }
  document.getElementById("ca" + value).remove();
  if (card_container.childElementCount == 0 || POINTS == TO_SCORE) {
    endGame();
  } else {
    summary_container.innerHTML =
      data[card_container.firstElementChild.id.slice(2) - 1]["summary"];
  }
}

function onStart(el, event) {
  event.dataTransfer.setData("num", el.id.slice(2));
}

function onOver(el, event) {
  event.preventDefault();
  el.style.background = "#03DAC6";
}

function onLeave(el, event) {
  event.preventDefault();
  el.style.background = "#3700B3";
}

function onDrop(el, event) {
  event.preventDefault();
  performCalc(el, event.dataTransfer.getData("num"));
}

function dropClicked(event) {
  if (card_container.childElementCount != 0) {
    performCalc(event.target, card_container.firstElementChild.id.slice(2));
  }
}

function getElementCard(num, abr, mass, name) {
  var e = document.createElement("div");
  e.className = "card";
  e.id = "ca" + num;
  e.innerHTML = `<div class="element-card" id="el${num}"><h1 class="abr" id="ab${num}">${abr}</h1><p class="title" id="ti${num}">${name}</p><span class="atomic-mass" id="at${num}">${mass}</span></div>`;
  return e;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function timer() {
  var x = setInterval(function () {
    var distance = SECONDS--;
    document.getElementById("time").innerHTML = distance + " Giây";
    if (distance == 0) {
      clearInterval(x);
      document.getElementById("time").innerHTML = "Kết thúc";
      endGame();
    }
  }, 1000);
}

function startGame() {
  slide_up();
  //dialog_box.setAttribute("style", "display:none;");
  var container_box = document.getElementsByClassName("container")[0];
  var rows = document.getElementsByClassName("row");
  if (LEVEL == 1) {
    container_box.className += "-level-1";
    rows[1] += "-level-1";
    rows[2] += "-level-1";
    rows[3] += "-level-1";
  } else if (LEVEL == 2) {
    container_box.className += "-level-2";
  }
  var new_list = shuffle([...ELEMENTS]);
  for (const el of new_list) {
    card_container.appendChild(
      getElementCard(
        data.indexOf(el) + 1,
        el["abr"],
        Math.round(el["atomic-mass"] * 100) / 100,
        el["name"]
      )
    );
  }
  for (const pcard of document.querySelectorAll(".card")) {
    pcard.setAttribute("draggable", "true");
    pcard.setAttribute("ondragstart", "onStart(event.target, event)");
  }
  for (const dcard of document.querySelectorAll(".el")) {
    if (dcard.innerHTML.length <= 3) {
      if (dcard.innerHTML <= ELEMENTS.length) {
        dcard.setAttribute("onclick", "dropClicked(event)");
        dcard.setAttribute("ondrop", "onDrop(event.target, event)");
        dcard.setAttribute("ondragover", "onOver(event.target, event)");
        dcard.setAttribute("ondragleave", "onLeave(event.target, event)");
      } else {
        dcard.setAttribute("style", "display:none;"); // "background:#212121;color:grey;cursor:default;");
      }
    } else {
      if (LEVEL != 3) {
        dcard.setAttribute("style", "display:none;");
      }
    }
  }
  summary_container.innerHTML = new_list[0]["summary"];
  timer();
}

function endGame() {
  card_container.innerHTML = "";
  var results;
  var level;
  var btn;
  if (POINTS >= TO_SCORE) {
    results = "CHÚC MỪNG!";
    level = parseInt(LEVEL) + 1;
    btn = "Level tiếp theo";
  } else {
    results = "Cố gắng hơn vào lần sau nha!";
    btn = "Thử lại";
    level = LEVEL;
  }
  summary_container.innerHTML = "";
  dialog_box.innerHTML = `<div class="flybox-content"><h2>${results}. Bạn đạt ${POINTS} điểm!</h2><button onclick="location.replace(window.location.origin+window.location.pathname+'?level=${level}');">${btn}</button></div>`;
  slide_down();
}
