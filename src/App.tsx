import { Redirect, Route } from "react-router-dom";
import { Storage } from "@ionic/storage";
import {
  setupIonicReact,
  withIonLifeCycle,
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonFab,
  IonFabButton,
  IonFabList,
  IonHeader,
  IonContent,
  IonItem,
  IonPopover,
  IonModal,
  IonGrid,
  IonCol,
  IonRow,
} from "@ionic/react";
import React, { useState, useEffect } from "react";
import { IonReactRouter } from "@ionic/react-router";
import {
  ellipse,
  cart,
  home,
  flask,
  trophy,
  square,
  skull,
  repeat,
  images,
  person,
  settings,
} from "ionicons/icons";
import HomeContainer from "./components/HomeContainer";
import GalleryContainer from "./components/GalleryContainer";
import ProfileContainer from "./components/ProfileContainer";
import StoreContainer from "./components/StoreContainer";
import FactoryContainer from "./components/FactoryContainer";
import TradeContainer from "./components/TradeContainer";
import SignInContainer from "./components/SignInContainer";
import HuntContainer from "./components/HuntContainer";
import TradeSetup from "./components/TradeSetup";
import ProfileManagerContainer from "./components/ProfileManagerContainer";
import GalleryMenu from "./components/GalleryMenu";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";

interface props {}

interface state {
  appReady: boolean;
  showPopover: boolean;
  galleryDigitalSettings: any;
  galleryNFTSettings: any;
  event: any;
  user: any;
  showTradeSetupModel: boolean;
  tradeUser: string;
  showProfileManageModel: boolean;
  showFactorySetupModel: boolean;
  showHuntModel: boolean;
  refreshTime: number;
}

const store = new Storage();
store.create();
let menuContent: any = "";

setupIonicReact({
  mode: "md",
});

class App extends React.Component<props, state> {
  constructor(props: any) {
    super(props);

    this.state = {
      appReady: false,
      showPopover: false,
      galleryDigitalSettings: {
        isInitialize: false,
        layoutCount: 3,
        year: new Date().getFullYear(),
        set: "All",
        view: "owned",
        viewOptions: "all",
      },
      galleryNFTSettings: {
        isInitialize: false,
        layoutCount: 3,
        collection: "terrorcards1",
        schema: "all",
        template: "all",
        viewOptions: "all",
      },

      event: undefined,
      user: {
        ID: null,
        credit: 0,
      },
      showTradeSetupModel: false,
      tradeUser: "",
      showProfileManageModel: false,
      showFactorySetupModel: false,
      showHuntModel: false,
      refreshTime: 0,
    };
  }

  componentDidMount() {
    console.log("componet did mount event fired");
    this.getUserStorage();
  }

  componentDidUpdate(prevProps: any) {}

  ionViewWillEnter() {
    console.log("ionViewWillEnter event fired");
  }

  ionViewWillLeave() {
    console.log("ionViewWillLeave event fired");
  }

  ionViewDidEnter() {
    console.log("ionViewDidEnter event fired");
  }

  ionViewDidLeave() {
    console.log("ionViewDidLeave event fired");
  }

  getUserStorage = () => {
    //store.create();
    //store.clear();
    //await store.set('username', "TerrorCards");
    store.get("userProfile").then((userProfile: any) => {
      console.log(userProfile);
      if (userProfile !== null) {
        //continue normally
        //const newState = {ID: username, credit:0};
        userProfile["ID"] = userProfile.Name;
        this.setState({ user: userProfile }, () => {
          this.setState({ appReady: true });
        });
      } else {
        //load login/sign up modal
        this.setState({ appReady: true });
      }
    });
  };

  getGallerySettingStorage = () => {
    store.get("galleryDigitalSettings").then((galleryDigitalSettings: any) => {
      console.log(galleryDigitalSettings);
      if (galleryDigitalSettings !== null) {
        //continue normally
        this.setState({ galleryDigitalSettings: galleryDigitalSettings });
      }
    });
    store.get("galleryNFTSettings").then((galleryNFTSettings: any) => {
      console.log(galleryNFTSettings);
      if (galleryNFTSettings !== null) {
        //continue normally
        this.setState({ galleryNFTSettings: galleryNFTSettings });
      }
    });
  };

  setUserName = (info: any) => {
    store.set("userProfile", info).then(() => {
      this.getUserStorage();
    });
  };

  setGallerySettingsStorage = (digital: any, nft: any) => {
    store.set("galleryDigitalSettings", digital).then(() => {
      store.set("galleryNFTSettings", nft).then(() => {
        this.getGallerySettingStorage();
      });
    });
  };

  removeUserFromStore = () => {
    store.clear();
    this.setState({ appReady: false });
  };

  fnUpdateUserInfo = (info: any) => {
    const newState = { ID: info.Name, credit: info.Credit };
    this.setState({ user: newState });
  };

  fnCallbackRefreshTime = (value: number) => {
    this.setState({ refreshTime: value });
  };

  //Gallery functions
  fnGalleryLayout = (param: string, item: number) => {
    const localSettings: any = { ...this.state.galleryDigitalSettings };
    localSettings[param] = item;
    const newState = {
      layoutCount: localSettings.layoutCount,
      isInitialize: true,
      year: localSettings.year,
      set: localSettings.set,
      view: localSettings.view,
      viewOptions: localSettings.viewOptions,
    };
    this.setState({ galleryDigitalSettings: newState });

    //setGalleryLayout({ layoutCount: item, isInitialize:true });
    //setTimeout(() => {
    //  setGalleryLayout({ layoutCount: item, isInitialize:true });
    //}, 500);
  };

  showPoperAction = (e: any) => {
    if (this.state.showPopover) {
      this.setState({ showPopover: false, event: undefined });
    } else {
      this.setState({ showPopover: true, event: e });
    }
  };

  showTradeModal = (e: any) => {
    if (this.state.showTradeSetupModel) {
      this.setState({ showTradeSetupModel: false, tradeUser: "" });
    } else {
      this.setState({ showTradeSetupModel: true, tradeUser: e });
    }
  };

  showProfileModal = (e: any) => {
    if (this.state.showProfileManageModel) {
      this.setState({ showProfileManageModel: false });
    } else {
      this.setState({ showProfileManageModel: true });
    }
  };

  showFactoryModal = (e: any) => {
    if (this.state.showFactorySetupModel) {
      this.setState({ showFactorySetupModel: false });
    } else {
      this.setState({ showFactorySetupModel: true });
    }
  };

  showHuntModal = (e: any) => {
    if (this.state.showHuntModel) {
      this.setState({ showHuntModel: false });
    } else {
      this.setState({ showHuntModel: true });
    }
  };

  /*
  setTimeout(() => {
    if(galleryState.year === -1) {
      const localSettings: any = {...galleryState};
      setGalleryLayout({layoutCount: localSettings.layoutCount, isInitialize:true ,year:(new Date()).getFullYear(), set:localSettings.set, view:localSettings.view}); 
    }    
  },1000);
  */

  //this.nav.parent.select(tabIndex);
  //{menuContent = <GalleryMenu layoutAction={this.fnGalleryLayout}  layoutProps={this.state.galleryDigitalSettings} user={this.state.user} />}
  render() {
    return this.state.appReady && this.state.user.ID !== null ? (
      <IonApp>
        <IonReactRouter>
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/home">
                <ProfileContainer
                  menuAction={this.showPoperAction}
                  user={this.state.user}
                  profileCallback={this.fnUpdateUserInfo}
                  lastRefreshed={this.state.refreshTime}
                />
                <HomeContainer
                  name="home"
                  user={this.state.user}
                  tradeCallback={this.showTradeModal}
                />
              </Route>
              <Route exact path="/gallery">
                <ProfileContainer
                  menuAction={this.showPoperAction}
                  user={this.state.user}
                  profileCallback={this.fnUpdateUserInfo}
                  lastRefreshed={this.state.refreshTime}
                />
                <GalleryContainer
                  galleryProps={this.state.galleryDigitalSettings}
                  nftProps={this.state.galleryNFTSettings}
                  settingsCallback={this.setGallerySettingsStorage}
                  key={this.state.galleryDigitalSettings.layoutCount}
                  user={this.state.user}
                />
              </Route>
              <Route path="/store">
                <ProfileContainer
                  menuAction={this.showPoperAction}
                  user={this.state.user}
                  profileCallback={this.fnUpdateUserInfo}
                  lastRefreshed={this.state.refreshTime}
                />
                <StoreContainer
                  storeProps={""}
                  user={this.state.user}
                  callbackPackOpenTimer={this.fnCallbackRefreshTime}
                />
              </Route>
              <Route path="/trade">
                <ProfileContainer
                  menuAction={this.showPoperAction}
                  user={this.state.user}
                  profileCallback={this.fnUpdateUserInfo}
                  lastRefreshed={this.state.refreshTime}
                />
                <TradeContainer user={this.state.user} />
              </Route>
              <Route exact path="/">
                <ProfileContainer
                  menuAction={this.showPoperAction}
                  user={this.state.user}
                  profileCallback={this.fnUpdateUserInfo}
                  lastRefreshed={this.state.refreshTime}
                />
                <HomeContainer
                  name="home"
                  user={this.state.user}
                  tradeCallback={this.showTradeModal}
                />
              </Route>
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
              <IonTabButton tab="home" href="/home">
                <IonIcon icon={home} />
                <IonLabel>Home</IonLabel>
              </IonTabButton>
              <IonTabButton tab="gallery" href="/gallery">
                <IonIcon icon={images} />
                <IonLabel>Gallery</IonLabel>
              </IonTabButton>
              <IonTabButton tab="tab2" href="/tab2"></IonTabButton>
              <IonTabButton tab="store" href="/store">
                <IonIcon icon={cart} />
                <IonLabel>Store</IonLabel>
              </IonTabButton>
              <IonTabButton tab="trade" href="/trade">
                <IonIcon icon={repeat} />
                <IonLabel>Trades</IonLabel>
              </IonTabButton>
            </IonTabBar>
          </IonTabs>

          <IonFab vertical="bottom" horizontal="center" slot="fixed">
            <IonFabButton color="dark">
              <IonIcon icon={skull} />
            </IonFabButton>
            <IonFabList side="start">
              <IonFabButton
                color="dark"
                onClick={(e) => {
                  this.showProfileModal(e);
                }}
              >
                <IonIcon icon={person} />
              </IonFabButton>
            </IonFabList>
            <IonFabList side="end">
              <IonFabButton
                color="dark"
                onClick={(e) => {
                  this.showFactoryModal(e);
                }}
              >
                <IonIcon icon={flask} />
              </IonFabButton>
            </IonFabList>
            <IonFabList side="top">
              <IonFabButton
                color="dark"
                onClick={(e) => {
                  this.showHuntModal(e);
                }}
              >
                <IonIcon icon={flask} />
              </IonFabButton>
            </IonFabList>
          </IonFab>

          <IonModal isOpen={this.state.showTradeSetupModel}>
            <TradeSetup
              otherUser={this.state.tradeUser}
              user={this.state.user}
              closePanel={this.showTradeModal}
            />
          </IonModal>

          <IonModal isOpen={this.state.showProfileManageModel}>
            <ProfileManagerContainer
              user={this.state.user}
              closePanel={this.showProfileModal}
              signOut={this.removeUserFromStore}
            />
          </IonModal>

          <IonModal isOpen={this.state.showFactorySetupModel}>
            <FactoryContainer
              user={this.state.user}
              closePanel={this.showFactoryModal}
            />
          </IonModal>

          <IonModal isOpen={this.state.showHuntModel}>
            <HuntContainer
              user={this.state.user}
              closePanel={this.showHuntModal}
            />
          </IonModal>
        </IonReactRouter>
      </IonApp>
    ) : (
      <IonApp>
        <SignInContainer
          user={this.state.user}
          signInCallback={this.setUserName}
        />
      </IonApp>
    );
  }

  /*
        <IonPopover
        cssClass='popper-custom-menu-size'
        isOpen={this.state.showPopover}
        onDidDismiss={() => this.setState({ showPopover: false, event: undefined })}
      >
        {menuContent}
      </IonPopover>
*/

  //<IonFabButton color="dark"><IonIcon icon={trophy} /></IonFabButton>
}

export default withIonLifeCycle(App);
