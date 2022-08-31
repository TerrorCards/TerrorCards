import React, {useState, useEffect} from 'react';
import {withIonLifeCycle, IonItem, IonLabel, IonGrid, IonRow, IonCol, IonInfiniteScroll, IonInfiniteScrollContent, IonList, IonListHeader, IonModal, IonButton, IonImg, IonThumbnail,
  IonButtons, IonContent, IonHeader, IonMenuButton, IonFooter, IonPage, IonTitle, IonToolbar, IonFab, IonFabButton, IonIcon, IonFabList, IonInput,
  IonSelect, IonSelectOption
} from '@ionic/react';
import { add, settings, share, person, arrowForwardCircle, arrowBackCircle, arrowUpCircle, layers, calendar, grid, logoTwitter } from 'ionicons/icons';
import './GalleryMenu.css';
import {callServer} from './ajaxcalls';

interface props {
  layoutAction: any;
  layoutProps: any;
  nftProps: any;
  user:any;
  type:string;
}

interface state {
  setList: Array<any>,
  availableSets: Array<any>,
  availableYears: Array<any>,
  availableViews: Array<any>
}

class GalleryMenu extends React.Component<props, state> {

  constructor(props:any) {
    super(props);

    this.state = {
      setList: [],
      availableSets: [],
      availableYears: [], 
      availableViews: []    
    }
  }
  TCYearStart:number = 2017;
  currYear = (new Date()).getFullYear();
  diffYear = this.currYear - this.TCYearStart;
  viewOptions = ['active','all','needs','owned'];

  componentDidMount() {
    let years:Array<any> = [];
    for(let i = 0; i <= this.diffYear; i++) {
      years.push(<IonSelectOption key={this.TCYearStart+i} value={this.TCYearStart+i}>{this.TCYearStart+i}</IonSelectOption>);
    }
    this.setState({availableYears:years}, () => {
      this.setRenderViews();
      this.pullSets();
      console.log('ionViewDidEnter event fired') 
    })   
  }  

  componentDidUpdate(prevProps:any) {
 
  }

  pullSets =() => {
    callServer("sets",{year:this.props.layoutProps.year, category:this.props.layoutProps.set, view:this.props.layoutProps.view},this.props.user.ID)?.then((resp)=>{ console.log(resp); return resp.json(); })
    .then((json)=>{ 
      if(json.length > 0) {
        console.log(json);
        this.setRenderSets(json);
      }
    })
    .catch((err:any) => {
      console.log(err);   
    });
  }

  setRenderSets =(data:any) => {
    const availableSets:any = [];
    availableSets.push(<IonSelectOption key={'all'} value={'All'}>{'All'}</IonSelectOption>);
    data.map((d:any, i:number) => {
      if(d.Year === this.props.layoutProps.year) {
        const cleanName = (d.SetName).replace(/_/g, " ");
        if(d.SetName === this.props.layoutProps.set) {
          availableSets.push(<IonSelectOption key={i} value={d.SetName}>{cleanName}</IonSelectOption>);
        } else {
          availableSets.push(<IonSelectOption key={i} value={d.SetName}>{cleanName}</IonSelectOption>);
        }
      }
    });
    this.setState({availableSets: availableSets, setList:data});
  }

  setRenderViews =() => {
    const availableView:any = [];
    this.viewOptions.map((d:any, i:number) => {
      if(this.props.layoutProps.viewOptions === 'all') {
        availableView.push(<IonSelectOption key={i} value={d}>{d}</IonSelectOption>);
      } else {
        if((this.props.layoutProps.viewOptions).indexOf(d) > -1) {
          availableView.push(<IonSelectOption key={i} value={d}>{d}</IonSelectOption>); 
        }
      }
    });
    this.setState({availableViews: availableView});    
  }

  yearSetHook =(value:any) => {
    //this.setRenderSets(this.state.setList);
    this.props.layoutAction('year', value);
    this.props.layoutAction('set', 'All');
  }

  updateSettings =(setting:any, value:any, type:any) => {
    const localDigitalSettings = {...this.props.layoutProps};
    const localNFTSettings = {...this.props.nftProps};
    if(type === 'digital') {
      localDigitalSettings[setting] = value;
    } else {
      localNFTSettings[setting] = value;
    }
    this.props.layoutAction(localDigitalSettings, localNFTSettings)
  }

  renderDigitalUI = () => {
    return(<IonList>
      <IonListHeader>Gallery Settings</IonListHeader>
      <IonListHeader>Filters</IonListHeader>
      <IonItem>
        <IonLabel>Year</IonLabel>
        <IonSelect value={this.props.layoutProps.year} placeholder="" onIonChange={(e:any) => {this.updateSettings('year', e.detail.value, 'digital')} }>
          {this.state.availableYears}
        </IonSelect>
      </IonItem>
      <IonItem>
        <IonLabel>Set</IonLabel>
        <IonSelect value={this.props.layoutProps.set} placeholder="" onIonChange={(e:any) => {this.updateSettings('set', e.detail.value, 'digital')} }>
          {this.state.availableSets}
        </IonSelect> 
      </IonItem>     
      <IonItem>
        <IonLabel>View</IonLabel>
        <IonSelect value={this.props.layoutProps.view} placeholder="" onIonChange={(e:any) => {this.updateSettings('view', e.detail.value, 'digital')} }>
          {this.state.availableViews}
        </IonSelect>  
      </IonItem>    
      <IonListHeader>Layout Settings</IonListHeader>
      <IonItem>
        <IonLabel># per row</IonLabel>
        <IonSelect value={(this.props.layoutProps.layoutCount).toString()} placeholder="" onIonChange={(e:any) => {this.updateSettings('layoutCount', parseInt(e.detail.value), 'digital')} }>
          <IonSelectOption value="1">1</IonSelectOption>
          <IonSelectOption value="2">2</IonSelectOption>
          <IonSelectOption value="3">3</IonSelectOption>
          <IonSelectOption value="4">4</IonSelectOption>
          <IonSelectOption value="5">5</IonSelectOption>
        </IonSelect>
      </IonItem>
    </IonList>)
  }

  renderNFTUI =() => {
    return(<IonList>
      <IonListHeader>NFT Gallery Settings</IonListHeader>
      <IonListHeader>Filters</IonListHeader>
      <IonItem>
        <IonLabel>Collection</IonLabel>
        <IonSelect value={this.props.nftProps.collection} placeholder="" onIonChange={(e:any) => {this.updateSettings('collection', e.detail.value, 'nft')} }>
          <IonSelectOption value="terrorcards1">Terror Cards</IonSelectOption>
          <IonSelectOption value="terrorkisses">Terror Kisses</IonSelectOption>
        </IonSelect>
      </IonItem>   
      <IonListHeader>Layout Settings</IonListHeader>
      <IonItem>
        <IonLabel># per row</IonLabel>
        <IonSelect value={(this.props.nftProps.layoutCount).toString()} placeholder="" onIonChange={(e:any) => {this.updateSettings('layoutCount', parseInt(e.detail.value), 'nft')} }>
          <IonSelectOption value="1">1</IonSelectOption>
          <IonSelectOption value="2">2</IonSelectOption>
          <IonSelectOption value="3">3</IonSelectOption>
          <IonSelectOption value="4">4</IonSelectOption>
          <IonSelectOption value="5">5</IonSelectOption>
        </IonSelect>
      </IonItem>
    </IonList>)    
  }


  render() {
    return (
      (this.props.type === "nft")?this.renderNFTUI() : this.renderDigitalUI()
    );    
  }


}

export default withIonLifeCycle(GalleryMenu);
