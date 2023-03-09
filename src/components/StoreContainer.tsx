import React from "react";
import {
  IonAlert,
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
  showNoCoinAlert: boolean;
  showConfirmPurchase: boolean;
  targetItem: any;
  targetType: any;
  showCoinMessage: boolean;
  coinPurchaseMsg: any;
  isInAppLoaded: boolean;
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
      showNoCoinAlert: false,
      showConfirmPurchase: false,
      targetItem: null,
      targetType: null,
      showCoinMessage: false,
      coinPurchaseMsg: null,
      isInAppLoaded: false,
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
    //this.pullInApp();
  }

  ionViewWillEnter() {
    this.pullPacks();
    //if (!this.state.isInAppLoaded) {
    //this.pullInApp();
    //}
  }

  componentWillMount() {
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
        if (json.length > 0) {
          const items = json;
          const regArray: Array<any> = [];
          items.forEach((item: any) => {
            regArray.push(this.registerAppStoreProduct(item.ID));
          });
          Promise.all(regArray).then((resp) => {
            this.setState(
              { allCoinList: InAppPurchase2.products, isInAppLoaded: true },
              () => {
                //this.renderCoinsList();
              }
            );
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
                            this.setState({
                              showConfirmPurchase: true,
                              targetItem: p,
                              targetType: "pack",
                            });
                            //this._canBuy(p);
                          }}
                          disabled={
                            parseInt(this.props.user.credit) >= parseInt(p.Cost)
                              ? false
                              : true
                          }
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
          <IonCard key={p.title}>
            <IonCardHeader>
              <IonCardSubtitle>{p.title}</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonImg src={""} />
                  </IonCol>
                  <IonCol>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ display: "flex", flex: 2 }}>
                        {p.description}
                      </div>
                      <div
                        style={{ display: "flex", justifyItems: "flex-end" }}
                      >
                        <IonButton
                          expand="block"
                          onClick={() => {
                            this.setState({
                              showConfirmPurchase: true,
                              targetItem: p,
                              targetType: "coin",
                            });
                            //this.canBuyCoins(p.ID);
                          }}
                        >
                          {p.price} {p.currency}
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
  _canBuy = () => {
    //call server to get latest credit and see if user can buy
    if (this.state.targetItem !== null) {
      const p = this.state.targetItem;
      if (parseInt(this.props.user.credit) >= parseInt(p.Cost)) {
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
            if (json.length > 0) {
              this.renderCards(json);
              this.props.callbackPackOpenTimer(Date.now());
              this.setState({ targetItem: null, targetType: null });
            }
          })
          .catch((err: any) => {
            console.log(err);
          });
      } else {
        this.setState({ showNoCoinAlert: true });
        //warn not enough credit
      }
    }
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

        <IonAlert
          isOpen={this.state.showNoCoinAlert}
          onDidDismiss={() => {
            this.setState({ showNoCoinAlert: false });
          }}
          header="Warning"
          subHeader="Purchase Error"
          message={"You do not have enough coins to purchase."}
          buttons={[
            {
              text: "Ok",
              role: "cancel",
              cssClass: "secondary",
              handler: (blah: any) => {
                this.setState({ showNoCoinAlert: false });
              },
            },
          ]}
        />

        <IonAlert
          isOpen={this.state.showConfirmPurchase}
          onDidDismiss={() => {
            this.setState({ showConfirmPurchase: false });
          }}
          header="Confirm"
          message={"Are you sure you want to purchase?"}
          buttons={[
            {
              text: "Yes",
              role: "ok",
              cssClass: "secondary",
              handler: (blah: any) => {
                this.setState({ showConfirmPurchase: false }, () => {
                  if (this.state.targetType === "coin") {
                    this.canBuyCoins();
                  } else {
                    this._canBuy();
                  }
                });
              },
            },
            {
              text: "No",
              role: "ok",
              cssClass: "secondary",
              handler: (blah: any) => {
                this.setState({ showConfirmPurchase: false });
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
            this.props.user.ID
          )?.then((result: any) => {
            this.setState({
              targetItem: null,
              targetType: null,
              showCoinMessage: true,
              coinPurchaseMsg:
                "Thank you. Account updated by " + value + " credit",
            });
            this.props.callbackPackOpenTimer(Date.now());
          });

          p.finish();
        });
      InAppPurchase2.refresh();
      resolve(true);
    });
  };

  /*
  registerAppStoreProduct = (productId: any) => {
    new Promise((resolve, reject) => {
      InAppPurchase2.register({
        id: productId,
        type: InAppPurchase2.CONSUMABLE,
      });
      InAppPurchase2.when(productId)
        .approved((p: any) => p.verify())
        .verified((p: any) => {
          p.finish();
          this.setState({
            coinMsg: JSON.stringify(p),
          });
          resolve(true);
        });
      InAppPurchase2.refresh();
    });
  };
  */

  canBuyCoins = () => {
    const item = this.state.targetItem;
    InAppPurchase2.order(item);
  };
}

export default withIonLifeCycle(StoreContainer);
