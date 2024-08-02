import React from "react";
import {
  withIonLifeCycle,
  IonGrid,
  IonRow,
  IonCol,
  IonModal,
  IonButton,
  IonImg,
  IonContent,
  IonIcon,
  IonBadge,
  IonText,
  IonPopover,
  IonLabel,
  IonAlert,
} from "@ionic/react";
import {
  copyOutline,
  flashOutline,
  settingsOutline,
  closeCircleOutline,
} from "ionicons/icons";
import "./GalleryContainer.css";
import GalleryMenu from "./GalleryMenu";
import CardOwnerMenu from "./CardOwnerMenu";
import { callServer } from "./ajaxcalls";

interface props {
  galleryProps: any;
  nftProps: any;
  settingsCallback: any;
  user: any;
  tradeCallback: any;
}

interface state {
  showModal: boolean;
  showDetails: boolean;
  showAlert: boolean;
  alertMsg: string;
  cardDetails: any;
  cardDetailsFromServer: any;
  dataList: Array<any>;
  chunkedList: Array<any>;
  length: number;
  list: any;
  infiniteScroll: any;
  imgList: Array<any>;
  viewState: string;
  nftAccount: string;
  nftList: Array<any>;
  nftImgList: Array<any>;
  showSettingPopover: boolean;
  event: any;
  showOwners: boolean;
  activeNFTMintCard: any;
  showMintConfirm: boolean;
  showMintButton: boolean;
  mintButtonHelp: string;
}

class GalleryContainer extends React.Component<props, state> {
  constructor(props: any) {
    super(props);

    this.state = {
      showModal: false,
      showDetails: false,
      showAlert: false,
      cardDetails: null,
      cardDetailsFromServer: null,
      dataList: [],
      chunkedList: [],
      length: 0,
      list: null,
      infiniteScroll: null,
      imgList: [],
      viewState: "cards",
      nftAccount: "",
      nftList: [],
      nftImgList: [],
      showSettingPopover: false,
      event: undefined,
      showOwners: false,
      alertMsg: "",
      activeNFTMintCard: null,
      showMintConfirm: false,
      showMintButton: false,
      mintButtonHelp: "",
    };
  }

  componentDidMount() {
    this.pullCards();
    //console.log("component did mount event fired");
  }

  componentDidUpdate(prevProps: any) {
    if (
      prevProps.galleryProps.year !== this.props.galleryProps.year ||
      prevProps.galleryProps.view !== this.props.galleryProps.view ||
      prevProps.galleryProps.set !== this.props.galleryProps.set ||
      prevProps.galleryProps.viewSortField !==
        this.props.galleryProps.viewSortField ||
      prevProps.galleryProps.viewSortDirection !==
        this.props.galleryProps.viewSortDirection ||
      prevProps.nftProps.collection !== this.props.nftProps.collection ||
      prevProps.nftProps.schema !== this.props.nftProps.schema ||
      prevProps.nftProps.template !== this.props.nftProps.template
    ) {
      if (this.state.viewState === "nft") {
        this.pullNFTs();
      } else {
        if (
          prevProps.galleryProps.viewSortField !==
            this.props.galleryProps.viewSortField ||
          prevProps.galleryProps.viewSortDirection !==
            this.props.galleryProps.viewSortDirection
        ) {
          //just re-sort cards.
          this.sortCards();
        } else {
          this.pullCards();
        }
      }
      //console.log("Props updated");
    }
    if (
      prevProps.galleryProps.layoutCount !==
        this.props.galleryProps.layoutCount ||
      prevProps.nftProps.layoutCount !== this.props.nftProps.layoutCount
    ) {
      if (this.state.viewState === "nft") {
        this.resetChunks();
      } else {
        this.sortCards();
      }
    }
  }

  ionViewWillEnter() {
    //console.log("ionViewWillEnter event fired");
  }

  ionViewWillLeave() {
    //console.log("ionViewWillLeave event fired");
  }

  ionViewDidEnter() {
    if (this.state.viewState === "nft") {
      this.pullNFTs();
    } else {
      this.pullCards();
    }
    //console.log("ionViewDidEnter event fired");
  }

  ionViewDidLeave() {
    //console.log("ionViewDidLeave event fired");
  }

  //Functions to do chunking of data
  chunkVersions = (array: Array<any>) => {
    const localList = [...array];
    let chunkList: Array<any> = [];
    if (localList.length > 0) {
      chunkList = this.chunk(
        localList,
        this.state.viewState === "nft"
          ? this.props.nftProps.layoutCount
          : this.props.galleryProps.layoutCount
      );
    }
    return chunkList;
  };

  chunk = (array: Array<any>, size: number) => {
    const temparray = [];
    const chunk = size;
    let i, j;
    for (i = 0, j = array.length; i < j; i += chunk) {
      temparray.push(array.slice(i, i + chunk));
    }
    return temparray;
  };
  //End chunking functions

  showCardetails = (card: any, front: boolean, owners: boolean) => {
    //Recent trades: {result[0].recentTrades} <br></br>(past 48 hrs)
    this.pullCardDetails(this.props.user.ID, card).then((result: any) => {
      this.checkMintNFTReqs(card).then((mintCheck: any) => {
        //console.log(result);
        let currImg = card.Image;
        if (!front) {
          currImg = card.Image.replace(/front/g, "back");
        }
        const details = (
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonImg
                  src={currImg}
                  onClick={() => {
                    this.showCardetails(card, !front, owners);
                  }}
                ></IonImg>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonText color="dark">Count: {result[0].count}</IonText>
              </IonCol>
              <IonCol>
                <IonText color="dark">
                  Own: {card.Count !== null ? card.Count : 0}
                </IonText>
              </IonCol>
              <IonCol>
                <IonText color="dark">
                  Sold Out: {result[0].cardSoldOut}
                </IonText>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonText color="dark">
                  Set: {card.SetName.replace(/_/g, " ")}
                </IonText>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonGrid>
                  <IonRow>
                    <IonCol>
                      <IonButton
                        color={"dark"}
                        size="small"
                        expand="block"
                        onClick={() => {
                          this.showCardetails(card, front, !owners);
                        }}
                      >
                        Show owners
                      </IonButton>
                    </IonCol>
                    <IonCol>
                      {mintCheck.status === "success" && (
                        <IonButton
                          color={"dark"}
                          size="small"
                          expand="block"
                          onClick={() => {
                            this.setState({
                              activeNFTMintCard: card,
                              showMintConfirm: true,
                            });
                          }}
                        >
                          Mint NFT
                        </IonButton>
                      )}
                      {mintCheck.status === "success" && (
                        <div>{this.state.mintButtonHelp}</div>
                      )}
                      {mintCheck.status === "fail" && (
                        <IonButton
                          color={"danger"}
                          size="small"
                          expand="block"
                          disabled
                        >
                          {mintCheck.message}
                        </IonButton>
                      )}
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCol>
            </IonRow>
            {owners && (
              <IonRow>
                <IonCol>
                  <CardOwnerMenu
                    user={this.props.user}
                    cardNumber={card.Number !== null ? card.Number : card.ID}
                    cardYear={card.Year}
                    tradeCallback={this.props.tradeCallback}
                    closePanel={null}
                  ></CardOwnerMenu>
                </IonCol>
              </IonRow>
            )}
          </IonGrid>
        );
        this.setState({ cardDetails: details, showDetails: true }, () => {});
      });
    });
  };

  pullCards = () => {
    callServer(
      "cards",
      {
        year: this.props.galleryProps.year,
        category: this.props.galleryProps.set,
        view: this.props.galleryProps.view,
        viewSortField: this.props.galleryProps.viewSortField,
        viewSortDirection: this.props.galleryProps.viewSortDirection,
      },
      this.props.user.ID
    )
      ?.then((resp) => {
        ////console.log(resp);
        return resp.json();
      })
      .then((json) => {
        if (json.length > 0) {
          //dataList = json;
          ////console.log(json);
          const chunkedList = this.chunkVersions(json);
          this.setState({ chunkedList: chunkedList, dataList: json }, () => {
            this.imgList();
            //this.initializeScroll();
            //this.appendItems(this.props.galleryProps.layoutCount*3);
          });
          //updateMessages({msg: msgList, controlList: json});
        } else {
          this.setState({ imgList: [] });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  sortCards = () => {
    const newDataList = [...this.state.dataList];
    let param = "SetName";
    if (this.props.galleryProps.viewSortField === "duplicates") {
      param = "-Count";
    }
    if (this.props.galleryProps.viewSortField === "acquired") {
      param = "-Date";
    }
    newDataList.sort(this.dynamicSort(param));
    this.setState({ dataList: newDataList }, () => {
      this.resetChunks();
    });
  };

  pullCardDetails = (user: string, card: any) => {
    return new Promise((resolve: any, reject: any) => {
      //console.log(card);
      callServer(
        "cardDetail",
        {
          number: card.Number !== null ? card.Number : card.ID,
          year: card.Year,
        },
        user
      )
        ?.then((resp) => {
          return resp.json();
        })
        .then((json) => {
          ////console.log(json);
          if (json) {
            resolve(json);
          } else {
            resolve(json);
          }
        })
        .catch((err: any) => {
          console.log(err);
          resolve(err);
        });
    });
  };

  imgList = () => {
    const list: Array<any> = [];
    this.state.chunkedList.forEach((ch: any, i: number) => {
      const item: Array<any> = [];
      ch.forEach((c: any, z: number) => {
        ////console.log(c);
        let imgSrc = c.Image;
        let message = c.Active === "0" ? "Sold Out" : "";
        if (this.props.galleryProps.layoutCount > 2) {
          imgSrc = imgSrc.replace("full", "thumbs");
        }
        if (this.props.galleryProps.layoutCount > 3) {
          if (message === "Sold Out") {
            message = "S.O.";
          }
        }
        item.push(
          <IonCol key={c.ID}>
            <IonImg
              style={{ width: "100%" }}
              src={imgSrc}
              class={c.UserID === null ? "need-card-alpha" : ""}
              onClick={() => {
                this.showCardetails(c, true, false);
              }}
            ></IonImg>
            {c.Count !== null && c.Count > 1 && (
              <IonBadge class="quantity-badge">{c.Count}</IonBadge>
            )}
            {<IonBadge class="message-badge ">{message}</IonBadge>}
          </IonCol>
        );
        if (i === this.state.chunkedList.length - 1) {
          if (ch.length < this.props.galleryProps.layoutCount) {
            const remainder = this.props.galleryProps.layoutCount - ch.length;
            for (let a = 0; a < remainder; a++) {
              item.push(<IonCol key={a + "_" + z}></IonCol>);
            }
          }
        }
      });
      list.push(<IonRow key={i}>{item}</IonRow>);
    });
    this.setState({ imgList: list });
  };

  pullNFTs = () => {
    //https://wax.api.atomicassets.io/atomicassets/v1/assets?collection_name=terrorcards1&schema_name=bodh&page=1&limit=100&order=desc&sort=asset_id
    let url =
      "https://wax.api.atomicassets.io/atomicassets/v1/assets?collection_name=" +
      this.props.nftProps.collection +
      "&owner=" +
      this.state.nftAccount +
      "&page=1&limit=200&order=desc&sort=asset_id";
    if (this.props.nftProps.schema !== "all") {
      url = url + "&schema_name=" + this.props.nftProps.schema;
    }
    if (this.props.nftProps.template !== "all") {
      url = url + "&template_id=" + this.props.nftProps.template;
    }

    fetch(url)
      .then((resp) => {
        return resp.json();
      })
      .then((json) => {
        //console.log(json);
        if (json.success) {
          const chunkedList = this.chunkVersions(json.data);
          this.setState(
            { chunkedList: chunkedList, dataList: json.data },
            () => {
              this.nftList();
            }
          );
        } else {
          this.setState({ nftList: [] });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  checkMintNFTReqs = (card: any) => {
    return new Promise((resolve: any, reject: any) => {
      callServer(
        "mintNFT_checkReqs",
        {
          number: card.Number !== null ? card.Number : card.ID,
          year: card.Year,
        },
        this.props.user.ID
      )
        ?.then((resp) => {
          return resp.json();
        })
        .then((json) => {
          if (json.status === "success") {
            this.setState(
              {
                showMintButton: true,
                mintButtonHelp: json.message,
              },
              () => {
                resolve(json);
              }
            );
          } else {
            resolve({ status: json.status, message: json.message });
          }
          //console.log(json);
        })
        .catch((err: any) => {
          //console.log(err);
          resolve(err);
        });
    });
  };

  mintNFT = (card: any) => {
    callServer(
      "mintNFT",
      { number: card.Number, year: card.Year },
      this.props.user.ID
    )
      ?.then((resp) => {
        return resp.json();
      })
      .then((json) => {
        this.setState({
          showAlert: true,
          alertMsg: json.message,
          showMintConfirm: false,
          activeNFTMintCard: null,
        });
        //console.log(json);
      })
      .catch((err: any) => {
        //console.log(err);
      });
  };

  nftList = () => {
    const list: Array<any> = [];
    let item: Array<any> = [];
    this.state.chunkedList.forEach((nl: any, a: number) => {
      item = [];
      nl.forEach((ch: any, i: number) => {
        let imgSrc = ch.data.img;
        if (typeof imgSrc !== "undefined") {
          item.push(
            <IonCol key={ch.asset_id}>
              <IonImg
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "contain",
                }}
                src={"https://atomichub-ipfs.com/ipfs/" + imgSrc}
              ></IonImg>
              {
                <IonBadge class="message-badge-left">
                  {"mint " + ch.template_mint}
                </IonBadge>
              }
            </IonCol>
          );
        } else {
          let vidSrc = ch.data.video;
          let poster = ch.data["video cover art"];
          item.push(
            <IonCol key={ch.asset_id}>
              <video
                width="100px"
                height="100px"
                controls
                preload="none"
                poster={"https://ipfs.io/ipfs/" + poster}
              >
                <source
                  src={"https://ipfs.io/ipfs/" + vidSrc}
                  type="video/mp4"
                ></source>
              </video>
              {
                <IonBadge class="message-badge-left">
                  {"mint " + ch.template_mint}
                </IonBadge>
              }
            </IonCol>
          );
        }
      });
      list.push(<IonRow key={a}>{item}</IonRow>);
    });
    this.setState({ nftImgList: list });
  };

  pullUserNFTAccount = () => {
    if (this.state.nftAccount !== "") {
      this.pullNFTs();
    } else {
      callServer("userInfo", "", this.props.user.ID)
        ?.then((resp) => {
          return resp.json();
        })
        .then((json) => {
          ////console.log(json);
          if (json) {
            //console.log(json);
            const data = json;
            this.setState({ nftAccount: data.Wallet }, () => {
              this.pullNFTs();
            });
          }
        })
        .catch((err: any) => {
          console.log(err);
        });
    }
  };

  resetChunks = () => {
    const newChunks = this.chunkVersions(this.state.dataList);
    this.setState({ chunkedList: newChunks }, () => {
      if (this.state.viewState === "nft") {
        this.nftList();
      } else {
        this.imgList();
      }
    });
  };

  dynamicSort = (property: string) => {
    var sortOrder = 1;
    if (property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a: any, b: any) {
      /* next line works with strings and numbers,
       * and you may want to customize it to your needs
       */
      var result =
        a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
      return result * sortOrder;
    };
  };

  render() {
    return (
      <IonContent style={{ height: "90%" }} scrollY={false}>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonButton
                color={this.state.viewState === "cards" ? "danger" : "dark"}
                expand="full"
                size="small"
                onClick={() => {
                  this.setState({ viewState: "cards" }, () => {
                    this.pullCards();
                  });
                }}
              >
                <IonIcon slot="start" icon={copyOutline} color="light" /> Cards
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                color={this.state.viewState === "nft" ? "danger" : "dark"}
                expand="full"
                size="small"
                onClick={() => {
                  this.setState({ viewState: "nft" }, () => {
                    this.pullUserNFTAccount();
                  });
                }}
              >
                <IonIcon slot="start" icon={flashOutline} color="light" />
                NFTs
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton
                color="dark"
                fill="clear"
                expand="full"
                size="small"
                onClick={(e: any) => {
                  this.setState({ showSettingPopover: true, event: e });
                }}
              >
                <IonIcon slot="start" icon={settingsOutline} color="dark" />
                Filters
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonContent style={{ height: "90%" }}>
          <IonGrid id="list">
            {this.state.viewState === "cards"
              ? this.state.imgList
              : this.state.nftImgList}
          </IonGrid>
        </IonContent>

        <IonPopover
          isOpen={this.state.showSettingPopover}
          side="bottom"
          alignment="center"
          ref={this.state.event}
          onDidDismiss={() =>
            this.setState({ showSettingPopover: false, event: undefined })
          }
          className={"popover-message-size"}
        >
          <GalleryMenu
            layoutAction={this.props.settingsCallback}
            layoutProps={this.props.galleryProps}
            nftProps={this.props.nftProps}
            user={this.props.user}
            type={this.state.viewState}
          />
        </IonPopover>

        <IonModal isOpen={this.state.showDetails}>
          <IonContent>
            <IonGrid>
              <IonRow>
                <IonCol>
                  <IonLabel>
                    <div style={{ textAlign: "end" }}>
                      <IonButton
                        fill="clear"
                        onClick={(e: any) => {
                          this.setState({
                            showDetails: false,
                            cardDetails: null,
                          });
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
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>{this.state.cardDetails}</IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <div style={{ height: 35 }}></div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={this.state.showMintConfirm}
          onDidDismiss={() =>
            this.setState({ showMintConfirm: false, activeNFTMintCard: null })
          }
          cssClass="my-custom-class"
          header={"Are you sure?"}
          message={"Minting will remove or decrease this card."}
          buttons={[
            {
              text: "No",
              role: "cancel",
              cssClass: "secondary",
              handler: (blah: any) => {
                this.setState({
                  showMintConfirm: false,
                  activeNFTMintCard: null,
                });
              },
            },
            {
              text: "Yes",
              handler: () => {
                this.mintNFT(this.state.activeNFTMintCard);
              },
            },
          ]}
        />

        <IonAlert
          isOpen={this.state.showAlert}
          onDidDismiss={() => {
            this.setState({ showAlert: false, alertMsg: "" }, () => {
              this.setState(
                {
                  showDetails: false,
                  cardDetails: null,
                },
                () => {
                  this.setState({ viewState: "nft" }, () => {
                    this.pullUserNFTAccount();
                  });
                }
              );
            });
          }}
          cssClass="my-custom-class"
          header={"Message"}
          message={this.state.alertMsg}
          buttons={["OK"]}
        />
      </IonContent>
    );
  }

  /*
        <IonInfiniteScroll threshold="100px" id="infinite-scroll">
        <IonInfiniteScrollContent
            loading-spinner="bubbles">
        </IonInfiniteScrollContent>
        </IonInfiniteScroll>
        */
}

export default withIonLifeCycle(GalleryContainer);
