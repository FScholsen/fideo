/* This class is a wrapper around the SIPJS UserAgent class */

import {
  UserAgent,
  UserAgentOptions,
  Registerer,
  RegistererState,
  RegistererOptions,
  RegistererRegisterOptions,
  RegistererUnregisterOptions,
  Invitation,
  Inviter,
  InviterOptions,
  Message,
  Referral,
  // URI,
  SessionState,
  Session,
  InvitationAcceptOptions,
  InviterInviteOptions,
} from 'sip.js';
import { SessionDescriptionHandler } from 'sip.js/lib/platform/web';

/*********************/
/* REGION INTERFACES */
/*********************/

export interface SIPWebRTCUserMediaConstraints {
  /** If true, offer and answer to send and receive audio. */
  audio: boolean;
  /** If true, offer and answer to send and receive video. */
  video: boolean;
}

export interface SIPWebRTCUserMediaLocal {
  video?: HTMLVideoElement;
}

export interface SIPWebRTCUserMediaRemote {
  audio?: HTMLAudioElement;
  video?: HTMLVideoElement;
}

export interface SIPWebRTCUserMedia {
  constraints?: SIPWebRTCUserMediaConstraints;
  local?: SIPWebRTCUserMediaLocal;
  remote?: SIPWebRTCUserMediaRemote;
}

export interface SIPWebRTCUserDelegate {
  /**
   * Called when a call is answered.
   * @remarks
   * Callback for handling establishment of a new Session.
   */
  onCallAnswered?(): void;

  /**
   * Called when a call is created.
   * @remarks
   * Callback for handling the creation of a new Session.
   */
  onCallCreated?(): void;

  /**
   * Called when a call is received.
   * @remarks
   * Callback for handling incoming INVITE requests.
   * The callback must either accept or reject the incoming call by calling `answer()` or `decline()` respectively.
   */
  onCallReceived?(): void;

  /**
   * Called when a call is hung up.
   * @remarks
   * Callback for handling termination of a Session.
   */
  onCallHangup?(): void;

  /**
   * Called when a call is put on hold or taken off hold.
   * @remarks
   * Callback for handling re-INVITE responses.
   */
  onCallHold?(held: boolean): void;

  /**
   * Called when a call receives an incoming DTMF tone.
   * @remarks
   * Callback for handling an incoming INFO request with content type application/dtmf-relay.
   */
  onCallDTMFReceived?(tone: string, duration: number): void;

  /**
   * Called upon receiving a message.
   * @remarks
   * Callback for handling incoming MESSAGE requests.
   * @param message - The message received.
   */
  onMessageReceived?(message: string): void;

  /**
   * Called when user is registered to received calls.
   */
  onRegistered?(): void;

  /**
   * Called when user is no longer registered to received calls.
   */
  onUnregistered?(): void;

  /**
   * Called when user is connected to server.
   * @remarks
   * Callback for handling user becomes connected.
   */
  onServerConnect?(): void;

  /**
   * Called when user is no longer connected.
   * @remarks
   * Callback for handling user becomes disconnected.
   *
   * @param error - An Error if server caused the disconnect. Otherwise undefined.
   */
  onServerDisconnect?(error?: Error): void;
}

export interface SIPWebRTCUserOptions {
  /**
   * User's SIP Address of Record (AOR).
   * @remarks
   * The AOR is registered to receive incoming calls.
   * If not specified, a random anonymous address is created for the user.
   */
  aor?: string;

  /**
   * Delegate handlers for SIPWebRTCUser.
   */
  delegate?: SIPWebRTCUserDelegate;

  /**
   * Media options.
   */
  media?: SIPWebRTCUserMedia;

  /**
   * Maximum number of times to attempt to reconnection.
   * @remarks
   * When the transport connection is lost (WebSocket disconnects),
   * reconnection will be attempted immediately. If that fails,
   * reconnection will be attempted again when the browser indicates
   * the application has come online. See:
   * https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine
   * @defaultValue 3
   */
  reconnectionAttempts?: number;

  /**
   * Seconds to wait between reconnection attempts.
   * @defaultValue 4
   */
  reconnectionDelay?: number;

  /**
   * Options for UserAgent.
   */
  userAgentOptions?: UserAgentOptions;
}

/************************/
/* ENDREGION INTERFACES */
/************************/

// Create a WebRTC user that can make calls, end calls (inspired from SimpleUser)

export class SIPWebRTCUser {
  public delegate: SIPWebRTCUserDelegate | undefined;

  private options: SIPWebRTCUserOptions;
  private registerer: Registerer | undefined = undefined;
  private registerRequested = false;
  private session: Session | undefined = undefined;
  private userAgent: UserAgent;

  constructor(server: string, options: SIPWebRTCUserOptions = {}) {
    // Delegate
    this.delegate = options.delegate;

    // Copy options
    this.options = { ...options };

    // UserAgentOptions
    const userAgentOptions: UserAgentOptions = {
      ...options.userAgentOptions,
    };

    // Transport options
    if (!userAgentOptions.transportOptions) {
      userAgentOptions.transportOptions = {
        server,
        // iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      };
    }

    // URI
    if (!userAgentOptions.uri) {
      // If an AOR was provided, convert it to a URI
      if (options.aor) {
        const uri = UserAgent.makeURI(options.aor);
        if (!uri) {
          throw new Error(`Failed to create valid URI from ${options.aor}`);
        }
        userAgentOptions.uri = uri;
      }
    }

    // UserAgent
    this.userAgent = new UserAgent(userAgentOptions);

    // UserAgent's delegate
    this.userAgent.delegate = {
      // Handle connection with server established
      onConnect: (): void => {
        console.log(`Connected`);
        if (this.delegate && this.delegate.onServerConnect) {
          this.delegate.onServerConnect();
        }
        if (this.registerer && this.registerRequested) {
          this.registerer.register().catch((e: Error) => console.error(e));
        }
      },
      // Handle connection with server lost
      onDisconnect: (error?: Error): void => {
        if (this.delegate && this.delegate.onServerDisconnect) {
          this.delegate.onServerDisconnect(error);
        }
        if (this.session) {
          // cleanup hung calls
          this.hangup().catch((e: Error) => {
            console.error(e.toString());
          });
        }
        if (this.registerer) {
          console.log(`Unregistering...`);
          // cleanup invalid registrations
          this.registerer.unregister().catch((e: Error) => {
            console.error(e.toString());
          });
        }
        // Only attempt to reconnect if network/server dropped the connection.
        if (error) {
          // TODO attemptReconnection
          // this.attemptReconnection();
        }
      },
      onInvite: (invitation) => {
        console.log('Received INVITE');
        if (this.session) {
          console.log('Session already in progress, rejecting INVITE...');
          invitation
            .reject()
            .then(() => {
              console.log('Rejected INVITE');
            })
            .catch((error: Error) => {
              console.error('Failed to reject INVITE', error.toString());
            });
          return;
        }

        // Use our configured constraints as options for any Inviter created as result of a REFER
        const referralInviterOptions: InviterOptions = {
          sessionDescriptionHandlerOptions: { constraints: this.constraints },
        };

        // Initialize our session
        this.initSession(invitation, referralInviterOptions);

        // Delegate
        if (this.delegate && this.delegate.onCallReceived) {
          this.delegate.onCallReceived();
        } else {
          console.warn(`No handler available, rejecting INVITE...`);
          invitation
            .reject()
            .then(() => {
              console.log(`Rejected INVITE`);
            })
            .catch((error: Error) => {
              console.error(`Failed to reject INVITE`, error.toString());
            });
        }
      },
      // Handle incoming messages
      onMessage: (message: Message): void => {
        message.accept().then(() => {
          if (this.delegate && this.delegate.onMessageReceived) {
            this.delegate.onMessageReceived(message.request.body);
          }
        });
      },
    };

    // TODO
    // Monitor network connectivity and attempt reconnection when we come online
    // window.addEventListener('online', () => {
    //   console.log(`Online`);
    //   this.attemptReconnection();
    // });
  }

  /** The local media stream. Undefined if call not answered. */
  get localMediaStream(): MediaStream | undefined {
    const sdh = this.session?.sessionDescriptionHandler;
    if (!sdh) {
      return undefined;
    }
    if (!(sdh instanceof SessionDescriptionHandler)) {
      throw new Error(
        'Session description handler not instance of web SessionDescriptionHandler'
      );
    }
    return sdh.localMediaStream;
  }

  /** The remote media stream. Undefined if call not answered. */
  get remoteMediaStream(): MediaStream | undefined {
    const sdh = this.session?.sessionDescriptionHandler;
    if (!sdh) {
      return undefined;
    }
    if (!(sdh instanceof SessionDescriptionHandler)) {
      throw new Error(
        'Session description handler not instance of web SessionDescriptionHandler'
      );
    }
    return sdh.remoteMediaStream;
  }

  /**
   * Start receiving incoming calls.
   * @remarks
   * Send a REGISTER request for the UserAgent's AOR.
   * Resolves when the REGISTER request is sent, otherwise rejects.
   */
  public register(
    registererOptions?: RegistererOptions,
    registererRegisterOptions?: RegistererRegisterOptions
  ): Promise<void> {
    console.log(`Registering UserAgent...`);
    this.registerRequested = true;

    if (!this.registerer) {
      this.registerer = new Registerer(this.userAgent, registererOptions);
      this.registerer.stateChange.addListener((state: RegistererState) => {
        switch (state) {
          case RegistererState.Initial:
            break;
          case RegistererState.Registered:
            if (this.delegate && this.delegate.onRegistered) {
              this.delegate.onRegistered();
            }
            break;
          case RegistererState.Unregistered:
            if (this.delegate && this.delegate.onUnregistered) {
              this.delegate.onUnregistered();
            }
            break;
          case RegistererState.Terminated:
            this.registerer = undefined;
            break;
          default:
            throw new Error('Unknown registerer state.');
        }
      });
    }

    return this.registerer.register(registererRegisterOptions).then(() => {
      return;
    });
  }

  /**
   * Stop receiving incoming calls.
   * @remarks
   * Send an un-REGISTER request for the UserAgent's AOR.
   * Resolves when the un-REGISTER request is sent, otherwise rejects.
   */
  public unregister(
    registererUnregisterOptions?: RegistererUnregisterOptions
  ): Promise<void> {
    console.log(`Unregistering UserAgent...`);
    this.registerRequested = false;

    if (!this.registerer) {
      return Promise.resolve();
    }

    return this.registerer.unregister(registererUnregisterOptions).then(() => {
      return;
    });
  }

  /**
   * Make an outgoing call.
   * @remarks
   * Send an INVITE request to create a new Session.
   * Resolves when the INVITE request is sent, otherwise rejects.
   * Use `onCallAnswered` delegate method to determine if Session is established.
   * @param destination - The target destination to call. A SIP address to send the INVITE to.
   * @param inviterOptions - Optional options for Inviter constructor.
   * @param inviterInviteOptions - Optional options for Inviter.invite().
   */
  public call(
    destination: string,
    inviterOptions?: InviterOptions,
    inviterInviteOptions?: InviterInviteOptions
  ): Promise<void> {
    console.log(`Beginning Session...`);

    if (this.session) {
      return Promise.reject(new Error('Session already exists.'));
    }

    const target = UserAgent.makeURI(destination);
    if (!target) {
      return Promise.reject(
        new Error(`Failed to create a valid URI from "${destination}"`)
      );
    }

    // Use our configured constraints as InviterOptions if none provided
    if (!inviterOptions) {
      inviterOptions = {};
    }
    if (!inviterOptions.sessionDescriptionHandlerOptions) {
      inviterOptions.sessionDescriptionHandlerOptions = {};
    }
    if (!inviterOptions.sessionDescriptionHandlerOptions.constraints) {
      inviterOptions.sessionDescriptionHandlerOptions.constraints = this.constraints;
    }

    // Create a new Inviter for the outgoing Session
    const inviter = new Inviter(this.userAgent, target, inviterOptions);

    // Send INVITE
    return this.sendInvite(inviter, inviterOptions, inviterInviteOptions);
  }

  /**
   * Hangup a call.
   * @remarks
   * Send a BYE request, CANCEL request or reject response to end the current Session.
   * Resolves when the request/response is sent, otherwise rejects.
   * Use `onCallTerminated` delegate method to determine if and when call is ended.
   */
  public hangup(): Promise<void> {
    return this.terminate();
  }

  /**
   * Answer an incoming call.
   * @remarks
   * Accept an incoming INVITE request creating a new Session.
   * Resolves with the response is sent, otherwise rejects.
   * Use `onCallAnswered` delegate method to determine if and when call is established.
   * @param invitationAcceptOptions - Optional options for Inviter.accept().
   */
  public answer(
    invitationAcceptOptions?: InvitationAcceptOptions
  ): Promise<void> {
    console.log(`Accepting Invitation...`);

    if (!this.session) {
      return Promise.reject(new Error('Session does not exist.'));
    }

    if (!(this.session instanceof Invitation)) {
      return Promise.reject(new Error('Session not instance of Invitation.'));
    }

    // Use our configured constraints as InvitationAcceptOptions if none provided
    if (!invitationAcceptOptions) {
      invitationAcceptOptions = {};
    }
    if (!invitationAcceptOptions.sessionDescriptionHandlerOptions) {
      invitationAcceptOptions.sessionDescriptionHandlerOptions = {};
    }
    if (!invitationAcceptOptions.sessionDescriptionHandlerOptions.constraints) {
      invitationAcceptOptions.sessionDescriptionHandlerOptions.constraints = this.constraints;
    }

    return this.session.accept(invitationAcceptOptions);
  }

  /**
   * Decline an incoming call.
   * @remarks
   * Reject an incoming INVITE request.
   * Resolves with the response is sent, otherwise rejects.
   * Use `onCallTerminated` delegate method to determine if and when call is ended.
   */
  public decline(): Promise<void> {
    console.log(`Rejecting Invitation...`);

    if (!this.session) {
      return Promise.reject(new Error('Session does not exist.'));
    }

    if (!(this.session instanceof Invitation)) {
      return Promise.reject(new Error('Session not instance of Invitation.'));
    }

    return this.session.reject();
  }

  /**
   * Setup session delegate and state change handler.
   * @param session - Session to setup
   * @param referralInviterOptions - Options for any Inviter created as result of a REFER.
   */
  private initSession(
    session: Session,
    referralInviterOptions?: InviterOptions
  ): void {
    // Set session
    this.session = session;

    // Call session created callback
    if (this.delegate && this.delegate.onCallCreated) {
      this.delegate.onCallCreated();
    }

    // Setup session state change handler
    this.session.stateChange.addListener((state: SessionState) => {
      if (this.session !== session) {
        return; // if our session has changed, just return
      }
      console.log(`session state changed to ${state}`);
      switch (state) {
        case SessionState.Initial:
          break;
        case SessionState.Establishing:
          break;
        case SessionState.Established:
          this.setupLocalMedia();
          this.setupRemoteMedia();
          if (this.delegate && this.delegate.onCallAnswered) {
            this.delegate.onCallAnswered();
          }
          break;
        case SessionState.Terminating:
        // fall through
        case SessionState.Terminated:
          this.session = undefined;
          this.cleanupMedia();
          if (this.delegate && this.delegate.onCallHangup) {
            this.delegate.onCallHangup();
          }
          break;
        default:
          throw new Error('Unknown session state.');
      }
    });

    // Setup delegate
    this.session.delegate = {
      // onInfo: (info: Info): void => {
      //   // As RFC 6086 states, sending DTMF via INFO is not standardized...
      //   //
      //   // Companies have been using INFO messages in order to transport
      //   // Dual-Tone Multi-Frequency (DTMF) tones.  All mechanisms are
      //   // proprietary and have not been standardized.
      //   // https://tools.ietf.org/html/rfc6086#section-2
      //   //
      //   // It is however widely supported based on this draft:
      //   // https://tools.ietf.org/html/draft-kaplan-dispatch-info-dtmf-package-00
      //   // FIXME: TODO: We should reject correctly...
      //   //
      //   // If a UA receives an INFO request associated with an Info Package that
      //   // the UA has not indicated willingness to receive, the UA MUST send a
      //   // 469 (Bad Info Package) response (see Section 11.6), which contains a
      //   // Recv-Info header field with Info Packages for which the UA is willing
      //   // to receive INFO requests.
      //   // https://tools.ietf.org/html/rfc6086#section-4.2.2
      //   // No delegate
      //   if (this.delegate?.onCallDTMFReceived === undefined) {
      //     info.reject();
      //     return;
      //   }
      //   // Invalid content type
      //   const contentType = info.request.getHeader("content-type");
      //   if (!contentType || !/^application\/dtmf-relay/i.exec(contentType)) {
      //     info.reject();
      //     return;
      //   }
      //   // Invalid body
      //   const body = info.request.body.split("\r\n", 2);
      //   if (body.length !== 2) {
      //     info.reject();
      //     return;
      //   }
      //   // Invalid tone
      //   let tone: string | undefined;
      //   const toneRegExp = /^(Signal\s*?=\s*?)([0-9A-D#*]{1})(\s)?.*/;
      //   if (toneRegExp.test(body[0])) {
      //     tone = body[0].replace(toneRegExp, "$2");
      //   }
      //   if (!tone) {
      //     info.reject();
      //     return;
      //   }
      //   // Invalid duration
      //   let duration: number | undefined;
      //   const durationRegExp = /^(Duration\s?=\s?)([0-9]{1,4})(\s)?.*/;
      //   if (durationRegExp.test(body[1])) {
      //     duration = parseInt(body[1].replace(durationRegExp, "$2"), 10);
      //   }
      //   if (!duration) {
      //     info.reject();
      //     return;
      //   }
      //   info
      //     .accept()
      //     .then(() => {
      //       if (this.delegate && this.delegate.onCallDTMFReceived) {
      //         if (!tone || !duration) {
      //           throw new Error("Tone or duration undefined.");
      //         }
      //         this.delegate.onCallDTMFReceived(tone, duration);
      //       }
      //     })
      //     .catch((error: Error) => {
      //       this.logger.error(error.message);
      //     });
      // },
      //
      onRefer: (referral: Referral): void => {
        referral
          .accept()
          .then(() =>
            this.sendInvite(
              referral.makeInviter(referralInviterOptions),
              referralInviterOptions
            )
          )
          .catch((error: Error) => {
            console.error(error.message);
          });
      },
    };
  }

  /** Helper function to init send then send invite. */
  private sendInvite(
    inviter: Inviter,
    inviterOptions?: InviterOptions,
    inviterInviteOptions?: InviterInviteOptions
  ): Promise<void> {
    // Initialize our session
    this.initSession(inviter, inviterOptions);

    // Send the INVITE
    return inviter.invite(inviterInviteOptions).then(() => {
      console.log(`Sent INVITE`);
    });
  }

  /** Media constraints. */
  private get constraints(): { audio: boolean; video: boolean } {
    let constraints = { audio: true, video: false }; // default to audio only calls
    if (this.options.media?.constraints) {
      constraints = { ...this.options.media.constraints };
    }
    return constraints;
  }

  /** Helper function to remove media from html elements. */
  private cleanupMedia(): void {
    if (this.options.media) {
      if (this.options.media.local) {
        if (this.options.media.local.video) {
          this.options.media.local.video.srcObject = null;
          this.options.media.local.video.pause();
        }
      }
      if (this.options.media.remote) {
        if (this.options.media.remote.audio) {
          this.options.media.remote.audio.srcObject = null;
          this.options.media.remote.audio.pause();
        }
        if (this.options.media.remote.video) {
          this.options.media.remote.video.srcObject = null;
          this.options.media.remote.video.pause();
        }
      }
    }
  }

  /** Helper function to attach local media to html elements. */
  private setupLocalMedia(): void {
    if (!this.session) {
      throw new Error('Session does not exist.');
    }

    const mediaElement = this.options.media?.local?.video;
    if (mediaElement) {
      const localStream = this.localMediaStream;
      if (!localStream) {
        throw new Error('Local media stream undefined.');
      }
      mediaElement.srcObject = localStream;
      mediaElement.volume = 0;
      mediaElement.play().catch((error: Error) => {
        console.error(`Failed to play local media`);
        console.error(error.message);
      });
    }
  }

  /** Helper function to attach remote media to html elements. */
  private setupRemoteMedia(): void {
    if (!this.session) {
      throw new Error('Session does not exist.');
    }

    const mediaElement =
      this.options.media?.remote?.video || this.options.media?.remote?.audio;

    if (mediaElement) {
      const remoteStream = this.remoteMediaStream;
      if (!remoteStream) {
        throw new Error('Remote media stream undefined.');
      }
      mediaElement.autoplay = true; // Safari hack, because you cannot call .play() from a non user action
      mediaElement.srcObject = remoteStream;
      mediaElement.play().catch((error: Error) => {
        console.error(`Failed to play remote media`);
        console.error(error.message);
      });
      remoteStream.onaddtrack = (): void => {
        console.log(`Remote media onaddtrack`);
        mediaElement.load(); // Safari hack, as it doesn't work otherwise
        mediaElement.play().catch((error: Error) => {
          console.error(`Failed to play remote media`);
          console.error(error.message);
        });
      };
    }
  }

  /**
   * End a session.
   * @remarks
   * Send a BYE request, CANCEL request or reject response to end the current Session.
   * Resolves when the request/response is sent, otherwise rejects.
   * Use `onCallTerminated` delegate method to determine if and when Session is terminated.
   */
  private terminate(): Promise<void> {
    console.log(`Terminating...`);

    if (!this.session) {
      return Promise.reject(new Error('Session does not exist.'));
    }

    switch (this.session.state) {
      case SessionState.Initial:
        if (this.session instanceof Inviter) {
          return this.session.cancel().then(() => {
            console.log(`Inviter never sent INVITE (canceled)`);
          });
        } else if (this.session instanceof Invitation) {
          return this.session.reject().then(() => {
            console.log(`Invitation rejected (sent 480)`);
          });
        } else {
          throw new Error('Unknown session type.');
        }
      case SessionState.Establishing:
        if (this.session instanceof Inviter) {
          return this.session.cancel().then(() => {
            console.log(`Inviter canceled (sent CANCEL)`);
          });
        } else if (this.session instanceof Invitation) {
          return this.session.reject().then(() => {
            console.log(`Invitation rejected (sent 480)`);
          });
        } else {
          throw new Error('Unknown session type.');
        }
      case SessionState.Established:
        return this.session.bye().then(() => {
          console.log(`Session ended (sent BYE)`);
        });
      case SessionState.Terminating:
        break;
      case SessionState.Terminated:
        break;
      default:
        throw new Error('Unknown state');
    }

    console.log(`Terminating in state ${this.session.state}, no action taken`);
    return Promise.resolve();
  }
}
