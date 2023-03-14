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
  IonBadge,
  withIonLifeCycle,
} from "@ionic/react";
import { settingsOutline, aperture, settings } from "ionicons/icons";
import { callServer } from "./ajaxcalls";

interface props {
  user: any;
}

interface state {
  widgets: any;
  currentYear: any;
  totalCards: any;
  totalYears: any;
  lastCollected: Array<any>;
  lastCollectedFlag: string;
  daysToDailyBoost: number;
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
    };
  }

  componentDidMount() {
    //this.pullProfile();
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
          <img src={card.CardImage} width="50"></img>
        </IonCol>
      );
    });
    justSystem.forEach((card: any, i: number) => {
      systemList.push(
        <IonCol key={i}>
          <img src={card.CardImage} width="50"></img>
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
                  Latest Cards
                </IonButton>{" "}
                <IonButton
                  fill="clear"
                  size="small"
                  onClick={() => {
                    this.setState({ lastCollectedFlag: "yours" });
                  }}
                >
                  Yours
                </IonButton>{" "}
                <IonButton
                  fill="clear"
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

  renderTradeStats() {
    return (
      <IonCard>
        <IonCardContent>
          <IonItem>
            <IonBadge slot="end" color="warning">
              11
            </IonBadge>
            <IonLabel>Pending</IonLabel>
          </IonItem>
          <IonItem>
            <IonBadge slot="end" color="success">
              15
            </IonBadge>
            <IonLabel>Accepted</IonLabel>
          </IonItem>
          <IonItem>
            <IonBadge slot="end" color="danger">
              {" "}
              8
            </IonBadge>
            <IonLabel>Cancelled</IonLabel>
          </IonItem>
        </IonCardContent>
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
            <IonCol>Trades (last 48 hours system wide)</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>{this.renderTradeStats()}</IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    );
  }
}

export default withIonLifeCycle(StatsContainer);
