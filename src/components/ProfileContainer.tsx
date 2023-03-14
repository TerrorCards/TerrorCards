import React, { useState, useEffect } from "react";
import {
  IonSlides,
  IonSlide,
  IonContent,
  IonHeader,
  IonCol,
  IonRow,
  IonGrid,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonIcon,
  IonLabel,
  IonButton,
  IonList,
  isPlatform,
  IonChip,
  IonAvatar,
  IonImg,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonPopover,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonTextarea,
  IonModal,
  IonMenuButton,
  IonButtons,
  IonToolbar,
  IonTitle,
  IonText,
  withIonLifeCycle,
} from "@ionic/react";
import { settingsOutline, aperture, settings } from "ionicons/icons";
import { callServer } from "./ajaxcalls";

interface props {
  user: any;
  profileCallback: any;
  lastRefreshed: any;
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
      showFriendsList: false,
      showBlockList: false,
      showPopover: false,
      event: null,
    };
  }

  componentDidMount() {
    this.pullProfile();
    console.log("ionViewDidEnter event fired");
  }

  componentDidUpdate(prevProps: any) {
    //this.pullProfile();
    console.log(prevProps);
    if (prevProps.lastRefreshed !== this.props.lastRefreshed) {
      this.pullProfile();
      console.log("component did update");
    }
  }

  ionViewWillEnter() {
    console.log("ionViewWillEnter event fired");
  }

  ionViewWillLeave() {
    console.log("ionViewWillLeave event fired");
  }

  ionViewDidEnter() {
    console.log("ionViewDidEnter event fired");
  }

  ionViewDidLeave() {
    console.log("ionViewDidLeave event fired");
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
        //console.log(json);
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
        //console.log(json);
        if (json) {
          this.setState({ blockList: json });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  renderProfileItem(j: any) {
    return (
      <IonGrid>
        <IonRow>
          <IonCol>
            <div style={{ height: 35 }}></div>
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
              icon={settings}
              color="dark"
              onClick={() => {
                this.setState({ showPopover: true });
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
        >
          <IonList>
            <IonItem>
              <IonLabel
                onClick={() => {
                  this.setState({ showFriendsList: true });
                }}
              >
                Friends List
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel
                onClick={() => {
                  this.setState({ showBlockList: true });
                }}
              >
                Block List
              </IonLabel>
            </IonItem>
          </IonList>
        </IonPopover>
      </React.Fragment>
    );
  }

  renderFriendsList() {
    const fList: any = [];
    this.state.friendsList.forEach((friend: any) => {
      fList.push(
        <IonItem>
          <IonAvatar>
            <IonImg src={friend.Image} />
          </IonAvatar>
          <IonLabel>{friend.Friend}</IonLabel>
        </IonItem>
      );
    });
    return fList;
  }
}

export default withIonLifeCycle(ProfileContainer);
