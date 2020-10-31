import React, {useState, useEffect} from 'react';
import SYMBOLS from '../../config/morse';
import Panel from "@vkontakte/vkui/dist/components/Panel/Panel";
import PanelHeader from "@vkontakte/vkui/dist/components/PanelHeader/PanelHeader";
import PanelHeaderBack from "@vkontakte/vkui/dist/components/PanelHeaderBack/PanelHeaderBack";
import Div from "@vkontakte/vkui/dist/components/Div/Div";
import styles from "./TableSymbols.module.css"
import Group from "@vkontakte/vkui/dist/components/Group/Group";
import Header from "@vkontakte/vkui/dist/components/Header/Header";
import Button from "@vkontakte/vkui/dist/components/Button/Button";
import PanelHeaderButton from "@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton";
import Icon24GearOutline from '@vkontakte/icons/dist/24/gear_outline';
import Icon28SubtitlesOutline from '@vkontakte/icons/dist/28/subtitles_outline';



const TableSymbols = (
  {
    id,
    route,
    setSymbol,
    go
  }) => {

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
        left={<PanelHeaderButton><Icon24GearOutline/></PanelHeaderButton>}>
        Морзянка
      </PanelHeader>
      <Div><Button size="xl" onClick={() => go(route)} after={<Icon28SubtitlesOutline/>}>Шифратор</Button></Div>
      <Group header={<Header mode="secondary">Цифры</Header>}>
        <Div className={styles['items']}>
          {numbers.map((sym, i) => (
            <Button mode="secondary" onClick={() => setSymbol(sym)} weight="regular"
                    className={styles['item']}
                    key={i}>{sym.value}<br/>{sym.morse}</Button>
          ))}
        </Div>
      </Group>
      <Group header={<Header mode="secondary">Буквы</Header>}>
        <Div className={styles['items']}>
          {letters.map((sym, i) => (
            <Button mode="secondary" className={styles['item']} key={i}
                    onClick={() => setSymbol(sym)}>{sym.value}<br/>{sym.morse}</Button>
          ))}
        </Div>
      </Group>
    </Panel>
  )
};

export default TableSymbols;