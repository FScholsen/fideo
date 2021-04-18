<template>
  <div class="conference">
    <div class="container row x-center">
      <h1>Conference</h1>
    </div>
    <div class="container col">
      <div class="container row x-center">
        <button id="test" @click="test">Test</button>
        <a href="https://192.168.1.2:8089/ws" target="blank"
          >accept this first</a
        >
      </div>
      <br />
      <!-- Controls -->
      <div class="container centered col x-center">
        <label for="extension">Extension: </label>
        <input
          type="text"
          name="extension"
          id="extension"
          v-model="extension"
          :disabled="registered"
        />
        <span v-show="loginHasError">You must fill in this field.</span>
        <button id="test" @click="registerUserAgent" :disabled="registered">
          Login
        </button>
        <button id="test" @click="unregisterUserAgent" :disabled="!registered">
          Logout
        </button>
      </div>
      <br />
      <div class="container centered col x-center">
        <button
          id="accept-call"
          @click="acceptCall"
          :disabled="!incomingCallPending"
        >
          Accept call
        </button>
        <button
          id="reject-call"
          @click="rejectCall"
          :disabled="!incomingCallPending"
        >
          Reject call
        </button>
      </div>
      <div
        class="container centered col x-center"
        v-show="registered || !registered"
      >
        <label for="extension-to-call">Number to call: </label>
        <input
          type="text"
          name="extension-to-call"
          id="extension-to-call"
          v-model="extensionToCall"
          :disabled="!registered"
        />
        <span v-show="makeCallHasError"
          >You must fill in this field to make a call.</span
        >
        <button
          id="make-call"
          @click="makeCall({ audio: true, video: false })"
          :disabled="!registered || isInCall"
        >
          Call
        </button>
        <!-- <button
          id="make-call"
          @click="makeCall({ audio: true, video: true })"
          :disabled="!registered || isInCall"
        >
          Video call
        </button> -->
        <button
          id="cancel-call"
          @click="endCall"
          :disabled="!registered || !isInCall"
        >
          End call
        </button>
      </div>
    </div>
    <!-- Medias -->
    <div class="container row wrap x-space-around">
      <div class="container col">
        <p>local video</p>
        <video autoplay controls playsinline id="local-media"></video>
        <audio id="local-audio"></audio>
      </div>
      <div class="container col">
        <p>remote video</p>
        <video autoplay controls playsinline id="remote-media"></video>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
  Web,
  UserAgent,
  Registerer,
  Invitation,
  Inviter,
  URI,
  SessionState,
  Session,
  InvitationAcceptOptions,
} from 'sip.js';
import { SessionDescriptionHandler } from 'sip.js/lib/platform/web';

export default defineComponent({
  setup() {
    return {};
  },

  data() {
    return {
      /* UI datas */
      registered: false,
      extension: '6002',
      password: '1234',
      loginHasError: false,
      disableCallButton: true,
      extensionToCall: '6001',
      incomingCallPending: false,
      outgoingCallPending: false,
      isInCall: false,
      makeCallHasError: false,

      /* DOM/HTML Elements */
      remoteMedia: null as unknown | HTMLVideoElement,
      localMedia: null as unknown | HTMLVideoElement,

      /* SIP/WebRTC datas */
      remotePeerConnection: null as unknown | RTCPeerConnection,
      userAgent: null as unknown | UserAgent,
      registerer: null as unknown | Registerer,
      // TODO maybe name invitation and inviter session (make it a Singleton)
      session: null as unknown | Inviter | Invitation,
    };
  },

  mounted() {
    this.remoteMedia = this.$el.querySelector('#remote-media');
    this.localMedia = this.$el.querySelector('#local-media');
  },

  computed: {
    // TODO refactor this
    isDisableddAcceptCall() {
      if (!this.registered) {
        return true;
      }
      if (this.isInCall) {
        return true;
      }
      if (this.loginHasError) {
        return true;
      }
      if (this.incomingCallPending) {
        return false;
      }
      return false;
    },
    // TODO refactor this
    isDisabledRejectCall() {
      if (!this.registered) {
        return true;
      }
      if (this.isInCall) {
        return true;
      }
      if (this.loginHasError) {
        return true;
      }
      if (this.incomingCallPending) {
        return false;
      }
      return false;
    },
  },

  methods: {
    /*
     * TODOS:
     * - be able to detect when a call is declined from the remote peer in order to terminate the call on the local peer
     */
    test() {
      console.log(this.remoteMedia);
      console.log(this.localMedia);
    },

    enableCallButtons() {
      this.disableCallButton = false;
    },

    cleanUpLocalMedia() {
      if (this.localMedia && this.localMedia instanceof HTMLVideoElement) {
        this.localMedia.srcObject = null;
        this.localMedia.pause();
      }
    },

    cleanUpRemoteMedia() {
      if (this.remoteMedia && this.remoteMedia instanceof HTMLVideoElement) {
        this.remoteMedia.srcObject = null;
        this.remoteMedia.pause();
      }
    },

    setupLocalMedia() {
      console.log('setup local media');

      if (!this.session || !(this.session instanceof Session)) {
        throw new Error("Session doesn't exist");
      } else {
        const sdh = this.session.sessionDescriptionHandler;
        if (!sdh) {
          throw new Error('Invalid session description handler');
        }
        if (!(sdh instanceof SessionDescriptionHandler)) {
          throw new Error(
            "Session's session description handler not instance of SessionDescriptionHandler"
          );
        }

        console.log(sdh.localMediaStream);

        if (
          !this.localMedia ||
          !(this.localMedia instanceof HTMLVideoElement)
        ) {
          throw new Error('Local video element not found');
        }
        this.localMedia.srcObject = sdh.localMediaStream;
        this.localMedia.play();
      }
    },

    setupRemoteMedia() {
      console.log('setup remote media');

      if (!this.session || !(this.session instanceof Session)) {
        throw new Error("Session doesn't exist");
      } else {
        const sdh = this.session.sessionDescriptionHandler;
        if (!sdh) {
          throw new Error('Invalid session description handler');
        }
        if (!(sdh instanceof SessionDescriptionHandler)) {
          throw new Error(
            "Session's session description handler not instance of SessionDescriptionHandler"
          );
        }

        console.log(sdh.remoteMediaStream);

        if (
          !this.remoteMedia ||
          !(this.remoteMedia instanceof HTMLVideoElement)
        ) {
          throw new Error('Remote video element not found');
        }
        sdh.remoteMediaStream.onaddtrack = (): void => {
          if (
            !this.remoteMedia ||
            !(this.remoteMedia instanceof HTMLVideoElement)
          ) {
            throw new Error('Remote video element not found');
          }
          console.warn('attaching remote media');
          this.remoteMedia.load();
          this.remoteMedia.play().catch((error) => {
            console.error(error);
          });
        };
        this.remoteMedia.autoplay = true; // safari hack
        this.remoteMedia.srcObject = sdh.remoteMediaStream;
        this.remoteMedia.play().catch((error) => {
          console.error(error);
        });
      }
    },

    /**
     * TODO maybe move this method outside of this component
     * When a SIP invitation is received:
     * turn on the accept call button
     */
    onInvite(invitation: Invitation) {
      console.log(invitation);
      this.incomingCallPending = true;

      invitation.stateChange.addListener((newState: SessionState) => {
        switch (newState) {
          case SessionState.Establishing:
            // Session is establishing
            console.log('Session is establishing');
            break;
          case SessionState.Established: {
            // Session has been established
            console.log('Session has been established');
            this.incomingCallPending = false;
            this.isInCall = true;

            /*
            const sdh = invitation.sessionDescriptionHandler;
            if (!sdh) {
              throw new Error('Invalid session description handler');
            }
            if (!(sdh instanceof SessionDescriptionHandler)) {
              throw new Error(
                "Session's session description handler not instance of SessionDescriptionHandler"
              );
            }

            console.log(sdh.localMediaStream);
            console.log(sdh.remoteMediaStream);
            */
            this.setupLocalMedia();
            this.setupRemoteMedia();
            // this.setupRemoteMedia(invitation);
            break;
          }
          case SessionState.Terminating:
          // fall through terminated
          case SessionState.Terminated:
            // Session has terminated
            this.cleanUpRemoteMedia();
            this.cleanUpLocalMedia();
            this.isInCall = false;
            this.session = undefined;
            console.log('Session has terminated');
            break;
          default:
            throw new Error('Unknown session state');
        }
      });
      this.enableCallButtons();
      this.session = invitation;
    },

    /**
     * When the accept call button is clicked
     * accept the invitation
     */
    acceptCall() {
      if (this.session instanceof Invitation && this.session !== null) {
        // TODO change this
        const options: InvitationAcceptOptions = {
          sessionDescriptionHandlerOptions: {
            constraints: { audio: true, video: true },
          },
        };
        this.session.accept(options);
      }
    },

    /**
     * When the reject call button is clicked
     * reject the invitation
     */
    rejectCall() {
      if (this.session instanceof Invitation && this.session !== null) {
        this.session.reject();
      }
      this.disableCallButton = true;
    },

    // TODO use this method to handle closing incoming and outgoing calls
    endCall() {
      if (this.session instanceof Inviter && this.session !== null) {
        switch (this.session.state) {
          case SessionState.Initial:
          case SessionState.Establishing:
            // An unestablished outgoing session
            this.session.cancel();
            break;
          case SessionState.Established:
            // An established session
            this.session.bye();
            break;
          case SessionState.Terminating:
          case SessionState.Terminated:
            // Cannot terminate a session that is already terminated
            break;
        }
        this.isInCall = false;
      } else if (this.session instanceof Invitation && this.session !== null) {
        switch (this.session.state) {
          case SessionState.Initial:
          case SessionState.Establishing:
            // An unestablished outgoing session
            this.session.bye();
            break;
          case SessionState.Established:
            // An established session
            this.session.bye();
            break;
          case SessionState.Terminating:
          case SessionState.Terminated:
            // Cannot terminate a session that is already terminated
            break;
        }
        this.isInCall = false;
      }
    },

    /* TODO make sure that the session is empty (ie the userAgent is not already in a call) */
    makeCall(callConstraints: Record<string, boolean>) {
      if (this.extensionToCall === null || this.extensionToCall === undefined) {
        this.makeCallHasError = true;
        return;
      } else {
        this.makeCallHasError = false;
      }

      if (this.userAgent instanceof UserAgent && this.userAgent !== null) {
        const sipEndpoint = `sip:${this.extensionToCall}@192.168.1.2:5060`;

        console.log(`calling endpoint: ${sipEndpoint}`);
        console.log(this.userAgent);

        const target = UserAgent.makeURI(sipEndpoint);
        if (!target) {
          throw new Error('Failed to create target URI');
        }

        if (target && target instanceof URI) {
          const options = {
            sessionDescriptionHandlerOptions: {
              constraints: callConstraints,
            },
            // inviteWithoutSdp: true,
          };

          const inviter = new Inviter(this.userAgent, target, options);

          this.session = inviter;

          if (this.session && this.session instanceof Session) {
            this.session.stateChange.addListener((newState: SessionState) => {
              switch (newState) {
                case SessionState.Establishing:
                  // Session is establishing
                  console.log('Session is establishing');
                  break;
                case SessionState.Established:
                  // Session has been established
                  console.log('Session has been established');

                  this.outgoingCallPending = false;
                  this.isInCall = true;
                  // FIXME: why is the remote video not attached
                  this.setupRemoteMedia();
                  this.setupLocalMedia();
                  break;
                case SessionState.Terminating:
                // fall through terminated
                case SessionState.Terminated:
                  // Session has terminated
                  // FIXME: why is the remote video not cleaned
                  this.cleanUpRemoteMedia();
                  this.cleanUpLocalMedia();
                  this.isInCall = false;
                  this.session = undefined;
                  console.log('Session has terminated');
                  break;
                default:
                  throw new Error('Unknown session state');
              }
            });

            this.session
              .invite()
              .then(() => {
                console.warn('invite sent');
                this.outgoingCallPending = true;
              })
              .catch(() => {
                console.error('failed to send invite');
              });
          }
        }
      }
    },

    registerUserAgent() {
      if (!this.extension) {
        this.loginHasError = true;
        return;
      } else {
        this.loginHasError = false;
      }

      const transportOptions = {
        server: 'wss://192.168.1.2:8089/ws',
        wsServers: 'wss://192.168.1.2:8089/ws',
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        traceSip: true,
      };
      const uri = UserAgent.makeURI(`sip:${this.extension}@192.168.1.2:5060`);

      const delegate = {
        onInvite: this.onInvite,
      };

      const userAgentOptions = {
        authorizationPassword: `${this.password}`,
        authorizationUsername: `${this.extension}`,
        transportOptions,
        hackViaTcp: true,
        // hackIpInContact: true,
        delegate,
        uri,
      };
      const userAgent = new UserAgent(userAgentOptions);

      this.userAgent = userAgent;

      const registerer = new Registerer(userAgent);

      this.registerer = registerer;

      userAgent
        .start()
        .then(() => {
          registerer
            .register()
            .then(() => {
              console.log('registered');
              this.registered = true;
            })
            .catch(console.error);
        })
        .catch(console.error);
    },

    /* TODO maybe rename this method to logout (as it unregisters and stops the user agent -disconnect-) */
    unregisterUserAgent() {
      if (
        this.userAgent &&
        this.userAgent instanceof UserAgent &&
        this.registerer &&
        this.registerer instanceof Registerer
      ) {
        this.registerer.unregister();
        this.userAgent.stop();
        this.registered = false;
        this.registerer = null;
        this.userAgent = null;
      }
    },

    /* LEGACY (?) */
    async testSimpleuser() {
      const server = 'wss://192.168.1.2:8089/ws';
      const aor = 'sip:webrtc_client@192.168.1.2:5060';
      // const aor = 'sip:6001@192.168.1.12:5060';
      const options = {
        aor,
        media: {
          // local: {
          //   video: document.getElementById('local-video') as HTMLVideoElement,
          // },
          // remote: {
          //   video: document.getElementById('remote-video') as HTMLVideoElement,
          // },
        },
        ua: {
          username: 'webrtc_client',
          password: 'webrtc_client',
        },
        // userAgentOptions: {
        //   authorizationUsername: 'webrtc_client',
        //   authorizationPassword: 'webrtc_client',
        // },
      };

      const simpleUser = new Web.SimpleUser(server, options);

      console.log(simpleUser);
      console.log('Connecting...');
      // Connect to server
      await simpleUser.connect();

      console.log('Registering...');
      // Register to receive inbound calls
      await simpleUser.register();
    },
  },
});
</script>

<style lang="scss" scoped>
.conference {
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
}
/*** LAYOUT ***/
.container {
  display: flex;
}
.centered {
  margin: 0 auto;
}
.w100 {
  width: 100%;
}
.h100 {
  height: 100%;
}
.row {
  flex-direction: row;
}
.col {
  flex-direction: column;
}
.wrap {
  flex-wrap: wrap;
}
.x-center {
  justify-content: center;
}
.x-end {
  justify-content: flex-end;
}
.y-center {
  align-items: center;
}
.x-space-between {
  justify-content: space-between;
}
.x-space-around {
  justify-content: space-around;
}
.y-space-between {
  align-content: space-between;
}
.y-space-around {
  align-content: space-around;
}
</style>
