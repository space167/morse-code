import React, {useState} from 'react';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import Group from '@vkontakte/vkui/dist/components/Group/Group';
import Input from "@vkontakte/vkui/dist/components/Input/Input";
import Button from "@vkontakte/vkui/dist/components/Button/Button";
import FormLayout from "@vkontakte/vkui/dist/components/FormLayout/FormLayout";
import Icon24Send from '@vkontakte/icons/dist/24/send';
import PanelHeaderButton from "@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton";
import Icon28SubtitlesOutline from '@vkontakte/icons/dist/28/subtitles_outline';

import Tooltip from "@vkontakte/vkui/dist/components/Tooltip/Tooltip";
import Card from "@vkontakte/vkui/dist/components/Card/Card";
import Div from "@vkontakte/vkui/dist/components/Div/Div";
import Header from "@vkontakte/vkui/dist/components/Header/Header";
import PanelHeaderBack from "@vkontakte/vkui/dist/components/PanelHeaderBack/PanelHeaderBack";

const Home = (
  {
    id,
    routes,
    textInput,
    morseCode,
    morseInput,
    decodeMorse,
    setMorseInput,
    setTextInput,
    openSendMenu,
    go
  }) => {

  const [tooltip, setTooltip] = useState(false);
  const [tooltipMorse, setTooltipMorse] = useState(false);

  //process input
  const onHandleChangeInput = (e) => {
    if ((e.target.value.match(/^[0-9А-Яа-яЁё\s]+$/)) || (e.target.value === '')) {
      setTextInput(e.target.value);
    } else {
      setTooltip(true);
      setTimeout(() => {
        setTooltip(false);
      }, 3500)
    }
  };

  //process input morse code
  const onHandleChangeMorseCode = (e) => {
    if ((e.target.value.match(/^[- \/*/]+$/)) || (e.target.value === '')) {
      setMorseInput(e.target.value);
    } else {
      setTooltipMorse(true);
      setTimeout(() => {
        setTooltipMorse(false);
      }, 3000)
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
        left={<PanelHeaderBack onClick={() => go(routes.TABLE_SYMBOLS)}/>}
      >
        Шифратор
      </PanelHeader>
      <FormLayout>
        <Group header={<Header mode="secondary">Шифратор</Header>}>
          <Tooltip
            text="Только цифры и русские буквы"
            isShown={tooltip}
            onClose={() => setTooltip(false)}
          >
            <Input
              type="text"
              value={textInput}
              maxLength="40"
              pattern="^[0-9А-Яа-яЁё\s]+$"
              placeholder="Введите сообщение"
              onChange={onHandleChangeInput}
            />
          </Tooltip>
          <Div>
            <Card style={{padding: "5px"}}>
              {morseCode ? morseCode : '...'}
            </Card>
          </Div>
          <Div>
            <Button
              size="xl"
              stretched
              after={<Icon24Send/>}
              disabled={!inputFilled(textInput)}
              onClick={openSendMenu}
            >Отправить</Button>
          </Div>
        </Group>
        <Group
          header={<><Header mode="secondary">Дешифратор</Header></>}
        >
          <Tooltip
            text="Только символы *, -, / и пробелы"
            isShown={tooltipMorse}
            onClose={() => setTooltipMorse(false)}
          >
            <Input
              type="text"
              value={morseInput}
              maxLength="500"
              pattern="^[- \/*/\s]+$"
              placeholder="Введите шифр"
              onChange={onHandleChangeMorseCode}
            />
          </Tooltip>
          <Div>
            <Card style={{padding: "5px"}}>
              {decodeMorse ? decodeMorse : '...'}
            </Card>
          </Div>
        </Group>
      </FormLayout>
    </Panel>
  );
};

export default Home;
