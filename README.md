# fideo

The goal of this project is to implement a WebRTC video (conf) app using VueJS with SIP libraries.

It will use RTCPeerConnection API to start WebRTC communications between peers until it becomes too hard to deal with the code and requires the use of an external library (like SIPJS, JSSIP, sipML5) to maintain active connections, create invites to other peers and send SDP payloads.

This project is inspired from Google WebRTC codelab.

It will use VueCLI and VueJS3.

If VueCLI doesn't allow me to work on my dev env efficiently, I will move to using Vue without the VueCLI scaffolding.
This involves creating config files for the build part (either using Webpack or Rollup or Parcel or Snowpack)

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Run your unit tests

```
npm run test:unit
```

### Run your end-to-end tests

```
npm run test:e2e
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

# References

## Store

Here are the resources I inspired from to setup the store with modules using Typescript

- Vuex + TypeScript: https://dev.to/3vilarthas/vuex-typescript-m4j

  - vuex-typescript [GitHub repo](https://github.com/andrewvasilchuk/vuex-typescript/)

- VueX modules + Typescript: https://codesandbox.io/s/using-vuex-4-modules-in-vue-3-with-typescript-7ygvy

  - [SO thread](https://stackoverflow.com/questions/64080549/using-vuex-4-modules-in-vue-3-with-typescript-and-how-to-fix-cyclical-dependenc)
  - [GitHub repo](https://github.com/ux-engineer/using-vuex-4-modules-in-vue3-with-typescript)

## SIP and WebRTC

- SIP.js: https://github.com/onsip/SIP.js

  - SimpleUser usage: [GitHub](https://github.com/onsip/SIP.js/blob/master/docs/simple-user.md), [Site](https://sipjs.com/guides/simple-user/)
  - SimpleUser implementation: [GitHub](https://github.com/onsip/SIP.js/blob/5555a9811f33df1f1461c9094a59b82307b25405/src/platform/web/simple-user/simple-user.ts)
  - Play MediaStream using SIPjs (attach MediaStream to HTMLVideoElement): [GitHub](https://github.com/onsip/SIP.js/blob/master/docs/session-description-handler.md#how-do-i-play-the-local-and-remote-mediastream), [Site](https://sipjs.com/guides/attach-media/)

- JsSIP:

  - [JsSIP](https://github.com/versatica/JsSIP)

- WebRTC ICE STUN:
  - [Peer connection ICE candidates](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/)
  - [webrtc-internals](chrome://webrtc-internals)

### Examples

- SIP.js: https://github.com/onsip/SIP.js/blob/master/demo/demo-1.ts

## Composition API

- Composition API comparison by karol-f: https://github.com/karol-f/vue-composition-api-comparison

### Examples

- VueJS 3 + Vuex 4 + Typescript + Composition API: https://soshace.com/building-web-apps-with-vue-3-composition-api-typescript-vuex4-0/

## Asterisk

- Video Conference: https://www.asterisk.org/asterisk-15-multi-stream-media-sfu/
- Conference bridge messaging: https://wiki.asterisk.org/wiki/display/AST/Conference+Bridge+Messaging
- WebRTC clients in Asterisk: https://wiki.asterisk.org/wiki/display/AST/Configuring+Asterisk+for+WebRTC+Clients

- ICE STUN TURN :
  - https://medium.com/av-transcode/what-is-webrtc-and-how-to-setup-stun-turn-server-for-webrtc-communication-63314728b9d0
  - https://groups.google.com/g/sip_js/c/W_ZTmpIeTbQ
  - http://www.asterisk-france.org/threads/3421-SIP-NAT-et-pas-d-audio-pas-de-son
  - https://wiki.asterisk.org/wiki/display/AST/Interactive+Connectivity+Establishment+%28ICE%29+in+Asterisk
  - https://wiki.asterisk.org/wiki/display/AST/Installing+and+Configuring+CyberMegaPhone (see in ~/www/fscholsen.local/webrtc/cyber_mega_phone_2k)

## TODOS

- allow to change audio and video devices (input (microphone) and output)
- fix video with ICE (stun/turn issue)
- send messages from a peer to another
