import React from 'react';
import Panel from "@vkontakte/vkui/dist/components/Panel/Panel";
import PanelHeaderBack from "../Friends";
import PanelHeader from "@vkontakte/vkui/dist/components/PanelHeader/PanelHeader";

const OnWall = ({go, route}) => {
  return (
    <Panel>
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
              {textToMorse(textInput)}
            </InfoRow>
          </SimpleCell>
        </Group>
      </Placeholder>}
    </Panel>
  );
};

export default OnWall;