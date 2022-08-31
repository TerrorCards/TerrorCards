import React from 'react';
import {withIonLifeCycle, IonGrid, IonRow, IonCol, IonInfiniteScroll, IonInfiniteScrollContent, IonList, IonModal, IonButton, IonImg, IonThumbnail,
  IonButtons, IonContent, IonHeader, IonMenuButton, IonFooter, IonPage, IonTitle, IonToolbar, IonFab, IonFabButton, IonIcon, IonFabList,
  IonChip, IonLabel, IonItem, IonSlides, IonSlide, IonBadge, IonPopover
} from '@ionic/react';
import {copyOutline, flashOutline, settingsOutline} from 'ionicons/icons';
import './GalleryContainer.css';
import GalleryMenu from './GalleryMenu';
import {callServer} from './ajaxcalls';

interface props {
  galleryProps: any;
  nftProps: any;
  settingsCallback: any;
  user: any;
}

interface state {
  showModal: boolean,
  showDetails: boolean,
  cardDetails:any,
  dataList: Array<any>,
  chunkedList: Array<any>,
  length:number,
  list:any,
  infiniteScroll:any,
  imgList: Array<any>,
  viewState:string,
  nftList: Array<any>
  nftImgList: Array<any>
  showSettingPopover:boolean
  event: any
}

class GalleryContainer extends React.Component<props, state> {

  constructor(props:any) {
    super(props);

    this.state = {
      showModal: false,
      showDetails: false,
      cardDetails: null ,
      dataList: [],
      chunkedList: [],
      length: 0,
      list: null,
      infiniteScroll: null ,
      imgList: [],
      viewState: "cards"  ,
      nftList: [],
      nftImgList: [],
      showSettingPopover: false,
      event: undefined
    }
  }

  componentDidMount() {
    this.pullCards();
    console.log('component did mount event fired')    
  }

  componentDidUpdate(prevProps:any) {
    if(prevProps.galleryProps.year !== this.props.galleryProps.year ||
      prevProps.galleryProps.view !== this.props.galleryProps.view || 
      prevProps.galleryProps.set !== this.props.galleryProps.set ||
      prevProps.nftProps.collection !== this.props.nftProps.collection
      ) {
        if(this.state.viewState === "nft") {
          this.pullNFTs();
        } else {
          this.pullCards();
        }
      console.log('Props updated'); 
    }  
    if(prevProps.galleryProps.layoutCount !== this.props.galleryProps.layoutCount || prevProps.nftProps.layoutCount !== this.props.nftProps.layoutCount) {
      this.resetChunks();
    }
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter event fired')
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave event fired')
  }

  ionViewDidEnter() {
    if(this.state.viewState === "nft") {
      this.pullNFTs();
    } else {
      this.pullCards();
    }
    console.log('ionViewDidEnter event fired')
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave event fired')
  }

  //Functions to do chunking of data
  chunkVersions = (array: Array<any>) => {
    const localList = [...array];
    let chunkList:Array<any> = [];
    if (localList.length > 0) {
      chunkList = this.chunk(localList, (this.state.viewState === "nft")?this.props.nftProps.layoutCount:this.props.galleryProps.layoutCount);
    }
    return chunkList;
  }

  chunk = (array: Array<any>, size:number) => {
    const temparray = [];
    const chunk = size;
    let i, j;
    for (i = 0, j = array.length; i < j; i += chunk) {
      temparray.push(array.slice(i, i + chunk));
    }
    return temparray;
  }
  //End chunking functions

  showCardetails =(card:any, front:boolean) => {
    //Recent trades: {result[0].recentTrades} <br></br>(past 48 hrs)
    this.pullCardDetails(this.props.user.ID, card).then((result:any) => {
      let currImg = card.Image;
      if(!front) {
        currImg = card.Image.replace(/front/g, "back");
      }
      const details =  
      <IonGrid>
        <IonRow>
          <IonCol>Card Count: {result[0].count}</IonCol> 
          <IonCol>Sold Out: {result[0].cardSoldOut}</IonCol> 
        </IonRow> 
        <IonRow>
          <IonCol>Set: {card.SetName.replace(/_/g, " ")}</IonCol>
        </IonRow>              
        <IonRow>
        <IonCol><IonImg src={currImg} onClick={() => {
          this.showCardetails(card, !front);
        }}></IonImg></IonCol> 
        </IonRow>               
      </IonGrid>;
      this.setState({cardDetails:details, showDetails:true})
    })
  }

  pullCards =() => {
    callServer("cards",{year:this.props.galleryProps.year, 
      category:this.props.galleryProps.set, 
      view:this.props.galleryProps.view},this.props.user.ID)?.then((resp)=>{ console.log(resp); return resp.json(); })
    .then((json)=>{ 
      if(json.length > 0) {
        //dataList = json;
        //console.log(json);
        const chunkedList = this.chunkVersions(json);
        this.setState({chunkedList:chunkedList, dataList:json}, ()=> {
          this.imgList();
          //this.initializeScroll();
          //this.appendItems(this.props.galleryProps.layoutCount*3);
        });
        //updateMessages({msg: msgList, controlList: json});
      } else {
        this.setState({imgList:[]});
      }
    })
    .catch((err:any) => {
      console.log(err);
    });
  }

  pullCardDetails =(user:string, card: any) => {
    return new Promise ((resolve:any, reject:any) => {
      //console.log(card);
      callServer("cardDetail",{number: card.Number, year:card.Year},user)?.then((resp)=>{ return resp.json(); })
      .then((json)=>{ 
        //console.log(json);
        if(json) {
          resolve(json);
        } else {
          resolve(json);
        }
      })
      .catch((err:any) => {
        console.log(err);
        resolve(err);
      });
    });
  }

  imgList =() => {
    const list:Array<any> = [];
    this.state.chunkedList.map((ch:any,i:number) => {
      const item:Array<any> = [];
      ch.map((c:any, z:number) => {
        let imgSrc = c.Image;
        let message = c.SoldOut;
        if(this.props.galleryProps.layoutCount > 2) {
          imgSrc = imgSrc.replace("full", "thumbs");
        }
        if(this.props.galleryProps.layoutCount > 3) {
          message = "S.O."
        }        
        item.push(
          <IonCol key={c.ID}>
            <IonImg style={{width:"100%"}} src={imgSrc} class={(c.UserID === null)?'need-card-alpha':''} onClick={
              () => {this.showCardetails(c, true)}
              }>
            </IonImg>
            {(c.Count !== null && c.Count > 1) && <IonBadge class="quantity-badge">{c.Count}</IonBadge>}
            {<IonBadge class="message-badge ">{message}</IonBadge>} 
          </IonCol>
        )
        if(i === (this.state.chunkedList.length -1)){
          if(ch.length  < this.props.galleryProps.layoutCount) {
            const remainder = this.props.galleryProps.layoutCount - ch.length;
            for(let a=0; a < remainder; a++) {
              item.push(
                <IonCol key={a+"_"+z}></IonCol>
              )             
            }
          }
        }
      });
      list.push(
        <IonRow key={i}>{item}</IonRow>
      );
    });
    this.setState({imgList:list});
  }

  pullNFTs =() => {
    //https://wax.api.atomicassets.io/atomicassets/v1/assets?collection_name=terrorcards1&owner=z15b2.wam&page=1&limit=100&order=desc&sort=asset_id
    const url = "https://wax.api.atomicassets.io/atomicassets/v1/assets?collection_name="+this.props.nftProps.collection+"&owner=z15b2.wam&page=1&limit=100&order=desc&sort=asset_id";    
  
    fetch(url).then((resp)=>{ return resp.json(); })
    .then((json)=>{ 
      console.log(json);
      if(json.success) {
        const chunkedList = this.chunkVersions(json.data);
        this.setState({chunkedList: chunkedList, dataList: json.data},()=> {
          this.nftList()
        })
      } else {
        this.setState({nftList: []})       
      }
    })
    .catch((err:any) => {
      console.log(err);
    });
  
  }

  nftList =() => {
    const list:Array<any> = [];
    let item:Array<any> = [];
    this.state.chunkedList.map((nl:any,a:number) => {
      item = [];
      nl.map((ch:any,i:number) => {
          let imgSrc = ch.data.img; 
          if(typeof(imgSrc) !== "undefined") {
            item.push(
              <IonCol key={ch.asset_id}>
                <IonImg style={{width:"100px", height:"100px", objectFit: "contain"}} src={"https://ipfs.io/ipfs/" + imgSrc}></IonImg>
                {<IonBadge class="message-badge-left">{"mint " + ch.template_mint}</IonBadge>} 
              </IonCol>
            )
          } else {
            let vidSrc = ch.data.video;
            let poster = ch.data["video cover art"];
            item.push(
              <IonCol key={ch.asset_id}>
                <video width="100px" height="100px" controls preload="none" poster={"https://ipfs.io/ipfs/" + poster}>
                  <source src={"https://ipfs.io/ipfs/" + vidSrc} type="video/mp4"></source>
                </video>
                {<IonBadge class="message-badge-left">{"mint " + ch.template_mint}</IonBadge>} 
              </IonCol>
            )
          }      
      });
      list.push(
        <IonRow key={a}>{item}</IonRow>
      );
    })
    this.setState({nftImgList:list});
  }



  resetChunks = () => {
    const newChunks = this.chunkVersions(this.state.dataList);
    this.setState({chunkedList: newChunks}, () => {
      if(this.state.viewState === "nft") {
        this.nftList();
      } else {
        this.imgList();
      }      
    });
  }

  render() {

    return (
      <IonContent style={{height:'92%'}} scrollY={false}>

        <IonGrid>
          <IonRow>
            <IonCol>
              <IonButton color={(this.state.viewState === 'cards')?'danger':'dark'} expand="full" size='small' onClick={()=>{
                this.setState({viewState:"cards"},()=>{
                  this.pullCards();
                })
              }}><IonIcon  slot="start" icon={copyOutline}  color="light" /> Cards</IonButton>        
            </IonCol>
            <IonCol>
              <IonButton color={(this.state.viewState === 'nft')?'danger':'dark'}  expand="full" size='small' onClick={()=>{
                this.setState({viewState:"nft"}, () => {
                  this.pullNFTs();
                });
              }}><IonIcon  slot="start" icon={flashOutline}  color="light" />NFTs</IonButton> 
            </IonCol> 
            <IonCol>
              <IonButton fill='clear' onClick={(e:any)=>{
                this.setState({showSettingPopover:true});
              }}>
                <IonIcon  slot="end" icon={settingsOutline}  color="dark" />
              </IonButton> 
            </IonCol>                 
          </IonRow>
        </IonGrid>

        <IonContent style={{height:'92%'}}>
          <IonGrid id="list">{(this.state.viewState === 'cards')?this.state.imgList:this.state.nftImgList}</IonGrid>
        </IonContent>

        <IonPopover
        cssClass='popper-custom-menu-size'
        isOpen={this.state.showSettingPopover}
        onDidDismiss={() => this.setState({ showSettingPopover: false, event: undefined })}
      >
        <GalleryMenu layoutAction={this.props.settingsCallback}  layoutProps={this.props.galleryProps} nftProps={this.props.nftProps} user={this.props.user}
          type={this.state.viewState}
        />
      </IonPopover>

      <IonModal isOpen={this.state.showDetails}>
        {this.state.cardDetails}
        <IonButton onClick={() => this.setState({showDetails:false, cardDetails:null})}>Close Details</IonButton>
      </IonModal>

      </IonContent>
    );
  }


/*
        <IonInfiniteScroll threshold="100px" id="infinite-scroll">
        <IonInfiniteScrollContent
            loading-spinner="bubbles">
        </IonInfiniteScrollContent>
        </IonInfiniteScroll>
        */

};

export default withIonLifeCycle(GalleryContainer);
