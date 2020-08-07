import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar, IonLoading, IonCard, IonImg
    , IonCardSubtitle, IonCardTitle, IonGrid, IonRow, IonCol, IonItem, IonButton, IonList, IonListHeader
    , IonLabel, IonIcon, IonText, IonModal, IonFooter, IonSelect, IonSelectOption, IonThumbnail } from '@ionic/react';

import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import update from 'immutability-helper';
import './Page.css';
import { getData, Store, t_basket, t_variant, i_magazines } from '../Store';
import { giftOutline, cartOutline, arrowBack, closeOutline, addCircleOutline, removeCircleOutline } from 'ionicons/icons';

import { menuContext } from "../components/Menu";

 interface i_card {
    Код:            number,
    Наименование:   string,
    Картинка:       string,
    Цена:           number,
    Варианты:       Array<t_variant>
 }

const c_state : i_card = {
  Код: -1, Наименование: "", Картинка: "", Цена: 0, Варианты: []
}

const v_state : t_variant = {
  НомерСтроки: 0, Характеристика: "", Цена: 0, Количество: 0, Картинка: ""
}

const Page: React.FC = () => {
  const [loading,     setLoading]   = useState(false);
  const [card,        setCard]      = useState<i_card>(c_state);
  const [basket,      setBasket]    = useState(false);
  const [b_length,    setBLength]   = useState(0);
  const [page,        setPage]      = useState(0);
  const [variant,     setVariant]   = useState<t_variant>(v_state);

  const { name } = useParams<{ name: string; }>();

  let hist = useHistory();

  let menu = useContext(menuContext)

  Store.subsribe_m_click(()=>{
    setCard(c_state)
    setPage(1);
    console.log("m_click")
  })

  Store.subsribe_l_basket(()=>{
    let basket = Store.getState().basket;
    let sum = 0;
    if(basket !== undefined)
      basket.forEach(info => {
        sum = sum + info.Количество
      });
    setBLength(sum);
  })

  Store.subsribe_t_click(()=>{
    setPage(0);
    console.log("t_click")
  })

  useEffect(()=>{
    setLoading(true);
    async function LoadData(){
      if( name === "Магазины"){
        

      } else {
      let params = {
          params : {
            "Группа": name
          }
        }
        let res = await getData("Товары", params);
        if(res.Код === 100){
          Store.dispatch({type: "goods", data: res.Данные})
        }
      }
      setLoading(false);
    }

    LoadData()

  }, [name])

  function          Variants():JSX.Element {
    let elem = <></>

    let info = card.Варианты;

    for(let i = 0;i < info.length; i++){
      elem = <>
        { elem }
        <IonSelectOption value={ info[i] }> { info[i].Характеристика } </IonSelectOption>
      </>
    }
    return elem
  }

  function          Cards():JSX.Element {
    let elem = <></>;

    let info = Store.getState().goods;
    if(info !== undefined)
      for(let i = 0;i < info.length;i++){
        elem = <>
          { elem }
          <IonCard class="i-card" onClick={()=>{
              showCard(info[i].Код);
          }}>
            <div className="i-container">
              <img className="img" src={ info[i].Картинка } alt=""/>
            </div>
            <IonCardTitle> Цена { info[i].Цена } руб </IonCardTitle>
            <IonCardSubtitle>  - </IonCardSubtitle>
            <IonCardSubtitle>{ info[i].Наименование }</IonCardSubtitle>
          </IonCard>
        </>
      }

    return elem
  }

  async function    showCard(Код){
    setLoading(true);
    let params = {
      params: {Код: Код}
    }

    let res = await getData("Товар", params);
    if(res.Код === 100){
      setCard(res.Данные);
      setVariant(res.Данные.Варианты[0])
      console.log("show")
      console.log(card)
    } else console.log(res)
    setLoading(false);
    setPage(2);
  }

  function          addBasket(amount: number){
    let basket = Store.getState().basket;

    if(basket === undefined) basket = [];

    var commentIndex = basket.findIndex(function(b) { 
        return b.Код === card.Код && b.НомерСтроки === variant.НомерСтроки; 
    });
    if(commentIndex >= 0){
      let b_amount = basket[commentIndex].Количество
      let sum = b_amount + (amount as number);
      let total = basket[commentIndex].Цена * sum;

      var updated = update(basket[commentIndex], {Количество: {$set: sum}, Всего: {$set: total}}); 

      Store.dispatch({type: "upd_basket", basket: updated})

    } else {
      Store.dispatch({type: "add_basket", 
        basket: {
          Код:            card.Код,
          Наименование:   card.Наименование,
          НомерСтроки:    variant.НомерСтроки,
          Характеристика: variant.Характеристика,
          Цена:           variant.Цена,
          Количество:     amount,
          Всего:          variant.Цена,
          Картинка:       variant.Картинка
        }
      })
    }
  }

  function          delBasket(Код: number, НомерСтроки: number){
    let basket = Store.getState().basket;

    if(basket === undefined) basket = [];

    var commentIndex = basket.findIndex(function(b) { 
        return b.Код === Код && b.НомерСтроки === НомерСтроки; 
    });
    if(commentIndex >= 0){
      basket.splice(commentIndex, 1)
      Store.dispatch({type:"basket", basket: basket})
    }
  }

  function          updBasket(Код: number, НомерСтроки: number, amount: number){
    let basket = Store.getState().basket;

    if(basket === undefined) basket = [];

    var commentIndex = basket.findIndex(function(b) { 
        return b.Код === Код && b.НомерСтроки === НомерСтроки; 
    });
    if(commentIndex >= 0){
      let b_amount = basket[commentIndex].Количество
      let sum = b_amount + amount;
      let total = basket[commentIndex].Цена * sum;

      if(sum === 0) delBasket(Код, НомерСтроки)
      else {
        var updated = update(basket[commentIndex], {Количество: {$set: sum}, Всего: {$set: total}}); 

        Store.dispatch({type: "upd_basket", basket: updated})
      }

    }
  }

  function          Card():JSX.Element{
      let elem = <></>
      
      elem = 
        <IonCard class="descr">

          {/* Заголовок */}
          <IonHeader>
            <IonToolbar class="a-center">
              <IonButton slot="start" fill="clear" onClick={()=>{
                setCard(c_state)
                setPage(1);
                console.log(page);
              }}>
                <IonIcon icon={ arrowBack }></IonIcon>
                Назад
              </IonButton>
              <IonCardTitle >
                <IonText>
                  { card.Наименование }
                </IonText>
                {/* <IonTitle>{ card.Наименование } </IonTitle> */}
              </IonCardTitle>
            </IonToolbar>
          </IonHeader>

          <IonGrid>
            <IonRow>
              <IonCol size="5">
                <IonImg src={ card.Картинка }/>
  
                <IonRow>
                  <IonCol>
                    <IonButton expand="block" onClick={()=> {
                      addBasket(1);
                    }}>
                      <IonIcon slot="end" icon={ giftOutline }/>
                      <IonLabel> В корзину </IonLabel>
                    </IonButton>
                  </IonCol>
                </IonRow>

              </IonCol>
              
              <IonCol>
                  <IonRow >
                    <IonCol class="r-underline">
                    <IonCardSubtitle >
                      Артикул:  { card.Код }
                    </IonCardSubtitle>
                    </IonCol>
                  </IonRow>
                  
                  <div className="i-row">
                    <div className="i-box1">
                      <IonList>
                        <IonListHeader>
                          <IonLabel>Варианты</IonLabel>
                        </IonListHeader>
                        <IonSelect value={variant} onIonChange={e => setVariant(e.detail.value)}>
                          <Variants />
                        </IonSelect>
                        <IonItem class="item">
                          <IonRow class="item">
                            <IonCol>
                              <IonText class="f-14">Цена:</IonText>
                            </IonCol>
                            <IonCol class="a-right">
                              <IonText class="f-14"> { variant.Цена } </IonText>  
                            </IonCol>
                          </IonRow>
                        </IonItem>
                        <IonItem class="item">
                          <IonRow class="item">
                            <IonCol>
                              <IonText class="f-14">Количество:</IonText>
                            </IonCol>
                            <IonCol class="a-right">
                              <IonText class="f-14"> { variant.Количество } </IonText>  
                            </IonCol>
                          </IonRow>
                        </IonItem>
                      </IonList>
                    </div>
                    <div className="i-box2" > 
                      <IonList>
                        <IonListHeader>
                          <IonLabel>Характеристики</IonLabel>
                        </IonListHeader>
                      </IonList> 
                    </div>  
                  </div>
                  
              </IonCol>
            </IonRow>
          </IonGrid>
        
        </IonCard>
      
      return elem;
    
  }

  function          Markets(): JSX.Element {
    let elem = <></>; 

    for(let i = 0;i < i_magazines.length;i++){
      elem = <>
        { elem }
        <IonCard class="i-mag" onClick={()=>{
          setMarket(i_magazines[i]);
        }}>
          <IonItem>
            <IonThumbnail class="i-thumb" slot="start">
              <img src="assets/Callisto.jpg" alt=""/>
            </IonThumbnail>
            <IonGrid>
            <IonRow>
              <IonCol>
              <IonCardTitle>{ i_magazines[i].store }</IonCardTitle>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
              <IonCardSubtitle>{  i_magazines[i].description }</IonCardSubtitle>
              </IonCol>
            </IonRow>
            </IonGrid>
          </IonItem>
        </IonCard>
      </>
     
    }

    return elem;
  }

  async function    setMarket(info){
    setLoading(true);

      let params = {
        params: {}
      }
      let res = await getData("Категории", params)
      if(res.Код === 100) {
        menu.setMenu(res.Данные);
      } 
      if(res.Данные.length > 0){
        let url = res.Данные[0].url;
        hist.push(url);
      }

    setPage(1);
    setLoading(false);
  }

  function          Place():JSX.Element{
  
    switch( page ){
        case 0:   return <Markets />
        case 1:   return <Cards />
        case 2:   return <Card />
      }
    return <></>
  }

  function          BItem(props:{info : t_basket}):JSX.Element{
    let info = props.info;
    return <>
      <IonRow class="r-underline">
        <IonCol><IonImg id="a-margin" src={info.Картинка}/></IonCol>
        <IonCol size="8">
          <IonCardSubtitle> {info.Наименование} </IonCardSubtitle>
          <IonCardTitle class="t-right"> 
            { info.Цена } Х { info.Количество } = { info.Всего}
          </IonCardTitle>
        </IonCol>
        <IonCol size="2">
          <IonRow>
            <IonCol class="i-col">
              <IonButton class="i-but" fill="clear" onClick={()=>{
                delBasket(info.Код, info.НомерСтроки)
              }}>
                <IonIcon slot="icon-only" icon={ closeOutline }>
                </IonIcon>
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol class="i-col">
              <IonButton class="i-but" fill="clear" onClick={()=>{
                updBasket(info.Код, info.НомерСтроки, 1)
              }}>
                <IonIcon slot="icon-only" icon={ addCircleOutline }>
                </IonIcon>
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol class="i-col">
              <IonButton class="i-but" fill="clear" onClick={()=>{
                updBasket(info.Код, info.НомерСтроки, -1)
              }}>
                <IonIcon slot="icon-only" icon={ removeCircleOutline }>
                </IonIcon>
              </IonButton>
            </IonCol>
          </IonRow>
        </IonCol>
    </IonRow>
    </>

  }

  function          Basket(props:{blen: number}):JSX.Element{

    let b_length = props.blen;

    let basket = Store.getState().basket;

    let items = <IonCardSubtitle> Всего товаров { b_length }</IonCardSubtitle>

    let sum = 0;
    for(let i = 0;i < basket.length;i++){
      sum = sum + basket[i].Всего;
      items = <>
        { items }
        <BItem info={ basket[i] } />
      </>
    }

    items = <>
      { items }
      <IonRow>
        <IonCol size="12">
          Итого на сумму
        </IonCol>
      </IonRow>
          <IonRow>
            <IonCol size="12" class="t-right r-underline">
              { sum }
            </IonCol>
          </IonRow>
    </>

    return items
  }

  return (
    <IonPage>
      <IonLoading isOpen={loading} message={'Please wait...'}/>     
      <IonHeader class="a-center">
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{ name } </IonTitle>
          <IonButton slot="end" fill="clear" onClick={()=>{
            setBasket(true)
          }}>
            <IonIcon slot="icon-only" icon = { cartOutline } />
            <IonText class="red-1"> { b_length } </IonText>
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div id="home">
          <Place /> 
        </div>
      </IonContent>

      <IonModal
        isOpen={ basket }
        cssClass='my-custom-class'
        swipeToClose={true}
  //      presentingElement={pageRef.current}
        onDidDismiss={() => setBasket( false )}>

          <IonHeader>
            <IonToolbar>
              <IonButton fill="clear" slot="end" onClick={() => setBasket(false)}>
                <IonIcon slot="icon-only" icon={ closeOutline }></IonIcon>
              </IonButton>
              <IonTitle> Корзина </IonTitle> 
            </IonToolbar>
          </IonHeader>

          <IonContent>
            <IonGrid class="i-content">
              <Basket blen = { b_length } />
            </IonGrid>
          </IonContent>

          <IonFooter>
            <IonToolbar>
              <IonButton slot="end" onClick={()=>{
                Store.dispatch({type: "cl_basket"})
                setBasket(false)
              }}> Заказать 
              </IonButton>
              <IonButton slot="start" onClick={()=>{
                Store.dispatch({type: "cl_basket"})
                setBasket(false)
              }}> Очистить заказ 
              </IonButton>
            </IonToolbar>
          </IonFooter>
      </IonModal>
    
    </IonPage>
  );
};

export default Page;
