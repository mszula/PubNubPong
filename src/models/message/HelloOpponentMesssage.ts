import { PongEventsEnum } from "../../enum/PongEventsEnum"
import PongMessage from "./PongMessage"

export default interface HelloOpponentMesssage extends PongMessage {
    type: PongEventsEnum.HelloOpponent
}
