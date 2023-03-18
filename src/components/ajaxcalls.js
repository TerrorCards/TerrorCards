export const serverpath = "https://gisgames.com/CardTemplateWork/";

export function prepData(pData) {
  jsonstr = {};
  if (pData !== null) {
    jsonstr = JSON.stringify(pData);
  } else {
    jsonstr = JSON.stringify({});
  }
  return jsonstr;
}

export function callServer(pTask, pData, pUserId) {
  let jsonstr = {};
  let formData = null;
  let test = null;
  switch (pTask) {
    case "cards": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uType", "Base");
      formData.append("uContent", jsonstr);
      /*
            test = fetch(serverpath + "cards_players.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */

      test = fetch(
        serverpath +
          "cards_players.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uType: "Base",
            uContent: jsonstr,
          })
      );

      return test;
      break;
    }
    case "sets": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      test = fetch(
        serverpath +
          "card_sets.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "cardCount": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      /*
          test = fetch(serverpath + "cards_count.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
      test = fetch(
        serverpath +
          "cards_count.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "cardDetail": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      /*
          test = fetch(serverpath + "cards_count.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
      test = fetch(
        serverpath +
          "cards_detail.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "userInfo": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uAction", "userInfo");
      formData.append("uContent1", "test");
      let data2 = { uUserId: pUserId, uAction: "userInfo", uContent1: "test" };
      /*
            test = fetch(serverpath + "profile.php", {
              method: 'GET',
              mode: 'cors', // no-cors, *cors, same-origin
              headers: new Headers({
                'Accept': 'application/json',
                "Content-Type": 'application/json',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'               
              }),
              body: JSON.stringify(data2)
            });
            */
      test = fetch(
        serverpath +
          "profile.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent1: "test",
          })
      );
      return test;
      break;
      /*
            test = fetch(serverpath + "profile.php", {
              method: 'GET',
              mode: 'cors', // no-cors, *cors, same-origin
              headers: new Headers({
                'Accept': 'application/json',
                "Content-Type": 'application/json',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'               
              }),
              body: JSON.stringify(data2)
            });
*/

      //application/json
      // "Content-Type": 'application/x-www-form-urlencoded',
      //'Access-Control-Request-Method': 'POST',
      //'Access-Control-Request-Headers': 'Content-Type'
    }
    case "messagesFull": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", pData);
      /*
            test = fetch(serverpath + "messages.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
      test = fetch(
        serverpath +
          "messages.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: pData,
          })
      );
      return test;
      break;
    }
    case "appendBoardMessages": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      /*
            test = fetch(serverpath + "messagesPost.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
      test = fetch(
        serverpath +
          "messagesPost.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "packs": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uType", "Base");
      formData.append("uContent", pData.count);
      /*
            test = fetch(serverpath + "packs.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
      test = fetch(
        serverpath +
          "packs.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uType: "Base",
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "packsOrder": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      formData.append("uAction", "BuyPack");
      /*
            test = fetch(serverpath + "packs_Result.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
      test = fetch(
        serverpath +
          "packs_Result.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uAction: "BuyPack",
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "showTrades": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent1", jsonstr);
      formData.append("uAction", "showTrades");
      /*
            test = fetch(serverpath + "tradeList.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
      test = fetch(
        serverpath +
          "tradeList.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uAction: "showTrades",
            uContent1: jsonstr,
          })
      );
      return test;
      break;
    }
    case "tradeSetup": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uType", "All");
      formData.append("uContent", jsonstr);
      /*
            test = fetch(serverpath + "tradeCardList.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */

      test = fetch(
        serverpath +
          "tradeCardList.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uType: "All",
            uContent: jsonstr,
          })
      );

      return test;
      break;
    }
    case "saveTrade": {
      let c1 = prepData(pData.uContent1);
      let c2 = prepData(pData.uContent2);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent1", c1);
      formData.append("uContent2", c2);
      formData.append("uMsg", pData.msg);
      formData.append("uAction", "saveTrade");
      /*           
            test = fetch(serverpath + "trade.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
      test = fetch(
        serverpath +
          "trade.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uAction: "saveTrade",
            uContent1: c1,
            uContent2: c2,
            uMsg: pData.msg,
          })
      );
      return test;
      break;
    }
    case "executeTrade": {
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent1", pData);
      formData.append("uContent2", "");
      formData.append("uAction", "executeTrade");
      /*           
            test = fetch(serverpath + "trade.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
      test = fetch(
        serverpath +
          "trade.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uAction: "executeTrade",
            uContent1: pData,
            uContent2: "",
          })
      );
      return test;
      break;
    }
    case "cancelTrade": {
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent1", pData);
      formData.append("uContent2", "");
      formData.append("uAction", "cancelTrade");
      /*           
            test = fetch(serverpath + "trade.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
      test = fetch(
        serverpath +
          "trade.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uAction: "cancelTrade",
            uContent1: pData,
            uContent2: "",
          })
      );
      return test;
      break;
    }
    case "requestTradeMessages": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uTradeID", pData);
      /*
            test = fetch(serverpath + "tradeMessages.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
      test = fetch(
        serverpath +
          "tradeMessages.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uTradeID: pData,
          })
      );
      return test;
      break;
    }
    case "appendTradeMessages": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent1", jsonstr);
      /*           
            test = fetch(serverpath + "tradeAppendMessage.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
      test = fetch(
        serverpath +
          "tradeAppendMessage.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent1: jsonstr,
          })
      );
      return test;
      break;
    }
    case "hasTrades": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      /*
            test = fetch(serverpath + "tradeCardList.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */

      test = fetch(
        serverpath +
          "trade_exists.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
          })
      );

      return test;
      break;
    }
    case "pullFactoryList": {
      //jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", pData);
      /*
            test = fetch(serverpath + "meld_pull_list.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
      test = fetch(
        serverpath +
          "meld_pull_list.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: pData,
          })
      );
      return test;
      break;
    }
    case "meldFactoryItem": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      /*
            test = fetch(serverpath + "meldCreateResult.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
      test = fetch(
        serverpath +
          "meldCreateResult.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "fetchNews": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      test = fetch(serverpath + "news.php", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      return test;
      break;
    }
    case "fetchNewsBanner": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      test = fetch(serverpath + "newsBanner.php", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      return test;
      break;
    }
    case "loginCheck": {
      //jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uAction", "checkLogin");
      formData.append("uPassword", pData);
      /*
            test = fetch(serverpath + "checkLogin.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
      test = fetch(
        serverpath +
          "checkLogin.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uAction: "checkLogin",
            uPassword: pData,
          })
      );

      return test;
      break;
    }
    case "forgotPassword": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uAction", "recoverPassword");
      formData.append("uContent", jsonstr);
      /*
              test = fetch(serverpath + "forgetPassword.php", {
                method: 'POST',
                headers: {
                  "Content-Type": 'multipart/form-data'
                },
                body: formData
              });
              */
      test = fetch(
        serverpath +
          "forgetPassword.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uAction: "recoverPassword",
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "defaultAccount": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uAction", "defaultAccount");
      formData.append("uContent", jsonstr);
      /*
              test = fetch(serverpath + "create_profile.php", {
                method: 'POST',
                headers: {
                  "Content-Type": 'multipart/form-data'
                },
                body: formData
              });
              */
      test = fetch(
        serverpath +
          "create_profile.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uAction: "defaultAccount",
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "registerUser": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uAction", "register");
      formData.append("uContent", jsonstr);
      /*
              test = fetch(serverpath + "register.php", {
                method: 'POST',
                headers: {
                  "Content-Type": 'multipart/form-data'
                },
                body: formData
              });
              */
      test = fetch(
        serverpath +
          "register.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
            uAction: "register",
          })
      );
      return test;
      break;
    }
    case "checkEmailExist": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      /*
          test = fetch(serverpath + "register.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
      test = fetch(
        serverpath +
          "checkEmailExist.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "changePassword": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      /*
          test = fetch(serverpath + "register.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
      test = fetch(
        serverpath +
          "changePassword.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "changeWallet": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      /*
          test = fetch(serverpath + "register.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
      test = fetch(
        serverpath +
          "changeWallet.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "changeDescription": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      /*
          test = fetch(serverpath + "register.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
      test = fetch(
        serverpath +
          "changeDescription.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "pullFriendsList": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uAction", "select");
      formData.append("uContent", jsonstr);
      /*
      test = fetch(serverpath + "friends.php", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      */
      test = fetch(
        serverpath +
          "friends.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
            uAction: "select",
          })
      );
      return test;
      break;
    }
    case "pullSearchList": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uAction", "search");
      formData.append("uContent", jsonstr);
      /*
      test = fetch(serverpath + "friends.php", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      */
      test = fetch(
        serverpath +
          "friends.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
            uAction: "search",
          })
      );
      return test;
      break;
    }
    case "pullBlockList": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uAction", "select");
      formData.append("uContent", jsonstr);
      /*
      test = fetch(serverpath + "playerBlock.php", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      */
      test = fetch(
        serverpath +
          "playerBlock.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
            uAction: "select",
          })
      );
      return test;
      break;
    }
    case "addFriend": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uAction", "insert");
      formData.append("uContent", jsonstr);
      /*
          test = fetch(serverpath + "friends.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
      test = fetch(
        serverpath +
          "friends.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uAction: "insert",
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "deleteFriend": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uAction", "delete");
      formData.append("uContent", jsonstr);
      /*
      test = fetch(serverpath + "friends.php", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      */
      test = fetch(
        serverpath +
          "friends.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uAction: "delete",
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "insertBlockPlayer": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uAction", "insert");
      formData.append("uContent", jsonstr);
      /*
          test = fetch(serverpath + "playerBlock.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
      test = fetch(
        serverpath +
          "playerBlock.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
            uAction: "insert",
          })
      );
      return test;
      break;
    }
    case "removeBlockPlayer": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uAction", "delete");
      formData.append("uContent", jsonstr);
      /*
      test = fetch(serverpath + "playerBlock.php", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      */
      test = fetch(
        serverpath +
          "playerBlock.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
            uAction: "delete",
          })
      );
      return test;
      break;
    }
    case "flagComment": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      /*
          test = fetch(serverpath + "flagContent.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
      test = fetch(
        serverpath +
          "flagContent.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "updateUserPic": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uAction", "update");
      formData.append("uContent", jsonstr);
      test = fetch(serverpath + "updateUserPic.php", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      return test;
      break;
    }
    case "battleYourStats": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uAction", "setup");
      formData.append("uContent", jsonstr);
      formData.append("uType", "");
      /*
          test = fetch(serverpath + "battle/battle_players_list.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          return test;
          break;
          */
      test = fetch(
        serverpath +
          "battle/battle_your_stats.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
            uAction: "setup",
            uType: "",
          })
      );
      return test;
      break;
    }

    case "battlePlayerList": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uAction", "setup");
      formData.append("uContent", jsonstr);
      formData.append("uType", "");
      /*
          test = fetch(serverpath + "battle/battle_players_list.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          return test;
          break;
          */
      test = fetch(
        serverpath +
          "battle/battle_players_list.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
            uAction: "setup",
            uType: "",
          })
      );
      return test;
      break;
    }
    case "battleSetup": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uAction", "setup");
      formData.append("uContent", jsonstr);
      formData.append("uType", "");
      /*
          test = fetch(serverpath + "battle/battle_players.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          return test;
          break;
          */
      test = fetch(
        serverpath +
          "battle/battle_players.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
            uAction: "setup",
            uType: "",
          })
      );
      return test;
      break;
    }
    case "battleResult": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uAction", "setup");
      formData.append("uContent", jsonstr);
      formData.append("uType", "");
      /*
      test = fetch(serverpath + "battle/battle_result.php", {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      */
      test = fetch(
        serverpath +
          "battle/battle_result.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uAction: "setup",
            uContent: jsonstr,
            uType: "",
          })
      );

      return test;
      break;
    }
    case "loadInAppItems": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uAction", "select");
      formData.append("uContent", jsonstr);
      /*
          test = fetch(serverpath + "inAppList.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
      test = fetch(
        serverpath +
          "inAppList.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uAction: "select",
            uContent: jsonstr,
          })
      );

      return test;
      break;
    }
    case "contactUs": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uAction", "email");
      formData.append("uContent", jsonstr);
      /*
          test = fetch(serverpath + "inAppList.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
      test = fetch(
        serverpath +
          "contactUs.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uAction: "email",
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "deleteAccount": {
      formData = new FormData();
      formData.append("uUserId", pUserId);
      /*
          test = fetch(serverpath + "inAppList.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
      test = fetch(
        serverpath +
          "deleteAccount.php?" +
          new URLSearchParams({
            uUserId: pUserId,
          })
      );
      return test;
      break;
    }
    case "updateCredit": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      formData.append("uAction", "update");
      /*
          test = fetch(serverpath + "inAppList.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
      test = fetch(
        serverpath +
          "updateUserCredit.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
            uAction: "update",
          })
      );
      return test;
      break;
    }
    case "processPromo": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      /*
          test = fetch(serverpath + "inAppList.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
      test = fetch(
        serverpath +
          "promoCode.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "stat_getCardTemplates": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      /*
          test = fetch(serverpath + "inAppList.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
      test = fetch(
        serverpath +
          "card_templates.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "state_getCardCounts": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      /*
          test = fetch(serverpath + "inAppList.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
      test = fetch(
        serverpath +
          "stats_card_in_system.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "stat_latestCards": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      /*
          test = fetch(serverpath + "inAppList.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
      test = fetch(
        serverpath +
          "stats_latest_cards.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }
    case "stat_loginCheck": {
      jsonstr = prepData(pData);
      formData = new FormData();
      formData.append("uUserId", pUserId);
      formData.append("uContent", jsonstr);
      /*
          test = fetch(serverpath + "inAppList.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
      test = fetch(
        serverpath +
          "stats_login_check.php?" +
          new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
          })
      );
      return test;
      break;
    }

    default:
      break;
  }
}
