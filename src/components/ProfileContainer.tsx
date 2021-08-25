import React, { useState, useEffect } from 'react';
import { IonSlides, IonSlide, IonContent, IonHeader, IonCol, IonRow, IonGrid, IonCard, IonCardHeader, IonCardSubtitle,
  IonCardTitle, IonCardContent, IonItem, IonIcon, IonLabel, IonButton,IonList, isPlatform, IonChip, IonAvatar, IonImg, IonRefresher,
  IonRefresherContent, IonSearchbar, IonPopover, IonItemSliding, IonItemOptions, IonItemOption, IonTextarea, IonModal,
  IonMenuButton,
  IonButtons,
  IonToolbar,
  IonTitle,
  withIonLifeCycle
} from '@ionic/react';
import { settingsOutline } from 'ionicons/icons';
import {callServer} from './ajaxcalls';

interface props {
  menuAction: any;
  user: any;
  profileCallback: any;
  lastRefreshed: any;
}

interface state {
  info: any,
  infoRender: any,
  initialSlide: number,
  speed: number
};

class ProfileContainer extends React.Component<props, state> {

  constructor(props:any) {
    super(props);

    this.state = {
      info: {},
      infoRender: null,
      initialSlide: 0,
      speed: 400    
    }
  }

  componentDidMount() {
    this.pullProfile(); 
    console.log('ionViewDidEnter event fired');   
  }

  componentDidUpdate(prevProps:any) {
    //this.pullProfile(); 
    console.log(prevProps);
    if(prevProps.lastRefreshed !== this.props.lastRefreshed) {
      this.pullProfile();
      console.log('component did update');       
    }
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter event fired')
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave event fired')
  }

  ionViewDidEnter() {   
    console.log('ionViewDidEnter event fired')
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave event fired')
  }

  viewHeight = (offset:number) => {
    return(window.innerHeight / offset);
  }


  //BEGIN BANNER CODE
  pullProfile() {
    callServer("userInfo","",this.props.user.ID)?.then((resp)=>{ return resp.json(); })
    .then((json)=>{ 
      console.log(json);
      if(json) {
        const infoRender = this.renderProfileItem(json);
        this.setState({info: json, infoRender: infoRender}, () => {
          this.props.profileCallback(json);
        }); 
      }
    })
    .catch((err:any) => {
      console.log(err);
    });
  }

  renderProfileItem(j:any) {
    return(
        <IonItem>
        <IonAvatar slot="start">
        <IonImg src={j.Image} />
        </IonAvatar>
        <div style={{display:'flex', flexDirection:"row", width:"100%"}}>
          <div style={{display:'flex', flex:3, flexDirection:"column"}}>
              <div>{j.Name} ({j.Rating})</div>
              <div style={{fontSize:'smaller'}}><IonIcon  slot="end" icon={settingsOutline}  color="dark" /> {j.Credit}</div>
          </div>
          <div style={{display:'flex', flex:1}}>
            <div style={{textAlign:'end'}}>
            <IonButton fill='clear' onClick={(e:any)=>{this.props.menuAction(e)}}>
              <IonIcon  slot="end" icon={settingsOutline}  color="dark" />
            </IonButton>
            </div>
          </div>          
        </div>
        </IonItem>
    );
  }

  render() {
    return (
      <React.Fragment>
        {this.state.infoRender}  
      </React.Fragment>
    );
  }
};

export default withIonLifeCycle(ProfileContainer);
