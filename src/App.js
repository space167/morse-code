import React, {useState, useEffect} from 'react';
import bridge from '@vkontakte/vk-bridge';
import View from '@vkontakte/vkui/dist/components/View/View';
import '@vkontakte/vkui/dist/vkui.css';
import Home from './panels/Home/Home';
import ModalRoot from "@vkontakte/vkui/dist/components/ModalRoot/ModalRoot";
import ModalCard from "@vkontakte/vkui/dist/components/ModalCard/ModalCard";
import Icon56CheckCircleOutline from '@vkontakte/icons/dist/56/check_circle_outline';
import Icon56DoNotDisturbOutline from '@vkontakte/icons/dist/56/do_not_disturb_outline';
import {ModalPageHeader, ANDROID, IOS, usePlatform} from '@vkontakte/vkui';
import Snackbar from "@vkontakte/vkui/dist/components/Snackbar/Snackbar";
import Avatar from "@vkontakte/vkui/dist/components/Avatar/Avatar";
import Icon24Error from "@vkontakte/icons/dist/24/error";
import Intro from "./panels/Intro/Intro";
import {hashToMorse, iOS, morseToStr, processHash, strToMorse} from "./utils/functions";
import TableSymbols from "./panels/TableSymbols/TableSymbols";
import ActionSheetItem from "@vkontakte/vkui/dist/components/ActionSheetItem/ActionSheetItem";
import ActionSheet from "@vkontakte/vkui/dist/components/ActionSheet/ActionSheet";
import OnWallSelf from "./panels/Friends/OnWallSelf/OnWallSelf";
import OnWall from "./panels/Friends/OnWall/OnWall";
import Title from "@vkontakte/vkui/dist/components/Typography/Title/Title";
import './styles/main.css';
import ModalPage from "@vkontakte/vkui/dist/components/ModalPage/ModalPage";
import PanelHeaderButton from "@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton";
import Icon24Done from "@vkontakte/icons/dist/24/done";
import FormLayout from "@vkontakte/vkui/dist/components/FormLayout/FormLayout";
import FormLayoutGroup from "@vkontakte/vkui/dist/components/FormLayoutGroup/FormLayoutGroup";
import Cell from "@vkontakte/vkui/dist/components/Cell/Cell";
import Icon24Flash from "@vkontakte/icons/dist/24/flash";
import Switch from "@vkontakte/vkui/dist/components/Switch/Switch";
import Icon24Volume from "@vkontakte/icons/dist/24/volume";

const ROUTES = {
  INTRO: 'intro',
  HOME: 'home',
  TABLE_SYMBOLS: 'table_symbols',
  ON_WALL: 'on_wall',
  ON_PRIVATE: 'on_private',
  ON_WALL_SELF: 'on_wall_self'
};

const MODALS = {
  SEND_ON_WALL: 'send_on_wall',
  ERROR_ON_WALL: 'error_on_wall',
  PLAY_SYMBOL: 'play_symbol',
  SETTINGS: 'settings'
};

const STORAGE_KEYS = {
  STATUS: 'viewStatus',
  SETTINGS: 'settings'
};

let AudioContext = window.AudioContext || window.webkitAudioContext;
let context = new AudioContext();
let o = null;
let g = null;

const TIME_POINT = 500;
const TIME_DASH = 1000;
const TIME_DELAY = 1500;

let TIMEOUT_CHAR = null;
let TIMEOUT_DELAY = null;

let hashApp = '';

if (iOS()) {
  hashApp = window.location.href;
} else {
  hashApp = window.location.hash;
}

const App = () => {
  const [popout, setPopout] = useState(null);
  const [activePanel, setActivePanel] = useState(ROUTES.INTRO);
  const [fetchedUser, setUser] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const [hash, setHash] = useState(processHash(hashApp));

  const [settings, setSettings] = useState(null);

  const [snackbar, setSnackbar] = useState(null);
  const [userHasSeenIntro, setUserHasSeenIntro] = useState(false);
  const [fetchedState, setFetchedState] = useState(null);
  //шифратор
  const [textInput, setTextInput] = useState('');
  const [morseCode, setMorseCode] = useState('');
  //дешифратор
  const [morseInput, setMorseInput] = useState('');
  const [decodeMorse, setDecodeMorse] = useState('');

  //воспроизводимый символ
  const [symbol, setSymbol] = useState(null);
  //воспроизводимые точки
  const [chars, setChars] = useState(null);
  //текущий точка
  const [currentChar, setCurrentChar] = useState(0);

  const platform = usePlatform();

  useEffect(() => {
    if (hash) {
      setMorseInput(hashToMorse(hash));
    }
  }, [hash]);

  useEffect(() => {
    setMorseCode(strToMorse(textInput));
  }, [textInput]);

  useEffect(() => {
    setDecodeMorse(morseToStr(morseInput));
  }, [morseInput]);

  const setStorage = async function (props) {
    await bridge.send('VKWebAppStorageSet', {
      key: STORAGE_KEYS.SETTINGS,
      value: JSON.stringify(props)
    });
  };

  useEffect(() => {
    if (settings) {
      setStorage(settings);
    }
  }, [settings])


  const viewIntro = async (panel) => {
    try {
      await bridge.send('VKWebAppStorageSet', {
        key: STORAGE_KEYS.STATUS,
        value: JSON.stringify({
          hasSeenIntro: true,
        }),
      });
      go(panel);
    } catch (error) {
      setSnackbar(<Snackbar
          layout='vertical'
          onClose={() => setSnackbar(null)}
          before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic_red)'}}><Icon24Error fill='#fff' width={14}
                                                                                                 height={14}/></Avatar>}
          duration={900}
        >
          Проблема с отправкой данных в Storage
        </Snackbar>
      );
    }
  };

  const modalBack = () => {
    setActiveModal(null);
  };

  useEffect(() => {
    bridge.subscribe(({detail: {type, data}}) => {
      if (type === 'VKWebAppViewHide') {
        bridge.send("VKWebAppFlashSetLevel", {"level": 0});
        stopPlay();
      }
      if (type === 'VKWebAppUpdateConfig') {
        const schemeAttribute = document.createAttribute('scheme');
        schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
        document.body.attributes.setNamedItem(schemeAttribute);
      }
    });

    async function fetchData() {
      const user = await bridge.send('VKWebAppGetUserInfo');
      const sheetState = await bridge.send('VKWebAppStorageGet', {keys: [STORAGE_KEYS.STATUS, STORAGE_KEYS.SETTINGS]});
      let checkSettingsDefault = true;
      if (Array.isArray(sheetState.keys)) {
        const data = {};
        sheetState.keys.forEach(({key, value}) => {
          try {
            data[key] = value ? JSON.parse(value) : {};
            switch (key) {
              case STORAGE_KEYS.STATUS:
                if (data[key] && data[key].hasSeenIntro) {
                  if (hash) {
                    setActivePanel(ROUTES.HOME);
                  } else {
                    setActivePanel(ROUTES.TABLE_SYMBOLS);
                  }
                  setUserHasSeenIntro(true);
                }
                break;
              case STORAGE_KEYS.SETTINGS:
                setSettings(data[key]);
                checkSettingsDefault = false;
                break;
              default:
                break;
            }
          } catch (error) {
            setSnackbar(<Snackbar
                layout='vertical'
                onClose={() => setSnackbar(null)}
                before={<Avatar size={24} style={{backgroundColor: 'var(--dynamic_red)'}}><Icon24Error fill='#fff'
                                                                                                       width={14}
                                                                                                       height={14}/></Avatar>}
                duration={900}
              >
                Проблема с получением данных из Storage
              </Snackbar>
            );
            setFetchedState({});
          }
        });
        if (checkSettingsDefault) {
          setSettings({volume: true, flash: true})
        }
      } else {
        setFetchedState({});
      }
      setUser(user);
      setPopout(null);
    }

    fetchData();
  }, []);

  const go = (panel) => {
    setActivePanel(panel);
  };

  const openSendMenu = () => {
    setPopout(
      <ActionSheet onClose={() => setPopout(null)}>
        <ActionSheetItem autoclose onClick={() => go(ROUTES.ON_WALL)}>
          На стену другу
        </ActionSheetItem>
        <ActionSheetItem autoclose onClick={() => go(ROUTES.ON_WALL_SELF)}>
          На стену себе
        </ActionSheetItem>
        {platform === IOS && <ActionSheetItem autoclose mode="cancel">Отменить</ActionSheetItem>}
      </ActionSheet>
    )
  };


  function stopPlay() {
    setActiveModal(null);
    clearTimeout(TIMEOUT_DELAY);
    clearTimeout(TIMEOUT_CHAR);
    audioStop();
    setSymbol(null);
  }

  useEffect(() => {
    if (symbol) {
      setActiveModal(MODALS.PLAY_SYMBOL);
      setChars(symbol.morse.split(' '))
    } else {
      setChars(null);
    }
  }, [symbol]);

  useEffect(() => {
    if (chars) {
      playChar();
    } else {
      setCurrentChar(0);
    }
  }, [chars]);

  useEffect(() => {
    if (chars) {
      if (currentChar < chars.length) {
        playChar();
      } else {
        stopPlay();
      }
    }
  }, [currentChar]);

  const getTimeDelay = (char) => {
    if (char === '*') {
      return TIME_POINT;
    } else {
      return TIME_DASH;
    }
  };

  const nextChar = () => {
    setCurrentChar(currentChar + 1)
  };

  const nextStep = () => {
    audioStop();
    TIMEOUT_DELAY = setTimeout(nextChar, TIME_DELAY)
  };

  function playChar() {
    if (symbol) {
      audioStart();
      TIMEOUT_CHAR = setTimeout(nextStep, getTimeDelay(chars[currentChar]))
    }
  }

  function audioStart() {
    if (settings.flash) {
      bridge.send("VKWebAppFlashSetLevel", {"level": 1});
    }

    if (settings.volume) {
      o = context.createOscillator();
      g = context.createGain();
      o.connect(g);
      g.connect(context.destination);
      o.start(0)
    }
  }

  function audioStop() {
    bridge.send("VKWebAppFlashSetLevel", {"level": 0});
    try {
      g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + 0.01)
    } catch (e) {
    }
  }

  const modal = (
    <ModalRoot
      isBack={false}
      activeModal={activeModal}
      onClose={() => setActiveModal(null)}>
      <ModalPage
        id={MODALS.SETTINGS}
        onClose={modalBack}
        header={
          <ModalPageHeader
            right={(
              <>
                {platform === ANDROID && <PanelHeaderButton onClick={modalBack}><Icon24Done/></PanelHeaderButton>}
                {platform === IOS && <PanelHeaderButton onClick={modalBack}>Готово</PanelHeaderButton>}
              </>
            )}
          >
            Настройки
          </ModalPageHeader>}>
        <FormLayout>
          <FormLayoutGroup>
            <Cell before={<Icon24Flash/>}
                  asideContent={<Switch
                    onChange={() => setSettings({...settings, flash: !settings.flash})}
                    checked={settings && settings.flash}/>}>
              Свет
            </Cell>
            <Cell before={<Icon24Volume/>}
                  asideContent={<Switch
                    onChange={() => setSettings({...settings, volume: !settings.volume})}
                    checked={settings && settings.volume}/>}>
              Звук
            </Cell>
          </FormLayoutGroup>
        </FormLayout>
      </ModalPage>
      <ModalCard
        id={MODALS.PLAY_SYMBOL}
        onClose={stopPlay}
        icon={symbol ? <Title level="1" weight="bold">{symbol.value}</Title> : ''}
        header={chars && chars.map((char, i) => (
          <span key={i} className={i === currentChar ? 'blue' : ''}>{char}</span>
        ))}
      >
      </ModalCard>
      <ModalCard
        id={MODALS.SEND_ON_WALL}
        onClose={() => {
          go(ROUTES.HOME);
          setActiveModal(null)
        }}
        icon={<Icon56CheckCircleOutline/>}
        header="Сообщение успешно отправлено"
        actions={[{
          title: 'Отлично',
          mode: 'primary',
          action: () => {
            go(ROUTES.HOME);
            setActiveModal(null);
          }
        }]}
      >
      </ModalCard>
      <ModalCard
        id={MODALS.ERROR_ON_WALL}
        onClose={() => {
          go(ROUTES.HOME);
          setActiveModal(null)
        }}
        icon={<Icon56DoNotDisturbOutline/>}
        header="Сообщение не доставлено"
        actions={[{
          title: 'Жаль',
          mode: 'primary',
          action: () => {
            go(ROUTES.HOME);
            setActiveModal(null);
          }
        }]}
      >
      </ModalCard>
    </ModalRoot>
  );
  return (
    <View activePanel={activePanel} popout={popout} modal={modal}>
      <Intro
        id={ROUTES.INTRO}
        fetchedUser={fetchedUser}
        go={viewIntro}
        routes={ROUTES}
        hash={hash}
        userHasSeenIntro={userHasSeenIntro}/>
      <Home
        id={ROUTES.HOME}
        textInput={textInput}
        morseCode={morseCode}
        decodeMorse={decodeMorse}
        morseInput={morseInput}
        setTextInput={setTextInput}
        setMorseInput={setMorseInput}
        setActiveModal={setActiveModal}
        openSendMenu={openSendMenu}
        go={go}
        routes={ROUTES}
      />
      <TableSymbols
        id={ROUTES.TABLE_SYMBOLS}
        route={ROUTES.HOME}
        setSymbol={setSymbol}
        modalPage={MODALS.SETTINGS}
        setActiveModal={setActiveModal}
        go={go}
      />
      <OnWall
        id={ROUTES.ON_WALL}
        route={ROUTES.HOME}
        morseCode={morseCode}
        textInput={textInput}
        setActiveModal={setActiveModal}
        go={go}
      />
      <OnWallSelf
        id={ROUTES.ON_WALL_SELF}
        route={ROUTES.HOME}
        fetchedUser={fetchedUser}
        morseCode={morseCode}
        textInput={textInput}
        setActiveModal={setActiveModal}
        go={go}
      />
    </View>
  );
};

export default App;

