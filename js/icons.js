"use strict";

/* ============================================================
   Все SVG-иконки и иллюстрации
   ============================================================ */

function svgBell() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="bellGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE66D"/><stop offset="1" stop-color="#E8A32E"/></linearGradient></defs>' +
    '<ellipse cx="56" cy="88" rx="18" ry="3" fill="#000" opacity="0.12"/>' +
    '<g transform="rotate(18 52 52)">' +
      '<path d="M52 18 Q36 18 36 40 L36 56 Q32 58 32 64 L72 64 Q72 58 68 56 L68 40 Q68 18 52 18 Z" fill="url(#bellGrad)" stroke="#B45309" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<rect x="48" y="12" width="8" height="8" rx="3" fill="#E8A32E" stroke="#B45309" stroke-width="1.2"/>' +
      '<path d="M44 70 Q52 80 60 70" fill="#E8A32E" stroke="#B45309" stroke-width="1.4" stroke-linejoin="round"/>' +
      '<circle cx="44" cy="42" r="2.8" fill="#FFFFFF" opacity="0.65"/>' +
    '</g>' +
    '<g transform="rotate(-25 24 72)">' +
      '<rect x="20" y="60" width="3.5" height="18" rx="1.75" fill="#8B5CF6" stroke="#5B21B6" stroke-width="1"/>' +
      '<circle cx="21.75" cy="58" r="5" fill="#A78BFA" stroke="#5B21B6" stroke-width="1.2"/>' +
    '</g>' +
    '<path d="M76 30 Q82 34 82 42" stroke="#8B5CF6" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.85"/>' +
    '<path d="M82 26 Q90 32 90 42" stroke="#A78BFA" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.6"/>' +
    '<path d="M88 22 Q96 30 96 42" stroke="#C4B5FD" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.4"/>' +
    '</svg>';
}

function svgChecklist() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="checklistGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A78BFA"/><stop offset="1" stop-color="#7C3AED"/></linearGradient></defs>' +
    '<ellipse cx="50" cy="88" rx="24" ry="3" fill="#000" opacity="0.1"/>' +
    '<rect x="22" y="20" width="56" height="62" rx="6" fill="#FFFFFF" stroke="#DDD0F5" stroke-width="1.4"/>' +
    '<rect x="28" y="14" width="44" height="12" rx="4" fill="url(#checklistGrad)"/>' +
    '<circle cx="38" cy="38" r="5" fill="#DDF7F4" stroke="#0D9488" stroke-width="1.2"/>' +
    '<path d="M35.5 38 L37.5 40 L41 36" stroke="#0D9488" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<line x1="48" y1="38" x2="68" y2="38" stroke="#DDD0F5" stroke-width="2" stroke-linecap="round"/>' +
    '<circle cx="38" cy="52" r="5" fill="#DDF7F4" stroke="#0D9488" stroke-width="1.2"/>' +
    '<path d="M35.5 52 L37.5 54 L41 50" stroke="#0D9488" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<line x1="48" y1="52" x2="68" y2="52" stroke="#DDD0F5" stroke-width="2" stroke-linecap="round"/>' +
    '<circle cx="38" cy="66" r="5" fill="#F0E9FF" stroke="#A78BFA" stroke-width="1.2"/>' +
    '<line x1="48" y1="66" x2="62" y2="66" stroke="#DDD0F5" stroke-width="2" stroke-linecap="round"/>' +
    '</svg>';
}

function svgDiary() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="diaryGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#A78BFA"/><stop offset="1" stop-color="#7C3AED"/></linearGradient></defs>' +
    '<ellipse cx="50" cy="88" rx="30" ry="4" fill="#000" opacity="0.12"/>' +
    '<rect x="20" y="18" width="52" height="70" rx="4" fill="url(#diaryGrad)" stroke="#5B21B6" stroke-width="1.5"/>' +
    '<rect x="20" y="18" width="8" height="70" rx="3" fill="#6D28D9"/>' +
    '<path d="M60 18 L60 42 L64 38 L68 42 L68 18 Z" fill="#F472B6" stroke="#DB2777" stroke-width="1"/>' +
    '<text x="46" y="68" font-family="Fredoka, sans-serif" font-size="34" font-weight="800" text-anchor="middle" fill="#FFE66D" stroke="#B45309" stroke-width="0.8">5</text>' +
    '</svg>';
}

function svgTarget() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="50" cy="50" r="32" fill="#FFFFFF" stroke="#E5C5F5" stroke-width="1.5"/>' +
    '<circle cx="50" cy="50" r="25" fill="#F9A8D4"/>' +
    '<circle cx="50" cy="50" r="18" fill="#FFFFFF"/>' +
    '<circle cx="50" cy="50" r="11" fill="#F472B6"/>' +
    '<circle cx="50" cy="50" r="5" fill="#DB2777"/>' +
    '<circle cx="50" cy="50" r="2" fill="#FFE66D"/>' +
    '<line x1="22" y1="22" x2="47" y2="47" stroke="#8B5CF6" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M20 20 L24 14 L28 22 Z" fill="#8B5CF6"/>' +
    '</svg>';
}

function svgExchange() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="exchGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5EEAD4"/><stop offset="1" stop-color="#0D9488"/></linearGradient></defs>' +
    '<ellipse cx="50" cy="88" rx="24" ry="3" fill="#000" opacity="0.1"/>' +
    '<path d="M28 34 L60 34 M60 34 L52 26 M60 34 L52 42" stroke="url(#exchGrad)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
    '<path d="M72 66 L40 66 M40 66 L48 58 M40 66 L48 74" stroke="url(#exchGrad)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
    '<circle cx="50" cy="50" r="3" fill="#FBBF24"/>' +
    '</svg>';
}

function svgBook() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="bookGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5EEAD4"/><stop offset="1" stop-color="#0D9488"/></linearGradient></defs>' +
    '<ellipse cx="50" cy="86" rx="30" ry="4" fill="#000" opacity="0.12"/>' +
    '<rect x="14" y="24" width="72" height="58" rx="5" fill="url(#bookGrad)" stroke="#0F766E" stroke-width="1.5"/>' +
    '<rect x="14" y="24" width="10" height="58" rx="3" fill="#0F766E"/>' +
    '<path d="M78 26 L78 52 L82 48 L86 52 L86 26 Z" fill="#F472B6" stroke="#DB2777" stroke-width="1"/>' +
    '<line x1="30" y1="48" x2="70" y2="48" stroke="#5EEAD4" stroke-width="1.2" opacity="0.6"/>' +
    '<line x1="30" y1="56" x2="70" y2="56" stroke="#5EEAD4" stroke-width="1.2" opacity="0.6"/>' +
    '</svg>';
}

function svgMoney() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="moneyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE66D"/><stop offset="1" stop-color="#F59E0B"/></linearGradient></defs>' +
    '<ellipse cx="50" cy="88" rx="26" ry="3" fill="#000" opacity="0.12"/>' +
    '<ellipse cx="50" cy="74" rx="26" ry="9" fill="url(#moneyGrad)" stroke="#B45309" stroke-width="1.5"/>' +
    '<ellipse cx="50" cy="66" rx="26" ry="9" fill="url(#moneyGrad)" stroke="#B45309" stroke-width="1.5"/>' +
    '<ellipse cx="50" cy="58" rx="26" ry="9" fill="url(#moneyGrad)" stroke="#B45309" stroke-width="1.5"/>' +
    '<ellipse cx="50" cy="50" rx="26" ry="9" fill="url(#moneyGrad)" stroke="#B45309" stroke-width="1.5"/>' +
    '<ellipse cx="50" cy="50" rx="14" ry="5" fill="#FFFFFF" opacity="0.35"/>' +
    '</svg>';
}

/* ============================================================
   Драконы (уровни)
   ============================================================ */

function dragonEgg() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><radialGradient id="eggGrad" cx="0.4" cy="0.35" r="0.75"><stop offset="0" stop-color="#F9A8D4"/><stop offset="0.55" stop-color="#C4B5FD"/><stop offset="1" stop-color="#7C3AED"/></radialGradient></defs>' +
    '<ellipse cx="50" cy="90" rx="22" ry="3" fill="#000" opacity="0.12"/>' +
    '<path d="M50 15 C 32 15 22 40 22 58 C 22 76 34 86 50 86 C 66 86 78 76 78 58 C 78 40 68 15 50 15 Z" fill="url(#eggGrad)" stroke="#5B21B6" stroke-width="1.6"/>' +
    '<ellipse cx="42" cy="42" rx="4" ry="5.5" fill="#F9A8D4" opacity="0.65"/>' +
    '<ellipse cx="60" cy="58" rx="3.5" ry="4.5" fill="#F9A8D4" opacity="0.6"/>' +
    '<ellipse cx="38" cy="32" rx="5" ry="8" fill="#FFFFFF" opacity="0.55"/>' +
    '<path d="M46 78 L50 72 L47 68 L52 64" stroke="#5B21B6" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
    '</svg>';
}

function dragonBaby() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="babyBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDD0F5"/><stop offset="1" stop-color="#A78BFA"/></linearGradient></defs>' +
    '<ellipse cx="50" cy="90" rx="22" ry="3" fill="#000" opacity="0.12"/>' +
    '<ellipse cx="50" cy="72" rx="18" ry="13" fill="url(#babyBody)" stroke="#7C3AED" stroke-width="1.5"/>' +
    '<ellipse cx="40" cy="84" rx="4.5" ry="3" fill="#7C3AED"/>' +
    '<ellipse cx="60" cy="84" rx="4.5" ry="3" fill="#7C3AED"/>' +
    '<circle cx="50" cy="42" r="20" fill="url(#babyBody)" stroke="#7C3AED" stroke-width="1.5"/>' +
    '<path d="M42 24 L38 14 L46 22 Z" fill="#FFE66D" stroke="#B45309" stroke-width="1.2"/>' +
    '<circle cx="44" cy="42" r="3.6" fill="#1E1B2E"/>' +
    '<circle cx="45" cy="40.8" r="1.2" fill="#FFFFFF"/>' +
    '<circle cx="56" cy="42" r="3.6" fill="#1E1B2E"/>' +
    '<circle cx="57" cy="40.8" r="1.2" fill="#FFFFFF"/>' +
    '<path d="M46 52 Q50 55 54 52" stroke="#1E1B2E" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
    '</svg>';
}

function dragonYoung() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="youngBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C4B5FD"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient></defs>' +
    '<ellipse cx="50" cy="91" rx="24" ry="3" fill="#000" opacity="0.12"/>' +
    '<path d="M28 60 Q10 54 18 78 Q24 68 34 66 Z" fill="#F9A8D4" stroke="#DB2777" stroke-width="1.4"/>' +
    '<path d="M72 60 Q90 54 82 78 Q76 68 66 66 Z" fill="#F9A8D4" stroke="#DB2777" stroke-width="1.4"/>' +
    '<ellipse cx="50" cy="70" rx="21" ry="16" fill="url(#youngBody)" stroke="#5B21B6" stroke-width="1.5"/>' +
    '<ellipse cx="50" cy="74" rx="12" ry="9" fill="#F5F0FF" opacity="0.75"/>' +
    '<ellipse cx="50" cy="40" rx="19" ry="17" fill="url(#youngBody)" stroke="#5B21B6" stroke-width="1.5"/>' +
    '<path d="M40 26 L36 14 L44 24 Z" fill="#FFE66D" stroke="#B45309" stroke-width="1.2"/>' +
    '<path d="M60 26 L64 14 L56 24 Z" fill="#FFE66D" stroke="#B45309" stroke-width="1.2"/>' +
    '<circle cx="43" cy="40" r="3.4" fill="#1E1B2E"/>' +
    '<circle cx="44" cy="38.9" r="1.1" fill="#FFFFFF"/>' +
    '<circle cx="57" cy="40" r="3.4" fill="#1E1B2E"/>' +
    '<circle cx="58" cy="38.9" r="1.1" fill="#FFFFFF"/>' +
    '<path d="M45 48 Q50 51 55 48" stroke="#1E1B2E" stroke-width="1.3" fill="none" stroke-linecap="round"/>' +
    '</svg>';
}

function dragonAdult() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
      '<linearGradient id="adultBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A78BFA"/><stop offset="1" stop-color="#6D28D9"/></linearGradient>' +
      '<linearGradient id="adultWing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5EEAD4"/><stop offset="1" stop-color="#0D9488"/></linearGradient>' +
    '</defs>' +
    '<ellipse cx="50" cy="92" rx="26" ry="3" fill="#000" opacity="0.14"/>' +
    '<path d="M30 55 Q6 42 12 82 Q20 68 34 62 Z" fill="url(#adultWing)" stroke="#0F766E" stroke-width="1.5"/>' +
    '<path d="M70 55 Q94 42 88 82 Q80 68 66 62 Z" fill="url(#adultWing)" stroke="#0F766E" stroke-width="1.5"/>' +
    '<ellipse cx="50" cy="70" rx="20" ry="17" fill="url(#adultBody)" stroke="#4C1D95" stroke-width="1.5"/>' +
    '<ellipse cx="50" cy="74" rx="11" ry="9" fill="#DDD0F5" opacity="0.75"/>' +
    '<ellipse cx="50" cy="38" rx="20" ry="18" fill="url(#adultBody)" stroke="#4C1D95" stroke-width="1.5"/>' +
    '<path d="M40 24 L36 12 L42 20 L44 10 L46 20 L44 24" fill="#FFE66D" stroke="#B45309" stroke-width="1.2"/>' +
    '<path d="M60 24 L64 12 L58 20 L56 10 L54 20 L56 24" fill="#FFE66D" stroke="#B45309" stroke-width="1.2"/>' +
    '<circle cx="43" cy="38" r="3.6" fill="#1E1B2E"/>' +
    '<circle cx="44" cy="36.8" r="1.2" fill="#FFFFFF"/>' +
    '<circle cx="57" cy="38" r="3.6" fill="#1E1B2E"/>' +
    '<circle cx="58" cy="36.8" r="1.2" fill="#FFFFFF"/>' +
    '<path d="M44 46 Q50 50 56 46" stroke="#1E1B2E" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
    '</svg>';
}

function dragonBig() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
      '<linearGradient id="bigBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8B5CF6"/><stop offset="1" stop-color="#4C1D95"/></linearGradient>' +
      '<linearGradient id="bigWing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5EEAD4"/><stop offset="1" stop-color="#0D9488"/></linearGradient>' +
      '<radialGradient id="bigGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0.4" stop-color="#FBBF24" stop-opacity="0.15"/><stop offset="1" stop-color="#FBBF24" stop-opacity="0"/></radialGradient>' +
    '</defs>' +
    '<circle cx="50" cy="50" r="46" fill="url(#bigGlow)"/>' +
    '<ellipse cx="50" cy="93" rx="28" ry="3" fill="#000" opacity="0.15"/>' +
    '<path d="M28 52 Q2 36 8 84 Q18 68 32 60 Z" fill="url(#bigWing)" stroke="#0F766E" stroke-width="1.6"/>' +
    '<path d="M72 52 Q98 36 92 84 Q82 68 68 60 Z" fill="url(#bigWing)" stroke="#0F766E" stroke-width="1.6"/>' +
    '<ellipse cx="50" cy="70" rx="20" ry="18" fill="url(#bigBody)" stroke="#3B1F5C" stroke-width="1.5"/>' +
    '<ellipse cx="50" cy="75" rx="11" ry="9" fill="#C4B5FD" opacity="0.75"/>' +
    '<ellipse cx="50" cy="36" rx="21" ry="19" fill="url(#bigBody)" stroke="#3B1F5C" stroke-width="1.5"/>' +
    '<path d="M38 22 L34 8 L40 18 L42 6 L44 18 L42 22" fill="#FFE66D" stroke="#B45309" stroke-width="1.3"/>' +
    '<path d="M62 22 L66 8 L60 18 L58 6 L56 18 L58 22" fill="#FFE66D" stroke="#B45309" stroke-width="1.3"/>' +
    '<circle cx="42" cy="36" r="3.8" fill="#1E1B2E"/>' +
    '<circle cx="43" cy="34.6" r="1.3" fill="#FFFFFF"/>' +
    '<circle cx="58" cy="36" r="3.8" fill="#1E1B2E"/>' +
    '<circle cx="59" cy="34.6" r="1.3" fill="#FFFFFF"/>' +
    '<path d="M46 46 Q50 49 54 46" stroke="#1E1B2E" stroke-width="1.3" fill="none" stroke-linecap="round"/>' +
    '</svg>';
}

function dragonLegend() {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
      '<linearGradient id="legBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7C3AED"/><stop offset="1" stop-color="#4C1D95"/></linearGradient>' +
      '<linearGradient id="legWing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5EEAD4"/><stop offset="1" stop-color="#0D9488"/></linearGradient>' +
      '<radialGradient id="legGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0.2" stop-color="#FBBF24" stop-opacity="0.28"/><stop offset="1" stop-color="#FBBF24" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="legCrown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE66D"/><stop offset="1" stop-color="#F59E0B"/></linearGradient>' +
    '</defs>' +
    '<circle cx="50" cy="50" r="48" fill="url(#legGlow)"/>' +
    '<ellipse cx="50" cy="94" rx="30" ry="3" fill="#000" opacity="0.16"/>' +
    '<path d="M26 50 Q0 32 4 84 Q16 66 30 58 Z" fill="url(#legWing)" stroke="#0F766E" stroke-width="1.8"/>' +
    '<path d="M74 50 Q100 32 96 84 Q84 66 70 58 Z" fill="url(#legWing)" stroke="#0F766E" stroke-width="1.8"/>' +
    '<ellipse cx="50" cy="70" rx="21" ry="19" fill="url(#legBody)" stroke="#2D1B5E" stroke-width="1.6"/>' +
    '<ellipse cx="50" cy="75" rx="12" ry="10" fill="#C4B5FD" opacity="0.8"/>' +
    '<ellipse cx="50" cy="35" rx="22" ry="20" fill="url(#legBody)" stroke="#2D1B5E" stroke-width="1.6"/>' +
    '<path d="M32 22 L36 10 L42 18 L50 6 L58 18 L64 10 L68 22 L66 24 L34 24 Z" fill="url(#legCrown)" stroke="#B45309" stroke-width="1.4"/>' +
    '<path d="M36 34 L26 32 L30 38 Z" fill="#FFE66D" stroke="#B45309" stroke-width="1.2"/>' +
    '<path d="M64 34 L74 32 L70 38 Z" fill="#FFE66D" stroke="#B45309" stroke-width="1.2"/>' +
    '<circle cx="42" cy="36" r="4" fill="#FBBF24"/>' +
    '<circle cx="42" cy="36" r="2.4" fill="#1E1B2E"/>' +
    '<circle cx="42.8" cy="35" r="0.9" fill="#FFFFFF"/>' +
    '<circle cx="58" cy="36" r="4" fill="#FBBF24"/>' +
    '<circle cx="58" cy="36" r="2.4" fill="#1E1B2E"/>' +
    '<circle cx="58.8" cy="35" r="0.9" fill="#FFFFFF"/>' +
    '<path d="M45 47 Q50 50 55 47" stroke="#1E1B2E" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
    '</svg>';
}

function dragonSvg(key) {
  var map = { egg: dragonEgg, baby: dragonBaby, young: dragonYoung, adult: dragonAdult, big: dragonBig, legend: dragonLegend };
  var fn = map[key];
  return fn ? fn() : "";
}

/* ============================================================
   Гуфи — осьминог-помощник (компактные версии)
   ============================================================ */

function guffyTentacles(cx, cy) {
  var legs = [
    [cx - 17, cy + 28, cx - 32, cy + 42, cx - 26, cy + 55],
    [cx - 9,  cy + 33, cx - 15, cy + 46, cx - 11, cy + 57],
    [cx + 0,  cy + 35, cx - 2,  cy + 48, cx + 2,  cy + 59],
    [cx + 9,  cy + 33, cx + 15, cy + 46, cx + 11, cy + 57],
    [cx + 17, cy + 28, cx + 32, cy + 42, cx + 26, cy + 55]
  ];
  var outlines = "", fills = "";
  legs.forEach(function (l) {
    var d = "M" + l[0] + " " + l[1] + " Q" + l[2] + " " + l[3] + " " + l[4] + " " + l[5];
    outlines += '<path d="' + d + '" fill="none" stroke="#7C3AED" stroke-width="5" stroke-linecap="round"/>';
    fills += '<path d="' + d + '" fill="none" stroke="#A78BFA" stroke-width="2.6" stroke-linecap="round"/>';
  });
  return outlines + fills;
}

function guffyEyes(cx, cy, emotion) {
  var ex1 = cx - 10, ex2 = cx + 10, ey = cy + 18;
  if (emotion === "happy") {
    return '<path d="M' + (ex1 - 4) + ' ' + (ey + 2) + ' Q' + ex1 + ' ' + (ey - 3) + ' ' + (ex1 + 4) + ' ' + (ey + 2) + '" stroke="#1E1B2E" stroke-width="1.9" fill="none" stroke-linecap="round"/>' +
           '<path d="M' + (ex2 - 4) + ' ' + (ey + 2) + ' Q' + ex2 + ' ' + (ey - 3) + ' ' + (ex2 + 4) + ' ' + (ey + 2) + '" stroke="#1E1B2E" stroke-width="1.9" fill="none" stroke-linecap="round"/>';
  }
  if (emotion === "sleeping") {
    return '<path d="M' + (ex1 - 4) + ' ' + ey + ' Q' + ex1 + ' ' + (ey + 2.5) + ' ' + (ex1 + 4) + ' ' + ey + '" stroke="#1E1B2E" stroke-width="1.7" fill="none" stroke-linecap="round"/>' +
           '<path d="M' + (ex2 - 4) + ' ' + ey + ' Q' + ex2 + ' ' + (ey + 2.5) + ' ' + (ex2 + 4) + ' ' + ey + '" stroke="#1E1B2E" stroke-width="1.7" fill="none" stroke-linecap="round"/>';
  }
  if (emotion === "thinking") {
    return '<ellipse cx="' + ex1 + '" cy="' + ey + '" rx="4.5" ry="5.5" fill="#FFFFFF"/>' +
           '<circle cx="' + (ex1 + 1) + '" cy="' + (ey + 1) + '" r="2.8" fill="#1E1B2E"/>' +
           '<circle cx="' + (ex1 + 1.8) + '" cy="' + (ey - 0.5) + '" r="1" fill="#FFFFFF"/>' +
           '<path d="M' + (ex2 - 4) + ' ' + ey + ' Q' + ex2 + ' ' + (ey + 2.5) + ' ' + (ex2 + 4) + ' ' + ey + '" stroke="#1E1B2E" stroke-width="1.9" fill="none" stroke-linecap="round"/>';
  }
  return '<ellipse cx="' + ex1 + '" cy="' + ey + '" rx="4.5" ry="5.5" fill="#FFFFFF"/>' +
         '<ellipse cx="' + ex2 + '" cy="' + ey + '" rx="4.5" ry="5.5" fill="#FFFFFF"/>' +
         '<circle cx="' + (ex1 + 1) + '" cy="' + (ey + 1) + '" r="2.8" fill="#1E1B2E"/>' +
         '<circle cx="' + (ex2 + 1) + '" cy="' + (ey + 1) + '" r="2.8" fill="#1E1B2E"/>' +
         '<circle cx="' + (ex1 + 1.8) + '" cy="' + (ey - 0.5) + '" r="1" fill="#FFFFFF"/>' +
         '<circle cx="' + (ex2 + 1.8) + '" cy="' + (ey - 0.5) + '" r="1" fill="#FFFFFF"/>';
}

function guffyMouth(cx, cy, emotion) {
  var my = cy + 26;
  if (emotion === "happy") {
    return '<path d="M' + (cx - 6) + ' ' + my + ' Q' + cx + ' ' + (my + 5) + ' ' + (cx + 6) + ' ' + my + '" stroke="#1E1B2E" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
  }
  if (emotion === "sleeping") {
    return '<ellipse cx="' + cx + '" cy="' + my + '" rx="1.8" ry="2.2" fill="#1E1B2E" opacity="0.55"/>';
  }
  if (emotion === "thinking") {
    return '<path d="M' + (cx - 4) + ' ' + (my + 1) + ' Q' + cx + ' ' + (my - 1) + ' ' + (cx + 4) + ' ' + (my + 1) + '" stroke="#1E1B2E" stroke-width="1.3" fill="none" stroke-linecap="round"/>';
  }
  return '<path d="M' + (cx - 4) + ' ' + my + ' Q' + cx + ' ' + (my + 3) + ' ' + (cx + 4) + ' ' + my + '" stroke="#1E1B2E" stroke-width="1.2" fill="none" stroke-linecap="round"/>';
}

function guffySleepZ(cx, cy) {
  return '<text x="' + (cx + 20) + '" y="' + (cy + 4) + '" font-family="Fredoka, sans-serif" font-size="10" font-weight="800" fill="#A78BFA" opacity="0.75">z</text>' +
         '<text x="' + (cx + 26) + '" y="' + (cy - 4) + '" font-family="Fredoka, sans-serif" font-size="12" font-weight="800" fill="#A78BFA" opacity="0.55">z</text>' +
         '<text x="' + (cx + 34) + '" y="' + (cy - 12) + '" font-family="Fredoka, sans-serif" font-size="14" font-weight="800" fill="#A78BFA" opacity="0.4">Z</text>';
}

function guffyBody(cx, cy, emotion) {
  emotion = emotion || "normal";
  return guffyTentacles(cx, cy) +
    '<ellipse cx="' + cx + '" cy="' + (cy + 18) + '" rx="24" ry="22" fill="#A78BFA" stroke="#7C3AED" stroke-width="1.4"/>' +
    '<ellipse cx="' + (cx - 6) + '" cy="' + (cy + 12) + '" rx="10" ry="7" fill="#C4B5FD" opacity="0.5"/>' +
    '<path d="M' + (cx - 18) + ' ' + cy + ' Q' + (cx - 22) + ' ' + (cy - 6) + ' ' + (cx - 14) + ' ' + (cy - 2) + ' Q' + (cx - 16) + ' ' + (cy + 2) + ' ' + (cx - 12) + ' ' + (cy + 4) + ' Z" fill="#C4B5FD" stroke="#7C3AED" stroke-width="0.9"/>' +
    '<path d="M' + (cx + 18) + ' ' + cy + ' Q' + (cx + 22) + ' ' + (cy - 6) + ' ' + (cx + 14) + ' ' + (cy - 2) + ' Q' + (cx + 16) + ' ' + (cy + 2) + ' ' + (cx + 12) + ' ' + (cy + 4) + ' Z" fill="#C4B5FD" stroke="#7C3AED" stroke-width="0.9"/>' +
    guffyEyes(cx, cy, emotion) +
    '<ellipse cx="' + (cx - 18) + '" cy="' + (cy + 24) + '" rx="3" ry="1.8" fill="#F472B6" opacity="0.55"/>' +
    '<ellipse cx="' + (cx + 18) + '" cy="' + (cy + 24) + '" rx="3" ry="1.8" fill="#F472B6" opacity="0.55"/>' +
    guffyMouth(cx, cy, emotion) +
    (emotion === "sleeping" ? guffySleepZ(cx, cy) : "");
}

function guffyWithPiggy(emotion) {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="50" cy="93" rx="26" ry="2.5" fill="#000" opacity="0.08"/>' +
    guffyBody(50, 20, emotion) +
    '<ellipse cx="50" cy="80" rx="17" ry="11" fill="#FFD6E8" stroke="#DB2777" stroke-width="1.1"/>' +
    '<ellipse cx="50" cy="84" rx="12" ry="5.5" fill="#FFE4F0" opacity="0.75"/>' +
    '<path d="M36 74 L32 67 L40 71 Z" fill="#F9A8D4" stroke="#DB2777" stroke-width="0.9"/>' +
    '<path d="M64 74 L68 67 L60 71 Z" fill="#F9A8D4" stroke="#DB2777" stroke-width="0.9"/>' +
    '<rect x="45" y="70" width="10" height="2.2" rx="1.1" fill="#A8577D"/>' +
    '<ellipse cx="50" cy="86" rx="3" ry="2.2" fill="#F472B6"/>' +
    '<circle cx="43" cy="78" r="1.2" fill="#1E1B2E"/>' +
    '<circle cx="57" cy="78" r="1.2" fill="#1E1B2E"/>' +
    '<path d="M46 80 Q50 83 54 80" stroke="#DB2777" stroke-width="0.9" fill="none" stroke-linecap="round"/>' +
    '<circle cx="20" cy="28" r="1" fill="#FFE66D"/>' +
    '<circle cx="82" cy="36" r="1.1" fill="#FFE66D"/>' +
    '</svg>';
}

function guffyWithCoin(emotion) {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
      '<radialGradient id="coinFace" cx="0.38" cy="0.32" r="0.75">' +
        '<stop offset="0" stop-color="#FFF8C4"/>' +
        '<stop offset="0.55" stop-color="#FCD34D"/>' +
        '<stop offset="1" stop-color="#D97706"/>' +
      '</radialGradient>' +
      '<linearGradient id="coinEdge" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#F59E0B"/>' +
        '<stop offset="1" stop-color="#92400E"/>' +
      '</linearGradient>' +
    '</defs>' +
    '<ellipse cx="50" cy="93" rx="26" ry="2.5" fill="#000" opacity="0.08"/>' +
    guffyBody(50, 20, emotion) +
    '<ellipse cx="42" cy="87" rx="11" ry="5.5" fill="url(#coinEdge)" stroke="#78350F" stroke-width="0.9"/>' +
    '<ellipse cx="42" cy="86" rx="11" ry="5.5" fill="#F59E0B" stroke="#92400E" stroke-width="0.9"/>' +
    '<ellipse cx="42" cy="85.5" rx="8" ry="3.8" fill="#FBBF24" opacity="0.85"/>' +
    '<ellipse cx="56" cy="82" rx="12" ry="6" fill="url(#coinEdge)" stroke="#78350F" stroke-width="1"/>' +
    '<ellipse cx="56" cy="81" rx="12" ry="6" fill="#F59E0B" stroke="#92400E" stroke-width="1"/>' +
    '<ellipse cx="56" cy="80.5" rx="10.5" ry="5.2" fill="url(#coinFace)" stroke="#B45309" stroke-width="1"/>' +
    '<ellipse cx="56" cy="80.5" rx="7.5" ry="3.6" fill="none" stroke="#B45309" stroke-width="0.8" opacity="0.85"/>' +
    '<ellipse cx="52.5" cy="78.5" rx="3.5" ry="1.4" fill="#FFFFFF" opacity="0.55"/>' +
    '<text x="56" y="83" font-family="Fredoka, sans-serif" font-size="7.5" font-weight="800" text-anchor="middle" fill="#92400E">$</text>' +
    '<circle cx="18" cy="60" r="1.2" fill="#FFE66D"/>' +
    '<circle cx="82" cy="40" r="1" fill="#FFE66D"/>' +
    '</svg>';
}

function guffyWithFlag(emotion) {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="hillA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A78BFA"/><stop offset="1" stop-color="#7C3AED"/></linearGradient></defs>' +
    '<path d="M4 94 L34 60 L50 76 L66 46 L96 94 Z" fill="url(#hillA)" stroke="#5B21B6" stroke-width="0.9"/>' +
    '<line x1="66" y1="26" x2="66" y2="48" stroke="#5B21B6" stroke-width="1.3"/>' +
    '<path d="M66 26 L84 32 L66 38 Z" fill="#F472B6" stroke="#DB2777" stroke-width="0.7"/>' +
    '<ellipse cx="24" cy="93" rx="20" ry="2.5" fill="#000" opacity="0.08"/>' +
    guffyBody(24, 24, emotion) +
    '<circle cx="86" cy="16" r="5" fill="#FFE66D" opacity="0.7"/>' +
    '<circle cx="86" cy="16" r="2.6" fill="#F59E0B"/>' +
    '</svg>';
}

function guffyWithNotebook(emotion) {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="50" cy="93" rx="24" ry="2.5" fill="#000" opacity="0.08"/>' +
    guffyBody(50, 20, emotion) +
    '<rect x="36" y="70" width="28" height="20" rx="2" fill="#FFFFFF" stroke="#8B5CF6" stroke-width="1"/>' +
    '<line x1="50" y1="70" x2="50" y2="90" stroke="#C4B5FD" stroke-width="0.7"/>' +
    '<line x1="40" y1="76" x2="47" y2="76" stroke="#DDD0F5" stroke-width="0.7"/>' +
    '<line x1="53" y1="76" x2="60" y2="76" stroke="#DDD0F5" stroke-width="0.7"/>' +
    '<text x="76" y="34" font-family="Nunito, sans-serif" font-size="12" font-weight="800" fill="#A78BFA">?</text>' +
    '</svg>';
}

function guffyWithDiary(emotion) {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="50" cy="93" rx="24" ry="2.5" fill="#000" opacity="0.08"/>' +
    guffyBody(50, 20, emotion) +
    '<rect x="34" y="68" width="32" height="22" rx="2.5" fill="#7C3AED" stroke="#5B21B6" stroke-width="0.9"/>' +
    '<rect x="34" y="68" width="5" height="22" rx="2" fill="#5B21B6"/>' +
    '<rect x="39" y="66" width="27" height="24" rx="2" fill="#FFFFFF" stroke="#C4B5FD" stroke-width="0.6"/>' +
    '<path d="M58 66 L58 82 L61 79 L64 82 L64 66 Z" fill="#F472B6"/>' +
    '<text x="52" y="83" font-family="Fredoka, sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="#FFE66D" stroke="#B45309" stroke-width="0.4">5</text>' +
    '</svg>';
}

function guffyLookingAtMountain(emotion) {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="hillB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDD0F5"/><stop offset="1" stop-color="#A78BFA"/></linearGradient></defs>' +
    '<path d="M48 92 L70 56 L100 92 Z" fill="url(#hillB)" opacity="0.55" stroke="#A78BFA" stroke-width="0.8"/>' +
    '<line x1="70" y1="40" x2="70" y2="56" stroke="#8B5CF6" stroke-width="1" opacity="0.6"/>' +
    '<path d="M70 40 L84 45 L70 50 Z" fill="#F9A8D4" opacity="0.7" stroke="#DB2777" stroke-width="0.6"/>' +
    '<ellipse cx="28" cy="93" rx="22" ry="2.5" fill="#000" opacity="0.08"/>' +
    guffyBody(28, 24, emotion) +
    '<path d="M42 58 Q50 56 56 60" stroke="#7C3AED" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<text x="80" y="32" font-family="Nunito, sans-serif" font-size="11" font-weight="800" fill="#A78BFA" opacity="0.7">★</text>' +
    '</svg>';
}

function guffyWithScroll(emotion) {
  return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="50" cy="93" rx="24" ry="2.5" fill="#000" opacity="0.08"/>' +
    guffyBody(50, 20, emotion) +
    '<rect x="30" y="72" width="40" height="18" rx="2" fill="#FFE9C0" stroke="#B45309" stroke-width="0.8"/>' +
    '<rect x="28" y="70" width="44" height="4" rx="2" fill="#F59E0B" stroke="#B45309" stroke-width="0.7"/>' +
    '<rect x="28" y="88" width="44" height="4" rx="2" fill="#F59E0B" stroke="#B45309" stroke-width="0.7"/>' +
    '<line x1="36" y1="79" x2="64" y2="79" stroke="#B45309" stroke-width="0.5" opacity="0.5"/>' +
    '</svg>';
}

/* ============================================================
   Гуфи — крупные версии (для стартового экрана и баннеров)
   ============================================================ */

function guffyFullSvg(emotion) {
  emotion = emotion || "normal";
  var cx = 55, cy = 70;
  return '<svg viewBox="0 0 110 170" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="55" cy="164" rx="34" ry="3" fill="#000" opacity="0.15"/>' +
    (function () {
      var legs = [
        [38, 118, 22, 138, 30, 156],
        [47, 125, 35, 148, 44, 162],
        [55, 128, 53, 150, 57, 165],
        [63, 125, 75, 148, 66, 162],
        [72, 118, 88, 138, 80, 156]
      ];
      var outlines = "", fills = "";
      legs.forEach(function (l) {
        var d = "M" + l[0] + " " + l[1] + " Q" + l[2] + " " + l[3] + " " + l[4] + " " + l[5];
        outlines += '<path d="' + d + '" fill="none" stroke="#7C3AED" stroke-width="6.5" stroke-linecap="round"/>';
        fills += '<path d="' + d + '" fill="none" stroke="#A78BFA" stroke-width="3.6" stroke-linecap="round"/>';
      });
      return outlines + fills;
    })() +
    '<ellipse cx="' + cx + '" cy="' + cy + '" rx="34" ry="40" fill="#A78BFA" stroke="#7C3AED" stroke-width="2"/>' +
    '<path d="M21 62 Q8 54 18 58 Q24 62 22 72 Z" fill="#C4B5FD" stroke="#7C3AED" stroke-width="1"/>' +
    '<path d="M89 62 Q102 54 92 58 Q86 62 88 72 Z" fill="#C4B5FD" stroke="#7C3AED" stroke-width="1"/>' +
    '<ellipse cx="44" cy="54" rx="12" ry="8" fill="#C4B5FD" opacity="0.55"/>' +
    (function () {
      var ex1 = cx - 13, ex2 = cx + 13, ey = 62;
      if (emotion === "happy") {
        return '<path d="M' + (ex1 - 5) + ' ' + (ey + 2) + ' Q' + ex1 + ' ' + (ey - 4) + ' ' + (ex1 + 5) + ' ' + (ey + 2) + '" stroke="#1E1B2E" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
               '<path d="M' + (ex2 - 5) + ' ' + (ey + 2) + ' Q' + ex2 + ' ' + (ey - 4) + ' ' + (ex2 + 5) + ' ' + (ey + 2) + '" stroke="#1E1B2E" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
      }
      if (emotion === "sleeping") {
        return '<path d="M' + (ex1 - 5) + ' ' + ey + ' Q' + ex1 + ' ' + (ey + 3) + ' ' + (ex1 + 5) + ' ' + ey + '" stroke="#1E1B2E" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
               '<path d="M' + (ex2 - 5) + ' ' + ey + ' Q' + ex2 + ' ' + (ey + 3) + ' ' + (ex2 + 5) + ' ' + ey + '" stroke="#1E1B2E" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
      }
      if (emotion === "thinking") {
        return '<ellipse cx="' + ex1 + '" cy="' + ey + '" rx="5.5" ry="7" fill="#FFFFFF"/>' +
               '<circle cx="' + (ex1 + 1) + '" cy="' + (ey + 1) + '" r="3.4" fill="#1E1B2E"/>' +
               '<circle cx="' + (ex1 + 2) + '" cy="' + (ey - 1) + '" r="1.2" fill="#FFFFFF"/>' +
               '<path d="M' + (ex2 - 5) + ' ' + ey + ' Q' + ex2 + ' ' + (ey + 3) + ' ' + (ex2 + 5) + ' ' + ey + '" stroke="#1E1B2E" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
      }
      return '<ellipse cx="' + ex1 + '" cy="' + ey + '" rx="5.5" ry="7" fill="#FFFFFF"/>' +
             '<ellipse cx="' + ex2 + '" cy="' + ey + '" rx="5.5" ry="7" fill="#FFFFFF"/>' +
             '<circle cx="' + (ex1 + 1) + '" cy="' + (ey + 1) + '" r="3.4" fill="#1E1B2E"/>' +
             '<circle cx="' + (ex2 + 1) + '" cy="' + (ey + 1) + '" r="3.4" fill="#1E1B2E"/>' +
             '<circle cx="' + (ex1 + 2) + '" cy="' + (ey - 1) + '" r="1.2" fill="#FFFFFF"/>' +
             '<circle cx="' + (ex2 + 2) + '" cy="' + (ey - 1) + '" r="1.2" fill="#FFFFFF"/>';
    })() +
    (function () {
      var my = 84;
      if (emotion === "happy") {
        return '<path d="M' + (cx - 8) + ' ' + my + ' Q' + cx + ' ' + (my + 7) + ' ' + (cx + 8) + ' ' + my + '" stroke="#1E1B2E" stroke-width="2" fill="none" stroke-linecap="round"/>';
      }
      if (emotion === "sleeping") {
        return '<ellipse cx="' + cx + '" cy="' + my + '" rx="2.2" ry="2.8" fill="#1E1B2E" opacity="0.55"/>';
      }
      if (emotion === "thinking") {
        return '<path d="M' + (cx - 5) + ' ' + (my + 1) + ' Q' + cx + ' ' + (my - 2) + ' ' + (cx + 5) + ' ' + (my + 1) + '" stroke="#1E1B2E" stroke-width="1.7" fill="none" stroke-linecap="round"/>';
      }
      return '<path d="M' + (cx - 5) + ' ' + my + ' Q' + cx + ' ' + (my + 4) + ' ' + (cx + 5) + ' ' + my + '" stroke="#1E1B2E" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
    })() +
    '<ellipse cx="34" cy="82" rx="4" ry="2.5" fill="#F472B6" opacity="0.6"/>' +
    '<ellipse cx="76" cy="82" rx="4" ry="2.5" fill="#F472B6" opacity="0.6"/>' +
    (emotion === "sleeping"
      ? '<text x="78" y="44" font-family="Fredoka, sans-serif" font-size="13" font-weight="800" fill="#A78BFA" opacity="0.75">z</text>' +
        '<text x="86" y="32" font-family="Fredoka, sans-serif" font-size="15" font-weight="800" fill="#A78BFA" opacity="0.55">z</text>' +
        '<text x="96" y="18" font-family="Fredoka, sans-serif" font-size="18" font-weight="800" fill="#A78BFA" opacity="0.4">Z</text>'
      : "") +
    '</svg>';
}

function guffyStandingSvg(emotion) {
  emotion = emotion || "normal";
  var cx = 45, cy = 55;
  return '<svg viewBox="0 0 90 120" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="45" cy="116" rx="26" ry="2.5" fill="#000" opacity="0.12"/>' +
    (function () {
      var legs = [
        [31, 86, 20, 100, 26, 112],
        [38, 90, 30, 106, 37, 114],
        [45, 92, 43, 108, 46, 116],
        [52, 90, 60, 106, 53, 114],
        [59, 86, 70, 100, 64, 112]
      ];
      var o = "", f = "";
      legs.forEach(function (l) {
        var d = "M" + l[0] + " " + l[1] + " Q" + l[2] + " " + l[3] + " " + l[4] + " " + l[5];
        o += '<path d="' + d + '" fill="none" stroke="#7C3AED" stroke-width="5" stroke-linecap="round"/>';
        f += '<path d="' + d + '" fill="none" stroke="#A78BFA" stroke-width="2.6" stroke-linecap="round"/>';
      });
      return o + f;
    })() +
    '<ellipse cx="' + cx + '" cy="' + cy + '" rx="26" ry="30" fill="#A78BFA" stroke="#7C3AED" stroke-width="1.6"/>' +
    '<path d="M19 46 Q10 40 17 44 Q22 48 20 56 Z" fill="#C4B5FD" stroke="#7C3AED" stroke-width="0.9"/>' +
    '<path d="M71 46 Q80 40 73 44 Q68 48 70 56 Z" fill="#C4B5FD" stroke="#7C3AED" stroke-width="0.9"/>' +
    '<ellipse cx="36" cy="42" rx="8" ry="5.5" fill="#C4B5FD" opacity="0.55"/>' +
    (function () {
      var ex1 = cx - 10, ex2 = cx + 10, ey = 50;
      if (emotion === "happy") {
        return '<path d="M' + (ex1 - 4) + ' ' + (ey + 2) + ' Q' + ex1 + ' ' + (ey - 3) + ' ' + (ex1 + 4) + ' ' + (ey + 2) + '" stroke="#1E1B2E" stroke-width="1.9" fill="none" stroke-linecap="round"/>' +
               '<path d="M' + (ex2 - 4) + ' ' + (ey + 2) + ' Q' + ex2 + ' ' + (ey - 3) + ' ' + (ex2 + 4) + ' ' + (ey + 2) + '" stroke="#1E1B2E" stroke-width="1.9" fill="none" stroke-linecap="round"/>';
      }
      return '<ellipse cx="' + ex1 + '" cy="' + ey + '" rx="4.5" ry="5.5" fill="#FFFFFF"/>' +
             '<ellipse cx="' + ex2 + '" cy="' + ey + '" rx="4.5" ry="5.5" fill="#FFFFFF"/>' +
             '<circle cx="' + (ex1 + 1) + '" cy="' + (ey + 1) + '" r="2.8" fill="#1E1B2E"/>' +
             '<circle cx="' + (ex2 + 1) + '" cy="' + (ey + 1) + '" r="2.8" fill="#1E1B2E"/>' +
             '<circle cx="' + (ex1 + 1.8) + '" cy="' + (ey - 0.5) + '" r="1" fill="#FFFFFF"/>' +
             '<circle cx="' + (ex2 + 1.8) + '" cy="' + (ey - 0.5) + '" r="1" fill="#FFFFFF"/>';
    })() +
    '<path d="M' + (cx - 4) + ' ' + (cy + 16) + ' Q' + cx + ' ' + (cy + 20) + ' ' + (cx + 4) + ' ' + (cy + 16) + '" stroke="#1E1B2E" stroke-width="1.5" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="28" cy="' + (cy + 14) + '" rx="3" ry="1.8" fill="#F472B6" opacity="0.6"/>' +
    '<ellipse cx="62" cy="' + (cy + 14) + '" rx="3" ry="1.8" fill="#F472B6" opacity="0.6"/>' +
    '</svg>';
}

/* ============================================================
   Свинка-копилка для стартового экрана
   ============================================================ */

function piggySvg() {
  return '<svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg">' +
    '<defs>' +
      '<linearGradient id="pigBody" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#FFC9DE"/>' +
        '<stop offset="0.6" stop-color="#F9A8D4"/>' +
        '<stop offset="1" stop-color="#EC4899"/>' +
      '</linearGradient>' +
      '<linearGradient id="pigSnout" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#FBA6C5"/>' +
        '<stop offset="1" stop-color="#DB2777"/>' +
      '</linearGradient>' +
      '<linearGradient id="pigEar" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="#FBA6C5"/>' +
        '<stop offset="1" stop-color="#EC4899"/>' +
      '</linearGradient>' +
    '</defs>' +
    '<ellipse cx="120" cy="188" rx="92" ry="6" fill="#000" opacity="0.15"/>' +
    '<ellipse cx="72" cy="172" rx="14" ry="10" fill="#BE185D"/>' +
    '<ellipse cx="168" cy="172" rx="14" ry="10" fill="#BE185D"/>' +
    '<ellipse cx="120" cy="118" rx="92" ry="66" fill="url(#pigBody)" stroke="#BE185D" stroke-width="2"/>' +
    '<path d="M 58 84 Q 42 44 82 56 Q 86 72 78 86 Z" fill="url(#pigEar)" stroke="#BE185D" stroke-width="1.8"/>' +
    '<path d="M 182 84 Q 198 44 158 56 Q 154 72 162 86 Z" fill="url(#pigEar)" stroke="#BE185D" stroke-width="1.8"/>' +
    '<path d="M 66 80 Q 54 58 74 62 Q 76 72 72 82 Z" fill="#FBA6C5"/>' +
    '<path d="M 174 80 Q 186 58 166 62 Q 164 72 168 82 Z" fill="#FBA6C5"/>' +
    '<ellipse cx="82" cy="92" rx="30" ry="18" fill="#FFFFFF" opacity="0.4"/>' +
    '<rect x="100" y="64" width="40" height="8" rx="4" fill="#4C1D95"/>' +
    '<rect x="102" y="65.5" width="36" height="3" rx="1.5" fill="#831843" opacity="0.6"/>' +
    '<ellipse cx="66" cy="128" rx="16" ry="10" fill="#F472B6" opacity="0.5"/>' +
    '<ellipse cx="174" cy="128" rx="16" ry="10" fill="#F472B6" opacity="0.5"/>' +
    '<circle cx="88" cy="112" r="10" fill="#FFFFFF" stroke="#BE185D" stroke-width="0.6"/>' +
    '<circle cx="152" cy="112" r="10" fill="#FFFFFF" stroke="#BE185D" stroke-width="0.6"/>' +
    '<circle cx="89" cy="114" r="5.5" fill="#1E1B2E"/>' +
    '<circle cx="153" cy="114" r="5.5" fill="#1E1B2E"/>' +
    '<circle cx="91" cy="112" r="2" fill="#FFFFFF"/>' +
    '<circle cx="155" cy="112" r="2" fill="#FFFFFF"/>' +
    '<ellipse cx="120" cy="140" rx="32" ry="22" fill="url(#pigSnout)" stroke="#BE185D" stroke-width="1.8"/>' +
    '<ellipse cx="120" cy="140" rx="24" ry="15" fill="#FBA6C5" opacity="0.7"/>' +
    '<ellipse cx="110" cy="140" rx="3.5" ry="5" fill="#831843"/>' +
    '<ellipse cx="130" cy="140" rx="3.5" ry="5" fill="#831843"/>' +
    '<path d="M 106 158 Q 120 166 134 158" stroke="#831843" stroke-width="1.8" fill="none" stroke-linecap="round"/>' +
    '<path d="M 208 100 Q 226 92 220 74 Q 214 60 202 68 Q 194 76 202 82" stroke="#F472B6" stroke-width="5" fill="none" stroke-linecap="round"/>' +
  '</svg>';
}

function piggyCoinSvg() {
  return '<svg viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><radialGradient id="coinGrad" cx="0.4" cy="0.35" r="0.7">' +
      '<stop offset="0" stop-color="#FFF3A0"/>' +
      '<stop offset="0.7" stop-color="#FBBF24"/>' +
      '<stop offset="1" stop-color="#B45309"/>' +
    '</radialGradient></defs>' +
    '<circle cx="15" cy="15" r="14" fill="url(#coinGrad)" stroke="#92400E" stroke-width="1.4"/>' +
    '<circle cx="15" cy="15" r="10" fill="none" stroke="#FFFFFF" stroke-width="1.6" opacity="0.7"/>' +
    '<text x="15" y="20.5" font-family="Fredoka, sans-serif" font-size="14" font-weight="800" text-anchor="middle" fill="#FFFFFF">$</text>' +
    '</svg>';
}