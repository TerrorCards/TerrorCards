import React from "react";
import {
  withIonLifeCycle,
  IonContent,
  IonCol,
  IonRow,
  IonGrid,
  IonCard,
  IonCardContent,
  IonItem,
  IonIcon,
  IonLabel,
  IonButton,
  IonList,
  IonAvatar,
  IonImg,
  IonSearchbar,
  IonPopover,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonTextarea,
  IonLoading,
  IonAlert,
} from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  listCircle,
  create,
  refresh,
  repeat,
  personAdd,
  flag,
  closeCircle,
  newspaper,
  chatbubble,
  statsChartOutline,
} from "ionicons/icons";
import "./HomeContainer.css";
import "swiper/css";
import "@ionic/react/css/ionic-swiper.css";
import StatsContainer from "./StatsContainer";
import NewsContainer from "./NewsContainer";
import { callServer } from "./ajaxcalls";

interface props {
  galleryProps: any;
  user: any;
  tradeCallback: any;
}

interface state {
  msg: Array<any>;
  controlList: Array<any>;
  value: string;
  showPopover: boolean;
  showNewMsg: boolean;
  showAlert: boolean;
  alertMsg: string;
  showError: boolean;
  event: any;
  newBannerState: Array<any>;
  viewState: string;
  showTradeSetupModel: boolean;
  tradePartner: string;
  txtMessage: string;
  showPlayerInfoAlert: boolean;
  otherPlayerInfo: any;
}

const slideOpts = {
  initialSlide: 0,
  speed: 400,
};

class HomeContainer extends React.Component<props, state> {
  constructor(props: any) {
    super(props);

    this.state = {
      msg: [],
      controlList: [],
      value: "",
      showPopover: false,
      showNewMsg: false,
      showAlert: false,
      alertMsg: "",
      showError: false,
      event: null,
      newBannerState: [],
      viewState: "Stats",
      showTradeSetupModel: false,
      tradePartner: "",
      txtMessage: "",
      showPlayerInfoAlert: false,
      otherPlayerInfo: null,
    };
  }

  componentDidMount() {
    this.pullMessages();
    this.pullNewsBanner();
    //console.log("ionViewDidEnter event fired");
  }

  componentDidUpdate(prevProps: any) {}

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

  viewHeight = (offset: number) => {
    return window.innerHeight / offset;
  };

  //BEGIN BANNER CODE
  pullNewsBanner = () => {
    callServer("fetchNewsBanner", "", this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        //console.log(json);
        if (json.length > 0) {
          this.setState({ newBannerState: json });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  //END BANNER CODE

  //BEGIN MESSAGE FUNCTIONS
  pullMessages = () => {
    callServer("messagesFull", "Trade", this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        //console.log(json);
        if (json.length > 0) {
          let msgList: Array<any> = [];
          json.forEach((j: any, i: number) => {
            msgList.push(this.renderMsgItem(j, i));
          });
          this.setState({ msg: msgList, controlList: json, showError: false });
        }
      })
      .catch((err: any) => {
        this.setState({ showError: true });
        console.log(err);
      });
  };

  postMessage = (value: string) => {
    callServer("appendBoardMessages", { message: value }, this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        //console.log(json);
        if (json) {
          this.setState(
            { showNewMsg: false, event: undefined, txtMessage: "" },
            () => {
              this.pullMessages();
            }
          );
        }
      })
      .catch((err: any) => {
        this.setState({ showError: true });
        console.log(err);
      });
  };

  queryPlayerInfo = (player: any) => {
    callServer("queryUser", { player: player }, this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        const text = "Wax: " + json.Wallet + "<br><br>Bio: " + json.Description;
        this.setState({
          showPlayerInfoAlert: true,
          otherPlayerInfo: text,
        });
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  addFriend = (user: any) => {
    callServer("addFriend", { friend: user }, this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        this.setState({
          showAlert: true,
          alertMsg: user + " has been added to your friends list.",
        });
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  flagPost = (user: any) => {
    callServer("flagComment", { id: user, area: "Message" }, this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        //console.log(json);
        if (json.length > 0) {
          this.setState({
            showAlert: true,
            alertMsg: "Post has been flagged and sent to Administrator",
          });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  blockPlayer = (user: any) => {
    callServer("insertBlockPlayer", { block: user }, this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        //console.log(json);
        if (json.length > 0) {
          this.setState(
            { showAlert: true, alertMsg: "You have blocked " + user },
            () => {
              this.pullMessages();
            }
          );
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  renderMsgItem = (j: any, i: number) => {
    return (
      <IonCard key={j.ID + i}>
        <IonItemSliding>
          <IonItem>
            <IonAvatar slot="start">
              <IonImg src={j.Image} />
            </IonAvatar>
            <IonLabel>
              <div>{j.ID}</div>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ fontSize: "smaller" }}>({j.Rating})</div>
              </div>
            </IonLabel>
            <IonIcon
              icon={listCircle}
              onClick={(e: any) => {
                if (j.ID !== this.props.user.ID) {
                  e.persist();
                  this.setState({
                    showPopover: true,
                    event: e,
                    tradePartner: j.ID,
                  });
                }
              }}
            />
          </IonItem>
          {j.ID !== this.props.user.ID && (
            <IonItemOptions side="start">
              <IonItemOption
                color="dark"
                onClick={() => {
                  this.sendTradeCallback(j.ID);
                }}
              >
                Trade
              </IonItemOption>
            </IonItemOptions>
          )}
          <IonItemOptions side="end">
            <IonItemOption
              color="dark"
              onClick={() => {
                this.queryPlayerInfo(j.ID);
              }}
            >
              Info
            </IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
        <IonCardContent>
          <div dangerouslySetInnerHTML={{ __html: j.Text }}></div>
        </IonCardContent>
      </IonCard>
    );
  };

  searchMessages = (value: string) => {
    if (value !== "") {
      let filtered = this.state.controlList.filter((cl: any) => {
        return cl.Text.indexOf(value) > 0;
      });
      let msgItem: any = [];
      filtered.forEach((j: any, i: number) => {
        msgItem.push(this.renderMsgItem(j, i));
      });
      this.setState({ msg: msgItem });
    } else {
      let msgItem: any = [];
      this.state.controlList.forEach((j: any, i: number) => {
        msgItem.push(this.renderMsgItem(j, i));
      });
      this.setState({ msg: msgItem });
    }
    this.setState({ value: value });
  };
  //END MESSAGE FUNCTIONS

  showPanel = (panel: string) => {
    switch (panel) {
      case "Post": {
        this.pullMessages();
        this.setState({ viewState: "Post" });
        break;
      }
      case "News": {
        this.pullMessages();
        this.setState({ viewState: "News" });
        break;
      }
      case "Stats": {
        this.setState({ viewState: "Stats" });
        break;
      }
      default:
        break;
    }
  };

  sendTradeCallback = (tradePartner: any) => {
    this.props.tradeCallback(tradePartner);
  };

  /*
          <IonCol>
            <IonButton color={(this.state.viewState === 'Stats')?'danger':'dark'}  expand="full" size='small' onClick={()=>{this.showPanel('Stats')}}>Stats <IonIcon  slot="end" icon={statsChart}  color="light" /></IonButton>          
          </IonCol> 
*/
  render() {
    return (
      <IonContent>
        {this.state.newBannerState.length > 0 && (
          <Swiper pager={true} options={slideOpts}>
            <SwiperSlide>
              <img
                src={this.state.newBannerState[0].Banner}
                width="100%"
                alt="banner 1"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src={this.state.newBannerState[1].Banner}
                width="100%"
                alt="banner 2"
              />
            </SwiperSlide>
            <SwiperSlide>
              <img
                src={this.state.newBannerState[2].Banner}
                width="100%"
                alt="banner 3"
              />
            </SwiperSlide>
          </Swiper>
        )}

        <IonGrid>
          <IonRow>
            <IonCol>
              <IonButton
                color={this.state.viewState === "Stats" ? "danger" : "dark"}
                expand="full"
                size="small"
                onClick={() => {
                  this.showPanel("Stats");
                }}
              >
                <IonIcon slot="start" icon={statsChartOutline} color="light" />{" "}
                Stats
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                color={this.state.viewState === "Post" ? "danger" : "dark"}
                expand="full"
                size="small"
                onClick={() => {
                  this.showPanel("Post");
                }}
              >
                <IonIcon slot="start" icon={chatbubble} color="light" /> Posts
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                color={this.state.viewState === "News" ? "danger" : "dark"}
                expand="full"
                size="small"
                onClick={() => {
                  this.showPanel("News");
                }}
              >
                <IonIcon slot="start" icon={newspaper} color="light" />
                News
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        {this.state.viewState === "Post" && (
          <IonItem color="light">
            <IonButton
              fill="clear"
              expand="full"
              size="default"
              onClick={() => {
                this.pullMessages();
              }}
            >
              <IonIcon slot="icon-only" icon={refresh} color="dark" />
            </IonButton>
            <IonSearchbar
              value={this.state.value}
              onIonChange={(e: any) => {
                this.searchMessages(e.detail.value);
              }}
              placeholder="Search Post"
            ></IonSearchbar>
            <IonButton
              fill="clear"
              expand="full"
              size="default"
              onClick={(e: any) => {
                this.setState({ showNewMsg: true, event: e });
              }}
            >
              <IonIcon slot="icon-only" icon={create} color="dark" />
            </IonButton>
          </IonItem>
        )}
        {this.state.viewState === "Post" && (
          <div
            style={{
              height:
                this.state.msg.length > 0
                  ? this.viewHeight(1.65)
                  : this.viewHeight(1.5),
              overflowY: "auto",
              backgroundColor: "#333",
            }}
          >
            {this.state.showError ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#ffffff",
                  fontSize: "larger",
                }}
              >
                System error, please try again later.
              </div>
            ) : this.state.msg.length > 0 ? (
              this.state.msg
            ) : (
              <IonLoading
                cssClass="my-custom-class"
                isOpen={true}
                onDidDismiss={() => console.log("loading")}
                message={"Loading, please wait..."}
                duration={30000}
              />
            )}
          </div>
        )}
        {this.state.viewState === "News" && (
          <div
            style={{
              height: this.viewHeight(1.1),
              overflowY: "auto",
              backgroundColor: "#333",
            }}
          >
            <NewsContainer name="news"></NewsContainer>
          </div>
        )}
        {this.state.viewState === "Stats" && (
          <div
            style={{
              height: this.viewHeight(1.55),
              overflowY: "auto",
              backgroundColor: "#333",
            }}
          >
            <StatsContainer
              user={this.props.user}
              tradeSetup={this.sendTradeCallback}
            ></StatsContainer>
          </div>
        )}

        <IonPopover
          event={this.state.event}
          isOpen={this.state.showPopover}
          onDidDismiss={() =>
            this.setState({ showPopover: false, event: undefined })
          }
        >
          <IonList>
            <IonItem>
              <IonButton
                fill="clear"
                onClick={() => {
                  this.sendTradeCallback(this.state.tradePartner);
                }}
              >
                <IonIcon slot="icon-only" icon={repeat} color="dark" />
              </IonButton>
              <IonLabel
                onClick={() => {
                  this.sendTradeCallback(this.state.tradePartner);
                }}
              >
                Trade
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonButton
                fill="clear"
                onClick={() => {
                  this.addFriend(this.state.tradePartner);
                }}
              >
                <IonIcon slot="icon-only" icon={personAdd} color="dark" />
              </IonButton>
              <IonLabel
                onClick={() => {
                  this.addFriend(this.state.tradePartner);
                }}
              >
                Add Friend
              </IonLabel>
            </IonItem>
            <IonItem></IonItem>
            <IonItem>
              <IonButton
                fill="clear"
                onClick={() => {
                  this.flagPost(this.state.tradePartner);
                }}
              >
                <IonIcon slot="icon-only" icon={flag} color="dark" />
              </IonButton>
              <IonLabel
                onClick={() => {
                  this.flagPost(this.state.tradePartner);
                }}
              >
                Flag
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonButton
                fill="clear"
                onClick={() => {
                  this.blockPlayer(this.state.tradePartner);
                }}
              >
                <IonIcon slot="icon-only" icon={closeCircle} color="dark" />
              </IonButton>
              <IonLabel
                onClick={() => {
                  this.blockPlayer(this.state.tradePartner);
                }}
              >
                Block
              </IonLabel>
            </IonItem>
          </IonList>
        </IonPopover>

        <IonPopover
          event={this.state.event}
          isOpen={this.state.showNewMsg}
          onDidDismiss={() =>
            this.setState({ showNewMsg: false, event: undefined })
          }
          side="left"
          className={"popover-message-size"}
        >
          <IonTextarea
            rows={10}
            cols={20}
            placeholder="Post message here"
            value={this.state.txtMessage}
            onIonChange={(e: any) => {
              this.setState({ txtMessage: e.currentTarget.value });
            }}
          ></IonTextarea>
          <IonItem>
            <IonButton
              onClick={() => {
                this.postMessage(this.state.txtMessage);
              }}
            >
              Submit
            </IonButton>
            <IonButton
              onClick={() => {
                this.setState({
                  showNewMsg: false,
                  event: undefined,
                  txtMessage: "",
                });
              }}
            >
              Close
            </IonButton>
          </IonItem>
        </IonPopover>

        <IonAlert
          isOpen={this.state.showAlert}
          onDidDismiss={() => {
            this.setState({ showAlert: false, alertMsg: "" });
          }}
          cssClass="my-custom-class"
          header={"Message"}
          message={this.state.alertMsg}
          buttons={["Cancel"]}
        />

        <IonAlert
          isOpen={this.state.showPlayerInfoAlert}
          onDidDismiss={() => {
            this.setState({
              showPlayerInfoAlert: false,
              otherPlayerInfo: null,
            });
          }}
          cssClass="my-custom-class"
          header={"Information"}
          message={this.state.otherPlayerInfo}
          buttons={["Cancel"]}
        />
      </IonContent>
    );
  }

  /*
      {this.state.showTradeSetupModel && <IonModal isOpen={this.state.showTradeSetupModel} cssClass='my-custom-class'>
          
          <TradeSetup otherUser={this.state.tradePartner} user={this.props.user} closePanel={this.toggleCloseTradePanel} />
          
      </IonModal>}
*/
}

export default withIonLifeCycle(HomeContainer);
