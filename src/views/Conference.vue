<template>
  <div class="conference">
    <div class="container row x-center">
      <h1>Conference</h1>
    </div>
    <div class="container col">
      <div class="container row x-center">
        <button id="test" @click="test">Test</button>
      </div>
      <br />
      <div class="container centered col x-center">
        <!-- <button id="test" @click="test">Test Simple User</button> -->
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
        <!-- <button id="start" @click="handleCallStart">Start</button>
        <button id="stop" @click="handleCallEnd">Stop</button> -->
      </div>
      <br />
      <div class="container centered col x-center">
        <button
          id="accept-call"
          @click="acceptCall"
          :disabled="disableCallButton"
        >
          Accept call
        </button>
        <button
          id="reject-call"
          @click="rejectCall"
          :disabled="disableCallButton"
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
          Audio call
        </button>
        <button
          id="make-call"
          @click="makeCall({ audio: true, video: true })"
          :disabled="!registered || isInCall"
        >
          Video call
        </button>
        <button
          id="cancel-call"
          @click="endCall"
          :disabled="!registered || !isInCall || !callPending"
        >
          End call
        </button>
      </div>
      <video controls playsinline id="remote-media"></video>
      <!-- <div class="container row x-center">
        <p>
          Press start to begin a call. <br />
          Press stop to end the active call.
        </p>
      </div> -->
    </div>
    <!-- <div class="container row wrap x-space-around">
      <div class="container col">
        <video autoplay controls playsinline id="local-video"></video>
        <audio id="local-audio"></audio>
      </div>
      <div class="container col">
        <video autoplay controls playsinline id="remote-video"></video>
      </div>
    </div> -->
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

export default defineComponent({
  setup() {
    return {};
  },

  data() {
    return {
      registered: false,
      extension: '102',
      loginHasError: false,
      disableCallButton: true,
      extensionToCall: '101',
      callPending: false,
      isInCall: false,
      makeCallHasError: false,

      remotePeerConnection: null as unknown | RTCPeerConnection,

      userAgent: null as unknown | UserAgent,
      // TODO maybe name invitation and inviter session (make it a Singleton)
      session: null as unknown | Inviter | Invitation,
    };
  },

  methods: {
    test() {
      console.log(this.$el.querySelector('#remote-media'));
    },

    enableCallButtons() {
      this.disableCallButton = false;
    },

    setupRemoteMedia(session: Session | Inviter | Invitation) {
      // const remoteMedia = this.$el.querySelector('#remote-media');
      // const remoteMediaStream = new MediaStream();

      console.log(session, session.sessionDescriptionHandler);

      if (session.sessionDescriptionHandler) {
        session.sessionDescriptionHandler.getDescription().then(console.log);
      }

      console.log(session.dialog);
      // if (session.sessionDescriptionHandler()) {
      //   session.sessionDescriptionHandler._peerConnection
      //     ?.getReceivers()
      //     .forEach((receiver: RTCRtpReceiver) => {
      //       if (receiver.track) {
      //         remoteMediaStream.addTrack(receiver.track);
      //       }
      //     });
      //   remoteMedia.srcObject = remoteMediaStream;
      //   remoteMedia.play();
      // }
    },

    /**
     * When a SIP invitation is received:
     * turn on the accept call button
     */
    onInvite(invitation: Invitation) {
      console.log(invitation);

      invitation.stateChange.addListener((newState: SessionState) => {
        switch (newState) {
          case SessionState.Establishing:
            // Session is establishing
            console.log('Session is establishing');
            break;
          case SessionState.Established:
            // Session has been established
            console.log('Session has been established');
            this.setupRemoteMedia(invitation);
            break;
          case SessionState.Terminating:
          // fall through terminated
          case SessionState.Terminated:
            // Session has terminated
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

        if (target instanceof URI && target !== undefined && target !== null) {
          const options = {
            sessionDescriptionHandlerOptions: {
              constraints: callConstraints,
            },
          };

          const inviter = new Inviter(this.userAgent, target, options);

          this.session = inviter;

          inviter.stateChange.addListener((newState: SessionState) => {
            switch (newState) {
              case SessionState.Establishing:
                // Session is establishing
                console.log('Session is establishing');
                break;
              case SessionState.Established:
                // Session has been established
                console.log('Session has been established');

                this.callPending = false;
                this.isInCall = true;
                this.setupRemoteMedia(inviter);
                break;
              case SessionState.Terminating:
              // fall through terminated
              case SessionState.Terminated:
                // Session has terminated
                console.log('Session has terminated');
                break;
              default:
                throw new Error('Unknown session state');
            }
          });

          inviter
            .invite()
            .then(() => {
              console.warn('invite sent');
              this.callPending = true;
            })
            .catch(() => {
              console.error('failed to send invite');
            });
        }
      }
    },

    registerUserAgent() {
      if (this.extension === null) {
        this.loginHasError = true;
        return;
      } else {
        this.loginHasError = false;
      }

      const transportOptions = {
        server: 'wss://192.168.1.2:8089/ws',
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      };
      const uri = UserAgent.makeURI(`sip:${this.extension}@192.168.1.2:5060`);

      const delegate = {
        onInvite: this.onInvite,
      };

      const userAgentOptions = {
        authorizationPassword: `${this.extension}`,
        authorizationUsername: `${this.extension}`,
        transportOptions,
        delegate,
        uri,
      };
      const userAgent = new UserAgent(userAgentOptions);

      this.userAgent = userAgent;

      const registerer = new Registerer(userAgent);
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
    handleCallStart() {
      console.log('Starting video call');
    },
    handleCallEnd() {
      console.log('Ending video call');
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
