import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonLabel,
  IonList,
  IonItem,
  IonCard,
  IonCardContent,
  IonModal,
  IonButton,
  IonImg,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonPopover,
  withIonLifeCycle,
} from "@ionic/react";
import "./FactoryContainer.css";
import { closeCircleOutline } from "ionicons/icons";
import { callServer } from "./ajaxcalls";

interface props {
  user: any;
  closePanel: any;
}

interface state {
  meldItems: Array<any>;
  showCards: boolean;
  cardsResult: Array<any>;
  showMeldAlert: boolean;
  event: any;
  currentMeld: any;
}

class FactoryContainer extends React.Component<props, state> {
  constructor(props: any) {
    super(props);

    this.state = {
      meldItems: [],
      showCards: false,
      cardsResult: [],
      showMeldAlert: false,
      event: null,
      currentMeld: null,
    };
  }

  componentDidMount() {
    //used when in a tab nav
    this.pullMelds();
  }

  ionViewWillEnter() {
    this.pullMelds();
  }

  ionViewWillLeave() {}

  ionViewDidEnter() {}

  ionViewDidLeave() {}

  pullMelds = () => {
    callServer("pullFactoryList", "", this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        console.log(json);
        if (json.length > 0) {
          this.renderItems(json);
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  requestMeldAttempt = () => {
    callServer(
      "meldFactoryItem",
      { MeldID: this.state.currentMeld.MeldID },
      this.props.user.ID
    )
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        console.log(json);
        if (json.length > 0) {
          this.setState({ showMeldAlert: false }, () => {
            this.renderCards(json);
          });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  renderItems = (allList: any) => {
    let items: Array<any> = [];
    allList.forEach((p: any) => {
      items.push(
        <IonCard key={p.MeldItemID}>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol>
                  <IonGrid>
                    <IonRow>
                      <IonCol>
                        <IonImg src={p.MeldImage} />
                      </IonCol>
                    </IonRow>
                    <IonRow>
                      <IonCol>
                        Meld cards on the right to try and obtain the card
                        above.
                      </IonCol>
                    </IonRow>
                    <IonRow>
                      <IonCol>Success rate: {p.MeldChance} %</IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCol>
                <IonCol>
                  <IonGrid>
                    <IonRow>
                      <IonCol>
                        <IonImg src={p.CardImage1} />
                      </IonCol>
                      <IonCol>
                        <div>Need: {p.MeldCountNeed1}</div>
                        <div>Have: {p.UserCountNeed1}</div>
                      </IonCol>
                    </IonRow>
                    {p.CardImage2 !== null && (
                      <IonRow>
                        <IonCol>
                          <IonImg src={p.CardImage2} />
                        </IonCol>
                        <IonCol>
                          <div>Need: {p.MeldCountNeed2}</div>
                          <div>Have: {p.UserCountNeed2}</div>
                        </IonCol>
                      </IonRow>
                    )}
                    {p.CardImage3 !== null && (
                      <IonRow>
                        <IonCol>
                          <IonImg src={p.CardImage3} />
                        </IonCol>
                        <IonCol>
                          <div>Need: {p.MeldCountNeed3}</div>
                          <div>Have: {p.UserCountNeed3}</div>
                        </IonCol>
                      </IonRow>
                    )}
                    {p.CardImage4 !== null && (
                      <IonRow>
                        <IonCol>
                          <IonImg src={p.CardImage4} />
                        </IonCol>
                        <IonCol>
                          <div>Need: {p.MeldCountNeed4}</div>
                          <div>Have: {p.UserCountNeed4}</div>
                        </IonCol>
                      </IonRow>
                    )}
                  </IonGrid>
                  <IonButton
                    disabled={!p.MeldMet}
                    expand="block"
                    onClick={() => {
                      this._canMeld(p);
                    }}
                    color={!p.MeldMet ? "danger" : "success"}
                  >
                    {"Meld"}
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>
      );
    });
    this.setState({ meldItems: items });
  };

  //Buying checks
  _canMeld = (p: any) => {
    if (p.MeldMet) {
      this.setState({ showMeldAlert: true, currentMeld: p });
    } else {
    }
  };

  renderCards = (cards: any) => {
    let items: Array<any> = [];
    if (cards.length > 0) {
      cards.forEach((c: any, i: number) => {
        items.push(<IonImg src={c.Image} key={i} />);
      });
    }
    this.setState({ cardsResult: items }, () => {
      this.setState({ showCards: true });
      this.pullMelds();
    });
  };

  //pop up cards
  closeCardsPopup = () => {
    //fetch packs again in case packs have expired
    this.setState({ showCards: false });
  };
  //end pop up cards

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonItem>
              <IonLabel>Factory</IonLabel>
              <IonLabel>
                <div style={{ textAlign: "end" }}>
                  <IonButton
                    fill="clear"
                    onClick={(e: any) => {
                      this.props.closePanel();
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
          <IonList>{this.state.meldItems}</IonList>

          <IonModal isOpen={this.state.showCards}>
            <IonContent>{this.state.cardsResult}</IonContent>
            <IonButton
              onClick={() => {
                this.closeCardsPopup();
              }}
            >
              Close
            </IonButton>
          </IonModal>

          <IonPopover
            event={this.state.event}
            isOpen={this.state.showMeldAlert}
            onDidDismiss={() =>
              this.setState({ showMeldAlert: false, event: undefined })
            }
          >
            Attempt the meld?
            <IonItem>
              <IonButton
                onClick={() => {
                  this.requestMeldAttempt();
                }}
              >
                YES
              </IonButton>
              <IonButton
                onClick={() => {
                  this.setState({ showMeldAlert: false, event: undefined });
                }}
              >
                NO
              </IonButton>
            </IonItem>
          </IonPopover>
        </IonContent>
      </IonPage>
    );
  }
}

export default withIonLifeCycle(FactoryContainer);
