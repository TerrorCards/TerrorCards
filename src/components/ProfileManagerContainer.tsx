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
import { settingsOutline, closeCircleOutline } from 'ionicons/icons';
import { star, listCircle, create, refresh, repeat, personAdd, flag, closeCircle, bookmark, newspaper, chatbubble, statsChart, settings } from 'ionicons/icons';
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
};

class ProfileManagerContainer extends React.Component<props, state> {

    constructor(props: any) {
        super(props);

        this.state = {
            info: {},
            infoRender: null,
            initialSlide: 0,
            speed: 400
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
                    this.setState({ info: json }, () => {
                        //this.props.profileCallback(json);
                    });
                }
            })
            .catch((err: any) => {
                console.log(err);
            });
    }

    setEmail(value: any) {

    }

    sectionContent() {
        return (<IonCol></IonCol>)
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
                        </IonRow>
                        <IonRow>
                            <IonCol key={"email"}>
                                <IonLabel position="stacked">Account email</IonLabel>
                                <IonInput value={this.state.info.Email} placeholder="Your contact email" onIonChange={(e) => this.setEmail(e.detail.value!)}></IonInput>
                            </IonCol>
                        </IonRow>
                        <IonRow>
                            <IonCol key={"password"}>
                                <IonLabel position="stacked">Password</IonLabel>
                                <IonInput type="password" value={this.state.info.Password} placeholder="Enter a name password" onIonChange={(e) => this.setEmail(e.detail.value!)}></IonInput>
                            </IonCol>
                        </IonRow>  
                        <IonRow>
                            <IonCol key={"wallet"}>
                                <IonLabel position="stacked">Crypto wallet (wax)</IonLabel>
                                <IonInput value={""} placeholder="Enter your Wax id (.wam)" onIonChange={(e) => this.setEmail(e.detail.value!)}></IonInput>
                            </IonCol>
                        </IonRow>                                              
                        <IonRow>
                            <IonCol key={"bio"}>
                                <IonLabel position="stacked">Small bio for others to see</IonLabel>
                                <IonTextarea value={""} placeholder="About yourself" onIonChange={(e) => this.setEmail(e.detail.value!)}></IonTextarea>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                    <IonGrid id="list">
                        <IonRow>
                            <IonCol key={"custom"}>
                                <IonItem>
                                    <IonLabel>Community Lists</IonLabel>
                                    <IonSelect value={""} placeholder="Select One" onIonChange={(e) => this.setEmail(e.detail.value)}>
                                        <IonSelectOption value="Friends">Friends</IonSelectOption>
                                        <IonSelectOption value="Blocklist">Blocked list</IonSelectOption>
                                    </IonSelect>
                                </IonItem>
                            </IonCol>
                        </IonRow>
                        <IonRow>
                            {this.sectionContent()}
                        </IonRow>
                    </IonGrid>
                </IonContent>
            </IonPage>
        );
    }
};



export default withIonLifeCycle(ProfileManagerContainer);
