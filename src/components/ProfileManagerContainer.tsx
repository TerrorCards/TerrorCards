import React, { useState, useEffect } from 'react';
import {
    IonSlides, IonSlide, IonContent, IonHeader, IonCol, IonRow, IonGrid, IonCard, IonCardHeader, IonCardSubtitle,
    IonCardTitle, IonCardContent, IonItem, IonIcon, IonLabel, IonButton, IonList, isPlatform, IonChip, IonAvatar, IonImg, IonRefresher,
    IonRefresherContent, IonSearchbar, IonPopover, IonItemSliding, IonItemOptions, IonItemOption, IonTextarea, IonModal,
    IonMenuButton,
    IonButtons, IonSelect, IonSelectOption, 
    IonToolbar, IonInput,
    IonTitle, IonPage, IonAlert,
    withIonLifeCycle
} from '@ionic/react';
import { checkmark, close, closeCircleOutline } from 'ionicons/icons';
import { callServer } from './ajaxcalls';

interface props {
    user: any;
    profileCallback: any;
    closePanel: any;
    signOut:any;
}

interface state {
    info: any,
    infoRender: any,
    initialSlide: number,
    speed: number

    currEmail: string;
    currPassword: string;
    currWallet: string;
    currDescription: string;
    currContactUs: string;
    currUserName: string;
    requestType: string;
    status: boolean;
    confirmDeleteAlert: boolean;
    needToRegister: boolean;
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
            currWallet: "",
            currDescription: "",
            currContactUs: "",
            currUserName:"",
            requestType: "",
            status: false,
            confirmDeleteAlert: false,
            needToRegister: false
        }
    }

    componentDidMount() {
        this.pullProfile();
        console.log('ionViewDidEnter event fired');
    }

    componentDidUpdate(prevProps: any) {
        //this.pullProfile(); 
        //console.log(prevProps);
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
                    if(json.Registered === "1") {
                        this.setState({ info: json, 
                            currEmail: json.Email, 
                            currPassword: json.Password, 
                            currWallet: json.Wallet,
                            currDescription: json.Description,
                            needToRegister: false
                        }, () => {
                            //this.props.profileCallback(json);
                        });
                    } else {
                        this.setState({ 
                            needToRegister: true
                        }, () => {
                            //this.props.profileCallback(json);
                        });
                    }
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
                        this.setState({requestType: "email", status: true}, () => {
                            this.pullProfile();
                        });
                    } else {
                        this.setState({requestType: "email", status: false, currEmail: this.state.info.Email});
                    }
                }
            })
            .catch((err: any) => {
                console.log(err);
            });
        } else {
            this.setState({requestType: "email", status: false, currEmail: this.state.info.Email});
        }
    }

    setPassword() {
        if(this.state.currPassword !== "") {
        callServer("changePassword", {password: this.state.currPassword}, this.props.user.ID)?.then((resp) => { return resp.json(); })
            .then((json) => {
                if (json) {
                    if(json.Response === "Success") {
                        this.setState({requestType: "password", status: true},() => {
                            this.pullProfile();
                        });
                    } else {
                        this.setState({requestType: "password", status: false, currPassword: this.state.info.Password});
                    }
                }
            })
            .catch((err: any) => {
                console.log(err);
            }); 
        }  else {
            this.setState({requestType: "password", status: false, currPassword: this.state.info.Password});
        }      
    }

    setWallet() {
        if(this.state.currWallet !== "") {
            callServer("changeWallet", {wallet: this.state.currWallet}, this.props.user.ID)?.then((resp) => { return resp.json(); })
                .then((json) => {
                    if (json) {
                        if(json.Response === "Success") {
                            this.setState({requestType: "wallet", status: true},() => {
                                this.pullProfile();
                            });
                        } else {
                            this.setState({requestType: "wallet", status: false, currWallet: this.state.info.Wallet});
                        }
                    }
                })
                .catch((err: any) => {
                    console.log(err);
                }); 
            }  else {
                this.setState({requestType: "wallet", status: false, currWallet: this.state.info.Wallet});
            }      
    }

    setDescription() {
        if(this.state.currDescription !== "") {
            if(this.state.currDescription.length <= 255) {
                callServer("changeDescription", {description: this.state.currDescription}, this.props.user.ID)?.then((resp) => { return resp.json(); })
                .then((json) => {
                    if (json) {
                        if(json.Response === "Success") {
                            this.setState({requestType: "description", status: true},() => {
                                this.pullProfile();
                            });
                        } else {
                            this.setState({requestType: "description", status: false, currDescription: this.state.info.Description});
                        }
                    }
                })
                .catch((err: any) => {
                    console.log(err);
                }); 
            } else {
                this.setState({requestType: "description", status: false}); 
            }
        }  else {
            this.setState({requestType: "description", status: false, currDescription: this.state.info.Description});
        }      
    }

    sendContactUs(value:any) {
        if(value !== "") {
            callServer("contactUs", {message: value, email:this.state.info.Email}, this.props.user.ID)?.then((resp) => { return resp.json(); })
                .then((json) => {
                    if (json) {
                        if(json[0].Status) {
                            this.setState({requestType: "contactUs", status: true},() => {
                                this.pullProfile();
                            });
                        } else {
                            this.setState({requestType: "contactUs", status: false});
                        }
                    }
                })
                .catch((err: any) => {
                    console.log(err);
                }); 
        }  else {
            this.setState({requestType: "contactUs", status: false});
        }      
    }

    confirmDelete() {
        this.setState({confirmDeleteAlert: true})
    }

    requestDelete() {
        callServer("deleteAccount", "", this.props.user.ID)?.then((resp) => { return resp.json(); })
        .then((json) => {
            if (json) {
                this.props.signOut();
                this.props.closePanel();
            }
        })
        .catch((err: any) => {
            console.log(err);
        });   
    }

    registerAccount() {
        callServer("registerUser", {user: this.state.currUserName, device:"999888777", email:this.state.currEmail, password:this.state.currPassword}, this.props.user.ID)?.then((resp) => { return resp.json(); })
        .then((json) => {
            if (json) {
                if(json.Response === "Fail") {
                    if(json.Type === "userName") {
                        this.setState({requestType: "userName", status: true},() => {
                        });
                    } else {
                        this.setState({requestType: "email", status: true},() => {
                        });
                    }
                } else {
                    this.setState({requestType: "", status: false, needToRegister: false},() => {
                        this.pullProfile();
                    });                   
                }
            }
        })
        .catch((err: any) => {
            console.log(err);
        }); 
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
                                    <IonButton fill='clear' onClick={(e: any) => { this.props.closePanel(e) }}>
                                        <IonIcon slot="icon-only" icon={closeCircleOutline} color="dark" size="l" />
                                    </IonButton>
                                </div>
                            </IonLabel>
                        </IonItem>

                    </IonToolbar>
                </IonHeader>
                {(this.state.needToRegister) ?
                <IonContent>
                <IonGrid id="list">
                <IonRow>
                    <IonCol key={"email"}>
                        <IonLabel position="stacked">User name
                        {(this.state.requestType === "userName")?
                                (this.state.status)?
                                <IonIcon slot="icon-only" icon={checkmark} color="success" size="l" />:
                                <IonIcon slot="icon-only" icon={close} color="danger" size="l" />   
                            :null 
                        }                             
                        </IonLabel>
                        <IonInput value={this.state.currUserName} placeholder="Your user name" onIonChange={(e) => {
                            this.setState({currUserName: e.detail.value!})
                        }}
                        ></IonInput>
                    </IonCol>
                </IonRow>                        
                <IonRow>
                    <IonCol key={"email"}>
                        <IonLabel position="stacked">Account email
                        {(this.state.requestType === "email")?
                                (this.state.status)?
                                <IonIcon slot="icon-only" icon={checkmark} color="success" size="l" />:
                                <IonIcon slot="icon-only" icon={close} color="danger" size="l" />   
                            :null 
                        }                             
                        </IonLabel>
                        <IonInput value={this.state.currEmail} placeholder="Your contact email" onIonChange={(e) => {
                            this.setState({currEmail: e.detail.value!})
                        }}
                        ></IonInput>
                    </IonCol>
                </IonRow>
                <IonRow>
                    <IonCol key={"password"}>
                        <IonLabel position="stacked">Password
                        {(this.state.requestType === "password")?
                                (this.state.status)?
                                <IonIcon slot="icon-only" icon={checkmark} color="success" size="l" />:
                                <IonIcon slot="icon-only" icon={close} color="danger" size="l" />   
                            :null 
                        } 
                        </IonLabel>
                        <IonInput type="password" value={this.state.currPassword} placeholder="Enter a name password"  onIonChange={(e) => {
                            this.setState({currPassword: e.detail.value!})
                        }}></IonInput>
                    </IonCol>
                </IonRow>  
                <IonRow>
                    <IonCol key={"register"}>
                        <IonButton expand="block" onClick={() => {this.registerAccount()}} color={"success"}
                            disabled={(this.state.currUserName === "" || this.state.currEmail === "" || this.state.currPassword === "") ? true : false}
                        >{"Register account"}</IonButton>
                        <IonLabel position="stacked">By registering your account, you will not lose your cards. Also you will be able to trade, battle, and post to the forum</IonLabel>
                    </IonCol>
                </IonRow>                                       
                </IonGrid>                    
            </IonContent> 
                :

                <IonContent>
                    <IonGrid id="personal">
                    <IonRow>
                        <IonCol key={"avatar"}>
                            <IonLabel position="stacked">Tap on image to update</IonLabel>
                            <IonImg style={{ width: "100px", height: "100px" }} src={this.state.info.Image}></IonImg>
                        </IonCol>
                        <IonCol key={"bio"}>
                            <IonLabel position="stacked">Small bio for others to see
                            {(this.state.requestType === "description")?
                                    (this.state.status)?
                                    <IonIcon slot="icon-only" icon={checkmark} color="success" size="l" />:
                                    <IonIcon slot="icon-only" icon={close} color="danger" size="l" />   
                                :null 
                            }                                  
                            </IonLabel>
                            <IonTextarea value={this.state.currDescription} placeholder="About yourself" onIonChange={(e) => {
                                this.setState({currDescription: e.detail.value!})
                            }}
                            onIonBlur={(e) => {
                                if(this.state.currDescription !== this.state.info.currDescription) {
                                    this.setDescription()
                                }                                    
                            }}></IonTextarea>
                        </IonCol>                            
                    </IonRow>
                    <IonRow>
                        <IonCol key={"email"}>
                            <IonLabel position="stacked">Account email
                            {(this.state.requestType === "email")?
                                    (this.state.status)?
                                    <IonIcon slot="icon-only" icon={checkmark} color="success" size="l" />:
                                    <IonIcon slot="icon-only" icon={close} color="danger" size="l" />   
                                :null 
                            }                                
                            </IonLabel>
                            <IonInput value={this.state.currEmail} placeholder="Your contact email" onIonChange={(e) => {
                                this.setState({currEmail: e.detail.value!})
                            }}
                            onIonBlur={(e) => {
                                if(this.state.currEmail !== this.state.info.Email) {
                                    this.setEmail()
                                }
                            }}
                            ></IonInput>
                        </IonCol>
                    </IonRow>
                    <IonRow>
                        <IonCol key={"password"}>
                            <IonLabel position="stacked">Password
                            {(this.state.requestType === "password")?
                                    (this.state.status)?
                                    <IonIcon slot="icon-only" icon={checkmark} color="success" size="l" />:
                                    <IonIcon slot="icon-only" icon={close} color="danger" size="l" />   
                                :null 
                            }                                    
                            </IonLabel>
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
                            <IonLabel position="stacked">Crypto wallet (wax)
                            {(this.state.requestType === "wallet")?
                                    (this.state.status)?
                                    <IonIcon slot="icon-only" icon={checkmark} color="success" size="l" />:
                                    <IonIcon slot="icon-only" icon={close} color="danger" size="l" />   
                                :null 
                            }                                 
                            </IonLabel>
                            <IonInput type="text" value={this.state.currWallet} placeholder="Enter your wallet"  onIonChange={(e) => {
                                this.setState({currWallet: e.detail.value!})
                            }}
                            onIonBlur={(e) => {
                                if(this.state.currWallet !== this.state.info.Wallet) {
                                    this.setWallet()
                                }                                    
                            }}></IonInput>
                        </IonCol>
                    </IonRow>  
                    <IonRow>
                        <IonCol key={"ContactUs"}>
                            <IonLabel position="stacked">Contact Us
                            {(this.state.requestType === "contactUs")?
                                    (this.state.status)?
                                    <IonIcon slot="icon-only" icon={checkmark} color="success" size="l" />:
                                    <IonIcon slot="icon-only" icon={close} color="danger" size="l" />   
                                :null 
                            }                                  
                            </IonLabel>
                            <IonTextarea value={this.state.currContactUs} placeholder="Your message" onIonChange={(e) => {
                                this.setState({currContactUs: e.detail.value!})
                            }}
                            onIonBlur={(e) => {
                                if(this.state.currContactUs !== "") {
                                    this.sendContactUs(this.state.currContactUs);
                                }                                    
                            }}
                            ></IonTextarea>
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
                        <IonCol key={"delete"}>
                            <IonButton expand="block" onClick={() => {this.confirmDelete()}} color={"danger"}>{"Remove Account"}</IonButton>
                            <IonLabel position="stacked">By removing your account, you will lose all your cards and contribute them to a collection pool</IonLabel>
                            <IonAlert
                                isOpen={this.state.confirmDeleteAlert}
                                onDidDismiss={() => this.setState({confirmDeleteAlert:false})}
                                cssClass='my-custom-class'
                                header={'Delete Account'}
                                subHeader={''}
                                message={'By removing your account, you will lose all your cards'}
                                buttons={[
                                    {
                                      text: 'Cancel',
                                      role: 'cancel',
                                      cssClass: 'secondary',
                                      handler: blah => {
                                        this.setState({confirmDeleteAlert:false});
                                      }
                                    },
                                    {
                                      text: 'Okay',
                                      handler: () => {
                                        this.requestDelete()
                                      }
                                    }
                                  ]}
                            />
                        </IonCol>
                    </IonRow>                         
                </IonGrid>
                </IonContent>               
                }
            </IonPage>
        );
    }
};



export default withIonLifeCycle(ProfileManagerContainer);
