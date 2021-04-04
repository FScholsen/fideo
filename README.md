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
- https://codesandbox.io/s/using-vuex-4-modules-in-vue-3-with-typescript-7ygvy
  - [SO thread](https://stackoverflow.com/questions/64080549/using-vuex-4-modules-in-vue-3-with-typescript-and-how-to-fix-cyclical-dependenc)
