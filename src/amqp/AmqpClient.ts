import { Channel } from "amqplib/callback_api";
import { AmqpOperationHandler } from "./AmqpOperationHandler";

export class AmqpClient {

  constructor(protected amqpOpHandler: AmqpOperationHandler) { }

  public setClosedState() {
    this.amqpOpHandler.setClosedState();
  }

  public setOpenedChannel(channel: Channel) {
    this.amqpOpHandler.setOpenedChannel(channel);
  }

  public closeChannel() {
    this.amqpOpHandler.closeChannel();
  }
}