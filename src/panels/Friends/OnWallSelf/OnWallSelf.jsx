import React, {useEffect, useState} from 'react';
import Panel from "@vkontakte/vkui/dist/components/Panel/Panel";
import PanelHeaderBack from "@vkontakte/vkui/dist/components/PanelHeaderBack/PanelHeaderBack";
import PanelHeader from "@vkontakte/vkui/dist/components/PanelHeader/PanelHeader";
import bridge from "@vkontakte/vk-bridge";
import SimpleCell from "@vkontakte/vkui/dist/components/SimpleCell/SimpleCell";
import Placeholder from "@vkontakte/vkui/dist/components/Placeholder/Placeholder";
import Avatar from "@vkontakte/vkui/dist/components/Avatar/Avatar";
import Button from "@vkontakte/vkui/dist/components/Button/Button";
import InfoRow from "@vkontakte/vkui/dist/components/InfoRow/InfoRow";
import Group from "@vkontakte/vkui/dist/components/Group/Group";
import {morseToHash} from "../../../utils/functions";

const OnWallSelf = (
  {
    id,
    go,
    route,
    morseCode,
    textInput,
    fetchedUser,
    setActiveModal
  }) => {

  const [accessSend, setAccessSend] = useState(false);

  useEffect(() => {
    async function getToken() {
      await bridge.send("VKWebAppGetAuthToken", {"app_id": 7629002, "scope": "friends,wall"})
        .then(data => {
          // sendOnWall();
          setAccessSend(true)
        })
        .catch(error => {
          go(route)
        });
    }

    getToken();
  }, []);

  async function sendOnWall() {
    await bridge.send("VKWebAppShowWallPostBox", {
      "owner_id": fetchedUser.id,
      "message": `«${morseCode}» Значение ниже`,
      "attachment": "https://vk.com/app7629002" + morseToHash(morseCode),
    }).then(data => {
      setActiveModal('send_on_wall');
    })
      .catch(error => {
        setActiveModal('error_on_wall');
      });
  }

  return (
    <Panel id={id}>
      <PanelHeader left={<PanelHeaderBack onClick={() => go(route)}/>}>Отправка шифра</PanelHeader>
      <SimpleCell multiline>
        <InfoRow header="Зашифровано">
          {textInput}
        </InfoRow>
      </SimpleCell>
      {(accessSend && fetchedUser) && <Placeholder
        icon={<Avatar size={80} src={fetchedUser.photo_200}/>}
        header="Получатель"
        action={<Button onClick={sendOnWall} size="l">Отправить на стену</Button>}
      >
        {fetchedUser.first_name} {fetchedUser.last_name}
        <Group>
          <SimpleCell multiline>
            <InfoRow header="Сообщение">
              {morseCode}
            </InfoRow>
          </SimpleCell>
        </Group>
      </Placeholder>}
    </Panel>
  );
};

export default OnWallSelf;