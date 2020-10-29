import SYMBOLS from "../config/morse";

export function strToMorse(str) {
  let arr = str.split(' ');
  let newStr = arr.join('').toUpperCase();
  let arrSymbols = [];
  for (let i = 0; i < newStr.length; i++) {
    for (let j = 0; j < SYMBOLS.length; j++) {
      if (SYMBOLS[j].value.indexOf(newStr[i]) !== -1) {
        arrSymbols.push(SYMBOLS[j].morse);
        break;
      }
    }
  }
  return arrSymbols.join(' / ');
}

export function morseToStr(morse) {
  let arr = morse.split(' ');
  let newStr = arr.join('');
  let arrayMorse = newStr.split('/');
  let arrSymbols = [];
  for (let i = 0; i < arrayMorse.length; i++) {
    for (let j = 0; j < SYMBOLS.length; j++) {
      if (SYMBOLS[j].morse.split(" ").join("") === arrayMorse[i]) {
        arrSymbols.push(SYMBOLS[j].value);
        break;
      }
    }
  }
  return arrSymbols.join(' ');
}