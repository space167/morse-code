import React, {useState, useEffect} from 'react';
import bridge from '@vkontakte/vk-bridge';
import View from '@vkontakte/vkui/dist/components/View/View';
import ScreenSpinner from '@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner';
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
import {morseToStr, strToMorse} from "./utils/functions";
import TableSymbols from "./panels/TableSymbols/TableSymbols";
import ActionSheetItem from "@vkontakte/vkui/dist/components/ActionSheetItem/ActionSheetItem";
import ActionSheet from "@vkontakte/vkui/dist/components/ActionSheet/ActionSheet";
import OnWallSelf from "./panels/Friends/OnWallSelf/OnWallSelf";
// import OnPrivate from "./panels/Friends/OnPrivate/OnPrivate";
import OnWall from "./panels/Friends/OnWall/OnWall";

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
};

const STORAGE_KEYS = {
  STATUS: 'viewStatus',
};

const App = () => {
  const [popout, setPopout] = useState(null);
  const [activePanel, setActivePanel] = useState(ROUTES.INTRO);
  const [fetchedUser, setUser] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const [snackbar, setSnackbar] = useState(null);
  const [userHasSeenIntro, setUserHasSeenIntro] = useState(false);
  const [fetchedState, setFetchedState] = useState(null);
  //шифратор
  const [textInput, setTextInput] = useState('');
  const [morseCode, setMorseCode] = useState('');
  //дешифратор
  const [morseInput, setMorseInput] = useState('');
  const [decodeMorse, setDecodeMorse] = useState('');

  const platform = usePlatform();

  useEffect(() => {
    setMorseCode(strToMorse(textInput));
  }, [textInput]);

  useEffect(() => {
    setDecodeMorse(morseToStr(morseInput));
  }, [morseInput]);

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
      if (type === 'VKWebAppUpdateConfig') {
        const schemeAttribute = document.createAttribute('scheme');
        schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
        document.body.attributes.setNamedItem(schemeAttribute);
      }
    });

    async function fetchData() {
      const user = await bridge.send('VKWebAppGetUserInfo');
      const sheetState = await bridge.send('VKWebAppStorageGet', {keys: [STORAGE_KEYS.STATUS]});
      if (Array.isArray(sheetState.keys)) {
        const data = {};
        sheetState.keys.forEach(({key, value}) => {
          try {
            data[key] = value ? JSON.parse(value) : {};
            switch (key) {
              case STORAGE_KEYS.STATUS:
                if (data[key] && data[key].hasSeenIntro) {
                  setActivePanel(ROUTES.TABLE_SYMBOLS);
                  setUserHasSeenIntro(true);
                }
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

  const modal = (
    <ModalRoot
      isBack={false}
      activeModal={activeModal}
      onClose={() => setActiveModal(null)}>
      <ModalCard
        id={MODALS.SEND_ON_WALL}
        onClose={() => setActiveModal(null)}
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
        onClose={() => setActiveModal(null)}
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
        route={ROUTES.HOME}
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

