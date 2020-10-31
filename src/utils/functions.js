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

export function hashToMorse(hash) {
  let arr = hash.split('#');
  let newHash = arr.join('');
  arr = newHash.split('d');
  newHash = arr.join('-');
  arr = newHash.split('p');
  newHash = arr.join('*');
  arr = newHash.split('s');
  newHash = arr.join('/');
  return newHash;
}

export function morseToHash(morse) {
  let arr = morse.split(' ');
  let newMorse = arr.join('');
  arr = newMorse.split('-');
  newMorse = arr.join('d');
  arr = newMorse.split('*');
  newMorse = arr.join('p');
  arr = newMorse.split('/');
  newMorse = arr.join('s');
  newMorse = '#' + newMorse;
  return newMorse;
}