import OneSignal from "onesignal-cordova-plugin";

// The plugin also registers itself on window.plugins.OneSignal (the Cordova convention);
// prefer that since the ESM default import doesn't resolve correctly under CRA's production build.
export function getOneSignal(): typeof OneSignal {
  return (window as any).plugins?.OneSignal || OneSignal;
}
