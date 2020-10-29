import React, {useState, useEffect} from 'react';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import Group from '@vkontakte/vkui/dist/components/Group/Group';
import Cell from '@vkontakte/vkui/dist/components/Cell/Cell';
import Input from "@vkontakte/vkui/dist/components/Input/Input";
import Button from "@vkontakte/vkui/dist/components/Button/Button";
import FormLayout from "@vkontakte/vkui/dist/components/FormLayout/FormLayout";
import bridge from '@vkontakte/vk-bridge';
import SYMBOLS from '../../config/morse';
import Icon24Settings from '@vkontakte/icons/dist/24/settings';
import Icon24Send from '@vkontakte/icons/dist/24/send';
import PanelHeaderButton from "@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton";

import styles from './Home.module.css'
import Tooltip from "@vkontakte/vkui/dist/components/Tooltip/Tooltip";

const Home = ({id, route, textInput, setTextInput, go}) => {
  const [tooltip, setTooltip] = useState(false);
  //символы

  const onStrToSymbols = () => {
    let arr = textInput.split(' ');
    let newStr = arr.join('').toUpperCase();
    let arrSymbols = [];
    for (let i = 0; i < newStr.length; i++) {
      for (let j = 0; j < SYMBOLS.length; j++) {
        if (SYMBOLS[j].value.indexOf(newStr[i]) !== -1) {
          let temp = Object.assign({}, SYMBOLS[j]);
          temp.morse = SYMBOLS[j].morse.split(' ');
          arrSymbols.push(temp);
          break;
        }
      }
    }
  };


  //process input
  const onHandleChangeInput = (e) => {
    if ((e.target.value.match(/^[0-9А-Яа-яЁёA-Za-z\s]+$/)) || (e.target.value === '')) {
      setTextInput(e.target.value);
    } else {
      setTooltip(true);
      setTimeout(() => {
        setTooltip(false);
      }, 3500)
    }
  };

  //check fill input
  const inputFilled = (str) => {
    let arr = str.split(' ');
    let newStr = arr.join('');
    return (newStr.length > 0);
  };

  return (
    <Panel id={id}>
      <PanelHeader
        left={<PanelHeaderButton><Icon24Settings/></PanelHeaderButton>}
      >
        Морзянка
      </PanelHeader>
      <FormLayout>
        <Group title="Input text">
          <Cell
            asideContent={<Button disabled={() => !inputFilled(textInput)} onClick={() => go(route)} size="s" mode="tertiary"><Icon24Send/></Button>}>
            <Tooltip
              text="Только цифры и русские/английские буквы"
              isShown={tooltip}
              onClose={() => setTooltip(false)}
            >
              <Input
                type="text"
                value={textInput}
                maxLength="25"
                pattern="^[0-9А-Яа-яЁёA-Za-z\s]+$"
                placeholder="Введите сообщение"
                onChange={onHandleChangeInput}
              />
            </Tooltip>
          </Cell>
        </Group>
      </FormLayout>
    </Panel>
  );
};

export default Home;
