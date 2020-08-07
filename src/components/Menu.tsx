import {
    IonContent, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonMenu
  , IonMenuToggle, IonNote
} from '@ionic/react';

import React, { useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { shirtOutline, bookmarkOutline } from 'ionicons/icons';
import './Menu.css';
import { Store } from '../Store';


interface i_menu {
  Код: number,
  url: string;
  title: string;
}
interface   IMenuContext {
  setMenu: Function;
}

const user: IMenuContext = {
  setMenu: () => {}
};

export const menuContext = React.createContext<IMenuContext>(user);

const labels = [ 'Новинки', 'Акции', 'Бренды', 'Топ' ];

const Menu: React.FC = () => {
  const [menu,  setMenu] = useState<Array<i_menu>>([]);
  const location = useLocation();
  const c_menu = useContext(menuContext);

  c_menu.setMenu = setMenu;

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="inbox-list">
        <IonListHeader onClick={()=>{
            Store.dispatch({type: "t_click"})
        }}>{ "Магазины" }</IonListHeader>
          <IonNote>{ "" }</IonNote>
          { menu.map((page, index) => {
            return (
              <IonMenuToggle key={index} autoHide={ false }>
                <IonItem 
                    className={ location.pathname === page.url ? 'selected' : '' } 
                    routerLink={ page.url } 
                    routerDirection="none" 
                    lines="none" 
                    detail={ false }
                    onClick={()=>{
                      Store.dispatch({type: "m_click"})
                    }}>
                  <IonIcon slot="start" icon={ shirtOutline }/>
                  <IonLabel>{ page.title }</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>

        <IonList id="labels-list">
          <IonListHeader> Коллекции </IonListHeader>
          {labels.map((label, index) => (
            <IonItem lines="none" key={index}>
              <IonIcon slot="start" icon={bookmarkOutline} />
              <IonLabel>{label}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
