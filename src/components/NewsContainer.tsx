import React, { useState, useEffect } from 'react';
import { IonSlides, IonSlide, IonContent, IonHeader, IonCol, IonRow, IonGrid, IonCard, IonCardHeader, IonCardSubtitle,
  IonCardTitle, IonCardContent, IonItem, IonIcon, IonLabel, IonButton,IonList, isPlatform, IonChip, IonAvatar, IonImg, IonRefresher,
  IonRefresherContent, IonSearchbar, IonPopover, IonItemSliding, IonItemOptions, IonItemOption, IonTextarea, IonModal,
  IonMenuButton,
  IonButtons,
  IonToolbar,
  IonTitle
} from '@ionic/react';
import { star, listCircle, create, refresh, repeat, personAdd, flag, closeCircle, bookmark, newspaper, chatbubble, statsChart, settings } from 'ionicons/icons';
import {callServer} from './ajaxcalls';

interface ContainerProps {
  name: string;
}

const slideOpts = {
  initialSlide: 0,
  speed: 400
};

const viewHeight = window.innerHeight / 1.5;

const NewsContainer: React.FC<ContainerProps> = ({ name }) => {

  const [searchState, updateSearch] = useState({value: ''});
  const [newsState, setNews] = useState([] as any);

  //BEGIN BANNER CODE
  function pullNews() {
    callServer("fetchNews","","TerrorCards")?.then((resp)=>{ return resp.json(); })
    .then((json)=>{ 
      console.log(json);
      if(json.length > 0) {
        let msgList:Array<any> = [];
        json.map((j:any, i:number) => {
          msgList.push(renderNewsItem(j, i));
        });
        setNews(msgList); 
      }
    })
    .catch((err:any) => {
      console.log(err);
    });
  }

  function renderNewsItem(j:any, i:number) {
    return(
    <IonCard key={i}>     
      <IonCardContent>
        <div  dangerouslySetInnerHTML={{ __html: j.Text }}></div>
        <div  dangerouslySetInnerHTML={{ __html: j.Timestamp }}></div>
      </IonCardContent>
    </IonCard>    
    );
  }

  //END MESSAGE FUNCTIONS

  useEffect(() => {
    // executed only once
    pullNews();
  }, [])

  return (
    <IonContent style={{backgroundColor:'#333'}}>
      {newsState}
    </IonContent>
  );
};

export default NewsContainer;
