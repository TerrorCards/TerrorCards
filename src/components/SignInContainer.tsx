import React from "react";
import {
  IonAlert,
  IonContent,
  IonCol,
  IonRow,
  IonGrid,
  IonItem,
  IonLabel,
  IonButton,
  IonModal,
  IonInput,
  withIonLifeCycle,
} from "@ionic/react";
import { callServer } from "./ajaxcalls";

interface props {
  signInCallback: any;
  signUpCallback: any;
}

interface state {
  userName: string;
  userPassword: string;
  userEmail: string;
  loginFailed: boolean;
  showForgotPassword: boolean;
  showForgotAlert: boolean;
  showForgotMessage: string;
}

class SignInContainer extends React.Component<props, state> {
  constructor(props: any) {
    super(props);

    this.state = {
      userName: "",
      userPassword: "",
      userEmail: "",
      loginFailed: false,
      showForgotPassword: false,
      showForgotAlert: false,
      showForgotMessage: "",
    };
  }

  componentDidMount() {
    console.log("ionViewDidEnter event fired");
  }

  componentDidUpdate(prevProps: any) {}

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

  //check if user exist

  checkLogin() {
    callServer("loginCheck", this.state.userPassword, this.state.userName)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        console.log(json);
        if (json) {
          //this.props.signInCallback();
          if (json.Response === "Failed") {
            this.setState({ loginFailed: true });
          } else {
            //send back to App to store and continue using app
            this.props.signInCallback(json);
          }
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  forgotPassword() {
    callServer("forgotPassword", { email: this.state.userEmail }, "")
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        console.log(json);
        if (json) {
          //this.props.signInCallback();
          if (json.Status === "Success") {
            this.setState(
              {
                showForgotAlert: true,
                showForgotMessage:
                  "Your login information has been sent to your email",
              },
              () => {
                this.setState({ showForgotPassword: false });
              }
            );
          } else {
            this.setState({
              showForgotAlert: true,
              showForgotMessage: "Sorry, no email found",
            });
          }
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  createNewDefaultAccount() {
    callServer("defaultAccount", { device: "123456" }, "")
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        console.log(json);
        if (json) {
          console.log(json);
          this.props.signInCallback(json);
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  renderSignInForm(j: any) {
    return (
      <IonGrid>
        <IonRow class="ion-align-items-center">
          <IonCol class="ion-text-center">
            <img src="assets/img/banner.jpg" alt="" width="100%" height={75} />
          </IonCol>
        </IonRow>
        <IonRow class="ion-align-items-center">
          <IonCol class="ion-text-center">
            If you're returning, sign in to access you account.
            <br></br>
            <br></br>If you're new, getting started is easy, click the link
            below and start your collection today!
          </IonCol>
        </IonRow>
        <IonRow class="ion-align-items-center">
          <IonCol class="ion-text-center">
            <IonItem>
              <IonLabel position="stacked">User name</IonLabel>
              <IonInput
                value={this.state.userName}
                placeholder="Your username"
                onIonChange={(e: any) =>
                  this.setState({ userName: e.detail.value })
                }
              ></IonInput>
            </IonItem>
          </IonCol>
        </IonRow>
        <IonRow class="ion-align-items-center">
          <IonCol class="ion-text-center">
            <IonItem>
              <IonLabel position="stacked">Password</IonLabel>
              <IonInput
                type="password"
                value={this.state.userPassword}
                placeholder="Your password"
                onIonChange={(e: any) =>
                  this.setState({ userPassword: e.detail.value })
                }
              ></IonInput>
            </IonItem>
          </IonCol>
        </IonRow>
        <IonRow class="ion-align-items-center">
          <IonCol class="ion-text-center">
            <IonButton
              shape="round"
              fill="outline"
              expand="full"
              onClick={() => {
                this.checkLogin();
              }}
            >
              Sign in
            </IonButton>
          </IonCol>
        </IonRow>
        <IonRow class="ion-align-items-center">
          <IonCol class="ion-text-center">
            <IonButton
              shape="round"
              fill="clear"
              expand="full"
              onClick={() => {
                this.setState({ showForgotPassword: true });
              }}
            >
              Forgot your password?
            </IonButton>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol></IonCol>
        </IonRow>
        <IonRow class="ion-align-items-center">
          <IonCol class="ion-text-center">
            <IonButton
              shape="round"
              fill="clear"
              expand="full"
              onClick={() => {
                this.createNewDefaultAccount();
              }}
            >
              New? Create an account now?
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    );
  }

  renderForgotPassword() {
    return (
      <IonGrid>
        <IonRow>
          <IonCol>
            <IonItem>
              <IonLabel position="stacked">Email Address</IonLabel>
              <IonInput
                value={this.state.userEmail}
                placeholder="Your email"
                onIonChange={(e: any) =>
                  this.setState({ userEmail: e.detail.value })
                }
              ></IonInput>
            </IonItem>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonButton
              shape="round"
              fill="outline"
              expand="full"
              onClick={() => {
                this.forgotPassword();
              }}
            >
              Send
            </IonButton>
          </IonCol>
        </IonRow>
        <IonRow>
          <IonCol>
            <IonButton
              shape="round"
              fill="outline"
              expand="full"
              onClick={() => {
                this.setState({ showForgotPassword: false });
              }}
            >
              Cancel
            </IonButton>
          </IonCol>
        </IonRow>
      </IonGrid>
    );
  }

  render() {
    return (
      <IonContent>
        {this.renderSignInForm("")}
        <IonModal isOpen={this.state.showForgotPassword}>
          {this.renderForgotPassword()}
        </IonModal>
        <IonAlert
          isOpen={this.state.loginFailed}
          onDidDismiss={() => this.setState({ loginFailed: false })}
          cssClass="my-custom-class"
          header={"Login Failed"}
          message={
            "Sorry, either the username or password is incorrect. Or no account exist."
          }
          buttons={["Try Again"]}
        />
        <IonAlert
          isOpen={this.state.showForgotAlert}
          onDidDismiss={() => this.setState({ showForgotAlert: false })}
          cssClass="my-custom-class"
          header={"Password Sent"}
          message={this.state.showForgotMessage}
          buttons={["Ok"]}
        />
      </IonContent>
    );
  }
}

export default withIonLifeCycle(SignInContainer);
