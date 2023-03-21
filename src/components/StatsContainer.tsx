import React from "react";
import {
  IonContent,
  IonCol,
  IonRow,
  IonGrid,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonText,
  withIonLifeCycle,
} from "@ionic/react";
import { callServer } from "./ajaxcalls";

interface props {
  user: any;
  tradeSetup: any;
}

interface state {
  widgets: any;
  currentYear: any;
  totalCards: any;
  totalYears: any;
  lastCollected: Array<any>;
  lastCollectedFlag: string;
  daysToDailyBoost: number;
  pandoraExpires: any;
}

class StatsContainer extends React.Component<props, state> {
  constructor(props: any) {
    super(props);

    this.state = {
      widgets: [],
      currentYear: {
        percentageOwned: 0,
        yourTemplateCount: 0,
        cardsTemplateInSystem: 0,
      },
      totalCards: {
        yourTotalCount: 0,
        cardsInSystem: 0,
      },
      totalYears: {
        percentageOwned: 0,
        yourCardsCount: 0,
        totalCardsInSystem: 0,
      },
      lastCollected: [],
      lastCollectedFlag: "yours",
      daysToDailyBoost: 0,
      pandoraExpires: null,
    };
  }

  componentDidMount() {
    this.pullLoginCheck();
    this.pullTemplates();
    this.pullCardCounts();
    this.pullLatestCards();
    console.log("ionViewDidEnter event fired");
  }

  componentDidUpdate(prevProps: any) {
    //this.pullProfile();
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
  pullLoginCheck() {
    callServer("stat_loginCheck", "", this.props.user.ID)
      ?.then((resp) => {
        console.log(resp);
        return resp.json();
      })
      .then((json) => {
        if (json) {
          const dayToBoost = 7 - parseInt(json.DailyStreak);
          let pandoraEnds = null;
          if (json.PandoraExpires !== null) {
            pandoraEnds = json.PandoraExpires;
          }
          this.setState({
            daysToDailyBoost: dayToBoost,
            pandoraExpires: pandoraEnds,
          });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  pullCardCounts() {
    callServer("state_getCardCounts", "", this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        if (json) {
          let data = {
            yourTotalCount: json.YourCardCount,
            cardsInSystem: json.SystemCardCount,
          };
          this.setState({ totalCards: data });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  pullTemplates() {
    callServer("stat_getCardTemplates", "", this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        if (json) {
          let data = {
            percentageOwned: Math.ceil(
              (parseInt(json.YourTemplateCount) /
                parseInt(json.SystemTemplateCount)) *
                100
            ),
            yourTemplateCount: json.YourTemplateCount,
            cardsTemplateInSystem: json.SystemTemplateCount,
          };
          this.setState({ currentYear: data });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  pullLatestCards() {
    callServer("stat_latestCards", "", this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        if (json.length > 0) {
          this.setState({ lastCollected: json });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  renderCurrentYearTemplates() {
    return (
      <IonCard>
        <IonCardHeader>
          <IonCardTitle class="ion-text-center">
            <IonText color="dark">
              {this.state.currentYear.percentageOwned + "%"}
            </IonText>
          </IonCardTitle>
          <IonCardSubtitle class="ion-text-center">
            <IonText color="dark">Templates</IonText>
          </IonCardSubtitle>
          <IonCardTitle class="ion-text-center">
            <IonText color="dark">
              {this.state.currentYear.yourTemplateCount}
            </IonText>
          </IonCardTitle>
          <IonCardSubtitle class="ion-text-center">
            <IonText color="dark">
              of {this.state.currentYear.cardsTemplateInSystem} {"templates"}
            </IonText>
          </IonCardSubtitle>
        </IonCardHeader>

        <IonCardContent class="ion-text-center"></IonCardContent>
      </IonCard>
    );
  }

  renderCurrentYearTotals() {
    return (
      <IonCard>
        <IonCardHeader>
          <IonCardTitle class="ion-text-center">
            <IonText color="dark">
              {this.state.totalCards.yourTotalCount}
            </IonText>
          </IonCardTitle>
          <IonCardSubtitle class="ion-text-center">
            <IonText color="dark">Cards Owned</IonText>
          </IonCardSubtitle>
          <IonCardTitle class="ion-text-center">
            <IonText color="dark">
              {this.state.totalCards.cardsInSystem}
            </IonText>
          </IonCardTitle>
          <IonCardSubtitle class="ion-text-center">
            <IonText color="dark">System Wide</IonText>
          </IonCardSubtitle>
        </IonCardHeader>

        <IonCardContent></IonCardContent>
      </IonCard>
    );
  }

  renderSystemLatestCards() {
    const userList: any = [];
    const systemList: any = [];
    const justUser = this.state.lastCollected.filter((card) => {
      return card.CardUser === "user";
    });
    const justSystem = this.state.lastCollected.filter((card) => {
      return card.CardUser === "system";
    });

    justUser.forEach((card: any, i: number) => {
      userList.push(
        <IonCol key={i}>
          <img src={card.CardImage} width="80%" alt=""></img>
          <br></br>
          <IonText color="dark"> </IonText>
        </IonCol>
      );
    });
    justSystem.forEach((card: any, i: number) => {
      systemList.push(
        <IonCol
          key={i}
          onClick={() => {
            if (card.CardOwner !== this.props.user.ID) {
              this.props.tradeSetup(card.CardOwner);
            }
          }}
        >
          <img src={card.CardImage} width="75%" alt=""></img>
          <br></br>
          <IonText color="dark">
            {card.CardOwner.length > 7
              ? card.CardOwner.substring(0, 5) + "..."
              : card.CardOwner}
          </IonText>
        </IonCol>
      );
    });
    return (
      <IonCard>
        <IonCardContent>
          <IonGrid>
            <IonRow>
              <IonText color="dark">
                <IonButton fill="clear" size="small" color="dark">
                  Latest Chase Cards
                </IonButton>{" "}
                <IonButton
                  color={
                    this.state.lastCollectedFlag === "yours" ? "danger" : "dark"
                  }
                  size="small"
                  onClick={() => {
                    this.setState({ lastCollectedFlag: "yours" });
                  }}
                >
                  Yours
                </IonButton>{" "}
                <IonButton
                  color={
                    this.state.lastCollectedFlag === "system"
                      ? "danger"
                      : "dark"
                  }
                  size="small"
                  onClick={() => {
                    this.setState({ lastCollectedFlag: "system" });
                  }}
                >
                  System
                </IonButton>
              </IonText>
            </IonRow>
            <IonRow>
              {this.state.lastCollectedFlag === "yours" ? userList : systemList}
            </IonRow>
          </IonGrid>
        </IonCardContent>
      </IonCard>
    );
  }

  renderBoostCheck() {
    return (
      <IonCard>
        <IonCardHeader>
          <IonCardTitle class="ion-text-center">
            <IonText color="dark">
              {this.state.daysToDailyBoost}
              <div style={{ height: 5 }}></div>
            </IonText>
          </IonCardTitle>
          <IonCardSubtitle class="ion-text-center">
            <IonText color="dark">Days Till Credit Boost</IonText>
          </IonCardSubtitle>
        </IonCardHeader>

        <IonCardContent></IonCardContent>
      </IonCard>
    );
  }
  renderPandoraAccess() {
    return (
      <IonCard>
        <IonCardHeader>
          <IonCardTitle class="ion-text-center">
            <IonText color="dark">{this.state.pandoraExpires}</IonText>
          </IonCardTitle>
          <IonCardSubtitle class="ion-text-center">
            <IonText color="dark">Pandora Expires</IonText>
          </IonCardSubtitle>
        </IonCardHeader>

        <IonCardContent></IonCardContent>
      </IonCard>
    );
  }

  render() {
    return (
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol>Collection</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>{this.renderCurrentYearTemplates()}</IonCol>
            <IonCol>{this.renderCurrentYearTotals()}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>{this.renderSystemLatestCards()}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>Information</IonCol>
          </IonRow>
          <IonRow>
            <IonCol color="dark">{this.renderBoostCheck()}</IonCol>
            <IonCol color="dark">
              {this.state.pandoraExpires !== null
                ? this.renderPandoraAccess()
                : ""}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    );
  }
}

export default withIonLifeCycle(StatsContainer);
