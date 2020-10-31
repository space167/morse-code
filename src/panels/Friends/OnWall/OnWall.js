import React, {useState, useEffect} from 'react';
import Panel from "@vkontakte/vkui/dist/components/Panel/Panel";
import PanelHeader from "@vkontakte/vkui/dist/components/PanelHeader/PanelHeader";
import SimpleCell from "@vkontakte/vkui/dist/components/SimpleCell/SimpleCell";
import InfoRow from "@vkontakte/vkui/dist/components/InfoRow/InfoRow";
import Group from "@vkontakte/vkui/dist/components/Group/Group";
import bridge from "@vkontakte/vk-bridge";
import PanelHeaderBack from "@vkontakte/vkui/dist/components/PanelHeaderBack/PanelHeaderBack";
import Placeholder from "@vkontakte/vkui/dist/components/Placeholder/Placeholder";
import Avatar from "@vkontakte/vkui/dist/components/Avatar/Avatar";
import Button from "@vkontakte/vkui/dist/components/Button/Button";
import {morseToHash} from "../../../utils/functions";

const OnWall = (
  {
    id,
    go,
    route,
    morseCode,
    textInput,
    setActiveModal
  }) => {
  const [friend, setFriend] = useState(null);

  useEffect(() => {
    async function getToken() {
      await bridge.send("VKWebAppGetAuthToken", {"app_id": 7629002, "scope": "friends,wall"})
        .then(data => {
          getFriend();
        })
        .catch(error => {
          go(route)
        });
    }

    getToken();
  }, []);

  async function getFriend() {
    await bridge.send("VKWebAppGetFriends", {})
      .then(data => {
        setFriend(data.users[0]);
      })
      .catch(error => {
        go(route);
      });
  }

  async function sendOnWall() {
    await bridge.send("VKWebAppShowWallPostBox", {
      "owner_id": friend.id,
      "message": `Лови шифровку! «${morseCode}» Значение узнаешь ниже`,
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
      {friend && <Placeholder
        icon={<Avatar size={80} src={friend.photo_200}/>}
        header="Получатель"
        action={<Button onClick={sendOnWall} size="l">Отправить на стену</Button>}
      >
        {friend.first_name} {friend.last_name}
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

export default OnWall;