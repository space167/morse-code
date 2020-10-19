import React from 'react';
import {Panel} from "@vkontakte/vkui";
import PanelHeader from "@vkontakte/vkui/dist/components/PanelHeader/PanelHeader";
import PanelHeaderBack from "@vkontakte/vkui/dist/components/PanelHeaderBack/PanelHeaderBack";
import SYMBOLS from "../../config/morse";


const Friends = ({id, route, go, textInput}) => {

  const textToMorse = (str) => {
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
  };

  const testMorse = textToMorse(textInput);
  return (
    <Panel id={id}>
      <PanelHeader left={<PanelHeaderBack onClick={() => go(route)}/>}>Шифр другу</PanelHeader>
      {textInput}<br/>
      {testMorse}<br/>
    </Panel>
  );
};

export default Friends;