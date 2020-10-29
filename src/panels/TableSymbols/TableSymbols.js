import React from 'react';
import SYMBOLS from '../../config/morse';
import Panel from "@vkontakte/vkui/dist/components/Panel/Panel";
import PanelHeader from "@vkontakte/vkui/dist/components/PanelHeader/PanelHeader";
import PanelHeaderBack from "@vkontakte/vkui/dist/components/PanelHeaderBack/PanelHeaderBack";

const TableSymbols = ({id, route, go}) => {
  return (
    <Panel id={id}>
      <PanelHeader
        left={<PanelHeaderBack onClick={() => go(route)}/>}>
        Азбука Морзе
      </PanelHeader>
      Контент
    </Panel>
  )
};

export default TableSymbols;