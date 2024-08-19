import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WebSocket } from "ws";
import { MeetApiResponse } from "./liftingcast.types";

@Injectable()
export class LiftingcastWebsocketService {
  private readonly logger = new Logger(LiftingcastWebsocketService.name)
  private readonly ws: WebSocket
  private meetState: MeetApiResponse
  private lastPing: number
  private lastPong: number
  private latencyList: number[] = []
  private latency: number
  private heartbeatTimeout: NodeJS.Timeout
  private pingInterval: NodeJS.Timeout

  constructor(private readonly configService: ConfigService) {
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
      // TODO: implement onOpen
    })

    this.ws.on("message", (data) => {
      heartbeat();
      const dataString = data.toString()


      if (dataString === "ping") {
        // TODO: implement onPing
        this.ws.send("pong")
        return
      }
      if (dataString === "pong") {
        // TODO: implement onPong
        this.lastPong = Date.now()
        calculateLatency()
        return
      }

      if (dataString !== "ping" && dataString !== "pong")
        try {
          const parsedData = JSON.parse(dataString);
          this.meetState = { ...this.meetState, ...parsedData };
          // TODO: implement onUpdate
          this.logger.log("Meet state updated")

        } catch (e) {
          console.log("Error saving message: ", e);
        }
    })

    this.ws.on("error", (data) => {
      this.logger.error("Error from websocket", data)
      // TODO: implement onEroor

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
        this.logger.log("latency", latency)
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
