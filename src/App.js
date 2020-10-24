import React, {useState, useEffect} from 'react';
import bridge from '@vkontakte/vk-bridge';
import View from '@vkontakte/vkui/dist/components/View/View';
import ScreenSpinner from '@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner';
import '@vkontakte/vkui/dist/vkui.css';
import Home from './panels/Home/Home';
import ModalRoot from "@vkontakte/vkui/dist/components/ModalRoot/ModalRoot";
import ModalPage from "@vkontakte/vkui/dist/components/ModalPage/ModalPage";
import FormLayout from "@vkontakte/vkui/dist/components/FormLayout/FormLayout";
import FormLayoutGroup from "@vkontakte/vkui/dist/components/FormLayoutGroup/FormLayoutGroup";
import Icon24Flash from "@vkontakte/icons/dist/24/flash";
import Icon24Volume from "@vkontakte/icons/dist/24/volume";
import Cell from "@vkontakte/vkui/dist/components/Cell/Cell";
import Switch from "@vkontakte/vkui/dist/components/Switch/Switch";
import Friends from "./panels/Friends/Friends";
import ModalCard from "@vkontakte/vkui/dist/components/ModalCard/ModalCard";
import Icon56CheckCircleOutline from '@vkontakte/icons/dist/56/check_circle_outline';
import Icon56DoNotDisturbOutline from '@vkontakte/icons/dist/56/do_not_disturb_outline';
import {ModalPageHeader, ANDROID, IOS, usePlatform} from '@vkontakte/vkui';
import PanelHeaderButton from "@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton";
import Icon24Done from "@vkontakte/icons/dist/24/done";
import Snackbar from "@vkontakte/vkui/dist/components/Snackbar/Snackbar";
import Avatar from "@vkontakte/vkui/dist/components/Avatar/Avatar";
import Icon24Error from "@vkontakte/icons/dist/24/error";
import Icon24Cancel from "@vkontakte/icons/dist/24/cancel";

const ROUTES = {
  HOME: 'home',
  FRIENDS: 'friends'
};

const MODALS = {
  SETTINGS: 'settings',
  SEND_ON_WALL: 'send_on_wall',
  ERROR_ON_WALL: 'error_on_wall',
};


const App = () => {
  const [popout, setPopout] = useState(<ScreenSpinner size='large'/>);
  const [activePanel, setActivePanel] = useState(ROUTES.HOME);
  const [activeModal, setActiveModal] = useState(null);
  const [settings, setSettings] = useState();

  const [textInput, setTextInput] = useState('');
  const [snackbar, setSnackbar] = useState(null);
  const platform = usePlatform();

  const setStorage = async function (props) {
    await bridge.send('VKWebAppStorageSet', {
      key: 'settings',
      value: JSON.stringify(props)
    });
  };

  const modalBack = () => {
    setActiveModal(null);
  };

  useEffect(() => {
    if (settings) {
      setStorage(settings);
    }

  }, [settings])


  useEffect(() => {
    bridge.subscribe(({detail: {type, data}}) => {
      if (type === 'VKWebAppUpdateConfig') {
        const schemeAttribute = document.createAttribute('scheme');
        schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
        document.body.attributes.setNamedItem(schemeAttribute);
      }
    });
    setPopout(null);

    async function fetchData() {
      const sheetState = await bridge.send('VKWebAppStorageGet', {keys: ['settings']});
      if (Array.isArray(sheetState.keys)) {
        const data = {};
        sheetState.keys.forEach(({key, value}) => {
          try {
            data[key] = value ? JSON.parse(value) : {};
            switch (key) {
              case 'settings':
                setSettings(data[key]);
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
          }
        });
      } else {
        setSettings({volume: true, flash: true});
      }
      setPopout(null);
    }

    fetchData();
  }, []);

  const go = (panel) => {
    setActivePanel(panel);
  };

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
                  asideContent={<Switch onChange={() => setSettings({...settings, flash: !settings.flash})}
                                        checked={settings ? settings.flash : true}/>}>
              Свет
            </Cell>
            <Cell before={<Icon24Volume/>}
                  asideContent={<Switch
                    onChange={() => setSettings({...settings, volume: !settings.volume})}
                    checked={settings ? settings.volume : true}/>}>
              Звук
            </Cell>
          </FormLayoutGroup>
        </FormLayout>
      </ModalPage>
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
        header="Сообщение не доставлено по неизвестным причинам"
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
      <Home
        id='home'
        textInput={textInput}
        setTextInput={setTextInput}
        setActiveModal={setActiveModal}
        go={go}
        route={ROUTES.FRIENDS}
        volume={settings ? settings.volume : false}
        flash={settings ? settings.flash : false}
      />
      <Friends
        id='friends'
        textInput={textInput}
        go={go}
        route={ROUTES.HOME}
        setActiveModal={setActiveModal}
      />
    </View>
  );
};

export default App;

