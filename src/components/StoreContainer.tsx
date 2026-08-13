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
  packItems: Array<any>;
  packHitIndicators: Record<string, number>;
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
  isIAPActiveBuy: boolean;
  isPackLoading: boolean;
  expandedChasePanel: Record<string, boolean>;
  chaseProgress: Record<string, { CurrentReleaseCompletion: number; AllReleaseCompletion: number } | null>;
}

const { store, ProductType, Platform } = window.CdvPurchase;
let inAppControl = 0;

class StoreContainer extends React.Component<props, state> {
  private packPurchaseLock = false;
  private coinPurchaseLock = false;
  private iapHandlersBound = false;
  private iapProductsRegistered = false;
  private iapStoreInitialized = false;
  private iapInitializing = false;

  constructor(props: any) {
    super(props);

    this.state = {
      allItemsList: [],
      allCoinList: [],
      packItems: [],
      packHitIndicators: {},
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
      isIAPActiveBuy: false,
      isPackLoading: false,
      expandedChasePanel: {},
      chaseProgress: {},
    };
  }

  acquirePackPurchaseLock = () => {
    if (this.packPurchaseLock) return false;
    this.packPurchaseLock = true;
    return true;
  };

  releasePackPurchaseLock = () => {
    this.packPurchaseLock = false;
    if (this.state.isPackLoading) {
      this.setState({ isPackLoading: false });
    }
  };

  acquireCoinPurchaseLock = () => {
    if (this.coinPurchaseLock) return false;
    this.coinPurchaseLock = true;
    return true;
  };

  releaseCoinPurchaseLock = () => {
    this.coinPurchaseLock = false;
  };

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
      if (!d.isVirtual) {
        this.pullInApp();
      }
    });
  }

  ionViewWillEnter() {
    this.pullPacks();
    if (!this.state.isInAppLoaded && !this.iapInitializing) {
      if (this.deviceInfo.platform) {
        this.pullInApp();
      } else {
        Device.getInfo().then((d: any) => {
          this.deviceInfo.platform = d.platform;
          if (!d.isVirtual) {
            this.pullInApp();
          }
        });
      }
    }
  }

  componentWillMount() {
    //this.pullInApp();
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
        //console.log(json);
        if (json.length > 0) {
          this.setState({ allItemsList: json }, () => {
            this.refreshAllPackHitIndicators(json);
            if (this.state.storeType === "coins") {
              this.renderCoinsList();
            } else {
              this.filterPacks();
            }
          });
        } else {
          this.setState({ packHitIndicators: {} });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  normalizeHitPercentage = (value: any) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return 0;
    }
    if (parsed < 0) {
      return 0;
    }
    if (parsed > 100) {
      return 100;
    }
    return parsed;
  };

  refreshPackHitIndicator = (packId: any) => {
    const parsedPackId = parseInt(packId, 10);
    if (!parsedPackId) return;

    callServer("packsPlayer", { packId: parsedPackId }, this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        const percentage = this.normalizeHitPercentage(json?.percentage);
        this.setState(
          (prevState) => ({
            packHitIndicators: {
              ...prevState.packHitIndicators,
              [String(parsedPackId)]: percentage,
            },
          }),
          () => {
            if (this.state.storeType === "pandora") {
              this.filterPacks();
            }
          }
        );
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  refreshAllPackHitIndicators = (packs: Array<any>) => {
    if (!packs || packs.length === 0) {
      this.setState({ packHitIndicators: {} });
      return;
    }

    const indicatorRequests = packs.map((pack: any) => {
      const parsedPackId = parseInt(pack.ID, 10);
      if (!parsedPackId) return Promise.resolve(null);

      const req = callServer(
        "packsPlayer",
        { packId: parsedPackId },
        this.props.user.ID
      );
      if (!req) return Promise.resolve(null);

      return req
        .then((resp) => {
          return resp.json();
        })
        .then((json) => {
          return {
            packId: String(parsedPackId),
            percentage: this.normalizeHitPercentage(json?.percentage),
          };
        })
        .catch((err: any) => {
          console.log(err);
          return null;
        });
    });

    Promise.all(indicatorRequests).then((results) => {
      const updatedIndicators: Record<string, number> = {};
      results.forEach((entry: any) => {
        if (entry && entry.packId) {
          updatedIndicators[entry.packId] = entry.percentage;
        }
      });

      this.setState({ packHitIndicators: updatedIndicators }, () => {
        if (this.state.storeType === "pandora") {
          this.filterPacks();
        }
      });
    });
  };

  fetchChaseProgress = (packId: string, chase: string) => {
    callServer("chaseProgress", { chase: [chase] }, this.props.user.ID)
      ?.then((resp) => resp.json())
      .then((json) => {
        this.setState(
          (prevState) => ({
            chaseProgress: { ...prevState.chaseProgress, [packId]: json },
          }),
          () => this.filterPacks()
        );
      })
      .catch((err: any) => console.log(err));
  };

  toggleChasePanel = (packId: string, chase: string) => {
    const isOpen = !!this.state.expandedChasePanel[packId];
    this.setState(
      (prevState) => ({
        expandedChasePanel: { ...prevState.expandedChasePanel, [packId]: !isOpen },
      }),
      () => {
        if (!isOpen) {
          this.fetchChaseProgress(packId, chase);
        } else {
          this.filterPacks();
        }
      }
    );
  };

  getHitIndicatorColor = (percentage: number) => {
    if (percentage <= 33) {
      return "#d32f2f";
    }
    if (percentage < 66) {
      return "#f9a825";
    }
    return "#2e7d32";
  };

  pullInApp = () => {
    if (this.state.isInAppLoaded || this.iapInitializing) return;
    if (!this.deviceInfo.platform) return;

    this.iapInitializing = true;

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

          if (!this.iapProductsRegistered) {
            store.register(productList);
            this.iapProductsRegistered = true;
          }

          if (!this.iapHandlersBound) {
            store
              .when()
              .approved((p: any) => p.verify())
              .verified((p: any) => {
                let productId = null;
                if (this.deviceInfo.platform === "android") {
                  productId = p.sourceReceipt.transactions[0].products[0].id;
                } else {
                  const trans = p.sourceReceipt.transactions;
                  trans.forEach((tran: any) => {
                    if (tran.products[0].id === this.state.targetItem.id) {
                      productId = tran.products[0].id;
                    }
                  });
                }
                let value = 0;
                if (productId.indexOf("25k") > -1) {
                  value = 25000;
                } else if (productId.indexOf("100k") > -1) {
                  value = 100000;
                } else if (productId.indexOf("250k") > -1) {
                  value = 250000;
                } else if (productId.indexOf("500k") > -1) {
                  value = 500000;
                } else if (productId.indexOf("750k") > -1) {
                  value = 750000;
                } else if (productId.indexOf("1m") > -1) {
                  value = 1000000;
                } else {
                  value = 0;
                }
                if (inAppControl === 1) {
                  callServer(
                    "updateCredit",
                    { credit: value },
                    this.props.user.ID
                  )?.then((result: any) => {
                    this.setState({
                      targetItem: null,
                      targetType: null,
                      storeType: "pandora",
                      showCoinMessage: true,
                      coinPurchaseMsg:
                        "Thank you. Account updated by " + value + " credit",
                      isIAPActiveBuy: false,
                    }, () => {
                      this.releaseCoinPurchaseLock();
                      this.pullPacks();
                    });
                    this.props.callbackPackOpenTimer(Date.now());
                  }).catch((err: any) => {
                    console.log(err);
                    this.setState({
                      targetItem: null,
                      targetType: null,
                      isIAPActiveBuy: false,
                    });
                    inAppControl = 0;
                    this.releaseCoinPurchaseLock();
                  });
                  inAppControl = 0;
                }
                p.finish();
              });
            this.iapHandlersBound = true;
          }

          const setLoadedProducts = () => {
            this.setState(
              {
                allCoinList: store.products,
                isInAppLoaded: true,
              },
              () => {
                if (this.state.storeType === "coins") {
                  this.renderCoinsList();
                }
              }
            );
          };

          if (!this.iapStoreInitialized) {
            store
              .initialize([whatPlatform])
              .then(() => {
                store.ready(() => {
                  this.iapStoreInitialized = true;
                  setLoadedProducts();
                  this.iapInitializing = false;
                });
              })
              .catch((err: any) => {
                console.log(err);
                this.iapInitializing = false;
              });
          } else {
            setLoadedProducts();
            this.iapInitializing = false;
          }
        } else {
          this.iapInitializing = false;
        }
      })
      .catch((err: any) => {
        console.log(err);
        this.iapInitializing = false;
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
        const isPackDisabled =
          this.state.isPackLoading ||
          parseInt(this.props.user.credit) < parseInt(p.Cost);
        if (parseInt(p.Ratio) === 1) {
          packMsg = "1 per pack";
        } else {
          if (parseInt(p.ID, 10) !== 291) {
            packMsg = "1 in " + p.Ratio + packOddsPack;
          }
        }
        const parsedPackId = parseInt(p.ID, 10);
        const hitPercentage = this.state.packHitIndicators[String(parsedPackId)] || 0;
        const hitIndicatorColor = this.getHitIndicatorColor(hitPercentage);
        const packIdStr = String(parsedPackId);
        const isChaseOpen = !!this.state.expandedChasePanel[packIdStr];
        const chaseData = this.state.chaseProgress[packIdStr] ?? null;
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
                      <br></br>
                      {this.state.storeType === "pandora" && parsedPackId !== 291 && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <div>Hit indicator</div>
                          <div
                            style={{
                              paddingTop: 10,
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              backgroundColor: hitIndicatorColor,
                              border: "1px solid rgba(0,0,0,0.35)",
                            }}
                          ></div>
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          flex: 2,
                          justifyItems: "flex-end",
                        }}
                      >
                        <IonButton
                          expand="block"
                          className={
                            isPackDisabled
                              ? "pack-buy-btn pack-buy-btn-disabled"
                              : "pack-buy-btn"
                          }
                          onClick={() => {
                            if (!this.acquirePackPurchaseLock()) return;
                            this.setState({
                              showConfirmPurchase: true,
                              targetItem: p,
                              targetType: "pack",
                              isPackLoading: true,
                            });
                            //this._canBuy(p);
                          }}
                          disabled={isPackDisabled}
                        >
                          {p.Cost}
                        </IonButton>
                      </div>
                      {parsedPackId !== 291 && <div style={{ paddingTop: 12 }}>
                        <div
                          onClick={() => this.toggleChasePanel(packIdStr, p.Chase)}
                          style={{ cursor: "pointer", fontSize: 12, color: "#888", userSelect: "none" }}
                        >
                          {isChaseOpen ? "▲ Hide progress" : "▼ Show progress"}
                        </div>
                        {isChaseOpen && (
                          <div style={{ marginTop: 6 }}>
                            {chaseData === null ? (
                              <div style={{ fontSize: 12, color: "#aaa" }}>Loading...</div>
                            ) : (
                              <>
                                <div style={{ fontSize: 12, marginBottom: 4 }}>
                                  <div>Current release: {Math.round(chaseData.CurrentReleaseCompletion)}%</div>
                                  <div style={{ height: 6, background: "#e0e0e0", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ width: `${chaseData.CurrentReleaseCompletion}%`, height: "100%", background: "#1976d2", borderRadius: 3 }} />
                                  </div>
                                </div>
                                <div style={{ fontSize: 12 }}>
                                  <div>All releases: {Math.round(chaseData.AllReleaseCompletion)}%</div>
                                  <div style={{ height: 6, background: "#e0e0e0", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ width: `${chaseData.AllReleaseCompletion}%`, height: "100%", background: "#388e3c", borderRadius: 3 }} />
                                  </div>
                                </div>
                                {this.state.storeType !== "pandora" && <div style={{ fontSize: 10, paddingTop:10 }}>* Does not include Pandora exclusive sets (if any).</div>}
                              </>
                            )}
                          </div>
                        )}
                      </div>}
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
      if (this.state.isIAPActiveBuy) {
        items.push(
          <IonItem>
            <IonLabel>Processing, please wait </IonLabel>
            <IonSpinner></IonSpinner>
          </IonItem>
        );
      }
      this.state.allCoinList.forEach((p: any) => {
        //alert(JSON.stringify(p));
        if (p.title !== "") {
          const pricing = p.offers[0].pricingPhases[0];
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
                            disabled={this.state.isIAPActiveBuy}
                            onClick={() => {
                              if (!this.acquireCoinPurchaseLock()) return;
                              this.setState({
                                showConfirmPurchase: true,
                                targetItem: p,
                                targetType: "coin",
                                isIAPActiveBuy: true,
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
        if (this.state.isInAppLoaded) {
          this.renderCoinsList();
        } else {
          this.pullInApp();
        }
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
      const openedPackId = p.ID;
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
              this.refreshPackHitIndicator(openedPackId);
              this.props.callbackPackOpenTimer(Date.now());
              const openedPackIdStr = String(parseInt(openedPackId, 10));
              if (this.state.expandedChasePanel[openedPackIdStr] && p.Chase) {
                this.fetchChaseProgress(openedPackIdStr, p.Chase);
              }
              this.setState({ targetItem: null, targetType: null });
            } else {
              this.setState({ targetItem: null, targetType: null });
              this.releasePackPurchaseLock();
            }
          })
          .catch((err: any) => {
            console.log(err);
            this.releasePackPurchaseLock();
          });
      } else {
        this.setState({ showNoCoinAlert: true });
        this.releasePackPurchaseLock();
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
      this.releasePackPurchaseLock();
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
        <br></br>
        <br></br>
        <br></br>
        <br></br>        

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
          backdropDismiss={false}
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
                this.setState({ showConfirmPurchase: false }, () => {
                  if (this.state.targetType === "pack") {
                    this.setState({ targetItem: null, targetType: null });
                    this.releasePackPurchaseLock();
                  } else if (this.state.targetType === "coin") {
                    this.setState({
                      targetItem: null,
                      targetType: null,
                      isIAPActiveBuy: false,
                    });
                    inAppControl = 0;
                    this.releaseCoinPurchaseLock();
                  }
                });
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
    const foundProduct = this.state.allCoinList.filter((coins) => {
      return coins.id === this.state.targetItem.id;
    });
    //alert(JSON.stringify(foundProduct));
    if (foundProduct.length > 0) {
      const offer = foundProduct[0].getOffer();
      //alert("offer");
      //alert(JSON.stringify(offer));
      inAppControl = 1;
      if (offer) offer.order();
    }
  };
}

export default withIonLifeCycle(StoreContainer);
