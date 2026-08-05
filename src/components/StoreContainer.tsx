import React from "react";
import {
  IonAlert,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonCardHeader,
  IonCard,
  IonCardSubtitle,
  IonCardContent,
  IonModal,
  IonButton,
  IonImg,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonItem,
  withIonLifeCycle,
} from "@ionic/react";
import "./StoreContainer.css";
import { callServer } from "./ajaxcalls";
//import { Capacitor } from "@capacitor/core";
import "cordova-plugin-purchase/www/store";
import { Device } from "@capacitor/device";

interface props {
  storeProps: any;
  user: any;
  callbackPackOpenTimer: any;
}

interface state {
  allItemsList: Array<any>;
  allCoinList: Array<any>;
  allCoinMetaList: Array<any>;
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
  purchaseErrorMsg: string;
  showCoinMessage: boolean;
  coinPurchaseMsg: any;
  isInAppLoaded: boolean;
  isInAppInitializing: boolean;
  isIAPActiveBuy: boolean;
  isPackActiveBuy: boolean;
}

const purchaseStore = window.CdvPurchase;
const store = purchaseStore?.store;
const ProductType = purchaseStore?.ProductType;
const Platform = purchaseStore?.Platform;
let inAppControl = 0;
let isStoreRegistered = false;
let isStoreInitialized = false;
let areStoreHandlersBound = false;
let pendingVerificationKey: string | null = null;
let lastProcessedVerificationKey: string | null = null;

class StoreContainer extends React.Component<props, state> {
  packBuyLock = false;

  constructor(props: any) {
    super(props);

    this.state = {
      allItemsList: [],
      allCoinList: [],
      allCoinMetaList: [],
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
      purchaseErrorMsg: "",
      showCoinMessage: false,
      coinPurchaseMsg: null,
      isInAppLoaded: false,
      isInAppInitializing: false,
      isIAPActiveBuy: false,
      isPackActiveBuy: false,
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

  deviceInfo: any = {
    platform: null,
  };

  componentDidMount() {
    //used when in a tab nav
    this.pullPacks();
    Device.getInfo().then((d: any) => {
      this.deviceInfo.platform = d.platform;
      if (!d.isVirtual && store && ProductType && Platform) {
        this.pullInApp();
      }
    });
  }

  ionViewWillEnter() {
    this.pullPacks();
    if (!this.state.isInAppLoaded && !this.state.isInAppInitializing) {
      this.pullInApp();
    }
  }

  componentWillMount() {
    //this.pullInApp();
  }

  ionViewWillLeave() {}

  ionViewDidEnter() {}

  ionViewDidLeave() {}

  getPurchaseValue = (productId: string | null) => {
    if (!productId) {
      return 0;
    }

    const matchedProduct = this.state.allCoinMetaList.find((item: any) => {
      return item.ID === productId;
    });
    const mappedValue = parseInt(
      matchedProduct?.Credit ||
        matchedProduct?.credit ||
        matchedProduct?.Value ||
        matchedProduct?.value ||
        matchedProduct?.Amount ||
        matchedProduct?.amount ||
        matchedProduct?.Coins ||
        matchedProduct?.coins ||
        0,
      10
    );

    if (!Number.isNaN(mappedValue) && mappedValue > 0) {
      return mappedValue;
    }

    if (productId.indexOf("25k") > -1) {
      return 25000;
    }
    if (productId.indexOf("100k") > -1) {
      return 100000;
    }
    if (productId.indexOf("250k") > -1) {
      return 250000;
    }
    if (productId.indexOf("500k") > -1) {
      return 500000;
    }
    if (productId.indexOf("750k") > -1) {
      return 750000;
    }
    if (productId.indexOf("1m") > -1) {
      return 1000000;
    }

    return 0;
  };

  updateCreditBalance = async (value: number) => {
    const response = await callServer(
      "updateCredit",
      { credit: value },
      this.props.user.ID
    );

    if (!response || !response.ok) {
      throw new Error("Credit update request failed.");
    }

    let payload: any = null;

    try {
      payload = await response.json();
    } catch (err) {
      payload = null;
    }

    if (
      payload === false ||
      payload === null ||
      payload === "" ||
      payload === "Error" ||
      payload?.success === false ||
      payload?.status === "error"
    ) {
      throw new Error("Credit update was not confirmed by the server.");
    }

    return payload;
  };

  getVerifiedProductId = (purchase: any) => {
    const transactions = purchase?.sourceReceipt?.transactions || [];

    if (this.deviceInfo.platform === "android") {
      return transactions?.[0]?.products?.[0]?.id || null;
    }

    for (const transaction of transactions) {
      const transactionProductId = transaction?.products?.[0]?.id;
      if (
        transactionProductId &&
        (!this.state.targetItem || transactionProductId === this.state.targetItem.id)
      ) {
        return transactionProductId;
      }
    }

    return transactions?.[0]?.products?.[0]?.id || null;
  };

  getVerificationKey = (purchase: any) => {
    const transaction = purchase?.sourceReceipt?.transactions?.[0];

    return (
      transaction?.transactionId ||
      transaction?.purchaseToken ||
      transaction?.id ||
      purchase?.transactionId ||
      purchase?.id ||
      null
    );
  };

  bindStoreHandlers = () => {
    if (!store || areStoreHandlersBound) {
      return;
    }

    store
      .when()
      .approved((purchase: any) => purchase.verify())
      .verified((purchase: any) => {
        const verificationKey = this.getVerificationKey(purchase);
        const productId = this.getVerifiedProductId(purchase);
        const value = this.getPurchaseValue(productId);
        let shouldFinishPurchase = false;

        if (
          verificationKey &&
          (verificationKey === pendingVerificationKey ||
            verificationKey === lastProcessedVerificationKey)
        ) {
          shouldFinishPurchase = true;
          purchase.finish();
          return;
        }

        if (inAppControl !== 1 || value === 0) {
          inAppControl = 0;
          this.setState({
            isIAPActiveBuy: false,
            purchaseErrorMsg:
              value === 0
                ? "Purchase completed, but the credit amount could not be matched to this product."
                : "Purchase verification was not tied to an active coin order.",
          });
          shouldFinishPurchase = true;
          purchase.finish();
          return;
        }

        inAppControl = 0;
        pendingVerificationKey = verificationKey;

        this.updateCreditBalance(value)
          .then(() => {
            lastProcessedVerificationKey = verificationKey;
            pendingVerificationKey = null;
            shouldFinishPurchase = true;
            this.setState({
              targetItem: null,
              targetType: null,
              purchaseErrorMsg: "",
              showCoinMessage: true,
              coinPurchaseMsg:
                "Thank you. Account updated by " + value + " credit",
              isIAPActiveBuy: false,
            });
            this.props.callbackPackOpenTimer(Date.now());
          })
          .catch((err: any) => {
            pendingVerificationKey = null;
            inAppControl = 1;
            this.setState({
              isIAPActiveBuy: false,
              purchaseErrorMsg:
                "Your purchase was verified, but the app could not confirm the credit update. Please contact support before retrying.",
            });
            console.log(err);
          })
          .finally(() => {
            if (shouldFinishPurchase) {
              purchase.finish();
            }
          });
      })
      .unverified((purchase: any) => {
        inAppControl = 0;
        this.setState({
          isIAPActiveBuy: false,
          purchaseErrorMsg:
            "The purchase could not be verified. You were not credited.",
        });
        if (purchase?.finish) {
          purchase.finish();
        }
      });

    areStoreHandlersBound = true;
  };

  pullPacks = () => {
    callServer("packs", "", this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        //console.log(json);
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
    if (!store || !ProductType || !Platform || this.state.isInAppInitializing) {
      return;
    }

    this.setState({ isInAppInitializing: true });

    callServer("loadInAppItems", "", this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        if (json.length > 0) {
          const whatPlatform =
            this.deviceInfo.platform === "android"
              ? Platform.GOOGLE_PLAY
              : Platform.APPLE_APPSTORE;
          const items = json;
          const productList: any[] = [];
          items.forEach((item: any) => {
            productList.push({
              id: item.ID,
              platform: whatPlatform,
              type: ProductType.CONSUMABLE,
            });
          });
          if (!isStoreRegistered) {
            store.register(productList);
            isStoreRegistered = true;
          }

          this.bindStoreHandlers();

          const initializeStore = isStoreInitialized
            ? Promise.resolve()
            : store.initialize([whatPlatform]).then(() => {
                isStoreInitialized = true;
              });

          initializeStore.then(() => {
            store.ready(() => {
              this.setState({
                allCoinMetaList: items,
                allCoinList: [...store.products],
                isInAppLoaded: true,
                isInAppInitializing: false,
              });
            });
          });
        } else {
          this.setState({
            allCoinMetaList: [],
            allCoinList: [],
            isInAppLoaded: false,
            isInAppInitializing: false,
          });
        }
      })
      .catch((err: any) => {
        this.setState({ isInAppInitializing: false });
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
    //console.log(filtered);
    this.renderItems(filtered, allItems);
  };

  renderItems = (filtered: any, allList: any) => {
    let items: Array<any> = [];
    if (filtered.length > 0) {
      filtered.forEach((p: any) => {
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
                            this.state.isPackActiveBuy ||
                            parseInt(this.props.user.credit) < parseInt(p.Cost)
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
    if (this.state.isInAppInitializing) {
      items.push(
        <IonItem key={"coin-loading"}>
          <IonLabel>Loading purchase options</IonLabel>
          <IonSpinner></IonSpinner>
        </IonItem>
      );
    }
    if (this.state.allCoinList.length > 0) {
      if (this.state.isIAPActiveBuy) {
        items.push(
          <IonItem key={"coin-processing"}>
            <IonLabel>Processing, please wait </IonLabel>
            <IonSpinner></IonSpinner>
          </IonItem>
        );
      }
      this.state.allCoinList.forEach((p: any) => {
        const pricing = p.offers?.[0]?.pricingPhases?.[0];
        if (p.title !== "" && pricing) {
          items.push(
            <IonCard key={p.title}>
              <IonCardHeader>
                <IonCardSubtitle>{p.title}</IonCardSubtitle>
              </IonCardHeader>
              <IonCardContent>
                <IonGrid>
                  <IonRow>
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
                            disabled={
                              this.state.isIAPActiveBuy ||
                              this.state.isInAppInitializing
                            }
                            onClick={() => {
                              this.setState({
                                showConfirmPurchase: true,
                                targetItem: p,
                                targetType: "coin",
                              });

                              //alert(JSON.stringify(p));
                              //this.canBuyCoins(p.ID);
                            }}
                          >
                            {pricing.price} {pricing.currency}
                          </IonButton>
                        </div>
                      </div>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCardContent>
            </IonCard>
          );
        }
      });
    }
    if (!this.state.isInAppInitializing && this.state.allCoinList.length === 0) {
      items.push(
        <IonCard key={"noCoinOptions"}>
          <IonCardContent>
            Purchase options are not available yet. Re-open the Coins tab to
            retry.
          </IonCardContent>
        </IonCard>
      );
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

    return items;
  };

  changeStoreType = (value: string) => {
    this.setState({ storeType: value }, () => {
      if (value === "coins") {
        if (!this.state.isInAppLoaded && !this.state.isInAppInitializing) {
          this.pullInApp();
        }
      } else {
        this.filterPacks();
      }
    });
  };

  //Buying checks
  _canBuy = () => {
    if (this.packBuyLock || this.state.isPackActiveBuy) {
      return;
    }

    //call server to get latest credit and see if user can buy
    if (this.state.targetItem !== null) {
      const p = this.state.targetItem;
      if (parseInt(this.props.user.credit) >= parseInt(p.Cost)) {
        // Lock synchronously so rapid taps cannot enqueue duplicate requests
        this.packBuyLock = true;
        this.setState({ isPackActiveBuy: true });

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
          })
          .finally(() => {
            this.packBuyLock = false;
            this.setState({ isPackActiveBuy: false });
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
      cards.forEach((c: any, i: number) => {
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

        <IonList>
          {this.state.storeType === "coins"
            ? this.renderCoinsList()
            : this.state.packItems}
        </IonList>

        <IonModal
          isOpen={this.state.showCards}
          className={"modal-size-override"}
        >
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
          isOpen={this.state.purchaseErrorMsg !== ""}
          onDidDismiss={() => {
            this.setState({ purchaseErrorMsg: "" });
          }}
          header="Purchase Issue"
          message={this.state.purchaseErrorMsg}
          buttons={[
            {
              text: "Ok",
              role: "cancel",
              cssClass: "secondary",
              handler: () => {
                this.setState({ purchaseErrorMsg: "" });
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
              isIAPActiveBuy: false,
            });
            this.props.callbackPackOpenTimer(Date.now());
          });

          p.finish();
        });
      //InAppPurchase2.refresh();
      resolve(true);
    });
  };
  */

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
    /*
    const product = store.get(
      this.state.targetItem.id,
      this.deviceInfo.platform
    );
    alert("product");
    alert(JSON.stringify(product));
    const offer = product?.getOffer();
    alert("offer");
    alert(JSON.stringify(offer));
    if (offer) offer.order();
    */
    if (
      this.state.isIAPActiveBuy ||
      this.state.isInAppInitializing ||
      this.state.targetItem === null
    ) {
      return;
    }

    const foundProduct = this.state.allCoinList.filter((coins) => {
      return coins.id === this.state.targetItem.id;
    });

    if (foundProduct.length > 0) {
      const offer = foundProduct[0].getOffer?.();
      if (offer) {
        inAppControl = 1;
        this.setState({ isIAPActiveBuy: true }, () => {
          offer.order();
        });
      }
    }
  };
}

export default withIonLifeCycle(StoreContainer);
