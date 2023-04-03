import { Route } from "react-router-dom";
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
  IonContent,
  IonModal,
  IonGrid,
  IonCol,
  IonRow,
  IonAlert,
} from "@ionic/react";
import React from "react";
import { IonReactRouter } from "@ionic/react-router";
import {
  cart,
  home,
  flask,
  skull,
  repeat,
  images,
  person,
  ribbon,
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
import { callServer } from "./components/ajaxcalls";

import { Device } from "@capacitor/device";
import { InAppPurchase2 } from "@awesome-cordova-plugins/in-app-purchase-2";

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
  hasTrades: boolean;
  dailyLogin: boolean;
  dailyMessage: string;
  showCoinMessage: boolean;
  coinPurchaseMsg: string;
}

const store = new Storage();
store.create();

setupIonicReact({ mode: "ios" });

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
      hasTrades: false,
      dailyLogin: false,
      dailyMessage: "",
      showCoinMessage: false,
      coinPurchaseMsg: "",
    };
  }

  deviceInfo: any = {
    uuid: null,
    platform: null,
  };
  tradesExist = false;

  componentDidMount() {
    //console.log("componet did mount event fired");
    this.getUserStorage();
  }

  componentWillMount() {
    Device.getInfo().then((d: any) => {
      this.deviceInfo.platform = d.platform;
      Device.getId().then((i: any) => {
        this.deviceInfo.uuid = i.uuid;
      });
    });

    this.pullInApp();

    /*
    this.deviceInfo.uuid = Device.uuid;
    this.deviceInfo.platform = Device.platform;
    if (this.deviceInfo.platform === "ios") {
      setupIonicReact({ mode: "ios" });
    } else {
      setupIonicReact({ mode: "md" });
    }
    */
  }

  componentDidUpdate(prevProps: any) {
    //console.log("component did update");
    callServer("hasTrades", "", this.state.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        if (json) {
          //console.log(json);
          if (json === "Yes") {
            this.tradesExist = true;
            //this.setState({ hasTrades: true });
          } else {
            this.tradesExist = false;
          }
        }
      })
      .catch((err: any) => {
        //console.log(err);
      });
  }

  ionViewWillEnter() {
    //console.log("ionViewWillEnter event fired");
  }

  ionViewWillLeave() {
    //console.log("ionViewWillLeave event fired");
  }

  ionViewDidEnter() {
    //console.log("ionViewDidEnter event fired");
  }

  ionViewDidLeave() {
    //console.log("ionViewDidLeave event fired");
  }

  getUserStorage = () => {
    //store.create();
    //store.clear();
    //await store.set('username', "TerrorCards");
    store.get("userProfile").then((userProfile: any) => {
      //console.log(userProfile);
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
      if (galleryDigitalSettings !== null) {
        //continue normally
        this.setState({ galleryDigitalSettings: galleryDigitalSettings });
      }
    });
    store.get("galleryNFTSettings").then((galleryNFTSettings: any) => {
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
    this.setState({ user: newState }, () => {
      if (info.Daily === "Yes") {
        this.setState({ dailyLogin: true, dailyMessage: info.DailyMessage });
      } else {
        this.setState({ dailyLogin: false, dailyMessage: "" });
      }
    });
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

  render() {
    return this.state.appReady && this.state.user.ID !== null ? (
      <IonApp>
        <IonReactRouter>
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/home">
                <ProfileContainer
                  user={this.state.user}
                  profileCallback={this.fnUpdateUserInfo}
                  lastRefreshed={this.state.refreshTime}
                  tradeCallback={this.showTradeModal}
                />
                <HomeContainer
                  name="home"
                  user={this.state.user}
                  tradeCallback={this.showTradeModal}
                />
              </Route>
              <Route exact path="/gallery">
                <ProfileContainer
                  user={this.state.user}
                  profileCallback={this.fnUpdateUserInfo}
                  lastRefreshed={this.state.refreshTime}
                  tradeCallback={this.showTradeModal}
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
                  user={this.state.user}
                  profileCallback={this.fnUpdateUserInfo}
                  lastRefreshed={this.state.refreshTime}
                  tradeCallback={this.showTradeModal}
                />
                <StoreContainer
                  storeProps={""}
                  user={this.state.user}
                  callbackPackOpenTimer={this.fnCallbackRefreshTime}
                  inAppPurchaseObject={InAppPurchase2.products}
                  coinBuyAction={this.fnCanBuyCoins}
                />
              </Route>
              <Route path="/trade">
                <ProfileContainer
                  user={this.state.user}
                  profileCallback={this.fnUpdateUserInfo}
                  lastRefreshed={this.state.refreshTime}
                  tradeCallback={this.showTradeModal}
                />
                <TradeContainer user={this.state.user} />
              </Route>
              <Route exact path="/">
                <ProfileContainer
                  user={this.state.user}
                  profileCallback={this.fnUpdateUserInfo}
                  lastRefreshed={this.state.refreshTime}
                  tradeCallback={this.showTradeModal}
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
                <IonIcon
                  icon={repeat}
                  color={this.tradesExist ? "danger" : ""}
                />
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
                <IonIcon icon={ribbon} />
              </IonFabButton>
            </IonFabList>
          </IonFab>

          <IonModal
            isOpen={this.state.showTradeSetupModel}
            className={"modal-size-override"}
          >
            <TradeSetup
              otherUser={this.state.tradeUser}
              user={this.state.user}
              closePanel={this.showTradeModal}
            />
          </IonModal>

          <IonModal
            isOpen={this.state.showProfileManageModel}
            className={"modal-size-override"}
          >
            <ProfileManagerContainer
              user={this.state.user}
              closePanel={this.showProfileModal}
              signOut={this.removeUserFromStore}
              deviceInfo={this.deviceInfo}
              signInCallback={this.setUserName}
            />
          </IonModal>

          <IonModal
            isOpen={this.state.showFactorySetupModel}
            className={"modal-size-override"}
          >
            <FactoryContainer
              user={this.state.user}
              closePanel={this.showFactoryModal}
            />
          </IonModal>

          <IonModal
            isOpen={this.state.showHuntModel}
            className={"modal-size-override"}
          >
            <HuntContainer
              user={this.state.user}
              closePanel={this.showHuntModal}
            />
          </IonModal>

          <IonAlert
            isOpen={this.state.dailyLogin}
            onDidDismiss={() => {
              this.setState({ dailyLogin: false, dailyMessage: "" });
            }}
            header="Daily Login"
            message={this.state.dailyMessage}
            buttons={[
              {
                text: "Ok",
                role: "cancel",
                cssClass: "secondary",
                handler: (blah: any) => {
                  this.setState({ dailyLogin: false, dailyMessage: "" });
                },
              },
            ]}
          />

          <IonAlert
            isOpen={this.state.showCoinMessage}
            onDidDismiss={() => {
              this.setState({ showCoinMessage: false });
            }}
            header="Message"
            message={this.state.coinPurchaseMsg}
            buttons={[
              {
                text: "Ok",
                role: "cancel",
                cssClass: "secondary",
                handler: (blah: any) => {
                  this.setState({ showCoinMessage: false });
                },
              },
            ]}
          />
        </IonReactRouter>
      </IonApp>
    ) : (
      <IonApp>
        <IonContent>
          <IonGrid>
            <IonRow>
              <IonCol>
                <div style={{ height: 50 }}></div>
              </IonCol>
            </IonRow>
          </IonGrid>
          <SignInContainer
            user={this.state.user}
            signInCallback={this.setUserName}
            deviceInfo={this.deviceInfo}
          />
        </IonContent>
      </IonApp>
    );
  }

  // in app purchase stuff
  pullInApp = () => {
    callServer("loadInAppItems", "", this.state.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        if (json.length > 0) {
          const items = json;
          const regArray: Array<any> = [];
          items.forEach((item: any) => {
            regArray.push(this.registerAppStoreProduct(item.ID));
          });
          Promise.all(regArray).then((resp) => {
            InAppPurchase2.refresh();
          });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  registerAppStoreProduct = (productId: any) => {
    new Promise((resolve, reject) => {
      InAppPurchase2.register({
        id: productId,
        type: InAppPurchase2.CONSUMABLE,
      });

      InAppPurchase2.when(productId)
        .approved((p: any) => p.verify())
        .verified((p: any) => {
          let value = 0;
          if (p.id.indexOf("25k") > -1) {
            value = 25000;
          } else if (p.id.indexOf("100k") > -1) {
            value = 100000;
          } else if (p.id.indexOf("250k") > -1) {
            value = 250000;
          } else if (p.id.indexOf("500k") > -1) {
            value = 500000;
          } else if (p.id.indexOf("750k") > -1) {
            value = 750000;
          } else if (p.id.indexOf("1m") > -1) {
            value = 1000000;
          } else {
            value = 0;
          }
          callServer(
            "updateCredit",
            { credit: value },
            this.state.user.ID
          )?.then((result: any) => {
            this.setState({
              showCoinMessage: true,
              coinPurchaseMsg:
                "Thank you. Account updated by " + value + " credit",
            });
            this.fnCallbackRefreshTime(Date.now());
          });

          p.finish();
        });
      //InAppPurchase2.refresh();
      resolve(true);
    });
  };

  fnCanBuyCoins = (item: any) => {
    InAppPurchase2.order(item);
  };
}

export default withIonLifeCycle(App);
