// В js/hanko.js добавляем:

window.showHankoAuthDirect = function () {
  const savedEmail = localStorage.getItem(HANKO_EMAIL_KEY);

  // Если email не сохранён — обычная форма (первый вход)
  if (!savedEmail) return false;

  // Создаём скрытый hanko-auth, ждём появления кнопки и кликаем по ней
  const hidden = document.createElement("div");
  hidden.style.cssText = "position:fixed; left:-9999px; top:-9999px;";
  document.body.appendChild(hidden);

  const el = document.createElement("hanko-auth");
  el.setAttribute("lang", "en");
  el.setAttribute("shadow", "false");
  el.setAttribute("prefilled-email", savedEmail);
  hidden.appendChild(el);

  var tries = 0;
  var interval = setInterval(function () {
    tries++;
    var btns = hidden.querySelectorAll("button");
    for (var i = 0; i < btns.length; i++) {
      var txt = (btns[i].textContent || "").toLowerCase();
      if (txt.indexOf("passkey") >= 0 || txt.indexOf("face id") >= 0 || txt.indexOf("отпечат") >= 0) {
        clearInterval(interval);
        btns[i].click();
        setTimeout(function () { hidden.remove(); }, 5000);
        return;
      }
    }
    if (tries >= 30) {
      clearInterval(interval);
      hidden.remove();
    }
  }, 50);

  return true;
};