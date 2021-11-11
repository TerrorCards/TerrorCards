import React, { useState, useEffect } from 'react';
import {
    IonSlides, IonSlide, IonContent, IonHeader, IonCol, IonRow, IonGrid, IonCard, IonCardHeader, IonCardSubtitle,
    IonCardTitle, IonCardContent, IonItem, IonIcon, IonLabel, IonButton, IonList, isPlatform, IonChip, IonAvatar, IonImg, IonRefresher,
    IonRefresherContent, IonSearchbar, IonPopover, IonItemSliding, IonItemOptions, IonItemOption, IonTextarea, IonModal,
    IonMenuButton,
    IonButtons, IonSelect, IonSelectOption, 
    IonToolbar, IonInput,
    IonTitle, IonPage,
    withIonLifeCycle
} from '@ionic/react';
import { checkmark, close, closeCircleOutline } from 'ionicons/icons';
import { callServer } from './ajaxcalls';

interface props {
    user: any;
    profileCallback: any;
    closePanel: any;
}

interface state {
    info: any,
    infoRender: any,
    initialSlide: number,
    speed: number

    currEmail: string;
    currPassword: string;
    requestType: string;
    status: boolean;
};

class ProfileManagerContainer extends React.Component<props, state> {

    constructor(props: any) {
        super(props);

        this.state = {
            info: {},
            infoRender: null,
            initialSlide: 0,
            speed: 400,
            currEmail: "",
            currPassword: "",
            requestType: "",
            status: false
        }
    }

    componentDidMount() {
        this.pullProfile();
        console.log('ionViewDidEnter event fired');
    }

    componentDidUpdate(prevProps: any) {
        //this.pullProfile(); 
        console.log(prevProps);
    }

    ionViewWillEnter() {
        this.pullProfile();
        console.log('ionViewWillEnter event fired')
    }

    ionViewWillLeave() {
        console.log('ionViewWillLeave event fired')
    }

    ionViewDidEnter() {
        console.log('ionViewDidEnter event fired')
    }

    ionViewDidLeave() {
        console.log('ionViewDidLeave event fired')
    }

    closePanel() {

    }

    viewHeight = (offset: number) => {
        return (window.innerHeight / offset);
    }


    //BEGIN BANNER CODE
    pullProfile() {
        callServer("userInfo", "", this.props.user.ID)?.then((resp) => { return resp.json(); })
            .then((json) => {
                console.log(json);
                if (json) {
                    this.setState({ info: json, currEmail: json.Email, currPassword: json.Password }, () => {
                        //this.props.profileCallback(json);
                    });
                }
            })
            .catch((err: any) => {
                console.log(err);
            });
    }

    setEmail() {
        //check if email is already used
        if(this.state.currEmail !== "") {
            callServer("checkEmailExist", {email: this.state.currEmail}, this.props.user.ID)?.then((resp) => { return resp.json(); })
            .then((json) => {
                if (json) {
                    if(json.Response === "Success") {
                        this.setState({requestType: "email", status: true});
                    } else {
                        this.setState({requestType: "email", status: false});
                    }
                }
            })
            .catch((err: any) => {
                console.log(err);
            });
        }
    }

    setBio(value: any) {

    }

    setPassword() {
        callServer("changePassword", {password: this.state.currPassword}, this.props.user.ID)?.then((resp) => { return resp.json(); })
            .then((json) => {
                console.log(json);
                if (json) {
                    if(json.Response === "Success") {
                        this.setState({requestType: "password", status: true});
                    } else {
                        this.setState({requestType: "password", status: false});
                    }
                }
            })
            .catch((err: any) => {
                console.log(err);
            });        
    }

    setCrypto(value: any) {
        
    }


    sectionContent() {
        return (<IonCol></IonCol>)
    }

    confirmRemove() {

    }



    render() {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonItem>
                            <IonLabel>Profile</IonLabel>
                            <IonLabel>
                                <div style={{ textAlign: 'end' }}>
                                    <IonButton fill='clear' onClick={(e: any) => { this.props.closePanel() }}>
                                        <IonIcon slot="icon-only" icon={closeCircleOutline} color="dark" size="l" />
                                    </IonButton>
                                </div>
                            </IonLabel>
                        </IonItem>

                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonGrid id="personal">
                        <IonRow>
                            <IonCol key={"avatar"}>
                                <IonLabel position="stacked">Tap on image to update</IonLabel>
                                <IonImg style={{ width: "100px", height: "100px" }} src={this.state.info.Image}></IonImg>
                            </IonCol>
                            <IonCol key={"bio"}>
                                <IonLabel position="stacked">Small bio for others to see</IonLabel>
                                <IonTextarea value={""} placeholder="About yourself" onIonChange={(e) => this.setBio(e.detail.value!)}></IonTextarea>
                            </IonCol>                            
                        </IonRow>
                        <IonRow>
                            <IonCol key={"email"}>
                                <IonLabel position="stacked">Account email</IonLabel>
                                <IonInput value={this.state.currEmail} placeholder="Your contact email" onIonChange={(e) => {
                                    this.setState({currEmail: e.detail.value!})
                                }}
                                onIonBlur={(e) => {
                                    if(this.state.currEmail !== this.state.info.Email) {
                                        this.setEmail()
                                    }
                                }}
                                ></IonInput>
                                {(this.state.requestType === "email" && this.state.status)?
                                    <IonIcon slot="icon-only" icon={checkmark} color="success" size="s" />:
                                    <IonIcon slot="icon-only" icon={close} color="danger" size="s" />    
                                }
                            </IonCol>
                        </IonRow>
                        <IonRow>
                            <IonCol key={"password"}>
                                <IonLabel position="stacked">Password</IonLabel>
                                <IonInput type="password" value={this.state.currPassword} placeholder="Enter a name password"  onIonChange={(e) => {
                                    this.setState({currPassword: e.detail.value!})
                                }}
                                onIonBlur={(e) => {
                                    if(this.state.currPassword !== this.state.info.Password) {
                                        this.setPassword()
                                    }                                    
                                }}></IonInput>
                            </IonCol>
                        </IonRow>  
                        <IonRow>
                            <IonCol key={"wallet"}>
                                <IonLabel position="stacked">Crypto wallet (wax)</IonLabel>
                                <IonInput value={""} placeholder="Enter your Wax id (.wam)" onIonChange={(e) => this.setCrypto(e.detail.value!)}></IonInput>
                            </IonCol>
                        </IonRow>  
                        <IonRow>
                            <IonCol key={"ContactUs"}>
                                <IonLabel position="stacked">Contact Us</IonLabel>
                                <IonTextarea value={""} placeholder="Your message" onIonChange={(e) => this.setBio(e.detail.value!)}></IonTextarea>
                            </IonCol>                                                       
                        </IonRow>                                            
                    </IonGrid>
                    <IonGrid id="list">
                        <IonRow>
                            {this.sectionContent()}
                        </IonRow>
                        <IonRow>
                            <IonCol key={"custom"}>{''}</IonCol>
                        </IonRow>   
                        <IonRow>
                            <IonCol key={"custom"}>{''}</IonCol>
                        </IonRow> 
                        <IonRow>
                            <IonCol key={"custom"}>{''}</IonCol>
                        </IonRow>                                                                      
                        <IonRow>
                            <IonCol key={"delete"}>
                                <IonButton expand="block" onClick={() => {this.confirmRemove()}} color={"danger"}>{"Remove Account"}</IonButton>
                                <IonLabel position="stacked">By removing your account, you will lose all your cards and contribute them to a collection pool</IonLabel>
                            </IonCol>
                        </IonRow>                         
                    </IonGrid>
                </IonContent>
            </IonPage>
        );
    }
};



export default withIonLifeCycle(ProfileManagerContainer);
