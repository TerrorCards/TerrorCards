import React from "react";
import {
  IonContent,
  IonCol,
  IonRow,
  IonGrid,
  IonItem,
  IonIcon,
  IonLabel,
  IonButton,
  IonAvatar,
  IonImg,
  IonPopover,
  IonText,
  withIonLifeCycle,
} from "@ionic/react";
import { aperture, repeat, closeCircle, appsOutline } from "ionicons/icons";
import { callServer } from "./ajaxcalls";
import "./ProfileContainer.css";

interface props {
  user: any;
  profileCallback: any;
  lastRefreshed: any;
  tradeCallback: any;
}

interface state {
  info: any;
  infoRender: any;
  initialSlide: number;
  speed: number;
  friendsList: any;
  showFriendsList: boolean;
  showBlockList: boolean;
  blockList: any;
  showPopover: boolean;
  event: any;
}

class ProfileContainer extends React.Component<props, state> {
  constructor(props: any) {
    super(props);

    this.state = {
      info: {},
      infoRender: null,
      initialSlide: 0,
      speed: 400,
      friendsList: [],
      blockList: [],
      showFriendsList: true,
      showBlockList: false,
      showPopover: false,
      event: null,
    };
  }

  componentDidMount() {
    this.pullProfile();
    //console.log("ionViewDidEnter event fired");
  }

  componentDidUpdate(prevProps: any) {
    //this.pullProfile();
    //console.log(prevProps);
    if (prevProps.lastRefreshed !== this.props.lastRefreshed) {
      this.pullProfile();
      //console.log("component did update");
    }
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

  viewHeight = (offset: number) => {
    return window.innerHeight / offset;
  };

  //BEGIN BANNER CODE
  pullProfile() {
    callServer("userInfo", "", this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        ////console.log(json);
        if (json) {
          const infoRender = this.renderProfileItem(json);
          this.setState({ info: json, infoRender: infoRender }, () => {
            this.props.profileCallback(json);
          });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  pullFriendsList() {
    callServer("pullFriendsList", "", this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        //console.log(json);
        if (json) {
          this.setState({ friendsList: json });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  pullBlockList() {
    callServer("pullBlockList", "", this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        ////console.log(json);
        if (json) {
          this.setState({ blockList: json });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  removeUser(user: string, type: string) {
    let request = "";
    let params = {};
    if (type === "friend") {
      request = "deleteFriend";
      params = { friend: user };
    } else {
      request = "removeBlockPlayer";
      params = { block: user };
    }
    callServer(request, params, this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        ////console.log(json);
        if (json) {
          if (type === "friend") {
            this.pullFriendsList();
          } else {
            this.pullBlockList();
          }
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  sendTradeCallback = (tradePartner: any) => {
    this.props.tradeCallback(tradePartner);
  };

  renderProfileItem(j: any) {
    return (
      <IonGrid>
        <IonRow>
          <IonCol>
            <div style={{ height: 25 }}></div>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol size="auto">
            <IonItem>
              <IonAvatar>
                <IonImg src={j.Image} />
              </IonAvatar>
            </IonItem>
          </IonCol>
          <IonCol>
            <IonGrid>
              <IonRow>
                <IonCol>
                  <IonText color="dark">
                    {j.Name} ({j.Rating})
                  </IonText>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonIcon icon={aperture} color="dark" />
                  <IonText color="dark"> {j.Credit}</IonText>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCol>
          <IonCol size="auto">
            <IonIcon
              icon={appsOutline}
              color="dark"
              onClick={(e: any) => {
                e.persist();
                this.setState({ showPopover: true, event: e });
              }}
            />
          </IonCol>
        </IonRow>
      </IonGrid>
    );
  }

  render() {
    return (
      <React.Fragment>
        {this.state.infoRender}
        <IonPopover
          event={this.state.event}
          isOpen={this.state.showPopover}
          onDidDismiss={() =>
            this.setState({
              showPopover: false,
              event: undefined,
              showFriendsList: false,
              showBlockList: false,
            })
          }
          className={"modal-size-menu-override"}
        >
          <IonContent>
            <IonGrid>
              <IonRow>
                <IonCol>
                  <IonLabel
                    onClick={() => {
                      this.pullFriendsList();
                      this.setState({
                        showFriendsList: true,
                        showBlockList: false,
                      });
                    }}
                  >
                    Friends List
                  </IonLabel>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  {this.state.showFriendsList ? this.renderFriendsList() : ""}
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonLabel
                    onClick={() => {
                      this.pullBlockList();
                      this.setState({
                        showBlockList: true,
                        showFriendsList: false,
                      });
                    }}
                  >
                    Block List
                  </IonLabel>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  {this.state.showBlockList ? this.renderBlockList() : ""}
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonContent>
        </IonPopover>
      </React.Fragment>
    );
  }

  renderFriendsList() {
    const fList: any = [];
    this.state.friendsList.forEach((friend: any) => {
      fList.push(
        <IonItem key={friend.Friend}>
          <IonButton
            fill="clear"
            onClick={() => {
              this.sendTradeCallback(friend.Friend);
            }}
          >
            <IonIcon slot="icon-only" icon={repeat} color="dark" />
          </IonButton>
          <IonAvatar>
            <IonImg src={friend.Image} />
          </IonAvatar>
          <IonLabel> {friend.Friend}</IonLabel>
          <IonButton
            fill="clear"
            onClick={() => {
              this.removeUser(friend.Friend, "friend");
            }}
          >
            <IonIcon slot="icon-only" icon={closeCircle} color="dark" />
          </IonButton>
        </IonItem>
      );
    });
    return fList;
  }

  renderBlockList() {
    const fList: any = [];
    this.state.blockList.forEach((block: any) => {
      fList.push(
        <IonItem key={block.Block}>
          <IonAvatar>
            <IonImg src={block.Image} />
          </IonAvatar>
          <IonLabel> {block.Block}</IonLabel>
          <IonButton
            fill="clear"
            onClick={() => {
              this.removeUser(block.Block, "block");
            }}
          >
            <IonIcon slot="icon-only" icon={closeCircle} color="dark" />
          </IonButton>
        </IonItem>
      );
    });
    return fList;
  }
}

export default withIonLifeCycle(ProfileContainer);
