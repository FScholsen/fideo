<template>
  <div class="conference">
    <div class="container row x-center">
      <h1>Call</h1>
    </div>

    <div class="container col">
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
        <button id="test" @click="register" :disabled="registered">
          Login
        </button>
        <button id="test" @click="unregister" :disabled="!registered">
          Logout
        </button>
        <div>{{ registered ? `registered` : `unregistered` }}</div>
      </div>

      <div class="container centered col x-center" v-show="registered">
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
          @click="makeCall({ audio: true, video: true })"
          :disabled="!registered || isInCall"
        >
          Video call
        </button>
        <button
          id="cancel-call"
          @click="endCall"
          :disabled="!registered || !isInCall"
        >
          End call
        </button>
      </div>
      <!-- <div class="container row x-center">
        <p>
          Press start to begin a call. <br />
          Press stop to end the active call.
        </p>
      </div> -->
    </div>
    <div class="container row wrap x-space-around">
      <div class="container col">
        <video autoplay controls playsinline id="remote-video"></video>
      </div>
      <div class="container col">
        <video autoplay controls playsinline id="local-video" muted></video>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { InvitationAcceptOptions, InviterOptions } from 'sip.js';
import { SimpleUser, SimpleUserOptions } from 'sip.js/lib/platform/web';

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

      simpleUser: null as unknown | SimpleUser,
    };
  },

  methods: {
    canRegister() {
      return !this.registered;
    },
    canUnregister() {
      return this.registered;
    },

    test() {
      console.log(this.$el.querySelector('#remote-media'));
    },

    enableCallButtons() {
      this.disableCallButton = false;
    },

    async endCall() {
      if (
        this.simpleUser instanceof SimpleUser &&
        this.simpleUser !== undefined
      ) {
        await this.simpleUser.hangup();
        this.isInCall = false;
      }
    },

    async makeCall() {
      if (!this.extensionToCall) {
        this.makeCallHasError = true;
        return;
      } else {
        this.makeCallHasError = false;
      }
      if (
        this.simpleUser instanceof SimpleUser &&
        this.simpleUser !== undefined
      ) {
        const destination = `sip:${this.extensionToCall}@192.168.1.2:5060`;

        const inviterOptions: InviterOptions = {
          sessionDescriptionHandlerOptions: {
            constraints: { audio: true, video: true },
          },
        };

        await this.simpleUser.call(destination, inviterOptions);
        this.isInCall = true;
      } else {
        throw new Error('user is not registered');
      }
    },

    async register() {
      if (this.simpleUser) {
        return;
      }
      if (!this.extension) {
        this.loginHasError = true;
        return;
      } else {
        this.loginHasError = false;
      }
      const server = 'wss://192.168.1.2:8089/ws';
      const aor = `sip:${this.extension}@192.168.1.2:5060`;

      const options: SimpleUserOptions = {
        aor,
        media: {
          local: {
            video: document.getElementById('local-video') as HTMLVideoElement,
          },
          remote: {
            video: document.getElementById('remote-video') as HTMLVideoElement,
          },
        },
        userAgentOptions: {
          authorizationUsername: `${this.extension}`,
          authorizationPassword: `${this.extension}`,
          transportOptions: {
            server: 'wss://192.168.1.2:8089/ws',
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
          },
        },
        // userAgentOptions: {
        //   authorizationUsername: 'webrtc_client',
        //   authorizationPassword: 'webrtc_client',
        // },
      };

      const simpleUser = new SimpleUser(server, options);

      // Supply delegate to handle inbound calls (optional)
      simpleUser.delegate = {
        onCallReceived: async () => {
          const options: InvitationAcceptOptions = {
            sessionDescriptionHandlerOptions: {
              constraints: { audio: true, video: true },
            },
          };
          await simpleUser.answer(options);
          this.isInCall = true;
        },
      };

      this.simpleUser = simpleUser;

      console.log(simpleUser);
      console.log('Connecting...');
      // Connect to server
      await simpleUser.connect();

      console.log('Registering...');
      // Register to receive inbound calls
      await simpleUser.register();
      this.registered = true;
    },
    async unregister() {
      if (this.simpleUser && this.simpleUser instanceof SimpleUser) {
        await this.simpleUser.disconnect();
        await this.simpleUser.unregister();
        this.simpleUser = null;
        this.registered = false;
      }
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
