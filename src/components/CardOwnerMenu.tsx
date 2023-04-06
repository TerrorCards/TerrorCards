import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonLabel,
  IonList,
  IonItem,
  IonAvatar,
  IonButton,
  IonImg,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  withIonLifeCycle,
} from "@ionic/react";
import { closeCircleOutline, repeat } from "ionicons/icons";
import { callServer } from "./ajaxcalls";

interface props {
  user: any;
  cardNumber: any;
  cardYear: any;
  closePanel: any;
  tradeCallback: any;
}

interface state {
  playerList: Array<any>;
}

class CardOwnerMenu extends React.Component<props, state> {
  constructor(props: any) {
    super(props);

    this.state = {
      playerList: [],
    };
  }

  componentDidMount() {
    this.pullCardOwners();
  }

  ionViewWillEnter() {}

  ionViewWillLeave() {}

  ionViewDidEnter() {}

  ionViewDidLeave() {}

  pullCardOwners = () => {
    callServer(
      "tradeWhoHasCard",
      { number: this.props.cardNumber, year: this.props.cardYear },
      this.props.user.ID
    )
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

  renderPlayerList = () => {
    let items: Array<any> = [];
    this.state.playerList.forEach((p: any, i: any) => {
      items.push(
        <IonRow key={i}>
          <IonCol size="auto">
            <IonAvatar>
              <IonImg src={p.Image} style={{ width: 35, height: 35 }} />
            </IonAvatar>
          </IonCol>
          <IonCol>
            {p.Player.length > 15
              ? p.Player.substring(0, 14) + "..."
              : p.Player}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                fontSize: "smaller",
              }}
            >
              <div>Qty: {p.CardCount} </div>
              <div style={{ width: 10 }} className="ion-text-center">
                {" "}
                |{" "}
              </div>
              <div>{p.LastLogged}</div>
            </div>
          </IonCol>
          <IonCol size="auto">
            <IonButton
              color="success"
              expand="block"
              onClick={() => {
                this.props.tradeCallback(p.Player);
                if (this.props.closePanel !== null) {
                  this.props.closePanel();
                }
              }}
            >
              <IonIcon slot="icon-only" icon={repeat} color="dark" size="l" />
            </IonButton>
          </IonCol>
        </IonRow>
      );
    });
    return <IonGrid>{items}</IonGrid>;
  };

  render() {
    if (this.props.closePanel !== null) {
      return (
        <IonGrid>
          <IonRow>
            <IonCol>
              <div style={{ height: 10 }}></div>
              Owners with this card
            </IonCol>
            <IonCol>
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
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonList>{this.renderPlayerList()}</IonList>
            </IonCol>
          </IonRow>
        </IonGrid>
      );
    } else {
      return <IonList>{this.renderPlayerList()}</IonList>;
    }
  }
}

export default withIonLifeCycle(CardOwnerMenu);
