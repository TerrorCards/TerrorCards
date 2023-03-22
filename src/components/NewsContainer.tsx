import React from "react";
import {
  IonContent,
  IonCard,
  IonCardContent,
  withIonLifeCycle,
} from "@ionic/react";
import { callServer } from "./ajaxcalls";

interface props {
  name: string;
}

interface state {
  newsState: any;
}

class NewsContainer extends React.Component<props, state> {
  constructor(props: any) {
    super(props);

    this.state = {
      newsState: [],
    };
  }

  componentDidMount() {
    this.pullNews();
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

  //BEGIN BANNER CODE
  pullNews() {
    callServer("fetchNews", "", "TerrorCards")
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        //console.log(json);
        if (json.length > 0) {
          let msgList: Array<any> = [];
          json.forEach((j: any, i: number) => {
            msgList.push(this.renderNewsItem(j, i));
          });
          this.setState({ newsState: msgList });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  renderNewsItem(j: any, i: number) {
    return (
      <IonCard key={i}>
        <IonCardContent>
          <div dangerouslySetInnerHTML={{ __html: j.Text }}></div>
          <div dangerouslySetInnerHTML={{ __html: j.Timestamp }}></div>
        </IonCardContent>
      </IonCard>
    );
  }

  render() {
    return (
      <IonContent style={{ backgroundColor: "#333" }}>
        {this.state.newsState}
      </IonContent>
    );
  }
}

export default withIonLifeCycle(NewsContainer);
