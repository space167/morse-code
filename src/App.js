import React, {useState, useEffect} from 'react';
import bridge from '@vkontakte/vk-bridge';
import View from '@vkontakte/vkui/dist/components/View/View';
import ScreenSpinner from '@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner';
import '@vkontakte/vkui/dist/vkui.css';
import Home from './panels/Home';
import ModalRoot from "@vkontakte/vkui/dist/components/ModalRoot/ModalRoot";
import ModalPage from "@vkontakte/vkui/dist/components/ModalPage/ModalPage";
import ModalPageHeader from "@vkontakte/vkui/dist/components/ModalPageHeader/ModalPageHeader";
import FormLayout from "@vkontakte/vkui/dist/components/FormLayout/FormLayout";
import FormLayoutGroup from "@vkontakte/vkui/dist/components/FormLayoutGroup/FormLayoutGroup";
import Icon24Flash from "@vkontakte/icons/dist/24/flash";
import Icon24Volume from "@vkontakte/icons/dist/24/volume";
import Cell from "@vkontakte/vkui/dist/components/Cell/Cell";
import Switch from "@vkontakte/vkui/dist/components/Switch/Switch";

const App = () => {
  const [popout, setPopout] = useState(<ScreenSpinner size='large'/>);
  const [activeModal, setActiveModal] = useState(null);
  const [volume, setVolume] = useState(false);
  const [flash, setFlash] = useState(true);

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

  const modal = (
    <ModalRoot
      activeModal={activeModal}
      onClose={modalBack}>
      <ModalPage
        id="settings"
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
    </ModalRoot>
  );

  return (
    <View activePanel={'home'} popout={popout} modal={modal}>
      <Home id='home' setActiveModal={setActiveModal} volume={volume} flash={flash}/>
    </View>
  );
};

export default App;

