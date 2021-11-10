export const serverpath = "https://gisgames.com/CardTemplateWork/";

export function prepData(pData) {
    if(pData !== null) {
        var jsonstr = JSON.stringify(pData);    
    } else {
        var jsonstr = JSON.stringify({});        
    }
    return jsonstr;	
}

export function callServer(pTask,pData,pUserId) {
    switch(pTask) {
        case "cards": {
            var jsonstr = prepData(pData);
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uType", "Base");
            formData.append("uContent", jsonstr);
            /*
            let test = fetch(serverpath + "cards_players.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
            
            let test = fetch(serverpath + "cards_players.php?" + new URLSearchParams({
              uUserId: pUserId,
              uType: "Base",
              uContent: jsonstr
            })); 
                     
            return test;      
            break;
        }
        case "sets": {
            var jsonstr = prepData(pData);
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uContent", jsonstr);
            let test = fetch(serverpath + "card_sets.php?" + new URLSearchParams({
              uUserId: pUserId,
              uContent: jsonstr
            }));
            return test;
            break;
        }  
        case "cardCount": {
          var jsonstr = prepData(pData);
          let formData  = new FormData();
          formData.append("uUserId", pUserId);
          formData.append("uContent", jsonstr);
          /*
          let test = fetch(serverpath + "cards_count.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
          let test = fetch(serverpath + "cards_count.php?" + new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr
          }));          
          return test;
          break;
        } 
        case "cardDetail": {
          var jsonstr = prepData(pData);
          let formData  = new FormData();
          formData.append("uUserId", pUserId);
          formData.append("uContent", jsonstr);
          /*
          let test = fetch(serverpath + "cards_count.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
          let test = fetch(serverpath + "cards_detail.php?" + new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr
          }));          
          return test;
          break;
        }                       
        case "userInfo": {
            var jsonstr = prepData(pData);
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uAction", "userInfo");
            formData.append("uContent1", "test");
            let data2 = {"uUserId": pUserId, "uAction": "userInfo", "uContent1": "test"};
            /*
            let test = fetch(serverpath + "profile.php", {
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
            let test = fetch(serverpath + "profile.php?" + new URLSearchParams({
              uUserId: pUserId,
              uContent1: 'test'
            }));          
            return test;
            break;
/*
            let test = fetch(serverpath + "profile.php", {
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
            var jsonstr = prepData(pData);
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uContent", pData);
            /*
            let test = fetch(serverpath + "messages.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
            let test = fetch(serverpath + "messages.php?" + new URLSearchParams({
              uUserId: pUserId,
              uContent: pData
            }));             
            return test;
            break;
        } 
        case "appendBoardMessages": {
            var jsonstr = prepData(pData);
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uContent", jsonstr);
            /*
            let test = fetch(serverpath + "messagesPost.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
            let test = fetch(serverpath + "messagesPost.php?" + new URLSearchParams({
              uUserId: pUserId,
              uContent: jsonstr
            }));              
            return test;
            break;
        }         
        case "packs": {
            var jsonstr = prepData(pData);
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uType", "Base");
            formData.append("uContent", pData.count);
            /*
            let test = fetch(serverpath + "packs.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
            let test = fetch(serverpath + "packs.php?" + new URLSearchParams({
              uUserId: pUserId,
              uType: "Base",
              uContent: jsonstr
            }));            
            return test;
            break;
        } 
        case "packsOrder": {
            var jsonstr = prepData(pData);
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uContent", jsonstr);
            formData.append("uAction", "BuyPack");
            /*
            let test = fetch(serverpath + "packs_Result.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
            let test = fetch(serverpath + "packs_Result.php?" + new URLSearchParams({
              uUserId: pUserId,
              uAction: "BuyPack",
              uContent: jsonstr
            }));             
            return test;
            break;
        }  
        case "showTrades": {
            var jsonstr = prepData(pData);
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uContent1", jsonstr);
            formData.append("uAction", "showTrades");
            /*
            let test = fetch(serverpath + "tradeList.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
            let test = fetch(serverpath + "tradeList.php?" + new URLSearchParams({
              uUserId: pUserId,
              uAction: "showTrades",
              uContent1: jsonstr
            }));            
            return test;
            break;
        } 
        case "tradeSetup": {
            var jsonstr = prepData(pData);
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uType", "All");
            formData.append("uContent", jsonstr);
            /*
            let test = fetch(serverpath + "tradeCardList.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */

            let test = fetch(serverpath + "tradeCardList.php?" + new URLSearchParams({
              uUserId: pUserId,
              uType: "All",
              uContent: jsonstr
            }));

            return test;
            break;
        } 
        case "saveTrade": {
            console.log(pData.uContent1);
            let c1 = prepData(pData.uContent1);
            let c2 = prepData(pData.uContent2);
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uContent1", c1);
            formData.append("uContent2", c2);
            formData.append("uMsg", pData.msg);
            formData.append("uAction", "saveTrade"); 
            /*           
            let test = fetch(serverpath + "trade.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
            let test = fetch(serverpath + "trade.php?" + new URLSearchParams({
              uUserId: pUserId,
              uAction: "saveTrade",
              uContent1: c1,
              uContent2: c2,
              uMsg: pData.msg
            }));           
            return test;
            break;
        } 
        case "executeTrade": {
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uContent1", pData);
            formData.append("uContent2", "");
            formData.append("uAction", "executeTrade"); 
            /*           
            let test = fetch(serverpath + "trade.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
            let test = fetch(serverpath + "trade.php?" + new URLSearchParams({
              uUserId: pUserId,
              uAction: "executeTrade",
              uContent1: pData,
              uContent2: ""
            }));             
            return test;
            break;
        } 
        case "cancelTrade": {
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uContent1", pData);
            formData.append("uContent2", "");
            formData.append("uAction", "cancelTrade"); 
            /*           
            let test = fetch(serverpath + "trade.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
            let test = fetch(serverpath + "trade.php?" + new URLSearchParams({
              uUserId: pUserId,
              uAction: "cancelTrade",
              uContent1: pData,
              uContent2: ""
            }));            
            return test;
            break;
        }         
        case "requestTradeMessages": {
            var jsonstr = prepData(pData);
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uTradeID", pData);
            /*
            let test = fetch(serverpath + "tradeMessages.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
           let test = fetch(serverpath + "tradeMessages.php?" + new URLSearchParams({
            uUserId: pUserId,
            uTradeID: pData
          }));             
            return test;
            break;
        }         
        case "appendTradeMessages": {
            var jsonstr = prepData(pData);
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uContent1", jsonstr); 
            /*           
            let test = fetch(serverpath + "tradeAppendMessage.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
           let test = fetch(serverpath + "tradeAppendMessage.php?" + new URLSearchParams({
              uUserId: pUserId,
              uContent1: jsonstr
            }));            
            return test;
            break;
        }  
        case "pullFactoryList": {
            //var jsonstr = prepData(pData);
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uContent", pData);
            /*
            let test = fetch(serverpath + "meld_pull_list.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
            let test = fetch(serverpath + "meld_pull_list.php?" + new URLSearchParams({
              uUserId: pUserId,
              uContent: pData
            }));             
            return test;
            break;
        } 
        case "meldFactoryItem": {
            var jsonstr = prepData(pData);
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uContent", jsonstr);
            /*
            let test = fetch(serverpath + "meldCreateResult.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
            let test = fetch(serverpath + "meldCreateResult.php?" + new URLSearchParams({
              uUserId: pUserId,
              uContent: jsonstr
            }));              
            return test;
            break;
        }  
        case "fetchNews": {
            var jsonstr = prepData(pData);
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uContent", jsonstr);
            let test = fetch(serverpath + "news.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            return test;
            break;
        } 
        case "fetchNewsBanner": {
          var jsonstr = prepData(pData);
          let formData  = new FormData();
          formData.append("uUserId", pUserId);
          formData.append("uContent", jsonstr);
          let test = fetch(serverpath + "newsBanner.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          return test;
          break;
      }                                
        case "loginCheck": {
            //var jsonstr = prepData(pData);
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uAction", "checkLogin");
            formData.append("uPassword", pData);
            /*
            let test = fetch(serverpath + "checkLogin.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            */
            let test = fetch(serverpath + "checkLogin.php?" + new URLSearchParams({
              uUserId: pUserId,
              uAction: "checkLogin",
              uPassword: pData
            })); 

            return test;
            break;
        }  
        case "forgotPassword": {
              var jsonstr = prepData(pData);
              let formData  = new FormData();
              formData.append("uUserId", pUserId);
              formData.append("uAction", "recoverPassword");
              formData.append("uContent", jsonstr);
              /*
              let test = fetch(serverpath + "forgetPassword.php", {
                method: 'POST',
                headers: {
                  "Content-Type": 'multipart/form-data'
                },
                body: formData
              });
              */
              let test = fetch(serverpath + "forgetPassword.php?" + new URLSearchParams({
              uUserId: pUserId,
              uAction: "recoverPassword",
              uContent: jsonstr
              }));              
              return test;
              break;
        }  
        case "defaultAccount": {
              var jsonstr = prepData(pData);
              let formData  = new FormData();
              formData.append("uUserId", pUserId);
              formData.append("uAction", "defaultAccount");
              formData.append("uContent", jsonstr);
              /*
              let test = fetch(serverpath + "create_profile.php", {
                method: 'POST',
                headers: {
                  "Content-Type": 'multipart/form-data'
                },
                body: formData
              });
              */
              let test = fetch(serverpath + "create_profile.php?" + new URLSearchParams({
                uUserId: pUserId,
                uAction: "defaultAccount",
                uContent: jsonstr
              }));              
              return test;
              break;
        } 
        case "registerUser": {
              var jsonstr = prepData(pData);
              let formData  = new FormData();
              formData.append("uUserId", pUserId);
              formData.append("uAction", "register");
              formData.append("uContent", jsonstr);
              let test = fetch(serverpath + "register.php", {
                method: 'POST',
                headers: {
                  "Content-Type": 'multipart/form-data'
                },
                body: formData
              });
              return test;
              break;
        }  
        case "pullFriendsList": {
              var jsonstr = prepData(pData);
              let formData  = new FormData();
              formData.append("uUserId", pUserId);
              formData.append("uAction", "select");
              formData.append("uContent", jsonstr);
              let test = fetch(serverpath + "friends.php", {
                method: 'POST',
                headers: {
                  "Content-Type": 'multipart/form-data'
                },
                body: formData
              });
              return test;
              break;
        }
        case "pullSearchList": {
            var jsonstr = prepData(pData);
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uAction", "search");
            formData.append("uContent", jsonstr);
            let test = fetch(serverpath + "friends.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            return test;
            break;
        }        
        case "pullBlockList": {
              var jsonstr = prepData(pData);
              let formData  = new FormData();
              formData.append("uUserId", pUserId);
              formData.append("uAction", "select");
              formData.append("uContent", jsonstr);
              let test = fetch(serverpath + "playerBlock.php", {
                method: 'POST',
                headers: {
                  "Content-Type": 'multipart/form-data'
                },
                body: formData
              });
              return test;
              break;
        } 
        case "addFriend": {
          var jsonstr = prepData(pData);
          let formData  = new FormData();
          formData.append("uUserId", pUserId);
          formData.append("uAction", "insert");
          formData.append("uContent", jsonstr);
          /*
          let test = fetch(serverpath + "friends.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
         let test = fetch(serverpath + "friends.php?" + new URLSearchParams({
            uUserId: pUserId,
            uAction: "insert",
            uContent: jsonstr
          }));          
          return test;
          break;
        }       
        case "deleteFriend": {
          var jsonstr = prepData(pData);
          let formData  = new FormData();
          formData.append("uUserId", pUserId);
          formData.append("uAction", "delete");
          formData.append("uContent", jsonstr);
          let test = fetch(serverpath + "friends.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          return test;
          break;
        }
        case "insertBlockPlayer": {
          var jsonstr = prepData(pData);
          let formData  = new FormData();
          formData.append("uUserId", pUserId);
          formData.append("uAction", "insert");
          formData.append("uContent", jsonstr);
          /*
          let test = fetch(serverpath + "playerBlock.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
          let test = fetch(serverpath + "playerBlock.php?" + new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr,
            uAction: "insert"
          }));           
          return test;
          break;
        }
        case "removeBlockPlayer": {
          var jsonstr = prepData(pData);
          let formData  = new FormData();
          formData.append("uUserId", pUserId);
          formData.append("uAction", "delete");
          formData.append("uContent", jsonstr);
          let test = fetch(serverpath + "playerBlock.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          return test;
          break;
        }      
        case "flagComment": {
          var jsonstr = prepData(pData);
          let formData  = new FormData();
          formData.append("uUserId", pUserId);
          formData.append("uContent", jsonstr);
          /*
          let test = fetch(serverpath + "flagContent.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
          let test = fetch(serverpath + "flagContent.php?" + new URLSearchParams({
            uUserId: pUserId,
            uContent: jsonstr
          }));          
          return test;
          break;
        }           
        case "updateUserPic": {
            var jsonstr = prepData(pData);
            let formData  = new FormData();
            formData.append("uUserId", pUserId);
            formData.append("uAction", "update");
            formData.append("uContent", jsonstr);
            let test = fetch(serverpath + "updateUserPic.php", {
              method: 'POST',
              headers: {
                "Content-Type": 'multipart/form-data'
              },
              body: formData
            });
            return test;
            break;
        } 
        case "battlePlayerList": {
          var jsonstr = prepData(pData);
          let formData  = new FormData();
          formData.append("uUserId", pUserId);
          formData.append("uAction", "setup");
          formData.append("uContent", jsonstr);
          formData.append("uType", "");
          let test = fetch(serverpath + "battle/battle_players_list.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          return test;
          break;
        } 
        case "battleSetup": {
          var jsonstr = prepData(pData);
          let formData  = new FormData();
          formData.append("uUserId", pUserId);
          formData.append("uAction", "setup");
          formData.append("uContent", jsonstr);
          formData.append("uType", "");
          let test = fetch(serverpath + "battle/battle_players.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          return test;
          break;
        }  
        case "battleResult": {
          var jsonstr = prepData(pData);
          let formData  = new FormData();
          formData.append("uUserId", pUserId);
          formData.append("uAction", "setup");
          formData.append("uContent", jsonstr);
          formData.append("uType", "");
          let test = fetch(serverpath + "battle/battle_result.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          return test;
          break;
        }            
        case "loadInAppItems": {
          var jsonstr = prepData(pData);
          let formData  = new FormData();
          formData.append("uUserId", pUserId);
          formData.append("uAction", "select");
          formData.append("uContent", jsonstr);
          /*
          let test = fetch(serverpath + "inAppList.php", {
            method: 'POST',
            headers: {
              "Content-Type": 'multipart/form-data'
            },
            body: formData
          });
          */
          let test = fetch(serverpath + "inAppList.php?" + new URLSearchParams({
            uUserId: pUserId,
            uAction: "select",
            uContent: jsonstr
          })); 

          return test;
          break;
        }                                
        default:
            break;
    }
}

export function callServer2(pTask,pData,pUserId,pCallback) {
    /*   
    else if (pTask === "getCardCount") {
    	var jsonstr = prepData(pData);
        $.post( serverpath + "cards_count.php", { uContent: jsonstr, uUserId: pUserId, uAction: "CardCount" })
          .done(function( result ) {
          	//console.log(result);
             var data = jQuery.parseJSON(result);
             pCallback(data);
        });      
    }     
     
    //****** account handlers **********
    else if (pTask === "defaultAccount") {
    	var jsonstr = prepData(pData);    	   	
        $.post( serverpath + "create_profile.php", { uContent: jsonstr, uUserId: pUserId, uAction: 'defaultAccount' })
          .done(function(result) {
             var data = jQuery.parseJSON(result);
             pCallback(data);
        	})
          .fail(function(xhr, textStatus, errorThrown) {
    		alert(xhr.responseText);
    		alert(errorThrown);
  		});
              
    } 
    else if (pTask === "user") {
    	var jsonstr = prepData(pData);
        $.post( serverpath + "create_profile.php", { uContent: jsonstr, uUserId: pUserId, uAction: "getUser" })
          .done(function( result ) {
             var data = jQuery.parseJSON(result);
             pCallback(data);
        });      
    } 
    else if (pTask === "loginCheck") {
    	var jsonstr = prepData(pData);
        $.post( serverpath + "checkLogin.php", { uPassword: pData, uUserId: pUserId, uAction: "checkLogin" })
          .done(function( result ) {
          	//console.log(result);
             var data = jQuery.parseJSON(result);
             pCallback(data);
        });      
    } 
    else if (pTask === "userInfo") {
    	var jsonstr = prepData(pData);
        $.post( serverpath + "profile.php", { uPassword: pData, uUserId: pUserId, uAction: "userInfo" })
          .done(function( result ) {
          	//console.log(result);
             var data = jQuery.parseJSON(result);
             pCallback(data);
        });      
    }
    else if (pTask === "registerUser") {
    	var jsonstr = prepData(pData);
        $.post( serverpath + "register.php", { uContent: jsonstr, uUserId: pUserId, uAction: "register" })
          .done(function( result ) {
          	//console.log(result);
             var data = jQuery.parseJSON(result);
             pCallback(data);
        });      
    } 
    else if (pTask === "forgotPassword") {
    	var jsonstr = prepData(pData);
        $.post( serverpath + "forgetPassword.php", { uContent: jsonstr, uUserId: pUserId, uAction: "recoverPassword" })
          .done(function( result ) {
          	//console.log(result);
             var data = jQuery.parseJSON(result);
             pCallback(data);
        });      
    }     
    else if (pTask === "updateUserPic") {
    	var jsonstr = prepData(pData);
        $.post( serverpath + "updateUserPic.php", { uContent: jsonstr, uUserId: pUserId, uAction: "update" })
          .done(function( result ) {
             var data = jQuery.parseJSON(result);
             pCallback(data);
        });      
    }        
    //******** Message Boards *********
    
    //******** Friends Mgmt *********
  
    else if (pTask === "insertBlock") {
    	var jsonstr = prepData(pData);
        $.post( serverpath + "playerBlock.php", { uContent: jsonstr, uUserId: pUserId, uAction: "insert" })
          .done(function( result ) {
          	//console.log(result);
             var data = jQuery.parseJSON(result);
             pCallback(data);
        });      
    }
    else if (pTask === "deleteBlock") {
    	var jsonstr = prepData(pData);
        $.post( serverpath + "playerBlock.php", { uContent: jsonstr, uUserId: pUserId, uAction: "delete" })
          .done(function( result ) {
          	//console.log(result);
             var data = jQuery.parseJSON(result);
             pCallback(data);
        });      
    }        
    //******** InApp Mgmt **************
     else if (pTask === "loadInApp") {
    	var jsonstr = prepData(pData);
        $.post( serverpath + "inAppList.php", { uContent: jsonstr, uUserId: pUserId, uAction: "select" })
          .done(function( result ) {
          	//console.log(result);
             var data = jQuery.parseJSON(result);
             pCallback(data);
        });      
    } 
     else if (pTask === "updateCredit") {
    	var jsonstr = prepData(pData);
        $.post( serverpath + "updateUserCredit.php", { uContent: jsonstr, uUserId: pUserId, uAction: "update" })
          .done(function( result ) {
          	//console.log(result);
             var data = jQuery.parseJSON(result);
             pCallback(data);
        });      
    }
    //******** COntact Us ***********
     else if (pTask === "contactUS") {
    	var jsonstr = prepData(pData);
        $.post( serverpath + "contactUs.php", { uContent: jsonstr, uUserId: pUserId, uAction: "email" })
          .done(function( result ) {
          	console.log(result);
             var data = jQuery.parseJSON(result);
             pCallback(data);
        });      
    } 
    //******** BATTLE actions ************
    else if (pTask === "battleResult") { 
     	var jsonstr = prepData(pData);
        $.post( serverpath + "battle/battle_result.php", { uContent: jsonstr, uUserId: pUserId, uAction: "setup" })
          .done(function( result ) {
             console.log(result);          	
             var data = jQuery.parseJSON(result);
             pCallback(data);
        });   	
    }
    else if (pTask === "battleYourStats") { 
     	var jsonstr = prepData(pData);
        $.post( serverpath + "battle/battle_your_stats.php", { uContent: jsonstr, uUserId: pUserId, uAction: "setup" })
          .done(function( result ) {
          	console.log(result);
             var data = jQuery.parseJSON(result);
             pCallback(data);
        });   	
    }                                                                 
    else {
    	
    }
    */
}