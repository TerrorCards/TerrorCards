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
  IonModal,
} from "@ionic/react";
import { callServer } from "./ajaxcalls";
import CardOwnerMenu from "./CardOwnerMenu";

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
  tradeList: Array<any>;
  showCardOwners: boolean;
  cardNumber: number;
  cardYear: number;
  triviaQuestion: string;
  triviaAnswerText: string;
  triviaAnswerStatus: string;
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
      tradeList: [],
      showCardOwners: false,
      cardNumber: 0,
      cardYear: 0,
      triviaQuestion: "",
      triviaAnswerText: "",
      triviaAnswerStatus: ""
    };
  }

  componentDidMount() {
    this.pullLoginCheck();
    this.pullTemplates();
    this.pullCardCounts();
    this.pullLatestCards();
    this.pullTradeList();
    this.pullTriviaQuestion();
    //console.log("ionViewDidEnter event fired");
  }

  componentDidUpdate(prevProps: any) {
    //this.pullProfile();
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

  pullLoginCheck() {
    callServer("stat_loginCheck", "", this.props.user.ID)
      ?.then((resp) => {
        //console.log(resp);
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

  pullTradeList() {
    callServer("stats_tradeCount", "", this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        if (json.length > 0) {
          this.setState({ tradeList: json });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  pullTriviaQuestion() {
    callServer("trivia_pullTriviaQuestion", "", this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        if (json) {
          this.setState({ triviaQuestion: json.triviaQuestion });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  sendTriviaAnswer() {
    this.setState({ triviaAnswerStatus: "" }, ()=> {
      callServer("trivia_answerTriviaQuestion", this.state.triviaAnswerText, this.props.user.ID)
        ?.then((resp) => {
          return resp.text();
        })
        .then((json) => {
          if (json.length > 0) {
            this.setState({ triviaAnswerStatus: json });
          }
        })
        .catch((err: any) => {
          console.log(err);
        });
    });
  }


  closeTradeOwners = () => {
    this.setState({ showCardOwners: false, cardNumber: 0, cardYear: 0 });
  };

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
      const currImg = card.CardImage.replace(/full/g, "thumbs");
      userList.push(
        <IonCol key={i}>
          <img
            src={currImg}
            width={justUser.length >= 2 ? "75%" : "50%"}
            alt=""
          ></img>
          <br></br>
          <IonText color="dark"> </IonText>
        </IonCol>
      );
    });
    justSystem.forEach((card: any, i: number) => {
      const currImg = card.CardImage.replace(/full/g, "thumbs");
      systemList.push(
        <IonCol
          key={i}
          onClick={() => {
            if (card.CardOwner !== this.props.user.ID) {
              this.props.tradeSetup(card.CardOwner);
            }
          }}
        >
          <img
            src={currImg}
            width={justSystem.length >= 2 ? "75%" : "50%"}
            alt=""
          ></img>
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
                  Latest Cards
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
  /*
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
  */
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

  renderTradeList() {
    const tradeListDom1_5: any = [];

    this.state.tradeList.forEach((tl: any, i: number) => {
      if (i < 5) {
        tradeListDom1_5.push(
          <IonCol class="ion-text-center" key={i}>
            <img
              src={tl.Image}
              width={50}
              alt=""
              onClick={() => {
                this.setState({
                  cardNumber: tl.ID,
                  cardYear: tl.Year,
                  showCardOwners: true,
                });
              }}
            ></img>
            <div>{tl.Count} </div>
          </IonCol>
        );
      }
    });
    return (
      <IonCard>
        <IonCardContent>
          <IonGrid>
            <IonRow class="ion-align-items-center">{tradeListDom1_5}</IonRow>
          </IonGrid>
        </IonCardContent>
        <IonModal
          isOpen={this.state.showCardOwners}
          className={"modal-size-override"}
        >
          <IonContent>
            <CardOwnerMenu
              user={this.props.user}
              cardNumber={this.state.cardNumber}
              cardYear={this.state.cardYear}
              tradeCallback={this.props.tradeSetup}
              closePanel={this.closeTradeOwners}
            ></CardOwnerMenu>
          </IonContent>
        </IonModal>
      </IonCard>
    );
  }

  renderTriviaBlock() {
    return (
      <IonCard>
        <IonCardHeader>
          <IonCardTitle class="ion-text-center">
            <IonText color="dark">{"Trivia"}</IonText>
          </IonCardTitle>
          <IonCardSubtitle>
            <IonText color="dark">{this.state.triviaQuestion}</IonText>
          </IonCardSubtitle>
        </IonCardHeader>
        <IonCardContent>
          <textarea id="userInput" rows={2} placeholder="Type here..." 
          style={{ width: '100%', boxSizing: 'border-box', color:'#fff' }}
          value={this.state.triviaAnswerText}
          onChange={(e) => this.setState({ triviaAnswerText: e.target.value })}
          >
          </textarea>
          <br></br>
          <IonButton onClick={() => {this.sendTriviaAnswer()}}>Send Answer</IonButton>
          <div>
            {this.state.triviaAnswerStatus}
          </div>
        </IonCardContent>
      </IonCard>
    );
  }

  render() {
    return (
      <IonContent>
        <IonGrid>
          {
            this.state.triviaQuestion !== "" && 
            <IonRow>
              <IonCol>{this.renderTriviaBlock()}</IonCol>
            </IonRow>
          }
          <IonRow>
            <IonCol>Collection (Current Year)</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>{this.renderCurrentYearTemplates()}</IonCol>
            <IonCol>{this.renderCurrentYearTotals()}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>{this.renderSystemLatestCards()}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>Most traded in the last 48 hours</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>{this.renderTradeList()}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              {this.state.pandoraExpires !== null ? "Information" : ""}
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol color="dark">
              {this.state.pandoraExpires !== null
                ? this.renderPandoraAccess()
                : ""}
            </IonCol>
            <IonCol color="dark"></IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <div style={{ height: 25 }}></div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    );
  }
}

export default withIonLifeCycle(StatsContainer);
