import React, { useState, useEffect } from "react";
import {
  withIonLifeCycle,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonList,
  IonListHeader,
  IonModal,
  IonButton,
  IonImg,
  IonThumbnail,
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonFooter,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon,
  IonFabList,
  IonInput,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import {
  add,
  settings,
  share,
  person,
  arrowForwardCircle,
  arrowBackCircle,
  arrowUpCircle,
  layers,
  calendar,
  grid,
  logoTwitter,
} from "ionicons/icons";
import "./GalleryMenu.css";
import { callServer } from "./ajaxcalls";

interface props {
  layoutAction: any;
  layoutProps: any;
  nftProps: any;
  user: any;
  type: string;
}

interface state {
  setList: Array<any>;
  nftSchemaList: Array<any>;
  nftTemplateList: Array<any>;
  availableNFTSchema: Array<any>;
  availableNFTTemplates: Array<any>;
  availableSets: Array<any>;
  availableYears: Array<any>;
  availableViews: Array<any>;
}

class GalleryMenu extends React.Component<props, state> {
  constructor(props: any) {
    super(props);

    this.state = {
      setList: [],
      nftSchemaList: [],
      nftTemplateList: [],
      availableNFTSchema: [],
      availableNFTTemplates: [],
      availableSets: [],
      availableYears: [],
      availableViews: [],
    };
  }
  TCYearStart: number = 2017;
  currYear = new Date().getFullYear();
  diffYear = this.currYear - this.TCYearStart;
  viewOptions = ["active", "all", "needs", "owned"];

  componentDidMount() {
    if (this.props.type === "cards") {
      let years: Array<any> = [];
      for (let i = 0; i <= this.diffYear; i++) {
        years.push(
          <IonSelectOption
            key={this.TCYearStart + i}
            value={this.TCYearStart + i}
          >
            {this.TCYearStart + i}
          </IonSelectOption>
        );
      }
      this.setState({ availableYears: years }, () => {
        this.setRenderViews();
        this.pullSets();
        console.log("ionViewDidEnter event fired");
      });
    } else {
      if (this.props.type === "nft") {
        this.pullNFTSchemas();
        this.pullNFTTemplates();
      }
    }
  }

  componentDidUpdate(prevProps: any) {}

  pullSets = () => {
    callServer(
      "sets",
      {
        year: this.props.layoutProps.year,
        category: this.props.layoutProps.set,
        view: this.props.layoutProps.view,
      },
      this.props.user.ID
    )
      ?.then((resp) => {
        console.log(resp);
        return resp.json();
      })
      .then((json) => {
        if (json.length > 0) {
          console.log(json);
          this.setRenderSets(json);
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  pullNFTTemplates = () => {
    //https://wax.api.atomicassets.io/atomicassets/v1/templates?collection_name=terrorcards1&schema_name=bodh&page=1&limit=100&order=desc&sort=created
    //https://wax.api.atomicassets.io/atomicassets/v1/templates?collection_name=terrorcards1&page=1&limit=100&order=desc&sort=created
    //https://wax.api.atomicassets.io/atomicassets/v1/templates?collection_name=terrorcards1&page=1&limit=100&order=desc&sort=created
    let url =
      "https://wax.api.atomicassets.io/atomicassets/v1/templates?collection_name=" +
      this.props.nftProps.collection +
      "&page=1&limit=1000&order=desc&sort=created";
    if (this.props.nftProps.schema !== "all") {
      url =
        "https://wax.api.atomicassets.io/atomicassets/v1/templates?collection_name=" +
        this.props.nftProps.collection +
        "&schema_name=" +
        this.props.nftProps.schema +
        "&page=1&limit=1000&order=desc&sort=created";
    }

    fetch(url)
      .then((resp) => {
        return resp.json();
      })
      .then((json) => {
        console.log(json);
        if (json.success) {
          this.setState({ nftTemplateList: json.data }, () => {
            this.renderNFTTemplates();
          });
        } else {
          this.setState({ nftTemplateList: [] });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  pullNFTSchemas = () => {
    //https://wax.api.atomicassets.io/atomicassets/v1/schemas?collection_name=terrorcards1&page=1&limit=1000&order=desc&sort=created
    let url =
      "https://wax.api.atomicassets.io/atomicassets/v1/schemas?collection_name=" +
      this.props.nftProps.collection +
      "&page=1&limit=1000&order=desc&sort=created";

    fetch(url)
      .then((resp) => {
        return resp.json();
      })
      .then((json) => {
        console.log(json);
        if (json.success) {
          this.setState({ nftSchemaList: json.data }, () => {
            this.renderNFTSchema();
          });
        } else {
          this.setState({ nftSchemaList: [] });
        }
      })
      .catch((err: any) => {
        console.log(err);
      });
  };

  renderNFTSchema = () => {
    const availableSets: any = [];
    availableSets.push(
      <IonSelectOption key={"all"} value={"All"}>
        {"All"}
      </IonSelectOption>
    );
    this.state.nftSchemaList.forEach((d: any, i: number) => {
      availableSets.push(
        <IonSelectOption key={i} value={d.schema_name}>
          {d.schema_name}
        </IonSelectOption>
      );
    });
    this.setState({ availableNFTSchema: availableSets });
  };

  renderNFTTemplates = () => {
    const availableSets: any = [];
    availableSets.push(
      <IonSelectOption key={"all"} value={"All"}>
        {"All"}
      </IonSelectOption>
    );
    this.state.nftTemplateList.forEach((d: any, i: number) => {
      availableSets.push(
        <IonSelectOption key={i} value={d.template_id}>
          {d.name}
        </IonSelectOption>
      );
    });
    this.setState({ availableNFTTemplates: availableSets });
  };

  setRenderSets = (data: any) => {
    const availableSets: any = [];
    availableSets.push(
      <IonSelectOption key={"all"} value={"All"}>
        {"All"}
      </IonSelectOption>
    );
    data.map((d: any, i: number) => {
      if (d.Year === this.props.layoutProps.year) {
        const cleanName = d.SetName.replace(/_/g, " ");
        if (d.SetName === this.props.layoutProps.set) {
          availableSets.push(
            <IonSelectOption key={i} value={d.SetName}>
              {cleanName}
            </IonSelectOption>
          );
        } else {
          availableSets.push(
            <IonSelectOption key={i} value={d.SetName}>
              {cleanName}
            </IonSelectOption>
          );
        }
      }
    });
    this.setState({ availableSets: availableSets, setList: data });
  };

  setRenderViews = () => {
    const availableView: any = [];
    this.viewOptions.map((d: any, i: number) => {
      if (this.props.layoutProps.viewOptions === "all") {
        availableView.push(
          <IonSelectOption key={i} value={d}>
            {d}
          </IonSelectOption>
        );
      } else {
        if (this.props.layoutProps.viewOptions.indexOf(d) > -1) {
          availableView.push(
            <IonSelectOption key={i} value={d}>
              {d}
            </IonSelectOption>
          );
        }
      }
    });
    this.setState({ availableViews: availableView });
  };

  yearSetHook = (value: any) => {
    //this.setRenderSets(this.state.setList);
    this.props.layoutAction("year", value);
    this.props.layoutAction("set", "all");
  };

  updateSettings = (setting: any, value: any, type: any) => {
    const localDigitalSettings = { ...this.props.layoutProps };
    const localNFTSettings = { ...this.props.nftProps };
    if (type === "cards") {
      localDigitalSettings[setting] = value;
    } else {
      localNFTSettings[setting] = value;
    }
    this.props.layoutAction(localDigitalSettings, localNFTSettings);
  };

  renderDigitalUI = () => {
    return (
      <IonList>
        <IonListHeader>Gallery Settings</IonListHeader>
        <IonListHeader>Filters</IonListHeader>
        <IonItem>
          <IonLabel>Year</IonLabel>
          <IonSelect
            value={this.props.layoutProps.year}
            placeholder=""
            onIonChange={(e: any) => {
              this.updateSettings("year", e.detail.value, "cards");
            }}
          >
            {this.state.availableYears}
          </IonSelect>
        </IonItem>
        <IonItem>
          <IonLabel>Set</IonLabel>
          <IonSelect
            value={this.props.layoutProps.set}
            placeholder=""
            onIonChange={(e: any) => {
              this.updateSettings("set", e.detail.value, "cards");
            }}
          >
            {this.state.availableSets}
          </IonSelect>
        </IonItem>
        <IonItem>
          <IonLabel>View</IonLabel>
          <IonSelect
            value={this.props.layoutProps.view}
            placeholder=""
            onIonChange={(e: any) => {
              this.updateSettings("view", e.detail.value, "cards");
            }}
          >
            {this.state.availableViews}
          </IonSelect>
        </IonItem>
        <IonListHeader>Layout Settings</IonListHeader>
        <IonItem>
          <IonLabel># per row</IonLabel>
          <IonSelect
            value={this.props.layoutProps.layoutCount.toString()}
            placeholder=""
            onIonChange={(e: any) => {
              this.updateSettings(
                "layoutCount",
                parseInt(e.detail.value),
                "cards"
              );
            }}
          >
            <IonSelectOption value="1">1</IonSelectOption>
            <IonSelectOption value="2">2</IonSelectOption>
            <IonSelectOption value="3">3</IonSelectOption>
            <IonSelectOption value="4">4</IonSelectOption>
            <IonSelectOption value="5">5</IonSelectOption>
          </IonSelect>
        </IonItem>
      </IonList>
    );
  };

  renderNFTUI = () => {
    return (
      <IonList>
        <IonListHeader>NFT Gallery Settings</IonListHeader>
        <IonListHeader>Filters</IonListHeader>
        <IonItem>
          <IonLabel>Collection</IonLabel>
          <IonSelect
            value={this.props.nftProps.collection}
            placeholder=""
            onIonChange={(e: any) => {
              this.updateSettings("collection", e.detail.value, "nft");
              setTimeout(() => {
                this.pullNFTSchemas();
                this.pullNFTTemplates();
              }, 1000);
            }}
          >
            <IonSelectOption value="terrorcards1">Terror Cards</IonSelectOption>
            <IonSelectOption value="terrorkisses">
              Terror Kisses
            </IonSelectOption>
          </IonSelect>
        </IonItem>
        <IonItem>
          <IonLabel>Schema</IonLabel>
          <IonSelect
            value={this.props.nftProps.schema}
            placeholder=""
            onIonChange={(e: any) => {
              this.updateSettings("schema", e.detail.value, "nft");
              setTimeout(() => {
                this.pullNFTTemplates();
              }, 1000);
            }}
          >
            {this.state.availableNFTSchema}
          </IonSelect>
        </IonItem>
        <IonItem>
          <IonLabel>Templates</IonLabel>
          <IonSelect
            value={this.props.nftProps.template}
            placeholder=""
            onIonChange={(e: any) => {
              this.updateSettings("template", e.detail.value, "nft");
            }}
          >
            {this.state.availableNFTTemplates}
          </IonSelect>
        </IonItem>
        <IonListHeader>Layout Settings</IonListHeader>
        <IonItem>
          <IonLabel># per row</IonLabel>
          <IonSelect
            value={this.props.nftProps.layoutCount.toString()}
            placeholder=""
            onIonChange={(e: any) => {
              this.updateSettings(
                "layoutCount",
                parseInt(e.detail.value),
                "nft"
              );
            }}
          >
            <IonSelectOption value="1">1</IonSelectOption>
            <IonSelectOption value="2">2</IonSelectOption>
            <IonSelectOption value="3">3</IonSelectOption>
            <IonSelectOption value="4">4</IonSelectOption>
            <IonSelectOption value="5">5</IonSelectOption>
          </IonSelect>
        </IonItem>
      </IonList>
    );
  };

  render() {
    return this.props.type === "nft"
      ? this.renderNFTUI()
      : this.renderDigitalUI();
  }
}

export default withIonLifeCycle(GalleryMenu);
