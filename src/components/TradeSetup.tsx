import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonItem,
  IonButton,
  IonImg,
  IonGrid,
  IonRow,
  IonCol,
  IonTextarea,
  IonAlert,
  IonPopover,
  IonIcon,
  IonBadge,
  withIonLifeCycle,
} from "@ionic/react";
import "./TradeSetup.css";
import GalleryMenu from "./GalleryMenu";
import { callServer } from "./ajaxcalls";
import {
  informationCircle,
  closeCircleOutline,
  settingsOutline,
} from "ionicons/icons";

interface props {
  otherUser: string;
  user: any;
  closePanel: any;
}

interface state {
  showAlert: boolean;
  showInfoPopover: boolean;
  showOverLimitAlert: boolean;
  showFilterMenu: boolean;
  showTradeSaveResult: boolean;
  showTradeSaveResultMessage: string;
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
  tradeMessage: string;
}

class TradeSetup extends React.Component<props, state> {
  constructor(props: any) {
    super(props);

    this.state = {
      showAlert: false,
      showInfoPopover: false,
      showOverLimitAlert: false,
      showFilterMenu: false,
      showTradeSaveResult: false,
      showTradeSaveResultMessage: "",
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
      tradeMessage: "",
    };
  }

  componentDidMount() {
    this.pullCards(this.props.user.ID, this.props.otherUser).then((result) => {
      this.pullCards(this.props.otherUser, this.props.user.ID).then(
        (response) => {
          this.generateImageSelectionList();
        }
      );
    });
    console.log("comp did mount");
  }

  ionViewWillEnter() {
    console.log("Ion view will enter");
  }

  ionViewWillLeave() {}

  ionViewDidEnter() {
    this.pullCards(this.props.user.ID, this.props.otherUser).then((result) => {
      this.pullCards(this.props.otherUser, this.props.user.ID).then(
        (response) => {
          this.generateImageSelectionList();
        }
      );
    });
    console.log("Ion view did enter");
  }

  componentDidUpdate() {
    if (this.state.yourCards.length <= 0) {
      this.pullCards(this.props.user.ID, this.props.otherUser).then(
        (result) => {
          this.pullCards(this.props.otherUser, this.props.user.ID).then(
            (response) => {
              this.generateImageSelectionList();
            }
          );
        }
      );
    }
  }

  ionViewDidLeave() {}

  changeTradeTab = (tab: string) => {
    this.setState({ step: tab }, () => {
      if (tab === "you" || tab === "other") {
        this.generateImageSelectionList();
      }
    });
  };

  showAlertPrompt = (action: string) => {
    this.setState({ showAlert: true, alertType: action });
  };

  closeTradeWindow = () => {};

  pullCards = (user: string, otherParty: string) => {
    return new Promise((resolve: any, reject: any) => {
      callServer(
        "tradeSetup",
        {
          year: this.state.layoutState.year,
          category: this.state.layoutState.set,
          receiver: otherParty,
          needs: this.state.layoutState.view === "owned" ? "N" : "Y",
        },
        user
      )
        ?.then((resp) => {
          console.log(resp);
          return resp.json();
        })
        .then((json) => {
          if (json.length > 0) {
            //dataList = json;
            console.log(json);
            if (user === this.props.user.ID) {
              const chunk = this.chunkCards(json);
              const chunkWithMatchNumbers = this.matchCountNumbers(chunk, user);
              this.setState({
                yourCards: json,
                yourChunkList: chunkWithMatchNumbers,
              });
            } else {
              const chunk = this.chunkCards(json);
              const chunkWithMatchNumbers = this.matchCountNumbers(chunk, user);
              this.setState({
                otherCards: json,
                otherChunkList: chunkWithMatchNumbers,
              });
            }
            resolve(true);
          }
        })
        .catch((err: any) => {
          console.log(err);
          resolve(err);
        });
    });
  };

  sendTradeToServer = () => {
    if (this.state.tradeCardsList.length > 0) {
      let yourList: Array<any> = [];
      let otherList: Array<any> = [];
      this.state.tradeCardsList.forEach((cl: any) => {
        if (cl.UserID === this.props.user.ID) {
          yourList.push(cl.ID + "_" + cl.Card_Year + "_" + cl.Count);
        } else {
          otherList.push(cl.ID + "_" + cl.Card_Year + "_" + cl.Count);
        }
      });
      console.log(this.state.tradeMessage);
      callServer(
        "saveTrade",
        {
          uContent1: { cards: yourList.join(","), userId: this.props.user.ID },
          uContent2: {
            cards: otherList.join(","),
            userId: this.props.otherUser,
          },
          msg: this.state.tradeMessage,
        },
        this.props.user.ID
      )
        ?.then((resp) => {
          console.log(resp);
          return resp.json();
        })
        .then((json) => {
          if (json === "Saved") {
            console.log(json);
            this.setState({ showAlert: false, alertType: "" }, () => {
              this.setState({
                showTradeSaveResult: true,
                showTradeSaveResultMessage:
                  "Trade saved. Other party has 24 hours to respond.",
              });
            });
          } else {
            this.setState({ showAlert: false, alertType: "" }, () => {
              this.setState({
                showTradeSaveResult: true,
                showTradeSaveResultMessage: json,
              });
            });
          }
        });
    }
  };

  //Functions to do chunking of data
  chunkCards = (array: Array<any>) => {
    const localList = [...array];
    let chunkList: Array<any> = [];
    if (localList.length > 0) {
      chunkList = this.chunk(localList, this.state.layoutState.layoutCount);
    }
    return chunkList;
  };

  chunk = (array: Array<any>, size: number) => {
    const temparray = [];
    const chunk = size;
    let i, j;
    for (i = 0, j = array.length; i < j; i += chunk) {
      temparray.push(array.slice(i, i + chunk));
    }
    return temparray;
  };
  //End chunking functions

  render() {
    let content: any = "";
    if (this.state.step === "you" || this.state.step === "other") {
      content = this.showCardSelection(this.state.step);
    } else {
      content = this.showTradeSummary();
    }

    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonItem>
              <IonLabel>Trade Setup</IonLabel>
              <IonLabel>
                <div style={{ textAlign: "end" }}>
                  <IonButton
                    fill="clear"
                    onClick={(e: any) => {
                      this.resetParameter();
                    }}
                  >
                    <IonIcon
                      slot="icon-only"
                      icon={closeCircleOutline}
                      color="dark"
                      size="l"
                    />
                  </IonButton>
                </div>
              </IonLabel>
            </IonItem>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonSegment
            value={this.state.step}
            onIonChange={(e: any) => {
              this.changeTradeTab(e.detail.value);
            }}
            color="dark"
          >
            <IonSegmentButton value="you">
              <IonLabel>Give</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="other">
              <IonLabel>Receive</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="summary">
              <IonLabel>Summary</IonLabel>
            </IonSegmentButton>
          </IonSegment>

          {content}

          <IonAlert
            isOpen={this.state.showAlert}
            onDidDismiss={() => this.closeTradeWindow()}
            header={"Confirm " + this.state.alertType}
            message={"Are you sure you want to " + this.state.alertType}
            buttons={[
              {
                text: "No",
                role: "cancel",
                cssClass: "secondary",
                handler: (blah: any) => {
                  console.log("Confirm Cancel: blah");
                  this.setState({ showAlert: false, alertType: "" });
                },
              },
              {
                text: "Yes",
                handler: () => {
                  console.log("Confirm Okay");
                  if (this.state.alertType === "submit") {
                    this.sendTradeToServer();
                  } else {
                    this.props.closePanel();
                  }
                },
              },
            ]}
          />

          <IonAlert
            isOpen={this.state.showOverLimitAlert}
            onDidDismiss={() => this.setState({ showOverLimitAlert: false })}
            header={"Alert"}
            message={"Sorry, only up to 5 cards can be traded in 1 trade."}
            buttons={[
              {
                text: "Dismiss",
                role: "cancel",
                cssClass: "secondary",
                handler: (blah: any) => {
                  this.setState({ showOverLimitAlert: false });
                },
              },
            ]}
          />

          <IonAlert
            isOpen={this.state.showTradeSaveResult}
            onDidDismiss={() => this.setState({ showTradeSaveResult: false })}
            header={"Alert"}
            message={this.state.showTradeSaveResultMessage}
            buttons={[
              {
                text: "Dismiss",
                role: "cancel",
                cssClass: "secondary",
                handler: (blah: any) => {
                  this.setState({ showTradeSaveResult: false }, () => {
                    this.props.closePanel();
                  });
                },
              },
            ]}
          />

          <IonPopover
            isOpen={this.state.showInfoPopover}
            onDidDismiss={() =>
              this.setState({ showInfoPopover: false, event: undefined })
            }
          >
            <IonLabel position="stacked">
              Once a trade is submitted. The other party will have 24 hours to
              accept, otherwise the trade will expire.
              <br />
            </IonLabel>
            <IonLabel position="stacked">
              If any of the cards in this trade are exchanged in a different
              trade, this trade will automatically get cancelled.
            </IonLabel>
          </IonPopover>

          <IonPopover
            isOpen={this.state.showFilterMenu}
            onDidDismiss={() =>
              this.setState({ showFilterMenu: false, event: undefined })
            }
            className={"popover-message-size"}
          >
            <GalleryMenu
              layoutAction={this.processCardListFilters}
              layoutProps={this.state.layoutState}
              user={this.props.user}
              type={"cards"}
            />
          </IonPopover>
        </IonContent>
      </IonPage>
    );
  }

  processCardListFilters = (type: any, value: any) => {
    let localObj = { ...this.state.layoutState };
    for (let key in localObj) {
      if (key === type) {
        localObj[key] = value;
      }
    }
    this.setState({ layoutState: type }, () => {
      this.pullCards(this.props.user.ID, this.props.otherUser).then(
        (result) => {
          this.pullCards(this.props.otherUser, this.props.user.ID).then(
            (response) => {
              //todo (decrease what is already in the trade panel in new fetched cards)

              this.generateImageSelectionList();
            }
          );
        }
      );
    });
  };

  showTradeSummary = () => {
    let yourItems: Array<any> = [];
    let othersItems: Array<any> = [];
    let disabled: boolean = true;
    yourItems = this.generateSummaryItems("you");
    othersItems = this.generateSummaryItems("other");

    if (yourItems.length > 0 && othersItems.length > 0) {
      disabled = false;
    }

    return (
      <IonGrid>
        <IonRow>
          <IonCol class="ion-text-center">
            You are giving to {this.props.otherUser}
          </IonCol>
        </IonRow>
        <IonRow>{yourItems.length <= 0 ? "Invalid trade" : yourItems}</IonRow>
        <IonRow>
          <IonCol class="ion-text-center">
            <hr />
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol class="ion-text-center">
            You are receiving from {this.props.otherUser}
          </IonCol>
        </IonRow>
        <IonRow>
          {othersItems.length <= 0 ? "Invalid trade" : othersItems}
        </IonRow>
        <IonRow>
          <IonCol>
            <IonItem>
              <IonLabel position="stacked">
                Add a message to this trade (optional)
              </IonLabel>
              <IonTextarea
                placeholder="type here"
                rows={5}
                value={this.state.tradeMessage}
                onIonChange={(e: any) => {
                  this.setState({ tradeMessage: e.currentTarget.value });
                }}
              ></IonTextarea>
            </IonItem>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol class="ion-text-center" size="4">
            <IonButton
              disabled={disabled}
              color="success"
              expand="block"
              onClick={() => {
                this.showAlertPrompt("submit");
              }}
            >
              Submit
            </IonButton>
          </IonCol>
          <IonCol class="ion-text-center" size="4">
            <IonButton
              color="medium"
              onClick={(e: any) => {
                e.persist();
                this.setState({ showInfoPopover: true, event: e });
              }}
            >
              <IonIcon slot="icon-only" icon={informationCircle} />
            </IonButton>
          </IonCol>
          <IonCol class="ion-text-center" size="4">
            <IonButton
              color="danger"
              expand="block"
              onClick={() => {
                this.showAlertPrompt("cancel");
              }}
            >
              Cancel
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    );
  };

  generateImageSelectionList = () => {
    let personList = [];
    if (this.state.step === "you") {
      personList = this.state.yourChunkList;
    } else {
      personList = this.state.otherChunkList;
    }
    const list: Array<any> = [];
    personList.forEach((ch: any, i: number) => {
      const item: Array<any> = [];
      ch.forEach((c: any, z: number) => {
        let imgSrc = c.Image;
        let message = c.Active === "0" ? "Sold Out" : "";
        const cardWidth = 100 / this.state.layoutState.layoutCount - 1;
        if (this.state.layoutState.layoutCount > 2) {
          imgSrc = imgSrc.replace("full", "thumbs");
        }
        if (this.state.layoutState.layoutCount > 3) {
          if (message === "Sold Out") {
            message = "S.O.";
          }
        }
        item.push(
          <div
            key={c.ID}
            style={{
              width: cardWidth + "%",
              position: "relative",
              margin: "auto",
            }}
          >
            <IonImg
              src={imgSrc}
              class={c.UserID === null ? "need-card-alpha" : ""}
              onClick={() => {
                this.showCardetails(c);
              }}
            ></IonImg>
            <div className="trade-button-add">
              <IonButton
                strong={true}
                class="trade-button-add"
                size="small"
                color={c.Count <= 0 ? "danger" : "success"}
                disabled={c.Count <= 0 ? true : false}
                onClick={() => {
                  this.addToTradeList(c, this.state.step);
                }}
              >
                +
              </IonButton>
            </div>
            {c.Count !== null && c.Count > 1 && (
              <IonBadge class="quantity-badge">{c.Count}</IonBadge>
            )}
            {<IonBadge class="message-badge-left">{message}</IonBadge>}
          </div>
        );
        if (i === personList.length - 1) {
          if (ch.length < this.state.layoutState.layoutCount) {
            const remainder = this.state.layoutState.layoutCount - ch.length;
            for (let a = 0; a < remainder; a++) {
              item.push(
                <div
                  key={a + "_" + z}
                  style={{
                    display: "flex",
                    width: cardWidth + "%",
                    margin: "auto",
                  }}
                ></div>
              );
            }
          }
        }
      });
      list.push(
        <div key={i} style={{ display: "flex", flexDirection: "row" }}>
          {item}
        </div>
      );
    });
    this.setState({ selectionCardList: list });
  };

  addToTradeList = (card: any, person: string) => {
    //search trade list to see if already exist and increment
    let user = this.props.user.ID;
    if (person === "other") {
      user = this.props.otherUser;
    }

    let local = [...this.state.tradeCardsList];
    if (local.length > 0) {
      let found = false;
      local.forEach((lc: any) => {
        if (lc.ID === card.ID) {
          found = true;
          lc.Count = lc.Count + 1;
        }
      });
      if (!found) {
        const filterByPerson = local.filter((lp: any) => {
          return lp.UserID === user;
        });
        if (filterByPerson.length < 5) {
          let localCard = { ...card };
          localCard.Count = 1;
          local.push(localCard);
        } else {
          this.setState({ showOverLimitAlert: true });
        }
      }
    } else {
      const filterByPerson = local.filter((lp: any) => {
        return lp.UserID === user;
      });
      if (filterByPerson.length < 5) {
        let localCard = { ...card };
        localCard.Count = 1;
        local.push(localCard);
      } else {
        this.setState({ showOverLimitAlert: true });
      }
    }
    //in selection list, decrease count and if zero, add button should be disabled on next render
    let playerList = null;
    if (person === "you") {
      playerList = [...this.state.yourChunkList];
    } else {
      playerList = [...this.state.otherChunkList];
    }
    if (playerList !== null) {
      playerList.forEach((pl: any) => {
        pl.forEach((p: any) => {
          if (card.ID === p.ID) {
            p.Count = p.Count - 1;
          }
        });
      });
    }

    if (person === "you") {
      this.setState(
        { tradeCardsList: local, yourChunkList: playerList },
        () => {
          this.generateImageSelectionList();
        }
      );
    } else {
      this.setState(
        { tradeCardsList: local, otherChunkList: playerList },
        () => {
          this.generateImageSelectionList();
        }
      );
    }

    //need another function to check and adjust selection list if criteria for selection list changes.
  };

  removeFromTrade = (card: any, person: string) => {
    let local = [...this.state.tradeCardsList];
    let found = -1;
    if (local.length > 0) {
      //if it's over 1, just decrease, otherwise, remove it
      local.forEach((lc: any, i: number) => {
        if (lc.ID === card.ID) {
          if (lc.Count > 1) {
            lc.Count = lc.Count - 1;
          } else {
            found = i;
          }
        }
      });
      if (found !== -1) {
        local.splice(found, 1);
      }
      //add back to the player list
      let playerList = null;
      if (this.state.step === "you") {
        playerList = [...this.state.yourChunkList];
      } else {
        playerList = [...this.state.otherChunkList];
      }
      if (playerList !== null) {
        playerList.forEach((pl: any) => {
          pl.forEach((p: any) => {
            if (card.ID === p.ID) {
              p.Count = p.Count + 1;
            }
          });
        });
      }

      if (this.state.step === "you") {
        this.setState(
          { tradeCardsList: local, yourChunkList: playerList },
          () => {
            this.generateImageSelectionList();
          }
        );
      } else {
        this.setState(
          { tradeCardsList: local, otherChunkList: playerList },
          () => {
            this.generateImageSelectionList();
          }
        );
      }
    }
  };

  showCardSelection = (person: string) => {
    let message = "";
    let itemsList = [];
    if (person === "you") {
      message = "You are giving to " + this.props.otherUser;
    } else {
      message = "You are receiving " + this.props.otherUser;
    }
    itemsList = this.generateTradeItemCol(this.state.step);
    return (
      <React.Fragment>
        <IonGrid>
          <IonRow>
            <IonCol class="ion-text-center">{message}</IonCol>
          </IonRow>
          <IonRow>{itemsList}</IonRow>
          <IonRow>
            <IonCol size="10" class="ion-text-left ion-align-items-center">
              <IonItem>{"Select cards below"}</IonItem>
            </IonCol>
            <IonCol size="2" class="ion-text-center">
              <IonButton
                fill="clear"
                onClick={(e: any) => {
                  this.setState({ showFilterMenu: true, event: e });
                }}
              >
                <IonIcon slot="end" icon={settingsOutline} color="dark" />
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        <div style={{ height: "70%", overflowY: "auto" }}>
          {this.state.selectionCardList}
        </div>
      </React.Fragment>
    );
  };

  generateTradeItemCol = (person: string) => {
    let filtered: Array<any> = [];
    let itemsList = [];
    filtered = this.state.tradeCardsList.filter((cl: any) => {
      if (person === "you") {
        return cl.UserID === this.props.user.ID;
      } else {
        return cl.UserID !== this.props.user.ID;
      }
    });
    if (filtered.length > 0) {
      for (let i = 0; i < 5; i++) {
        if (filtered[i]) {
          itemsList.push(
            <IonCol class="ion-text-center" key={i}>
              <img src={filtered[i].Image} alt="" />
              <IonButton
                className="trade-button-remove"
                size="small"
                color="danger"
                onClick={() => {
                  this.removeFromTrade(filtered[i], this.state.step);
                }}
              >
                x
              </IonButton>
              {filtered[i].Count !== null && filtered[i].Count > 1 && (
                <IonBadge class="quantity-badge">{filtered[i].Count}</IonBadge>
              )}
            </IonCol>
          );
        } else {
          itemsList.push(
            <IonCol class="ion-text-center" key={i}>
              <img
                src="http://TerrorCards.com/images/banners/waitSmall.png"
                alt=""
              />
            </IonCol>
          );
        }
      }
    } else {
      for (let i = 0; i < 5; i++) {
        itemsList.push(
          <IonCol class="ion-text-center" key={i}>
            <img
              src="http://TerrorCards.com/images/banners/waitSmall.png"
              alt=""
            />
          </IonCol>
        );
      }
    }

    return itemsList;
  };

  generateSummaryItems = (person: string) => {
    let filtered: Array<any> = [];
    let itemsList = [];
    if (this.state.tradeCardsList.length > 0) {
      filtered = this.state.tradeCardsList.filter((cl: any) => {
        if (person === "you") {
          return cl.UserID === this.props.user.ID;
        } else {
          return cl.UserID !== this.props.user.ID;
        }
      });
      if (filtered.length > 0) {
        for (let i = 0; i < 5; i++) {
          if (filtered[i]) {
            itemsList.push(
              <IonCol class="ion-text-center" key={i}>
                <img src={filtered[i].Image} style={{ width: 75 }} alt="" />
                <IonButton
                  className="trade-button-remove"
                  size="small"
                  color="danger"
                  onClick={() => {
                    this.removeFromTrade(filtered[i], this.state.step);
                  }}
                >
                  x
                </IonButton>
                {filtered[i].Count !== null && filtered[i].Count > 1 && (
                  <IonBadge class="quantity-badge">
                    {filtered[i].Count}
                  </IonBadge>
                )}
              </IonCol>
            );
          } else {
            itemsList.push(<IonCol class="ion-text-center" key={i}></IonCol>);
          }
        }
      }
    }
    return itemsList;
  };

  showCardetails = (card: any) => {
    return (
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
          <IonCol>Card Count</IonCol>
          <IonCol>Sold Out?</IonCol>
        </IonRow>
        <IonRow>
          <IonCol>Type:</IonCol>
          <IonCol>Set:</IonCol>
        </IonRow>
      </IonGrid>
    );
    //this.setState({cardDetails:details, showDetails:true})
  };

  matchCountNumbers = (list: any, player: string) => {
    let localPlayerList = [...list];
    if (localPlayerList.length > 0) {
      let local = [...this.state.tradeCardsList];
      if (local.length > 0) {
        let filtered = local.filter((lc: any) => {
          return lc.UserID === player;
        });
        if (filtered.length > 0) {
          localPlayerList.forEach((pl: any) => {
            pl.forEach((p: any) => {
              filtered.forEach((f: any) => {
                if (f.ID === p.ID) {
                  p.Count = p.Count - f.Count;
                }
              });
            });
          });
        }
      }
    }
    return localPlayerList;
  };

  resetParameter = () => {
    this.setState(
      {
        step: "you",
        tradeCardsList: [],
        yourCards: [],
        yourChunkList: [],
        otherCards: [],
        otherChunkList: [],
        selectionCardList: [],
      },
      () => {
        this.props.closePanel();
      }
    );
  };
}

export default withIonLifeCycle(TradeSetup);
