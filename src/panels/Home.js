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
import Icon24Play from '@vkontakte/icons/dist/24/play';
import Icon24Pause from '@vkontakte/icons/dist/24/pause';
import Icon24Replay from '@vkontakte/icons/dist/24/replay';
import Icon24Advertising from '@vkontakte/icons/dist/24/advertising';
import bridge from '@vkontakte/vk-bridge';
import SYMBOLS from '../config/morse';
import Icon24Settings from '@vkontakte/icons/dist/24/settings';
import Icon24Flash from '@vkontakte/icons/dist/24/flash';
import Icon24Volume from '@vkontakte/icons/dist/24/volume';

import point from '../assets/audio/-.mp3'
import line from '../assets/audio/—.mp3'
import Div from "@vkontakte/vkui/dist/components/Div/Div";
import PanelHeaderButton from "@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton";
import Checkbox from "@vkontakte/vkui/dist/components/Checkbox/Checkbox";

import styles from './Home.module.css'

const DEFAULT_PLAYBACK_SPEED = 2;

function throttle(callback, delay) {
  let isThrottled = false, args, context;

  function wrapper() {
    if (isThrottled) {
      args = arguments;
      context = this;
      return;
    }

    isThrottled = true;
    callback.apply(this, arguments);

    setTimeout(() => {
      isThrottled = false;
      if (args) {
        wrapper.apply(context, args);
        args = context = null;
      }
    }, delay);
  }

  return wrapper;
}


const languages = {
  'ru': 0,
  'en': 1
};
const language = 'ru';

let statusPlay = false;
let symbolePlay = '';

const Home = ({id, volume, flash, setActiveModal}) => {
  const pointAudio = new Audio(point);
  const lineAudio = new Audio(line);
  const [playbackSpeed, setPlaybackSpeed] = useState(DEFAULT_PLAYBACK_SPEED);

  const [currentSymbole, setCurrentSymbole] = useState(0);
  const [symbole, setSymbole] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [playStatus, setPlayStatus] = useState(false);
  const [playStatusChar, setPlayStatusChar] = useState(false);

  useEffect(() => {
    statusPlay = playStatusChar;
    if (playStatusChar) {
      playMorse([symbolePlay], 0)
    }
  }, [playStatusChar]);

  useEffect(() => {
    statusPlay = playStatus;
    if (playStatus) {
      playStr(textInput);
    }
  }, [playStatus]);

  const onPlayBackSpeedChange = throttle(speed => {
    if (speed === playbackSpeed) return;
    setPlaybackSpeed(speed);
  });

  const onHandleChangeInput = (e) => {
    if (currentSymbole > 0) setCurrentSymbole(0);
    setTextInput(e.target.value);
  };

  const onPause = () => {
    setPlayStatus(false);
  };

  const onPlay = () => {
    if (textInput.length > 0) {
      if (textInput.match(/^[0-9А-Яа-яЁё\s]+$/)) {
        setPlayStatus(true);
      }
    }
  };

  const onReplay = () => {
    setPlayStatus(false);
    setCurrentSymbole(0);
  };

  const playSymbole = (symbole) => {
    symbolePlay = symbole;
    setPlayStatusChar(true);
  };

  function playStr(str) {
    let arr = str.split(' ');
    let newStr = arr.join('').toUpperCase();
    let arrSymbols = [];
    for (let i = 0; i < newStr.length; i++) {
      for (let j = 0; j < SYMBOLS.length; j++) {
        if (SYMBOLS[j].value.indexOf(newStr[i]) !== -1) {
          arrSymbols.push(SYMBOLS[j]);
          break;
        }
      }
    }
    playMorse(arrSymbols, currentSymbole)
  }

  function playMorse(symbols, i) {
    if (symbols.length <= i) {
      onReplay();
      return;
    }

    if (!statusPlay) {
      return;
    }

    setCurrentSymbole(i);
    let symbole = symbols[i];
    setSymbole(symbole);
    let arrayCode = symbole.morse.split(' ');
    playCurrentCharacter(arrayCode, 0, () => playMorse(symbols, ++i));

    function playCurrentCharacter(arrayCode, i, next) {
      if (arrayCode.length <= i) {
        setSymbole(null);
        setPlayStatusChar(false);
        setTimeout(next, 800 / playbackSpeed);
        return;
      }

      if (!statusPlay) {
        setSymbole(null);
        return;
      }

      const onHandleEndedPoint = () => {
        pointAudio.removeEventListener("ended", onHandleEndedPoint);
        bridge.send("VKWebAppFlashSetLevel", {"level": 0});
        setTimeout(() => playCurrentCharacter(arrayCode, ++i, next), 300 / playbackSpeed);
      };

      const onHandleEndedLine = () => {
        lineAudio.removeEventListener("ended", onHandleEndedLine);
        bridge.send("VKWebAppFlashSetLevel", {"level": 0});
        setTimeout(() => playCurrentCharacter(arrayCode, ++i, next), 300 / playbackSpeed);
      };

      if (volume) {
        pointAudio.volume = 1
        lineAudio.volume = 1
      } else {
        pointAudio.volume = 0
        lineAudio.volume = 0
      }
      if (arrayCode[i] === '-') {

        pointAudio.addEventListener("ended", onHandleEndedPoint);
        if (flash) {
          bridge.send("VKWebAppFlashSetLevel", {"level": 0.5});
        }
        setTimeout(() => {
          pointAudio.play()
        }, 100)

      } else {
        lineAudio.addEventListener("ended", onHandleEndedLine);
        if (flash) {
          bridge.send("VKWebAppFlashSetLevel", {"level": 1});
        }
        setTimeout(() => {
          lineAudio.play()
        }, 100)
      }
    }
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
          <Cell>
            <Header>
              <span role='img' aria-label='Only russian language'>⚠</span> Только русские буквы
            </Header>
            <Input
              disabled={playStatusChar || playStatus}
              value={textInput}
              pattern="^[0-9А-Яа-яЁё\s]+$"
              placeholder="Введите сообщение"
              onChange={onHandleChangeInput}
            />
          </Cell>
          <Cell>
            {playStatus ?
              <Button disabled={playStatusChar} className={styles['margin-small']} size='m'
                      onClick={onPause}><Icon24Pause/></Button> :
              <Button disabled={playStatusChar} className={styles['margin-small']} size='m'
                      onClick={onPlay}><Icon24Play/></Button>
            }
            <Button disabled={playStatusChar} className={styles['margin-small']} size='m' onClick={onReplay}>
              <Icon24Replay/>
            </Button>
            <span className={styles['inline']}><Icon24Advertising/></span>
            <Button className={styles['margin-small']} mode="secondary"
                    size="m">{symbole ? <>{symbole.value[languages[language]]} {symbole.morse}</> : '...'}</Button>
          </Cell>
        </Group>
        <Group>
          <Header indicator={<Counter size='m' mode='primary'>{playbackSpeed}х</Counter>}>
            <span role='img' aria-label='Speed play'>⏱</span> Скорость
          </Header>
          <Slider
            step={0.1}
            min={0.5}
            max={3}
            value={playbackSpeed}
            onChange={(speed) => onPlayBackSpeedChange(speed)}
          />
        </Group>
      </FormLayout>
      <Div className={styles['container-items']}>
        {SYMBOLS.map((symbole, i) => (
          <div className={styles['item']} key={i}>
            {typeof symbole.value[languages[language]] != 'undefined' &&
            <Button disabled={playStatusChar || playStatus} onClick={() => playSymbole(symbole)}
                    size="s">{symbole.value[languages[language]]}<br/>{symbole.morse}</Button>}
          </div>
        ))}
      </Div>
    </Panel>
  );
};

export default Home;
