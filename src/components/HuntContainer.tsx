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
  IonButton,
  IonImg,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  withIonLifeCycle,
  IonAlert,
  IonSearchbar,
} from "@ionic/react";
import "./HuntContainer.css";
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

  yourStats: any;
  isInBattle: boolean;
  opponent: string;
  playerList: Array<any>;
  battleParams: any;
  battleResults: any;
  yourDamMsg: string;
  otherDamMsg: string;
  battleIsRunning: boolean;
  showWinnerAlert: boolean;
  playerSearch: string;
}

class HuntContainer extends React.Component<props, state> {
  constructor(props: any) {
    super(props);

    this.state = {
      meldItems: [],
      showCards: false,
      cardsResult: [],
      showMeldAlert: false,
      event: null,
      currentMeld: null,

      yourStats: [],
      isInBattle: false,
      opponent: "",
      battleParams: [],
      battleResults: "",
      yourDamMsg: "",
      otherDamMsg: "",
      battleIsRunning: false,
      playerList: [],
      showWinnerAlert: false,
      playerSearch: "",
    };
  }

  battleWinner = "";
  battleLoser = "";
  gBattleUser: any = {};
  gBattleTarget: any = {};

  componentDidMount() {
    this.pullBattleYourStats();
    if (this.state.isInBattle) {
      this.pullBattleParams();
    } else {
      this.pullBattleList();
    }
  }

  ionViewWillEnter() {
    this.pullBattleYourStats();
    if (this.state.isInBattle) {
      this.pullBattleParams();
    } else {
      this.pullBattleList();
    }
  }

  ionViewWillLeave() {}

  ionViewDidEnter() {}

  ionViewDidLeave() {}

  pullBattleYourStats = () => {
    callServer("battleYourStats", "", this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        //console.log(json);
        if (json.length > 0) {
          this.setState({ yourStats: json[0] });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  pullBattleParams = () => {
    if (this.state.opponent !== "") {
      callServer(
        "battleSetup",
        { target: this.state.opponent },
        this.props.user.ID
      )
        ?.then((resp) => {
          return resp.json();
        })
        .then((json) => {
          //console.log(json);
          if (json.length > 0) {
            this.setState({ battleParams: json }, () => {
              //this.renderItems(json);
            });
          }
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
  };

  pullBattleList = () => {
    let options = {};
    if (this.state.playerSearch !== "") {
      options = { search: this.state.playerSearch };
    }
    callServer("battlePlayerList", options, this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        //console.log(json);
        if (json.length > 0) {
          this.setState({ playerList: json });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  renderYourStats = () => {
    let s = this.state.yourStats;
    return (
      <IonGrid>
        <IonRow>
          <IonCol>W: {s.Curr_Win}</IonCol>
          <IonCol>L: {s.Curr_Lose}</IonCol>
          <IonCol>
            %:{" "}
            {Math.ceil(
              (parseInt(s.Curr_Win) /
                (parseInt(s.Curr_Win) + parseInt(s.Curr_Lose))) *
                100
            )}
          </IonCol>
          <IonCol>
            <IonButton expand="block">
              Moves<br></br>
              {s.AvailablePlays}
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    );
  };

  renderPlayerList = () => {
    let items: Array<any> = [];
    items.push(
      <IonSearchbar
        key="searchBar"
        value={this.state.playerSearch}
        onIonChange={(e: any) => {
          this.setState({ playerSearch: e.detail.value }, () => {
            this.pullBattleList();
          });
        }}
        placeholder="Search Player"
      ></IonSearchbar>
    );
    this.state.playerList.forEach((p: any, i: any) => {
      items.push(
        <IonCard key={i}>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="auto">
                  <IonImg
                    src={p.Img}
                    key={i + "image"}
                    class={"ListItemSizing"}
                  />
                </IonCol>
                <IonCol class="ion-text-center">{p.Player}</IonCol>
                <IonCol size="auto">
                  <IonButton
                    color="success"
                    expand="block"
                    disabled={
                      this.state.yourStats.AvailablePlays > 0 ? false : true
                    }
                    onClick={() => {
                      this.selectOpponent(p.Player);
                    }}
                  >
                    Select
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>
      );
    });
    return items;
  };

  renderItems = () => {
    let you = this.state.battleParams[0];
    let other = this.state.battleParams[1];
    //console.log(this.state.battleResults);
    //allList.forEach((p: any) => {
    return (
      <IonCardContent key={you.Player}>
        <IonGrid>
          <IonRow class="ion-align-items-center">
            <IonCol class="ion-text-center">{you.Player}</IonCol>
          </IonRow>
          <IonRow class="ion-align-items-center">
            <IonCol class="ion-text-center">ATTACK</IonCol>
            <IonCol class="ion-text-center">DEFENSE</IonCol>
            <IonCol class="ion-text-center">LIFE</IonCol>
          </IonRow>
          <IonRow class="ion-align-items-center">
            <IonCol class="ion-text-center">{you.AttackMax}</IonCol>
            <IonCol class="ion-text-center">
              {Math.floor(you.DefenseMax / 2)}
            </IonCol>
            <IonCol class="ion-text-center">{you.LifeMax}</IonCol>
          </IonRow>
          <IonRow class="ion-align-items-center">
            <IonCol class="ion-text-center">{this.state.yourDamMsg}</IonCol>
          </IonRow>
          <IonRow class="ion-align-items-center">
            <IonCol class="ion-text-center">
              <IonImg src={you.AttackImg} class={"baseCardSize"} />
            </IonCol>
            <IonCol class="ion-text-center">
              <IonImg src={you.DefenseImg} class={"baseCardSize"} />
            </IonCol>
            <IonCol class="ion-text-center">
              <IonImg src={you.LifeImg} class={"baseCardSize"} />
            </IonCol>
          </IonRow>
          <IonRow class="ion-align-items-center">
            <IonCol class="ion-text-center">{this.state.otherDamMsg}</IonCol>
          </IonRow>
          <IonRow class="ion-align-items-center">
            <IonCol class="ion-text-center">{other.AttackMax}</IonCol>
            <IonCol class="ion-text-center">
              {Math.floor(other.DefenseMax / 2)}
            </IonCol>
            <IonCol class="ion-text-center">{other.LifeMax}</IonCol>
          </IonRow>
          <IonRow class="ion-align-items-center">
            <IonCol class="ion-text-center">ATTACK</IonCol>
            <IonCol class="ion-text-center">DEFENSE</IonCol>
            <IonCol class="ion-text-center">LIFE</IonCol>
          </IonRow>
          <IonRow class="ion-align-items-center">
            <IonCol class="ion-text-center">{other.Player}</IonCol>
          </IonRow>
          <IonRow class="ion-align-items-center">
            <IonCol class="ion-text-center"></IonCol>
          </IonRow>
          <IonRow class="ion-align-items-center">
            <IonCol class="ion-text-center">
              <IonButton
                color="success"
                expand="block"
                disabled={this.state.battleIsRunning}
                onClick={() => {
                  this.setState({ battleIsRunning: true }, () => {
                    this.playOutBattle();
                  });
                }}
              >
                Start
              </IonButton>
            </IonCol>
            <IonCol class="ion-text-center">
              <IonButton
                color="warning"
                expand="block"
                disabled={this.state.battleIsRunning}
                onClick={() => {
                  this.setState(
                    {
                      isInBattle: false,
                      opponent: "",
                      battleIsRunning: false,
                      battleResults: "",
                      battleParams: [],
                    },
                    () => {
                      this.pullBattleYourStats();
                      this.pullBattleList();
                    }
                  );
                }}
              >
                Cancel
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonCardContent>
    );
  };

  renderNoMoves = () => {
    return (
      <IonCard>
        <IonCardContent>Sorry, no more moves.</IonCardContent>
      </IonCard>
    );
  };

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonItem>
              <IonLabel>Hunting Grounds</IonLabel>
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
          {this.renderYourStats()}
          <IonList>
            {this.state.battleParams.length > 0
              ? this.renderItems()
              : parseInt(this.state.yourStats.AvailablePlays) > 0
              ? this.renderPlayerList()
              : this.renderNoMoves()}
          </IonList>
        </IonContent>
        <IonAlert
          isOpen={this.state.showWinnerAlert}
          onDidDismiss={() => {
            this.pullBattleYourStats();
            this.pullBattleList();
            this.setState({
              showWinnerAlert: false,
              battleResults: "",
              battleParams: [],
              battleIsRunning: false,
            });
            this.battleWinner = "";
            this.battleLoser = "";
            this.gBattleUser = {};
            this.gBattleTarget = {};
          }}
          cssClass="my-custom-class"
          header={"Winner"}
          message={this.state.battleResults}
          buttons={[
            {
              text: "Close",
              role: "cancel",
              cssClass: "secondary",
              handler: (blah: any) => {
                this.pullBattleYourStats();
                this.pullBattleList();
                this.setState({
                  showWinnerAlert: false,
                  battleResults: "",
                  battleParams: [],
                  battleIsRunning: false,
                });
                this.battleWinner = "";
                this.battleLoser = "";
                this.gBattleUser = {};
                this.gBattleTarget = {};
              },
            },
          ]}
        />
      </IonPage>
    );
  }

  selectOpponent = (param: any) => {
    this.setState({ isInBattle: true, opponent: param }, () => {
      this.pullBattleParams();
    });
  };

  playOutBattle = () => {
    var rounds = 10;
    var i = 1;
    var whoseTurn = "you";
    var gArrResults = [];
    while (i <= rounds) {
      //setTimeout(function(i,rounds) {
      if (i === 1) {
        //determine who goes first
        whoseTurn = this.firstAttackBattle();
      }
      var result = this.playBattleRound({ turn: whoseTurn, round: i });
      gArrResults.push(result);
      if (this.battleWinner !== "") {
        this.battleEndGame(gArrResults);
        break;
      }
      if (i === rounds) {
        this.battleEndGame(gArrResults);
        break;
      }
      if (whoseTurn === "you") {
        whoseTurn = "target";
      } else {
        whoseTurn = "you";
      }
      i++;
      //},2000);
    }
  };

  firstAttackBattle = () => {
    var ran_num = Math.floor(Math.random() * 10) + 1;
    var oddEven = ran_num % 2;
    if (oddEven === 1) {
      return "you";
    } else {
      return "target";
    }
  };

  playBattleRound = (pParam: any) => {
    var attack = 0;
    var defense = 0;
    let difference = 0;
    this.gBattleUser = { ...this.state.battleParams[0] };
    this.gBattleTarget = { ...this.state.battleParams[1] };
    if (pParam.turn === "you") {
      //your attack
      attack = Math.floor(Math.random() * this.gBattleUser.AttackMax) + 1;
      //target defense
      defense = Math.floor(
        (Math.floor(Math.random() * this.gBattleTarget.DefenseMax) + 1) / 2
      );
      difference = attack - defense;
      if (difference > 0) {
        this.gBattleTarget.LifeMax = this.gBattleTarget.LifeMax - difference;
        //$("#targetLifeVal").text(this.gBattleTarget.Life);
      } else {
        difference = 0;
      }
      if (this.gBattleTarget.LifeMax <= 0) {
        //target no life left, you won
        this.battleWinner = this.gBattleUser.Player;
        this.battleLoser = this.gBattleTarget.Player;
      }
      //playBattleResults({round:pParam.round, player:this.gBattleTarget.ID, damage:difference, lifeLeft:this.gBattleTarget.Life});
      return {
        round: pParam.round,
        player: this.gBattleTarget.Player,
        damage: difference,
        lifeLeft: this.gBattleTarget.LifeMax,
      };
    } else {
      //target attack
      attack = Math.floor(Math.random() * this.gBattleTarget.AttackMax) + 1;
      //you defense
      defense = Math.floor(
        (Math.floor(Math.random() * this.gBattleUser.DefenseMax) + 1) / 2
      );
      difference = attack - defense;
      if (difference > 0) {
        this.gBattleUser.LifeMax = this.gBattleUser.LifeMax - difference;
        //$("#myLifeVal").text(this.gBattleUser.Life);
      } else {
        difference = 0;
      }
      if (this.gBattleUser.LifeMax <= 0) {
        //target no life left, you won
        this.battleWinner = this.gBattleTarget.Player;
        this.battleLoser = this.gBattleUser.Player;
      }
      //playBattleResults({round:pParam.round, player:this.gBattleUser.ID, damage:difference, lifeLeft:this.gBattleUser.Life});
      return {
        round: pParam.round,
        player: this.gBattleUser.Player,
        damage: difference,
        lifeLeft: this.gBattleUser.LifeMax,
      };
    }
  };

  battleEndGame = (params: any) => {
    if (this.battleWinner === "") {
      if (this.gBattleUser.Life >= this.gBattleTarget.Life) {
        this.battleWinner = this.gBattleUser.ID;
        this.battleLoser = this.gBattleTarget.ID;
      } else {
        this.battleWinner = this.gBattleTarget.ID;
        this.battleLoser = this.gBattleUser.ID;
      }
    }

    if (this.battleWinner !== "") {
      callServer(
        "battleResult",
        {
          winner: this.battleWinner,
          loser: this.battleLoser,
          you: this.gBattleUser.ID,
          target: this.gBattleTarget.ID,
        },
        this.props.user.ID
      )
        ?.then((resp) => {
          return resp.json();
        })
        .then((json) => {
          this.playBattleResults(params, json);
        })
        .catch((err: any) => {
          console.log(err);
        });
    } else {
      callServer(
        "battleResult",
        {
          winner: "",
          loser: "",
          you: this.gBattleUser.ID,
          target: this.gBattleTarget.ID,
        },
        this.props.user.ID
      )
        ?.then((resp) => {
          return resp.json();
        })
        .then((json) => {
          this.playBattleResults(params, json);
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
  };

  playBattleResults = (pParam: any, result: any) => {
    let battleLog = "<div>Battle Log</div>";
    for (let index = 0; index < pParam.length; ) {
      const value = pParam[index];
      let txtResult = value.player + " hurt " + value.damage;
      const test2 = { yourDamMsg: "", otherDamMsg: "" };
      if (value.player === this.gBattleUser.ID) {
        test2.yourDamMsg = txtResult;
      } else {
        test2.otherDamMsg = txtResult;
      }
      battleLog = battleLog + "<div>" + txtResult + "</div>";
      this.setState(
        { yourDamMsg: test2.yourDamMsg, otherDamMsg: test2.otherDamMsg },
        // eslint-disable-next-line
        () => {
          if (index + 1 === pParam.length) {
            let resultMsg = this.battleWinner + " is the winner!";
            //console.log(result[0]);
            if (
              result[0].Reward !== "" ||
              typeof result[0].Reward !== "undefined"
            ) {
              resultMsg =
                "<div>" +
                this.battleWinner +
                " is the winner!<br></br><img src='" +
                result[0].Reward +
                "' width='50'></img></div>";
            }
            // eslint-disable-next-line
            resultMsg = resultMsg + battleLog;

            this.setState({
              battleResults: resultMsg,
              showWinnerAlert: true,
            });
          }
          index = index + 1;
        }
      );
    }
  };
}

export default withIonLifeCycle(HuntContainer);
