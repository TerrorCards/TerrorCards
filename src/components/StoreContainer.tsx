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
  packSelection?: Record<string, number>;
}

let inAppControl = 0;
// store/CdvPurchase.store is a global singleton that outlives this component, so these guards
// must be module-level, not instance fields - otherwise a remount (e.g. switching tabs away and
// back) resets them and re-registers duplicate listeners on the same shared store, causing each
// purchase to be credited once per registered listener.
let iapHandlersBound = false;
let iapProductsRegistered = false;
let iapStoreInitialized = false;
let iapInitializing = false;
// guards against re-crediting a transaction the store replays before it's finished
const processedPurchaseIds = new Set<string>();
// bindStoreListeners only ever runs once (see iapHandlersBound), so its callbacks must never
// close over a specific component instance's `this` - that instance can unmount (e.g. switching
// tabs away and back) while the listener keeps firing for the lifetime of the app. Route all
// instance-specific work (setState, props) through whichever instance is currently mounted.
let activeInstance: any = null;

// shared by every path where a purchase attempt ends without ever reaching verified() (user
// cancelled the native payment sheet, receipt failed verification, etc.) - without this, the
// buy buttons stay disabled forever since isIAPActiveBuy/coinPurchaseLock are only otherwise
// cleared inside the verified() success/failure branches.
const resetPendingCoinPurchaseUI = () => {
  activeInstance?.setState({ targetItem: null, targetType: null, isIAPActiveBuy: false });
  activeInstance?.releaseCoinPurchaseLock();
};

const getPurchaseApi = () => (window as any).CdvPurchase || null;

class StoreContainer extends React.Component<props, state> {
  private packPurchaseLock = false;
  private coinPurchaseLock = false;

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
      packSelection: {},
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
    activeInstance = this;
    this.pullPacks();
    this.waitForDeviceReady();
  }

  ionViewWillEnter() {
    activeInstance = this;
    this.pullPacks();
    this.waitForDeviceReady();
  }

  componentDidUpdate(prevProps: props) {
    if (prevProps.user?.credit !== this.props.user?.credit) {
      this.reconcilePackSelections();
    }
  }

  waitForDeviceReady = () => {
    const purchaseApi = getPurchaseApi();
    if (purchaseApi?.store) {
      this.initializePurchaseStore();
      return;
    }

    const onReady = () => {
      if (getPurchaseApi()?.store) {
        this.initializePurchaseStore();
      }
    };

    if (document.readyState === "complete") {
      onReady();
      return;
    }

    document.addEventListener("deviceready", onReady, { once: true });
  };

  resolveDevicePlatform = async (): Promise<string | null> => {
    if (this.deviceInfo.platform) return this.deviceInfo.platform;

    const devicePlatform = (window as any).device?.platform;
    if (devicePlatform) {
      this.deviceInfo.platform = devicePlatform;
      return devicePlatform;
    }

    try {
      const d = await Device.getInfo();
      this.deviceInfo.platform = d?.platform || null;
      return this.deviceInfo.platform;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  getStorePlatform = () => {
    const purchaseApi = getPurchaseApi();
    if (!purchaseApi) return null;

    const platform = (this.deviceInfo.platform || (window as any).device?.platform || "android").toLowerCase();
    if (platform === "android") return purchaseApi.Platform.GOOGLE_PLAY;
    if (platform === "ios" || platform === "iphone" || platform === "ipad") {
      return purchaseApi.Platform.APPLE_APPSTORE;
    }
    return purchaseApi.Platform.GOOGLE_PLAY;
  };

  // Read the product straight off this specific transaction - never infer it by matching
  // against component state (targetItem), which can be stale/cleared by an overlapping purchase.
  // A transaction's products list can bundle the app's own receipt entry (id = bundle id, e.g.
  // "com.gisgames.terrocards") alongside the real coin SKU, so index [0] is not reliable - scan
  // every candidate and prefer the one that actually maps to a known coin pack. Receipts are
  // cumulative and append new entries at the end, so walk from the newest (last) candidate
  // backwards rather than taking the first match - repeat buys of the same pack would otherwise
  // always resolve back to the oldest purchase.
  extractVerifiedProductId = (p: any): string | null => {
    const candidates: string[] = [];

    (p?.products || []).forEach((prod: any) => {
      if (prod?.id) candidates.push(prod.id);
    });

    (p?.sourceReceipt?.transactions || []).forEach((tran: any) => {
      (tran?.products || []).forEach((prod: any) => {
        if (prod?.id) candidates.push(prod.id);
      });
    });

    for (let i = candidates.length - 1; i >= 0; i--) {
      if (this.mapProductIdToCreditValue(candidates[i]) > 0) return candidates[i];
    }
    return candidates[candidates.length - 1] || null;
  };

  // Must be unique per transaction, even for repeat purchases of the same consumable SKU.
  // Unlike purchaseId, productId is NOT safe here: it's identical across repeat buys of the
  // same pack, so using it (even as a fallback) would make the 2nd purchase look like a replay
  // of the 1st and get silently skipped without crediting.
  // "appstore.application" is a synthesized placeholder id this plugin build attaches to the
  // app's own receipt entry - it is NOT a real per-purchase transaction id. Also walk the
  // receipt from newest (last) to oldest: repeat buys of the same SKU add multiple matching
  // entries, and the one just verified is always the most recently appended, not the first.
  extractVerifiedPurchaseId = (p: any, productId: string | null): string | null => {
    const PLACEHOLDER = "appstore.application";
    const isUsable = (id: any) => !!id && id !== PLACEHOLDER;

    if (isUsable(p?.transactionId)) return p.transactionId;
    if (isUsable(p?.purchaseId)) return p.purchaseId;

    const trans = p?.sourceReceipt?.transactions || [];
    for (let i = trans.length - 1; i >= 0; i--) {
      const tran = trans[i];
      if ((tran?.products || []).some((prod: any) => prod?.id === productId) && isUsable(tran?.transactionId)) {
        return tran.transactionId;
      }
    }

    for (let i = trans.length - 1; i >= 0; i--) {
      if (isUsable(trans[i]?.transactionId)) return trans[i].transactionId;
    }

    return null;
  };

  mapProductIdToCreditValue = (productId: string | null): number => {
    if (!productId) return 0;
    if (productId.indexOf("25k") > -1) return 25000;
    if (productId.indexOf("100k") > -1) return 100000;
    if (productId.indexOf("250k") > -1) return 250000;
    if (productId.indexOf("500k") > -1) return 500000;
    if (productId.indexOf("750k") > -1) return 750000;
    if (productId.indexOf("1m") > -1) return 1000000;
    return 0;
  };

  bindStoreListeners = () => {
    const purchaseApi = getPurchaseApi();
    const store = purchaseApi?.store;
    if (!store || iapHandlersBound) return;

    store.when()
      .productUpdated(() => {
        if (activeInstance?.state.storeType === "coins") {
          activeInstance?.renderCoinsList();
        }
      })
      .approved((p: any) => {
        alert("IAP: purchase approved, verifying receipt...");
        p.verify();
      })
      .cancelled((p: any) => {
        // user dismissed the native App Store/Play Store payment sheet - approved()/verified()
        // will never fire for this transaction, so this is the only place that can release the
        // pending-purchase UI state.
        alert("IAP: purchase cancelled by user");
        if (inAppControl === 1) {
          inAppControl = 0;
          resetPendingCoinPurchaseUI();
        }
      })
      .unverified((p: any) => {
        // receipt failed native verification - also never reaches verified(), same UI-stuck risk
        alert("IAP: purchase failed verification, leaving unfinished");
        if (inAppControl === 1) {
          inAppControl = 0;
          resetPendingCoinPurchaseUI();
        }
      })
      .verified((p: any) => {
        // isActivePurchase tracks whether *this* JS session initiated the purchase, so we know
        // whether to drive the confirmation UI. It must never gate whether we credit the
        // account -- the store can replay an approved-but-unfinished transaction (app restart,
        // crash, network retry) after this flag has already reset to 0, and every verified
        // transaction represents money already taken from the user.
        const isActivePurchase = inAppControl === 1;
        if (isActivePurchase) {
          inAppControl = 0;
        }

        const productId = this.extractVerifiedProductId(p);
        const value = this.mapProductIdToCreditValue(productId);
        const rawCandidates = [
          ...(p?.products || []).map((prod: any) => prod?.id),
          ...(p?.sourceReceipt?.transactions || []).flatMap((tran: any) => (tran?.products || []).map((prod: any) => prod?.id)),
        ];
        alert("IAP: verified fired - productId=" + productId + " value=" + value + " candidates=" + JSON.stringify(rawCandidates));

        if (!productId || value === 0) {
          alert("IAP: unrecognized product, leaving transaction unfinished for retry");
          console.log("Unrecognized IAP product on verified transaction, leaving unfinished for retry", p);
          if (isActivePurchase) {
            resetPendingCoinPurchaseUI();
          }
          return; // don't finish() - that would discard the purchase without ever crediting it
        }

        const purchaseId = this.extractVerifiedPurchaseId(p, productId);
        const transIds = (p?.sourceReceipt?.transactions || []).map((tran: any) => tran?.transactionId);
        alert(
          "IAP: resolved purchaseId=" + purchaseId +
          " (p.transactionId=" + p?.transactionId +
          ", p.purchaseId=" + p?.purchaseId +
          ", receipt transactionIds=" + JSON.stringify(transIds) +
          ", p.purchaseDate=" + p?.purchaseDate +
          ", p.transactionDate=" + p?.transactionDate + ")"
        );
        if (purchaseId && processedPurchaseIds.has(purchaseId)) {
          alert("IAP: transaction already credited earlier, just finishing - " + purchaseId);
          p.finish();
          return;
        }

        // mark as processed NOW, synchronously - if a duplicate verified() fires for the same
        // transaction while this server call is still in flight, it must see this id as taken.
        // Marking it only after the server responds leaves a race window where both calls pass
        // the check above and both credit the account.
        if (purchaseId) processedPurchaseIds.add(purchaseId);

        alert("IAP: calling server to credit " + value + " (purchaseId " + purchaseId + ")");
        callServer("updateCredit", { credit: value }, activeInstance?.props.user.ID)
          ?.then((resp: any) => resp.json())
          .then((json: any) => {
            alert("IAP: server responded - " + JSON.stringify(json));
            if (json?.Status !== "Success") {
              throw new Error("Server rejected credit update: " + JSON.stringify(json));
            }

            p.finish();
            activeInstance?.props.callbackPackOpenTimer(Date.now());

            if (isActivePurchase) {
              activeInstance?.setState({
                targetItem: null,
                targetType: null,
                storeType: "pandora",
                showCoinMessage: true,
                coinPurchaseMsg: "Thank you. Account updated by " + value + " credit",
                isIAPActiveBuy: false,
              }, () => {
                activeInstance?.releaseCoinPurchaseLock();
                activeInstance?.pullPacks();
              });
            }
          })
          .catch((err: any) => {
            alert("IAP: credit update failed, purchase left unfinished - " + (err?.message || err));
            console.log(err);
            // the server call failed, so undo the synchronous mark above - allow a retry/replay to credit it
            if (purchaseId) processedPurchaseIds.delete(purchaseId);
            // leave the transaction unfinished so the store retries delivery instead of losing the purchase
            if (isActivePurchase) {
              resetPendingCoinPurchaseUI();
            }
          });
      });

    iapHandlersBound = true;
  };

  initializePurchaseStore = async () => {
    const purchaseApi = getPurchaseApi();
    const store = purchaseApi?.store;
    if (!purchaseApi || !store) return;

    // the store was already fully initialized by a prior mount of this component - don't
    // re-register listeners/re-init, just sync this (new) instance's local state from it
    if (iapStoreInitialized) {
      this.setState(
        { allCoinList: store.products, isInAppLoaded: true },
        () => {
          if (this.state.storeType === "coins") this.renderCoinsList();
        }
      );
      return;
    }

    if (iapInitializing) return;
    iapInitializing = true;

    try {
      const platformName = await this.resolveDevicePlatform();
      if (!platformName || platformName === "browser") {
        iapInitializing = false;
        return;
      }

      this.deviceInfo.platform = platformName;
      this.bindStoreListeners();

      const loadedInAppItems = await callServer("loadInAppItems", "", this.props.user.ID)?.then((resp) => resp.json());

      if (!loadedInAppItems || loadedInAppItems.length === 0) {
        alert("IAP: no in-app items loaded from server, store will not initialize");
        iapInitializing = false;
        return;
      }

      const targetPlatform = this.getStorePlatform();
      const productList = loadedInAppItems.map((item: any) => ({
        id: item.ID,
        platform: targetPlatform,
        type: purchaseApi.ProductType.CONSUMABLE,
      }));

      if (!iapProductsRegistered) {
        store.register(productList);
        iapProductsRegistered = true;
      }

      await store.initialize([targetPlatform]);
      store.ready(() => {
        iapStoreInitialized = true;
        iapInitializing = false;
        alert("IAP: store ready, product count = " + store.products.length);
        this.setState(
          {
            allCoinList: store.products,
            isInAppLoaded: true,
          },
          () => {
            if (this.state.storeType === "coins") this.renderCoinsList();
          }
        );
      });
    } catch (err) {
      alert("IAP: store initialization threw an error - " + err);
      console.log(err);
      iapInitializing = false;
    }
  };

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

  setPackQty = (packId: string, qty: number) => {
    this.setState(
      (prevState) => ({
        packSelection: { ...prevState.packSelection, [packId]: qty },
      }),
      () => this.filterPacks()
    );
  };

  // after credit changes (e.g. post-purchase), drop any pack selection that's no longer affordable
  reconcilePackSelections = () => {
    const credit = parseInt(this.props.user.credit);
    const qtyOptions = [1, 3, 5];
    const updatedSelection: Record<string, number> = { ...this.state.packSelection };
    let changed = false;

    this.state.allItemsList.forEach((p: any) => {
      const packIdStr = String(parseInt(p.ID, 10));
      const cost = parseInt(p.Cost);
      const currentQty = updatedSelection[packIdStr] || 1;
      if (credit < cost * currentQty) {
        const affordableQty = [...qtyOptions].reverse().find((q) => credit >= cost * q) || 1;
        if (affordableQty !== currentQty) {
          updatedSelection[packIdStr] = affordableQty;
          changed = true;
        }
      }
    });

    if (changed) {
      this.setState({ packSelection: updatedSelection }, () => {
        if (this.state.storeType !== "coins") this.filterPacks();
      });
    }
  };

  pullInApp = () => {
    this.initializePurchaseStore();
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
        const parsedPackId = parseInt(p.ID, 10);
        const packIdStr = String(parsedPackId);
        const packCost = parseInt(p.Cost);
        const credit = parseInt(this.props.user.credit);
        const qtyOptions = [1, 3, 5];
        const qty = this.state.packSelection?.[packIdStr] || 1;
        const totalCost = packCost * qty;
        const isPackDisabled = this.state.isPackLoading || credit < totalCost;
        if (parseInt(p.Ratio) === 1) {
          packMsg = "1 per pack";
        } else {
          if (parsedPackId !== 291) {
            packMsg = "1 in " + p.Ratio + packOddsPack;
          }
        }
        const hitPercentage = this.state.packHitIndicators[String(parsedPackId)] || 0;
        const hitIndicatorColor = this.getHitIndicatorColor(hitPercentage);
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
                      <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
                        How many packs?
                      </div>
                      <IonSegment
                        className="pack-qty-segment"
                        value={String(qty)}
                        onIonChange={(e: any) => {
                          this.setPackQty(packIdStr, parseInt(e.detail.value, 10));
                        }}
                      >
                        {qtyOptions.map((option) => (
                          <IonSegmentButton
                            key={option}
                            value={String(option)}
                            disabled={credit < packCost * option}
                          >
                            <IonLabel>{option}</IonLabel>
                          </IonSegmentButton>
                        ))}
                      </IonSegment>
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
                          {totalCost}
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
                              alert("IAP: coin purchase tapped - " + p.id);
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
  _canBuy = async () => {
    if (this.state.targetItem === null) return;

    const p = this.state.targetItem;
    const openedPackId = p.ID;
    const openedPackIdStr = String(parseInt(openedPackId, 10));
    const qty = this.state.packSelection?.[openedPackIdStr] || 1;
    const costPer = parseInt(p.Cost);

    for (let i = 0; i < qty; i++) {
      // re-check affordability before each purchase
      if (parseInt(this.props.user.credit) < costPer) {
        this.setState({ showNoCoinAlert: true });
        break;
      }

      const packOrder = {
        packID: p.ID,
        packName: p.Name,
        userID: this.props.user.ID,
        packSets: p.Set,
        packChase: p.Chase,
        packCost: p.Cost,
        packPer: p.PerPack,
      };

      try {
        const resp = await callServer("packsOrder", packOrder, this.props.user.ID);
        const json = resp ? await resp.json() : [];
        if (json.length > 0) {
          const append = i > 0;
          this.renderCards(json, append, false, i, qty);
          this.refreshPackHitIndicator(openedPackId);
          this.props.callbackPackOpenTimer(Date.now());
          if (this.state.expandedChasePanel[openedPackIdStr] && p.Chase) {
            this.fetchChaseProgress(openedPackIdStr, p.Chase);
          }
          // refresh packs and availability
          this.pullPacks();
        } else {
          break;
        }
      } catch (err: any) {
        console.log(err);
        break;
      }
    }

    this.setState({ targetItem: null, targetType: null, isPackLoading: false }, () => {
      this.releasePackPurchaseLock();
    });
  };

  renderCards = (
    cards: any,
    append: boolean = false,
    releaseLock: boolean = true,
    packIndex: number = 0,
    totalPacks: number = 1
  ) => {
    let items: Array<any> = [];
    if (totalPacks > 1) {
      items.push(
        <div key={`subtitle-${packIndex}`} style={{ fontWeight: 600, margin: "8px 0 4px" }}>
          {`Pack ${packIndex + 1} results`}
        </div>
      );
    }
    if (cards.length > 0) {
      cards.forEach((c: any, i: number) => {
        items.push(
          <IonCard key={`${packIndex}-${i}`}>
            <IonCardContent>
              <IonImg src={c.Image} />
            </IonCardContent>
          </IonCard>
        );
      });
    }

    if (append && this.state.cardsResult && this.state.cardsResult.length > 0) {
      const separator = (
        <div key={"sep-" + Date.now()} style={{ height: 1, background: "#ddd", margin: "8px 0" }} />
      );
      this.setState(
        (prevState) => ({ cardsResult: [...(prevState.cardsResult || []), separator, ...items] }),
        () => {
          this.setState({ showCards: true });
          if (releaseLock) this.releasePackPurchaseLock();
        }
      );
    } else {
      this.setState({ cardsResult: items }, () => {
        this.setState({ showCards: true });
        if (releaseLock) this.releasePackPurchaseLock();
      });
    }
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
    alert("IAP: canBuyCoins - matched " + foundProduct.length + " product(s) for " + this.state.targetItem.id);
    if (foundProduct.length > 0) {
      const offer = foundProduct[0].getOffer();
      if (!offer) {
        alert("IAP: no offer available for this product, cannot order");
      }
      inAppControl = 1;
      if (offer) {
        alert("IAP: submitting order to store...");
        offer.order();
      }
    } else {
      alert("IAP: no matching product found, purchase cannot start");
    }
  };
}

export default withIonLifeCycle(StoreContainer);
