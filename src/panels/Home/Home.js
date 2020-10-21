import React, {useState, useEffect} from 'react';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import Group from '@vkontakte/vkui/dist/components/Group/Group';
import Cell from '@vkontakte/vkui/dist/components/Cell/Cell';
import Input from "@vkontakte/vkui/dist/components/Input/Input";
import Button from "@vkontakte/vkui/dist/components/Button/Button";
import {Slider} from "@vkontakte/vkui";
import FormLayout from "@vkontakte/vkui/dist/components/FormLayout/FormLayout";
import Header from "@vkontakte/vkui/dist/components/Header/Header";
import Counter from "@vkontakte/vkui/dist/components/Counter/Counter";
import Icon24Pause from '@vkontakte/icons/dist/24/pause';
import bridge from '@vkontakte/vk-bridge';
import SYMBOLS from '../../config/morse';
import Icon24Settings from '@vkontakte/icons/dist/24/settings';
import Icon24Send from '@vkontakte/icons/dist/24/send';

import Icon24MicrophoneSlash from '@vkontakte/icons/dist/24/microphone_slash';
import Icon24Voice from '@vkontakte/icons/dist/24/voice';
import Icon24PlayNext from '@vkontakte/icons/dist/24/play_next';

import point from '../../assets/audio/-.mp3'
import line from '../../assets/audio/—.mp3'
import Div from "@vkontakte/vkui/dist/components/Div/Div";
import PanelHeaderButton from "@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton";

import styles from './Home.module.css'
import Tooltip from "@vkontakte/vkui/dist/components/Tooltip/Tooltip";

const DEFAULT_PLAYBACK_SPEED = 2;
const BASE_SPEED = 300;
let audios = {
  p: new Audio(point),
  l: new Audio(line)
};


const Home = ({id, route, volume, flash, textInput, setTextInput, go, setActiveModal}) => {
  const [playbackSpeed, setPlaybackSpeed] = useState(DEFAULT_PLAYBACK_SPEED);
  const [tooltip, setTooltip] = useState(false);
  //символы
  const [symbols, setSymbols] = useState([]);
  const [currentSymbol, setCurrentSymbol] = useState(0);
  //знак Морзе
  const [chars, setChars] = useState([]);
  const [currentChar, setCurrentChar] = useState(0);

  const [playStatus, setPlayStatus] = useState(false);
  const [playStatusSymbol, setPlayStatusSymbol] = useState(false);

  useEffect(() => {
    if (symbols.length > 0) {
      setPlayStatus(true);
    }
    setChars([]);
  }, [symbols]);

  useEffect(() => {
    if (symbols.length > 0) {
      if (currentSymbol < symbols.length) {
        setChars(symbols[currentSymbol].morse);
      } else {
        onStop();
      }
    } else {
      onStop();
    }
    setCurrentChar(0);
  }, [currentSymbol]);

  useEffect(() => {
    playChar();
  }, [currentChar]);

  useEffect(() => {
    if (chars.length > 0) {
      playChar();
    }
    setCurrentChar(0)
  }, [chars]);

  useEffect(() => {
    if (playStatus) {
      onPlaySymbols();
    } else {
      setPlayStatusSymbol(false);
      setCurrentSymbol(0);
      setSymbols([]);
    }
  }, [playStatus]);

  const onStop = () => {
    setPlayStatus(false);
  };

  const onBtnToSymbols = (char) => {
    let charN = Object.assign({}, char);
    charN.morse = char.morse.split(' ');
    setSymbols([charN]);
  };

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
    setSymbols(arrSymbols);
  };

  //change play speed
  const onPlayBackSpeedChange = speed => {
    if (speed === playbackSpeed) return;
    setPlaybackSpeed(speed);
  };

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
  //check fill input
  const inputFilled = (str) => {
    let arr = str.split(' ');
    let newStr = arr.join('');
    return (newStr.length > 0);
  };

  const onPlaySymbols = () => {
    if ((symbols.length === 0) || (!playStatus)) {
      onStop();
      return;
    }
    setChars(symbols[currentSymbol].morse);
  };

  const playChar = () => {
    if (currentChar >= chars.length) {
      if (currentSymbol < symbols.length) {
        setTimeout(() => {
          setCurrentSymbol(currentSymbol + 1)
        }, (BASE_SPEED * 5) / playbackSpeed);
        return;
      } else {
        onStop();
        return;
      }
    }

    if (!playStatus) {
      onStop();
      return;
    }

    setPlayStatusSymbol(true);
    const onHandleEndedL = () => {
      audios.l.removeEventListener("ended", onHandleEndedL);
      bridge.send("VKWebAppFlashSetLevel", {"level": 0});
      setTimeout(() => {
        setCurrentChar(currentChar + 1);
      }, BASE_SPEED / playbackSpeed);
    };

    const onHandleEndedP = () => {
      audios.p.removeEventListener("ended", onHandleEndedP);
      bridge.send("VKWebAppFlashSetLevel", {"level": 0});
      setTimeout(() => {
        setCurrentChar(currentChar + 1);
      }, BASE_SPEED / playbackSpeed);
    };

    if (flash) {
      bridge.send("VKWebAppFlashSetLevel", {"level": 1});
    }
    if (chars[currentChar] === '-') {
      audios.p.addEventListener("ended", onHandleEndedP);
      setTimeout(() => {
        audios.p.volume = getVolume();
        audios.p.play()
      }, 100)
    } else {
      audios.l.addEventListener("ended", onHandleEndedL);
      setTimeout(() => {
        audios.l.volume = getVolume();
        audios.l.play()
      }, 100)
    }
  };


  const getVolume = () => {
    if (volume) return 1;
    return 0;
  };

  return (
    <Panel id={id}>
      <PanelHeader
        left={<PanelHeaderButton onClick={() => setActiveModal('settings')}><Icon24Settings/></PanelHeaderButton>}
      >
        Морзянка
      </PanelHeader>
      <FormLayout>
        <Group title="Input text">
          <Cell
            asideContent={<Button onClick={() => go(route)}
                                  disabled={playStatus || (!inputFilled(textInput))} size="s"
                                  mode="tertiary"><Icon24Send/></Button>}>
            <Tooltip
              text="Только цифры и русские буквы"
              isShown={tooltip}
              onClose={() => setTooltip(false)}
            >
              <Input
                disabled={playStatus}
                type="text"
                value={textInput}
                maxLength="20"
                pattern="^[0-9А-Яа-яЁё\s]+$"
                placeholder="Введите сообщение"
                onChange={onHandleChangeInput}
              />
            </Tooltip>
          </Cell>
          <Cell
            before={playStatusSymbol ? <Icon24Voice/> : <Icon24MicrophoneSlash/>}
            size="l"
            asideContent={playStatus ?
              <Button className={styles['margin-small']} size='m'
                      onClick={onStop}><Icon24Pause/></Button> :
              <Button disabled={!inputFilled(textInput)} className={styles['margin-small']} size='m'
                      onClick={onStrToSymbols}><Icon24PlayNext/></Button>}
          >
            {((playStatusSymbol && currentSymbol) < symbols.length) ? <>{symbols[currentSymbol].value} {symbols[currentSymbol].morse}</> : '...'}
          </Cell>
        </Group>
        <Group>
          <Header indicator={<Counter size='m' mode='primary'>{playbackSpeed}х</Counter>}>
            <span role='img' aria-label='Speed play'>⏱</span> Скорость
          </Header>
          <Slider
            disabled={playStatus}
            step={0.1}
            min={0.5}
            max={3}
            value={playbackSpeed}
            onChange={(speed) => onPlayBackSpeedChange(speed)}
          />
        </Group>
      </FormLayout>
      <Div className={styles['container-items']}>
        {SYMBOLS.map((symbol, i) => (
          <div className={styles['item']} key={i}>
            <Button mode="secondary"
                    disabled={playStatus}
                    onClick={() => onBtnToSymbols(symbol)}
                    size="s">{symbol.value}<br/>{symbol.morse}</Button>
          </div>
        ))}
      </Div>
    </Panel>
  );
};

export default Home;
