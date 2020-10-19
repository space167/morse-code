import React, {useState, useEffect} from 'react';
import {Panel} from "@vkontakte/vkui";
import PanelHeader from "@vkontakte/vkui/dist/components/PanelHeader/PanelHeader";
import PanelHeaderBack from "@vkontakte/vkui/dist/components/PanelHeaderBack/PanelHeaderBack";
import SYMBOLS from "../../config/morse";
import bridge from "@vkontakte/vk-bridge";
import Avatar from "@vkontakte/vkui/dist/components/Avatar/Avatar";
import Button from "@vkontakte/vkui/dist/components/Button/Button";
import Placeholder from "@vkontakte/vkui/dist/components/Placeholder/Placeholder";
import Group from "@vkontakte/vkui/dist/components/Group/Group";
import SimpleCell from "@vkontakte/vkui/dist/components/SimpleCell/SimpleCell";
import InfoRow from "@vkontakte/vkui/dist/components/InfoRow/InfoRow";


const Friends = ({id, route, go, textInput}) => {


  //bridge.send("VKWebAppShowWallPostBox", {"message": "Hello!"});
  //параметры
  //https://vk.com/dev/wall.post

  const [friend, setFriend] = useState(
    {
      first_name: "Виктор",
      id: 271427797,
      last_name: "Волков",
      photo_200: "https://sun9-63.userapi.com/impf/c849224/v849224811/60246/5GvGTlgd0Zk.jpg?size=200x0&quality=88&crop=6,64,337,337&sign=7dfa0196ee36c099d39f9cf06efffde4&c_uniq_tag=p6XJge7QMg2zEvLNW5xoXGJerDPj3dPvJRTRI8stiYQ&ava=1"
    });
  const [token, setToken] = useState(null);

  useEffect(() => {
    async function getToken() {
      const data = await bridge.send("VKWebAppGetAuthToken", {"app_id": 7629002, "scope": "friends,wall"});
      setToken(data.access_token);
    }

    getToken();
  }, []);


  useEffect(() => {
    async function getFriend() {
      const data = await bridge.send("VKWebAppGetFriends", {"access_token": "token"});
      setFriend(data.users[0]);
    }

    if (token) {
      // getFriend();
    }

  }, [token]);


  const textToMorse = (str) => {
    let arr = str.split(' ');
    let newStr = arr.join('').toUpperCase();
    let arrSymbols = [];
    for (let i = 0; i < newStr.length; i++) {
      for (let j = 0; j < SYMBOLS.length; j++) {
        if (SYMBOLS[j].value.indexOf(newStr[i]) !== -1) {
          arrSymbols.push(SYMBOLS[j].morse);
          break;
        }
      }
    }
    return arrSymbols.join(' / ');
  };

  return (
    <Panel id={id}>
      <PanelHeader left={<PanelHeaderBack onClick={() => go(route)}/>}>Шифр другу</PanelHeader>
      <SimpleCell multiline>
        <InfoRow header="Зашифровано">
          {textInput}
        </InfoRow>
      </SimpleCell>
      <Placeholder
        icon={<Avatar size={80} src={friend.photo_200}/>}
        header="Получатель"
        action={<Button size="l">Отправить на стену</Button>}
      >
        {friend.first_name} {friend.last_name}
        <Group>
          <SimpleCell multiline>
            <InfoRow header="Сообщение">
              {textToMorse(textInput)}
            </InfoRow>
          </SimpleCell>
        </Group>
      </Placeholder>
    </Panel>
  );
};

export default Friends;