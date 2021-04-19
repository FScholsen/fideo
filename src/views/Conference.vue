<template>
  <div class="conference">
    <div class="container row x-center">
      <h1>Conference</h1>
    </div>
    <div class="container col">
      <div class="container row x-center">
        <button @click="joinConference" :disabled="isInConference">
          Join conference
        </button>
        <button @click="leaveConference" :disabled="!isInConference">
          Leave conference
        </button>
      </div>
      <!-- <div class="container row x-center">
        <video autoplay controls playsinline id="local-media"></video>
      </div> -->
      <div class="container" id="remote-video-container">
        <!-- <div
          v-for="(video, index) in remoteMediaVideoElements"
          :key="index"
          v-html="video"
        ></div> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Invitation,
  Inviter,
  Registerer,
  Session,
  SessionState,
  URI,
  UserAgent,
  UserAgentDelegate,
  UserAgentOptions,
} from 'sip.js';
import { SessionDescriptionHandler } from 'sip.js/lib/platform/web';

import { defineComponent } from 'vue';

export default defineComponent({
  setup() {
    return {};
  },
  data() {
    return {
      /* UI Datas */
      isInConference: false,
      remoteMediaStreams: null as unknown | Array<MediaStream>,

      /* DOM/HTML Elements */
      localMedia: null as unknown | HTMLVideoElement,
      remoteMediaVideoElements: null as unknown | Array<HTMLVideoElement>,

      /* SIP/WebRTC datas */
      userAgent: null as unknown | UserAgent,
      registerer: null as unknown | Registerer,
      // TODO maybe name invitation and inviter session (make it a Singleton)
      session: null as unknown | Inviter | Invitation | Session,
    };
  },
  watch: {
    remoteMediaVideoElements(newValue) {
      console.log(newValue);
    },
  },
  methods: {
    // TODO how to detect the echo streams and display them in the browser
    setupRemoteMedias() {
      console.log('setup remote medias');
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

        const remoteVideoContainer = this.$el.querySelector(
          '#remote-video-container'
        );

        if (
          !this.remoteMediaStreams &&
          !(this.remoteMediaStreams instanceof Array)
        ) {
          this.remoteMediaStreams = new Array<MediaStream>();
        }
        if (
          !this.remoteMediaVideoElements &&
          !(this.remoteMediaVideoElements instanceof Array)
        ) {
          this.remoteMediaVideoElements = new Array<HTMLVideoElement>();
        }

        if (
          this.remoteMediaStreams &&
          this.remoteMediaStreams instanceof Array
        ) {
          console.log('setting up local');
          if (!this.remoteMediaStreams.includes(sdh.remoteMediaStream)) {
            this.remoteMediaStreams.push(sdh.remoteMediaStream);
            if (
              this.remoteMediaVideoElements &&
              this.remoteMediaVideoElements instanceof Array
            ) {
              console.log('add local media');
              const videoElement = document.createElement('video');
              videoElement.srcObject = sdh.remoteMediaStream;
              if (
                !this.remoteMediaVideoElements.includes(sdh.remoteMediaStream)
              ) {
                this.remoteMediaVideoElements.push(videoElement);
              }
              videoElement.play().catch(console.error);
              remoteVideoContainer.appendChild(videoElement);
            }
          }
        }

        sdh.remoteMediaStream.onaddtrack = (
          mediaStreamTrackEvent: MediaStreamTrackEvent
        ): void => {
          console.log(mediaStreamTrackEvent);
          if (
            !this.remoteMediaStreams &&
            !(this.remoteMediaStreams instanceof Array)
          ) {
            this.remoteMediaStreams = new Array<MediaStream>();
          }
          if (
            !this.remoteMediaVideoElements &&
            !(this.remoteMediaVideoElements instanceof Array)
          ) {
            this.remoteMediaVideoElements = new Array<HTMLVideoElement>();
          }
          if (
            this.remoteMediaStreams &&
            this.remoteMediaStreams instanceof Array
          ) {
            if (mediaStreamTrackEvent.target instanceof MediaStream) {
              console.log('setting up remote');
              if (
                !this.remoteMediaStreams.includes(mediaStreamTrackEvent.target)
              ) {
                this.remoteMediaStreams.push(mediaStreamTrackEvent.target);
                if (
                  this.remoteMediaVideoElements &&
                  this.remoteMediaVideoElements instanceof Array
                ) {
                  console.log('add local media');
                  const videoElement = document.createElement('video');
                  videoElement.srcObject = mediaStreamTrackEvent.target;
                  if (
                    !this.remoteMediaVideoElements.includes(
                      mediaStreamTrackEvent.target
                    )
                  ) {
                    this.remoteMediaVideoElements.push(videoElement);
                  }
                  videoElement.load();
                  videoElement.play().catch(console.error);
                  remoteVideoContainer.appendChild(videoElement);
                }
              }
            }
          }
        };
      }
    },

    cleanUpRemoteMedias() {
      console.log('clean up remote media');
      if (this.remoteMediaStreams && this.remoteMediaStreams instanceof Array) {
        this.remoteMediaStreams.forEach((remoteMediaStream) => {
          if (remoteMediaStream && remoteMediaStream instanceof MediaStream) {
            remoteMediaStream = null;
          }
        });
        this.remoteMediaStreams = undefined;
      }
      if (
        this.remoteMediaVideoElements &&
        this.remoteMediaVideoElements instanceof Array
      ) {
        this.remoteMediaVideoElements.forEach((remoteMediaVideoElement) => {
          if (
            remoteMediaVideoElement &&
            remoteMediaVideoElement instanceof HTMLVideoElement
          ) {
            remoteMediaVideoElement.srcObject = null;
            remoteMediaVideoElement.pause();
          }
        });
        this.remoteMediaVideoElements = undefined;
      }
    },

    // setupLocalMedia() {
    //   console.log('setup local media');

    //   if (!this.session || !(this.session instanceof Session)) {
    //     throw new Error("Session doesn't exist");
    //   } else {
    //     const sdh = this.session.sessionDescriptionHandler;
    //     if (!sdh) {
    //       throw new Error('Invalid session description handler');
    //     }
    //     if (!(sdh instanceof SessionDescriptionHandler)) {
    //       throw new Error(
    //         "Session's session description handler not instance of SessionDescriptionHandler"
    //       );
    //     }

    //     console.log(sdh.localMediaStream);

    //     if (
    //       !this.localMedia ||
    //       !(this.localMedia instanceof HTMLVideoElement)
    //     ) {
    //       throw new Error('Local video element not found');
    //     }
    //     this.localMedia.srcObject = sdh.localMediaStream;
    //     this.localMedia.play();
    //   }
    // },

    // cleanUpLocalMedia() {
    //   console.log('clean up local media');
    //   if (this.localMedia && this.localMedia instanceof HTMLVideoElement) {
    //     this.localMedia.srcObject = null;
    //     this.localMedia.pause();
    //   }
    // },

    async joinConference() {
      console.log('Join conference');
      if (this.userAgent) {
        return;
      }
      const transportOptions = {
        server: 'wss://192.168.1.2:8089/ws',
        // wsServers: 'wss://192.168.1.2:8089/ws',
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        // traceSip: true,
      };
      const uri = UserAgent.makeURI(`sip:webrtc_client@192.168.1.2:5060`);

      const delegate: UserAgentDelegate = {
        onInvite: async (invitation) => {
          // Incoming Session is created (INVITE received)
          console.warn('Call received', invitation);
        },
      };

      const userAgentOptions: UserAgentOptions = {
        authorizationPassword: 'webrtc_client',
        authorizationUsername: 'webrtc_client',
        delegate,
        transportOptions,
        uri,
      };

      const userAgent = new UserAgent(userAgentOptions);
      this.userAgent = userAgent;

      // FIXME: is the registration needed ?
      const registerer = new Registerer(userAgent);
      this.registerer = registerer;

      await userAgent.start();

      // Call the conference room
      if (this.userAgent && this.userAgent instanceof UserAgent) {
        console.log('calling conference room');
        const destination = `sip:video-conference@192.168.1.2:5060`;
        // const destination = `sip:echo@192.168.1.2:5060`;
        const target = UserAgent.makeURI(destination);
        const inviterOptions = {
          sessionDescriptionHandlerOptions: {
            constraints: { audio: true, video: true },
          },
        };
        if (target && target instanceof URI) {
          const inviter = new Inviter(this.userAgent, target, inviterOptions);
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

                  this.isInConference = true;
                  // FIXME: why is the remote video not attached
                  this.setupRemoteMedias();
                  // this.setupLocalMedia();
                  break;
                case SessionState.Terminating:
                // fall through terminated
                case SessionState.Terminated:
                  // Session has terminated
                  // FIXME: why is the remote video not cleaned
                  this.cleanUpRemoteMedias();
                  // this.cleanUpLocalMedia();
                  this.isInConference = false;
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
              })
              .catch(() => {
                console.error('failed to send invite');
              });
          }
        }
      }
    },

    async leaveConference() {
      console.log('Leave conference');
      // TODO leave call
      if (this.session && this.session instanceof Session) {
        this.session.bye();
      }
      if (
        this.userAgent &&
        this.userAgent instanceof UserAgent &&
        this.registerer &&
        this.registerer instanceof Registerer
      ) {
        this.registerer.unregister();
        this.userAgent.stop();
        this.registerer = null;
        this.userAgent = null;
        this.isInConference = false;
      }
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
