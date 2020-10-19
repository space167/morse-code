import React, {useState, useEffect} from 'react';
import bridge from '@vkontakte/vk-bridge';
import View from '@vkontakte/vkui/dist/components/View/View';
import ScreenSpinner from '@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner';
import '@vkontakte/vkui/dist/vkui.css';
import Home from './panels/Home/Home';
import ModalRoot from "@vkontakte/vkui/dist/components/ModalRoot/ModalRoot";
import ModalPage from "@vkontakte/vkui/dist/components/ModalPage/ModalPage";
import ModalPageHeader from "@vkontakte/vkui/dist/components/ModalPageHeader/ModalPageHeader";
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

const ROUTES = {
  HOME: 'home',
  FRIENDS: 'friends'
};

const MODALS = {
  SETTINGS: 'settings',
  SEND_ON_WALL: 'send_on_wall',
  ERROR_ON_WALL: 'error_on_wall',
}

const App = () => {
  const [popout, setPopout] = useState(<ScreenSpinner size='large'/>);
  const [activePanel, setActivePanel] = useState(ROUTES.HOME)
  const [activeModal, setActiveModal] = useState(null);
  const [volume, setVolume] = useState(true);
  const [flash, setFlash] = useState(true);
  const [textInput, setTextInput] = useState('');

  useEffect(() => {
    bridge.subscribe(({detail: {type, data}}) => {
      if (type === 'VKWebAppUpdateConfig') {
        const schemeAttribute = document.createAttribute('scheme');
        schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
        document.body.attributes.setNamedItem(schemeAttribute);
      }
    });
    setPopout(null);
  }, []);

  const modalBack = () => {
    setActiveModal(null);
  };

  const go = (panel) => {
    setActivePanel(panel);
  };

  const modal = (
    <ModalRoot
      activeModal={activeModal}
      onClose={modalBack}>
      <ModalPage
        id={MODALS.SETTINGS}
        onClose={modalBack}
        header={
          <ModalPageHeader>
            Настройки
          </ModalPageHeader>}>
        <FormLayout>
          <FormLayoutGroup>
            <Cell before={<Icon24Flash/>} asideContent={<Switch onChange={() => setFlash(!flash)} checked={flash}/>}>
              Свет
            </Cell>
            <Cell before={<Icon24Volume/>} asideContent={<Switch onChange={() => setVolume(!volume)} checked={volume}/>}>
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
        header="Сообщение недоставлено по неизвестным причинам"
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
        volume={volume}
        flash={flash}
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

