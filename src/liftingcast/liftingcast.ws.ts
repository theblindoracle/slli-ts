import { Injectable, Logger, Type } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WebSocket } from "ws";
import { MeetApiResponse } from "./liftingcast.types";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class LiftingcastWebsocketService {
  private readonly logger = new Logger(LiftingcastWebsocketService.name)
  private readonly ws: WebSocket
  private lastPing: number
  private lastPong: number
  private latencyList: number[] = []
  private heartbeatTimeout: NodeJS.Timeout
  private pingInterval: NodeJS.Timeout

  latency: number
  meetState: MeetApiResponse

  constructor(private readonly configService: ConfigService, private readonly eventEmitter: EventEmitter2) {
    const apiKey = this.configService.getOrThrow("LC_API_KEY")
    const wsUrl = this.configService.getOrThrow("LC_WS_URL")
    const meetId = this.configService.getOrThrow("LC_MEET_ID")
    const password = this.configService.getOrThrow("LC_PASSWORD")

    this.ws = new WebSocket(`${wsUrl}?meetId=${meetId}&auth=${encodeURI(btoa(`${meetId}:${password}`))}&apiKey=${encodeURI(apiKey)}`)

    this.pingInterval = setInterval(() => {
      // If you send a "ping" message server will respond with a "pong" message.
      // This is different that the build in ping/pong protocol messages built into the ws protocol.
      this.ws.send("ping");
      this.lastPing = Date.now()
    }, 30000);

    this.ws.on("open", () => {
      this.logger.log("opening connection")
      heartbeat()

      this.ws.send("ping");
      this.lastPing = Date.now()
    })

    this.ws.on("message", (data) => {
      heartbeat();
      const dataString = data.toString()


      if (dataString === "ping") {
        this.ws.send("pong")
        return
      }
      if (dataString === "pong") {
        this.lastPong = Date.now()
        calculateLatency()
        return
      }

      try {
        const parsedData = JSON.parse(dataString);
        this.meetState = { ...this.meetState, ...parsedData };
        this.logger.log("Meet state updated")
        this.eventEmitter.emit(LC_EVENTS.MEET_UPDATED, { meetDoc: this.meetState })

      } catch (e) {
        console.log("Error saving message: ", e);
      }
    })

    this.ws.on("error", (data) => {
      this.logger.error("Error from websocket", data)
      this.eventEmitter.emit(LC_EVENTS.ERROR, { error: data })

    })

    this.ws.on("close", () => {
      this.logger.log("Connection closing");
      // TODO: implement onClose

      if (this.heartbeatTimeout) {
        clearTimeout(this.heartbeatTimeout);
      }

      if (this.pingInterval) {
        clearInterval(this.pingInterval)
      }
    })

    const calculateLatency = () => {
      if (this.lastPong > this.lastPing) {
        const latency = this.lastPong - this.lastPing
        const newList = [...this.latencyList, latency].slice(0, 10)
        const average = newList.reduce((a, b) => (a + b)) / newList.length
        this.latency = average
        this.eventEmitter.emit(LC_EVENTS.LATENCY_UPDATED, { latency })
      }
    }

    const heartbeat = () => {
      if (this.heartbeatTimeout) {
        clearTimeout(this.heartbeatTimeout);
      }

      // If we don't get a ping or other message after a min assume something is wrong and close the connection.
      this.heartbeatTimeout = setTimeout(() => {
        this.logger.log("Connection to server timed out.");
        this.ws.close();
      }, 60000);
    };
  }
}

export const LC_EVENTS = {
  LATENCY_UPDATED: "lc.latency_updated",
  MEET_UPDATED: "lc.meet_updated",
  ERROR: "lc.error"
} as const

export type LCMeetUpdatedEvent = {
  meetDoc: MeetApiResponse
}

export type LCLatencyUpdatedEvent = {
  latency: number
}

export type LCErrorEvent = {
  error: unknown
}
