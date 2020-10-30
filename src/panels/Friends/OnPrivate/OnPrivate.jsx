import React, {useEffect, useState} from 'react';
import Panel from "@vkontakte/vkui/dist/components/Panel/Panel";
import PanelHeaderBack from "@vkontakte/vkui/dist/components/PanelHeaderBack/PanelHeaderBack";
import PanelHeader from "@vkontakte/vkui/dist/components/PanelHeader/PanelHeader";
import bridge from "@vkontakte/vk-bridge";
import InfoRow from "@vkontakte/vkui/dist/components/InfoRow/InfoRow";
import Placeholder from "@vkontakte/vkui/dist/components/Placeholder/Placeholder";
import Avatar from "@vkontakte/vkui/dist/components/Avatar/Avatar";
import Button from "@vkontakte/vkui/dist/components/Button/Button";
import Group from "@vkontakte/vkui/dist/components/Group/Group";
import SimpleCell from "@vkontakte/vkui/dist/components/SimpleCell/SimpleCell";

// bridge.send("VKWebAppCallAPIMethod", {"method": "users.get", "request_id": "32test", "params": {"user_ids": "1", "v":"5.124", "access_token":"your_token"}});
const OnPrivate = (
  {
    id,
    go,
    route,
    morseCode,
    textInput,
    setActiveModal
  }) => {

  const [friend, setFriend] = useState(null);
  const [token, setToken] = useState(null)

  useEffect(() => {
    async function getToken() {
      await bridge.send("VKWebAppGetAuthToken", {"app_id": 7629002, "scope": "friends,wall"})
        .then(data => {
          setToken(data.access_token);
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

  async function sendOnPrivate() {
    console.log('try send')
    bridge.send("VKWebAppCallAPIMethod",
      {
        "method": "messages.send",
        "params":
          {
            "user_id": friend.id,
            "message": `Лови шифровку! «${morseCode}» Значение узнаешь ниже`,
            "attachment": "https://vk.com/app7629002",
            "v": "5.124",
            "access_token": token
          }
      }).then(data => {
      console.log(data)
      setActiveModal('send_on_wall');
    })
      .catch(error => {
        console.log(error)
        setActiveModal('error_on_wall');
      });

    // await bridge.send("VKWebAppShowMessageBox", {
    //   "owner_id": friend.id,
    //   "message": `Лови шифровку! «${morseCode}» Значение узнаешь ниже`,
    //   "attachment": "https://vk.com/app7629002",
    // }).then(data => {
    //   console.log(data)
    //   setActiveModal('send_on_wall');
    // })
    //   .catch(error => {
    //     console.log(error)
    //     setActiveModal('error_on_wall');
    //   });
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
        action={<Button onClick={sendOnPrivate} size="l">Отправить в личные сообщения</Button>}
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

export default OnPrivate;