import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonCardHeader,
  IonCard,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonModal,
  IonButton,
  IonSlides,
  IonSlide,
  IonImg,
  IonGrid,
  IonRow,
  IonCol,
  withIonLifeCycle,
} from "@ionic/react";
import "./StoreContainer.css";
import { callServer } from "./ajaxcalls";
import { InAppPurchase2 } from "@awesome-cordova-plugins/in-app-purchase-2";
import { isPlatform, getPlatforms } from "@ionic/react";
import { promises } from "fs";

interface props {
  storeProps: any;
  user: any;
  callbackPackOpenTimer: any;
}

interface state {
  allItemsList: Array<any>;
  allCoinList: Array<any>;
  packItems: Array<any>;
  storeType: string;
  showCards: boolean;
  cardsResult: Array<any>;
  packOpenTimer: number;
  coinMsg: any;
}

class StoreContainer extends React.Component<props, state> {
  constructor(props: any) {
    super(props);

    this.state = {
      allItemsList: [],
      allCoinList: [],
      packItems: [],
      storeType: "regular",
      showCards: false,
      cardsResult: [],
      packOpenTimer: 0,
      coinMsg: "",
    };
  }

  slideOpts = {
    //slidesPerView: 1,
    //spaceBetween: 0,
    initialSlide: 0,
    speed: 0,
    direction: "vertical",
    centeredSlides: true,
  };

  componentDidMount() {
    //used when in a tab nav
    this.pullPacks();
    this.pullInApp();
  }

  ionViewWillEnter() {
    this.pullPacks();
    this.pullInApp();
  }

  ionViewWillLeave() {}

  ionViewDidEnter() {}

  ionViewDidLeave() {}

  pullPacks = () => {
    callServer("packs", "", this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        console.log(json);
        if (json.length > 0) {
          this.setState({ allItemsList: json }, () => {
            this.filterPacks();
          });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  pullInApp = () => {
    callServer("loadInAppItems", "", this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        console.log(json);
        if (json.length > 0) {
          const items = json;
          const regArray: Array<any> = [];
          items.forEach((item: any) => {
            regArray.push(this.registerAppStoreProduct(item.ID));
          });
          Promise.all(regArray).then((resp) => {
            this.setState({ allCoinList: json }, () => {
              //this.renderCoinsList();
            });
          });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  filterPacks = () => {
    const allItems = [...this.state.allItemsList];
    const filtered = this.state.allItemsList.filter((pl: any) => {
      if (this.state.storeType === "pandora") {
        return pl.Discount === "1";
      } else {
        return pl.Discount === "0";
      }
    });
    console.log(filtered);
    this.renderItems(filtered, allItems);
  };

  renderItems = (filtered: any, allList: any) => {
    let items: Array<any> = [];
    if (filtered.length > 0) {
      filtered.map((p: any) => {
        const packOddsPack = parseInt(p.Ratio) > 1 ? " Packs" : " Pack";
        let packMsg = "";
        if (parseInt(p.Ratio) === 1) {
          packMsg = "1 per pack";
        } else {
          packMsg = "1 in " + p.Ratio + packOddsPack;
        }
        items.push(
          <IonCard key={p.Name}>
            <IonCardHeader>
              <IonCardSubtitle>{p.Name}</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonImg src={p.Image} />
                  </IonCol>
                  <IonCol>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", flex: 2 }}>{p.Desc}</div>
                      <p></p>
                      <div style={{ display: "flex", flex: 2 }}>{packMsg}</div>
                      <p></p>
                      <div
                        style={{
                          display: "flex",
                          flex: 2,
                          justifyItems: "flex-end",
                        }}
                      >
                        <IonButton
                          expand="block"
                          onClick={() => {
                            this._canBuy(p);
                          }}
                        >
                          {p.Cost}
                        </IonButton>
                      </div>
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        );
      });
    } else {
      items.push(
        <IonCard key={"nopacks"}>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol>
                  Make any coin purchase to see the special discounted packs
                  here.
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>
      );
    }
    this.setState({ packItems: items, allItemsList: allList });
  };

  renderCoinsList = () => {
    let items: Array<any> = [];
    if (this.state.allCoinList.length > 0) {
      this.state.allCoinList.map((p: any) => {
        items.push(
          <IonCard key={p.Name}>
            <IonCardHeader>
              <IonCardSubtitle>{p.Name}</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol>{this.state.coinMsg}</IonCol>
                </IonRow>
                <IonRow>
                  <IonCol>
                    <IonImg src={""} />
                  </IonCol>
                  <IonCol>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", flex: 2 }}>{p.Desc}</div>
                      <div
                        style={{ display: "flex", justifyItems: "flex-end" }}
                      >
                        <IonButton
                          expand="block"
                          onClick={() => {
                            this.canBuyCoins(p.ID);
                          }}
                        >
                          {p.Amount}
                        </IonButton>
                      </div>
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        );
      });
    }
    items.push(
      <IonCard key={"spaceerCoin"}>
        <IonCardContent>
          <IonGrid>
            <IonRow>
              <IonCol>
                <div style={{ height: 35 }}></div>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCardContent>
      </IonCard>
    );
    this.setState({ packItems: items });
  };

  changeStoreType = (value: string) => {
    this.setState({ storeType: value }, () => {
      if (value === "coins") {
        this.renderCoinsList();
      } else {
        this.filterPacks();
      }
    });
  };

  //Buying checks
  _canBuy = (p: any) => {
    //call server to get latest credit and see if user can buy
    //if(this.props.user.Credit >= p.Cost) {
    //call to pull packs.
    let packOrder = {
      packID: p.ID,
      packName: p.Name,
      userID: this.props.user.ID,
      packSets: p.Set,
      packChase: p.Chase,
      packCost: p.Cost,
      packPer: p.PerPack,
    };

    callServer("packsOrder", packOrder, this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        console.log(json);
        if (json.length > 0) {
          this.renderCards(json);
          this.props.callbackPackOpenTimer(Date.now());
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
    //} else {
    //warn not enough credit
    //}
  };

  renderCards = (cards: any) => {
    let items: Array<any> = [];
    if (cards.length > 0) {
      cards.map((c: any, i: number) => {
        items.push(
          <IonCard key={i}>
            <IonCardContent>
              <IonImg src={c.Image} />
            </IonCardContent>
          </IonCard>
        );
      });
    }
    this.setState({ cardsResult: items }, () => {
      this.setState({ showCards: true });
    });
  };

  _notSuspended = () => {
    //see if user is suspended, don't show anything
  };
  //end buying checks

  //pop up cards
  closeCardsPopup = () => {
    //fetch packs again in case packs have expired
    this.filterPacks();
    this.setState({ showCards: false });
  };
  //end pop up cards

  render() {
    return (
      <IonContent>
        <IonSegment
          value={this.state.storeType}
          onIonChange={(e: any) => {
            this.changeStoreType(e.detail.value);
          }}
        >
          <IonSegmentButton value="regular">
            <IonLabel>Regular</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="pandora">
            <IonLabel>Pandora</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="coins">
            <IonLabel>Coins</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        <IonList>{this.state.packItems}</IonList>

        <IonModal isOpen={this.state.showCards}>
          <IonButton fill="clear"></IonButton>
          <IonContent>{this.state.cardsResult}</IonContent>
          <IonButton
            onClick={() => {
              this.closeCardsPopup();
            }}
          >
            Close
          </IonButton>
          <IonButton fill="clear"></IonButton>
        </IonModal>
      </IonContent>
    );
  }

  //In app purchase code
  registerAppStoreProduct = (productId: any) => {
    new Promise((resolve, reject) => {
      InAppPurchase2.register({
        id: productId,
        type: InAppPurchase2.CONSUMABLE,
      });
      this.setState({
        coinMsg: JSON.stringify(InAppPurchase2.when(productId)),
      });
      InAppPurchase2.when(productId)
        .approved((p: any) => p.verify())
        .verified((p: any) => {
          p.finish();
          this.setState({ coinMsg: p.toString() });
          resolve(true);
        });
      InAppPurchase2.refresh();
    });
  };

  canBuyCoins = (item: any) => {
    InAppPurchase2.order(item).then((msg: any) => {
      this.setState({ coinMsg: msg.toString() });
    });
  };
}

export default withIonLifeCycle(StoreContainer);
