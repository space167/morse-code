import React from 'react';
import SYMBOLS from '../../config/morse';
import Panel from "@vkontakte/vkui/dist/components/Panel/Panel";
import PanelHeader from "@vkontakte/vkui/dist/components/PanelHeader/PanelHeader";
import PanelHeaderBack from "@vkontakte/vkui/dist/components/PanelHeaderBack/PanelHeaderBack";
import Div from "@vkontakte/vkui/dist/components/Div/Div";
import styles from "./TableSymbols.module.css"
import Group from "@vkontakte/vkui/dist/components/Group/Group";
import Header from "@vkontakte/vkui/dist/components/Header/Header";

const TableSymbols = ({id, route, go}) => {
  let numbers = [];
  let letters = [];
  for (let i = 0; i < 10; i++) {
    numbers.push(SYMBOLS[i]);
  }

  for (let j = 10; j < SYMBOLS.length; j++) {
    letters.push(SYMBOLS[j]);
  }
  return (
    <Panel id={id}>
      <PanelHeader
        left={<PanelHeaderBack onClick={() => go(route)}/>}>
        Азбука Морзе
      </PanelHeader>
      <Group header={<Header mode="secondary">Цифры</Header>}>
        <Div className={styles['items']}>
          {numbers.map((sym, i) => (
            <div className={styles['item']} key={i}>{sym.value}<br/>{sym.morse}</div>
          ))}
        </Div>
      </Group>
      <Group header={<Header mode="secondary">Буквы</Header>}>
        <Div className={styles['items']}>
          {letters.map((sym, i) => (
            <div className={styles['item']} key={i}>{sym.value}<br/>{sym.morse}</div>
          ))}
        </Div>
      </Group>
    </Panel>
  )
};

export default TableSymbols;