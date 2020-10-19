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

const Home = ({id, route, volume, flash, textInput, setTextInput, go, setActiveModal}) => {
  const pointAudio = new Audio(point);
  const lineAudio = new Audio(line);
  const [playbackSpeed, setPlaybackSpeed] = useState(DEFAULT_PLAYBACK_SPEED);

  const [tooltip, setTooltip] = useState(false);

  const [currentSymbole, setCurrentSymbole] = useState(0);
  const [symbole, setSymbole] = useState(null);

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
    if ((e.target.value.match(/^[0-9А-Яа-яЁё\s]+$/)) || (e.target.value === '')) {
      setTextInput(e.target.value);
    } else {
      setTooltip(true);
      setTimeout(() => {
        setTooltip(false);
      }, 3500)
    }
  };

  const onPlay = () => {
    if (textInput.length > 0) {
      if (textInput.match(/^[0-9А-Яа-яЁё\s]+$/)) {
        setPlayStatus(true);
      }
    }
  };

  const onStop = () => {
    setPlayStatus(false);
    setPlayStatusChar(false);
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
      onStop();
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
        pointAudio.volume = 1;
        lineAudio.volume = 1;
      } else {
        pointAudio.volume = 0;
        lineAudio.volume = 0;
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

  const inputFilled = (str) => {
    let arr = str.split(' ');
    let newStr = arr.join('');
    return (newStr.length > 0);
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
                                  disabled={(playStatusChar || playStatus) || (!inputFilled(textInput))} size="s"
                                  mode="tertiary"><Icon24Send/></Button>}>
            <Tooltip
              text="Только цифры и русские буквы"
              isShown={tooltip}
              onClose={() => setTooltip(false)}
            >
              <Input
                disabled={playStatusChar || playStatus}
                type="text"
                value={textInput}
                maxLength="26"
                pattern="^[0-9А-Яа-яЁё\s]+$"
                placeholder="Введите сообщение"
                onChange={onHandleChangeInput}
              />
            </Tooltip>
          </Cell>
          <Cell
            before={playStatusChar || playStatus ? <Icon24Voice/> : <Icon24MicrophoneSlash/>}
            size="l"
            asideContent={playStatusChar || playStatus ?
              <Button className={styles['margin-small']} size='m'
                      onClick={onStop}><Icon24Pause/></Button> :
              <Button disabled={playStatusChar || !inputFilled(textInput)} className={styles['margin-small']} size='m'
                      onClick={onPlay}><Icon24PlayNext/></Button>}
          >
            {symbole ? <>{symbole.value[languages[language]]} {symbole.morse}</> : '...'}
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
            <Button mode="secondary" disabled={playStatusChar || playStatus} onClick={() => playSymbole(symbole)}
                    size="s">{symbole.value[languages[language]]}<br/>{symbole.morse}</Button>}
          </div>
        ))}
      </Div>
    </Panel>
  );
};

export default Home;
