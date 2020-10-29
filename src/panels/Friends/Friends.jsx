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


const Friends = ({id, route, go, textInput, setActiveModal}) => {
  const [friend, setFriend] = useState(null);
  const [place, setPlace] = useState(null);

  useEffect(()=>{
    switch(place) {
      case 'wall':
        break;
      case 'private':
        break;
      default:
        break;
    }
  }, [place]);
  // useEffect(() => {
  //   async function getToken() {
  //     await bridge.send("VKWebAppGetAuthToken", {"app_id": 7629002, "scope": "friends"})
  //       .then(data => {
  //         getFriend();
  //       })
  //       .catch(error => {
  //         go(route)
  //       });
  //   }
  //   getToken();
  // }, []);

  // async function getFriend() {
  //   await bridge.send("VKWebAppGetFriends", {})
  //     .then(data => {
  //       setFriend(data.users[0]);
  //     })
  //     .catch(error => {
  //       go(route);
  //     });
  // }
  //
  // async function sendOnWall() {
  //   await bridge.send("VKWebAppShowWallPostBox", {
  //     "owner_id": friend.id,
  //     "message": `Лови шифровку! «${textToMorse(textInput)}» Значение узнаешь ниже`,
  //     "attachment": "https://vk.com/app7629002",
  //     access_token: "token"
  //   }).then(data => {
  //     setActiveModal('send_on_wall');
  //   })
  //     .catch(error => {
  //       setActiveModal('error_on_wall');
  //     });
  // };

  return (
    <Panel id={id}>
      {/*<PanelHeader left={<PanelHeaderBack onClick={() => go(route)}/>}>Выберете</PanelHeader>*/}
    </Panel>
  );
};

export default Friends;