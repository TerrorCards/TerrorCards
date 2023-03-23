import React from "react";
import {
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonItem,
  IonCardHeader,
  IonCard,
  IonCardTitle,
  IonModal,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonTextarea,
  IonAlert,
  IonPopover,
  IonIcon,
  IonBadge,
  IonText,
  withIonLifeCycle,
} from "@ionic/react";
import "./TradeContainer.css";
import { callServer } from "./ajaxcalls";
import { informationCircle } from "ionicons/icons";

interface props {
  user: any;
}

interface state {
  showAlert: boolean;
  showInfoPopover: boolean;
  showOverLimitAlert: boolean;
  showFilterMenu: boolean;
  alertType: string;
  event: any;

  layoutState: any;

  step: string;
  tradeCardsList: Array<any>;
  yourCards: Array<any>;
  yourChunkList: Array<any>;
  otherCards: Array<any>;
  otherChunkList: Array<any>;
  selectionCardList: Array<any>;

  tradeStatus: string;
  filteredTradeList: Array<any>;
  tradeMessages: any;
  activeTradeID: any;
  messageText: string;
  showDetails: boolean;
  cardDetails: any;
}

class TradeContainer extends React.Component<props, state> {
  constructor(props: any) {
    super(props);

    this.state = {
      showAlert: false,
      showInfoPopover: false,
      showOverLimitAlert: false,
      showFilterMenu: false,
      alertType: "",
      event: undefined,

      layoutState: {
        layoutCount: 3,
        year: new Date().getFullYear(),
        set: "All",
        view: "needs",
        viewOptions: "owned,needs",
      },

      step: "you",
      tradeCardsList: [],
      yourCards: [],
      yourChunkList: [],
      otherCards: [],
      otherChunkList: [],
      selectionCardList: [],

      filteredTradeList: [],
      tradeStatus: "PENDING",
      tradeMessages: [],
      activeTradeID: "",
      messageText: "",
      showDetails: false,
      cardDetails: null,
    };
  }

  componentDidMount() {
    this.pullTrades(this.props.user.ID).then((result: any) => {
      this.groupTradesById(result);
    });
    //console.log("comp did mount");
  }

  ionViewWillEnter() {
    //console.log("Ion view will enter");
  }

  ionViewWillLeave() {}

  ionViewDidEnter() {
    this.pullTrades(this.props.user.ID).then((result: any) => {
      this.groupTradesById(result);
    });
    //console.log("Ion view did enter");
  }

  componentDidUpdate() {}

  ionViewDidLeave() {}

  changeTradeTab = (tab: string) => {
    this.setState({ tradeStatus: tab }, () => {
      this.pullTrades(this.props.user.ID).then((result: any) => {
        this.groupTradesById(result);
      });
    });
  };

  showAlertPrompt = (action: string, tradeID: any) => {
    this.setState({
      showAlert: true,
      alertType: action,
      activeTradeID: tradeID,
    });
  };

  closeTradeWindow = () => {};

  pullTrades = (user: string) => {
    return new Promise((resolve: any, reject: any) => {
      callServer("showTrades", this.state.tradeStatus, user)
        ?.then((resp) => {
          return resp.json();
        })
        .then((json) => {
          ////console.log(json);
          if (json.length > 0) {
            resolve(json);
          } else {
            resolve(json);
          }
        })
        .catch((err: any) => {
          console.log(err);
          resolve(err);
        });
    });
  };

  pullTradesMessages = (user: string, tradeId: string) => {
    return new Promise((resolve: any, reject: any) => {
      callServer("requestTradeMessages", tradeId, user)
        ?.then((resp) => {
          return resp.json();
        })
        .then((json) => {
          if (json.length > 0) {
            resolve(json);
          } else {
            resolve(json);
          }
        })
        .catch((err: any) => {
          console.log(err);
          resolve(err);
        });
    });
  };

  cancelTradeRequest = (user: string, tradeId: string) => {
    return new Promise((resolve: any, reject: any) => {
      callServer("cancelTrade", tradeId, user)
        ?.then((resp) => {
          return resp.json();
        })
        .then((json) => {
          if (json) {
            this.pullTrades(this.props.user.ID).then((result: any) => {
              this.groupTradesById(result);
            });
          } else {
            resolve(json);
          }
        })
        .catch((err: any) => {
          console.log(err);
          resolve(err);
        });
    });
  };

  executeTradeRequest = (user: string, tradeId: string) => {
    return new Promise((resolve: any, reject: any) => {
      callServer("executeTrade", tradeId, user)
        ?.then((resp) => {
          return resp.json();
        })
        .then((json) => {
          if (json) {
            this.pullTrades(this.props.user.ID).then((result: any) => {
              this.groupTradesById(result);
            });
          } else {
            resolve(json);
          }
        })
        .catch((err: any) => {
          console.log(err);
          resolve(err);
        });
    });
  };

  pullCardDetails = (user: string, card: any) => {
    return new Promise((resolve: any, reject: any) => {
      callServer(
        "cardDetail",
        { number: card.Number, year: card.CardYear },
        user
      )
        ?.then((resp) => {
          return resp.json();
        })
        .then((json) => {
          ////console.log(json);
          if (json) {
            resolve(json);
          } else {
            resolve(json);
          }
        })
        .catch((err: any) => {
          console.log(err);
          resolve(err);
        });
    });
  };

  groupTradesById = (array: Array<any>) => {
    const newArray = this.groupByKey(array, "TradeID");
    this.setState({ filteredTradeList: newArray }, () => {
      //console.log(this.state.filteredTradeList);
    });
  };

  groupByKey = (array: Array<any>, key: string) => {
    return array.reduce((hash, obj) => {
      if (obj[key] === undefined) return hash;
      return Object.assign(hash, {
        [obj[key]]: (hash[obj[key]] || []).concat(obj),
      });
    }, {});
  };

  render() {
    return (
      <IonContent style={{ height: "85%" }}>
        <IonSegment
          value={this.state.tradeStatus}
          onIonChange={(e: any) => {
            this.changeTradeTab(e.detail.value);
          }}
          color="dark"
        >
          <IonSegmentButton value="PENDING">
            <IonLabel>Pending</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="ACCEPTED">
            <IonLabel>Accepted</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="CANCELLED">
            <IonLabel>Cancelled</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {this.showTradeSummary()}

        <IonAlert
          isOpen={this.state.showAlert}
          onDidDismiss={() => this.closeTradeWindow()}
          cssClass="my-custom-class"
          header={"Confirm " + this.state.alertType}
          message={"Are you sure you want to " + this.state.alertType}
          buttons={[
            {
              text: "No",
              role: "cancel",
              cssClass: "secondary",
              handler: (blah: any) => {
                this.setState({ showAlert: false, alertType: "" });
              },
            },
            {
              text: "Yes",
              handler: () => {
                if (this.state.alertType === "cancel") {
                  this.cancelTradeRequest(
                    this.props.user.ID,
                    this.state.activeTradeID
                  );
                  this.setState({ showAlert: false, alertType: "" });
                } else if (this.state.alertType === "accept") {
                  this.executeTradeRequest(
                    this.props.user.ID,
                    this.state.activeTradeID
                  );
                  this.setState({ showAlert: false, alertType: "" });
                } else {
                  //error happened, just close dialog
                  this.setState({ showAlert: false, alertType: "" });
                }
              },
            },
          ]}
        />

        <IonPopover
          isOpen={this.state.showInfoPopover}
          onDidDismiss={() =>
            this.setState({ showInfoPopover: false, event: undefined })
          }
          className={"popover-message-size-height"}
        >
          <IonContent style={{ height: "100%" }}>
            <IonGrid>
              <IonRow>
                <IonCol>
                  <IonItem>
                    <IonLabel position="stacked">
                      Add a message to this trade (optional)
                    </IonLabel>
                    <IonTextarea
                      placeholder="type here"
                      rows={2}
                      value={this.state.messageText}
                      onIonChange={(e: any) => {
                        this.updateTextMessage(e);
                      }}
                    ></IonTextarea>
                    <IonButton
                      color="success"
                      expand="block"
                      onClick={() => {
                        this.sendMessage();
                      }}
                    >
                      Send Message
                    </IonButton>
                  </IonItem>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonContent style={{ height: "90%" }}>
                    {this.state.tradeMessages}
                  </IonContent>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonContent>
        </IonPopover>

        <IonModal isOpen={this.state.showDetails}>
          {this.state.cardDetails}
          <IonButton
            onClick={() =>
              this.setState({ showDetails: false, cardDetails: null })
            }
          >
            Close Details
          </IonButton>
        </IonModal>

        <IonPopover
          isOpen={this.state.showFilterMenu}
          onDidDismiss={() =>
            this.setState({ showFilterMenu: false, event: undefined })
          }
        ></IonPopover>
      </IonContent>
    );
  }

  showTradeSummary = () => {
    let tradeBlock: Array<any> = [];

    for (let key in this.state.filteredTradeList) {
      let yourItems: Array<any> = [];
      let othersItems: Array<any> = [];
      let otherLabel: string = "";

      this.state.filteredTradeList[key].forEach((card: any) => {
        ////console.log(card);
        if (card.UserID === this.props.user.ID) {
          yourItems.push(
            <div
              key={key + card.ID}
              style={{ width: "20%", position: "relative" }}
            >
              <img
                src={card.Image}
                width="100%"
                onClick={() => {
                  this.showCardetails(card);
                }}
                alt=""
              />
              {card.Count !== null && card.Count > 1 && (
                <IonBadge class="quantity-badge">{card.Count}</IonBadge>
              )}
              {card.OwnedCount !== null && card.OwnedCount > 1 && (
                <IonBadge class="quantity-owned-badge">
                  {card.OwnedCount}
                </IonBadge>
              )}
            </div>
          );
        } else {
          othersItems.push(
            <div
              key={key + card.ID}
              style={{ width: "20%", position: "relative" }}
            >
              <img
                src={card.Image}
                width="100%"
                onClick={() => {
                  this.showCardetails(card);
                }}
                alt=""
              />
              {card.Count !== null && card.Count > 1 && (
                <IonBadge class="quantity-badge">{card.Count}</IonBadge>
              )}
              {card.OwnedCount !== null && card.OwnedCount > 1 && (
                <IonBadge class="quantity-owned-badge">
                  {card.OwnedCount}
                </IonBadge>
              )}
            </div>
          );
          otherLabel = card.UserID;
        }
      });

      tradeBlock.push(
        <IonCard key={key}>
          <IonCardHeader>
            <IonCardTitle>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex" }}>Trade with {otherLabel}</div>
                <div
                  style={{
                    display: "flex",
                    fontSize: "small",
                    flexDirection: "row",
                  }}
                >
                  <div>Ends</div>
                  <div style={{ paddingLeft: 5, paddingRight: 5 }}>
                    {this.endDate(
                      this.state.filteredTradeList[key][0].TradeDate
                    )}
                  </div>
                </div>
              </div>
            </IonCardTitle>
          </IonCardHeader>
          <IonGrid key={key}>
            <IonRow>
              <IonCol class="ion-text-center">You are giving</IonCol>
            </IonRow>
            <IonRow>
              {yourItems.length <= 0 ? (
                "Invalid trade"
              ) : (
                <div style={{ display: "flex", flexDirection: "row" }}>
                  {yourItems}
                </div>
              )}
            </IonRow>
            <IonRow>
              <IonCol class="ion-text-center">
                <hr />
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol class="ion-text-center">You are receiving</IonCol>
            </IonRow>
            <IonRow>
              {othersItems.length <= 0 ? "Invalid trade" : othersItems}
            </IonRow>
            <IonRow>
              {this.state.tradeStatus === "PENDING" &&
              this.state.filteredTradeList[key][0].TradeOwner !==
                this.props.user.ID ? (
                <IonCol class="ion-text-center" size="4">
                  <IonButton
                    color="success"
                    expand="block"
                    onClick={() => {
                      this.showAlertPrompt("accept", key);
                    }}
                  >
                    Accept
                  </IonButton>
                </IonCol>
              ) : (
                <IonCol class="ion-text-center" size="4"></IonCol>
              )}
              <IonCol class="ion-text-center" size="4">
                <IonButton
                  color="medium"
                  onClick={(e: any) => {
                    e.persist();
                    this.displayTradeMessages(key);
                  }}
                >
                  <IonIcon slot="icon-only" icon={informationCircle} />
                </IonButton>
              </IonCol>
              {this.state.tradeStatus === "PENDING" ? (
                <IonCol class="ion-text-center" size="4">
                  <IonButton
                    color="danger"
                    expand="block"
                    onClick={() => {
                      this.showAlertPrompt("cancel", key);
                    }}
                  >
                    Cancel
                  </IonButton>
                </IonCol>
              ) : (
                <IonCol class="ion-text-center" size="4"></IonCol>
              )}
            </IonRow>
          </IonGrid>
        </IonCard>
      );
    }

    return tradeBlock;
  };

  displayTradeMessages = (ID: any) => {
    let msgList: Array<any> = [];
    this.pullTradesMessages(this.props.user.ID, ID).then((result: any) => {
      ////console.log(result);
      result.forEach((res: any, i: number) => {
        msgList.push(
          <IonRow key={res.ID + "-" + i}>
            <IonCol
              class={
                res.Member === this.props.user.ID
                  ? "ion-text-left"
                  : "ion-text-right"
              }
            >
              <div>{res.Message}</div>
              <div>{res.Member}</div>
            </IonCol>
          </IonRow>
        );
      });
      this.setState({
        showInfoPopover: true,
        tradeMessages: msgList,
        activeTradeID: ID,
        messageText: "",
      });
    });
  };

  sendMessage = () => {
    return new Promise((resolve: any, reject: any) => {
      callServer(
        "appendTradeMessages",
        { tradeID: this.state.activeTradeID, message: this.state.messageText },
        this.props.user.ID
      )
        ?.then((resp) => {
          return resp.json();
        })
        .then((json) => {
          if (json) {
            this.displayTradeMessages(this.state.activeTradeID);
          }
        })
        .catch((err: any) => {
          console.log(err);
          resolve(err);
        });
    });
  };

  updateTextMessage = (e: any) => {
    this.setState({ messageText: e.detail.value });
  };

  showCardetails = (card: any) => {
    this.pullCardDetails(this.props.user.ID, card).then((result: any) => {
      const details = (
        <IonGrid>
          <IonRow>
            <IonCol>
              <div style={{ height: 50 }}></div>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <img src={card.Image} width="100%" alt="" />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonText color="dark">Card Count: {result[0].count}</IonText>
            </IonCol>
            <IonCol>
              <IonText color="dark">Sold Out: {result[0].cardSoldOut}</IonText>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonText color="dark">
                Set: {card.SetName.replace(/_/g, " ")}
              </IonText>
            </IonCol>
          </IonRow>
        </IonGrid>
      );
      this.setState({ cardDetails: details, showDetails: true });
    });
  };

  endDate = (tradeDate: string) => {
    const formatDate = new Date(
      new Date(tradeDate).getTime() + 60 * 60 * 24 * 1000
    );
    const fullDateTime =
      formatDate.toLocaleDateString() + " " + formatDate.toLocaleTimeString();
    return fullDateTime;
  };
}

export default withIonLifeCycle(TradeContainer);
