import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonCardHeader,
  IonCard,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonModal,
  IonButton,
  IonSlides,
  IonSlide,
  IonImg,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonPopover,
  withIonLifeCycle,
} from "@ionic/react";
import "./HuntContainer.css";
import { settingsOutline, closeCircleOutline } from "ionicons/icons";
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
  battleParams: any;
  battleResults: any;
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
        console.log(json);
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
          console.log(json);
          if (json.length > 0) {
            this.setState({ battleParams: json }, () => {
              this.renderItems(json);
            });
          }
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
  };

  pullBattleList = () => {
    callServer("battlePlayerList", "", this.props.user.ID)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        console.log(json);
        if (json.length > 0) {
          this.renderPlayerList(json);
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
          <IonCol>%: {s.Curr_Percentage}</IonCol>
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

  renderPlayerList = (allList: any) => {
    let items: Array<any> = [];
    let p = allList[0];
    allList.forEach((p: any, i: any) => {
      items.push(
        <IonCard key={i}>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol>
                  <IonImg
                    src={p.Img}
                    key={i + "image"}
                    class={"ListItemSizing"}
                  />
                </IonCol>
                <IonCol>{p.Player}</IonCol>
                <IonCol>
                  <IonButton
                    color="success"
                    expand="block"
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
    this.setState({ meldItems: items });
  };

  renderItems = (allList: any) => {
    let items: Array<any> = [];
    let you = allList[0];
    let other = allList[1];
    console.log(this.state.battleResults);
    //allList.forEach((p: any) => {
    items.push(
      <IonCard key={you.Player}>
        <IonCardContent>
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
            <IonRow>
              <IonCol class="ion-text-center">
                {this.state.battleResults}
              </IonCol>
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
                  onClick={() => {
                    this.playOutBattle();
                  }}
                >
                  Start
                </IonButton>
              </IonCol>
              <IonCol class="ion-text-center">
                <IonButton
                  color="warning"
                  expand="block"
                  onClick={() => {
                    this.setState({ isInBattle: false, opponent: "" }, () => {
                      this.pullBattleYourStats();
                      this.pullBattleList();
                    });
                  }}
                >
                  Cancel
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCardContent>
      </IonCard>
    );
    //});
    this.setState({ meldItems: items });
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
          <IonList>{this.state.meldItems}</IonList>
        </IonContent>
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
      if (i == 1) {
        //determine who goes first
        whoseTurn = this.firstAttackBattle();
      }
      var result = this.playBattleRound({ turn: whoseTurn, round: i });
      gArrResults.push(result);
      if (this.battleWinner !== "") {
        this.battleEndGame(gArrResults);
        break;
      }
      if (i == rounds) {
        this.battleEndGame(gArrResults);
        break;
      }
      if (whoseTurn == "you") {
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
    if (oddEven == 1) {
      return "you";
    } else {
      return "target";
    }
  };

  playBattleRound = (pParam: any) => {
    var attack = 0;
    var defense = 0;
    this.gBattleUser = { ...this.state.battleParams[0] };
    this.gBattleTarget = { ...this.state.battleParams[1] };
    if (pParam.turn == "you") {
      //your attack
      attack = Math.floor(Math.random() * this.gBattleUser.AttackMax) + 1;
      //target defense
      defense = Math.floor(
        (Math.floor(Math.random() * this.gBattleTarget.DefenseMax) + 1) / 2
      );
      var difference = attack - defense;
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
      var difference = attack - defense;
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
    console.log(params);
    if (this.battleWinner == "") {
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
          this.playBattleResults(params);
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
          this.playBattleResults(params);
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
  };

  playBattleResults(pParam: any) {
    pParam.forEach((value: any, index: number) => {
      let test = setTimeout(() => {
        let txtResult = value.player + "hurt " + value.damage;
        this.setState({ battleResults: txtResult }, () => {
          if (index + 1 == pParam.length) {
            this.setState({
              battleResults: this.battleWinner + " is the winner!",
            });
          }
        });
      }, 2000 * index);
    });
    /*
    $.each(gArrResults, function (index, value) {
      var test = setTimeout(function() {
        if(value.player == gUser.ID) {
          if(value.lifeLeft <= 0) {
            $("#myLifeVal").text("0");	
          } else {
            $("#myLifeVal").text(value.lifeLeft);					
          }		
        } else {
          if(value.lifeLeft <= 0) {
            $("#targetLifeVal").text("0");	
          } else {
            $("#targetLifeVal").text(value.lifeLeft);	
          }	
        }
        $("#divBattleID").text(value.player);	
        $("#divBattleDamage").text("hurt " + value.damage);
        
        if((index+1) == gArrResults.length) {
          $("#divBattleID").text(gBattleWinner);
          $("#divBattleDamage").text("is the winner!");
          if(pParam[0].Reward !== "") {
            $("#divBattleReward").css("display", "block");
            $("#battleRewardImg").attr("src", pParam[0].Reward);	
          }
          $("#btnBattleList").attr("disabled", false);				
        }		
      },2000 * index);
    });
    */
  }
}

export default withIonLifeCycle(HuntContainer);
