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
  deviceInfo: any;
}

interface state {
  userName: string;
  userPassword: string;
  userEmail: string;
  loginFailed: boolean;
  showForgotPassword: boolean;
  showForgotAlert: boolean;
  showForgotMessage: string;
  showTerms: boolean;
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
      showTerms: false,
    };
  }

  componentDidMount() {
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

  //check if user exist

  checkLogin() {
    callServer("loginCheck", this.state.userPassword, this.state.userName)
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        //console.log(json);
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
        //console.log(json);
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
    callServer("defaultAccount", { device: this.props.deviceInfo.uuid }, "")
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        ////console.log(json);
        if (json) {
          //console.log(json);
          this.props.signInCallback(json);
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  }

  agreeToTerms() {
    this.setState({ showTerms: true });
  }

  renderSignInForm(j: any) {
    return (
      <IonGrid>
        <IonRow class="ion-align-items-center">
          <IonCol class="ion-text-center">
            <img
              src="http://TerrorCards.com/images/banners/app_banner.jpg"
              alt=""
              width="100%"
              height={75}
            />
          </IonCol>
        </IonRow>
        <IonRow class="ion-align-items-center">
          <IonCol class="ion-text-center">
            If you're returning, sign in to access you account.
          </IonCol>
        </IonRow>
        <IonRow class="ion-align-items-center">
          <IonCol class="ion-text-center">
            <IonItem>
              <IonLabel position="stacked">User name</IonLabel>
              <IonInput
                value={this.state.userName}
                placeholder="Your username"
                onIonInput={(e: any) =>
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
                onIonInput={(e: any) =>
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
            Getting started is easy, click the link below and start your
            collection today!
            <IonButton
              shape="round"
              fill="clear"
              expand="full"
              onClick={() => {
                this.agreeToTerms();
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
                onIonInput={(e: any) =>
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
        <IonModal isOpen={this.state.showTerms}>
          <IonContent class="ion-text-center">
            <div style={{ height: "100%", width: "95%" }}>
              END USERS LICENSE AGREEMENT
              <p></p>Please read the following terms and conditions carefully
              before using this APP. Your use, distribution or installation of
              this copy of 'TERROR CARDS' indicates your acceptance of this
              License.
              <p></p>APP here means Software, image files, all accompanying
              files, data and materials received with your order of 'TERROR
              CARDS'. If you do not agree to any of the terms of this License,
              then do not install, distribute or use the APP. Warrantee covers
              defects in the software, which prevents successfully installing
              the software in the buyer's device.
              <p></p>Warrantee does not cover fitness of purpose, not meeting of
              expectations or needs in the mind of the buyer. This APP is for
              personal use only and may be installed and used one APP and one
              account per device. Its component parts may not be separated for
              use on more than one computer. All components accompanying the
              software are copyrighted by PREVIN WONG and may not be taken
              apart, modified, used or published with other software or means
              except with the APP software and may not be distributed or copied
              in any manner. <p></p>This APP, all accompanying files, data and
              materials, are distributed 'AS IS' and with no warranties of any
              kind, whether express or implied. The user must assume all risk of
              using the program. This disclaimer of warranty constitutes an
              essential part of the agreement. Any liability of PREVIN WONG will
              be limited exclusively to refund of purchase price. In addition,
              in no event shall PREVIN WONG, or its principals, shareholders,
              officers, employees, affiliates, contractors, subsidiaries, or
              parent organizations, be liable for any incidental, consequential,
              punitive or any other damages whatsoever relating to the use of
              APP. <p></p>In addition, in no event does PREVIN WONG authorize
              you to use this APP in applications or systems where APP's failure
              to perform can reasonably be expected to result in a physical
              injury, or in loss of life. Any such use by you is entirely at
              your own risk, and you agree to hold PREVIN WONG harmless from any
              claims or losses relating to such unauthorized use. This Agreement
              constitutes the entire statement of the Agreement between the
              parties on the subject matter, and merges and supersedes all other
              or prior understandings, purchase orders, agreements and
              arrangements. <p></p>This Agreement shall be governed by the laws
              of United States of America OR STATE. PREVIN WONG the owner of the
              copyright of this APP, all of its derivatives, title and
              accompanying materials are the exclusive property of PREVIN WONG.
              All rights of any kind, which are not expressly granted in this
              License, are entirely and exclusively reserved to and by PREVIN
              WONG. You may not rent, lease, transfer, modify, translate,
              reverse engineer, de-compile, disassemble or create derivative
              works based on this APP. <p></p>You may not make access to APP
              available to others in connection with a service bureau,
              application service provider, or similar business, or use this APP
              in a business to provide file compression, decompression, or
              conversion services to others. There are no third party
              beneficiaries of any promises, obligations or representations made
              by PREVIN WONG herein. You may not disclose to other persons the
              data or techniques relating to this APP that you know or should
              know that it is a trade secret of the [PREVIN WONG] in any manner
              that will cause damage to PREVIN WONG. This APP and all services
              provided may be used for lawful purposes only. Transmission,
              storage, or presentation of any information, data or material in
              violation of any United States of America, State or City law is
              strictly prohibited. This includes, but is not limited to:
              copyrighted material, material we judge to be threatening or
              obscene, or material protected by trade secret and other statute.
              You agree to indemnify and hold PREVIN WONG harmless from any
              claims resulting from the use of this APP, which may damage any
              other party. This APP contains user-defined content. <p></p>By
              installing this APP, you agree to not create any content that is
              objectionable, obscene, and contains nudity. This APP has a zero
              tolerance for abuse of users towards other users. Failure to do so
              will result in your account termination.
            </div>
          </IonContent>
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonButton
                  expand="full"
                  color="success"
                  onClick={() => {
                    this.setState({ showTerms: false }, () => {
                      this.createNewDefaultAccount();
                    });
                  }}
                >
                  Accept
                </IonButton>
              </IonCol>
              <IonCol>
                <IonButton
                  expand="full"
                  color="danger"
                  onClick={() => {
                    this.setState({ showTerms: false });
                  }}
                >
                  Decline
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonModal>
      </IonContent>
    );
  }
}

export default withIonLifeCycle(SignInContainer);
