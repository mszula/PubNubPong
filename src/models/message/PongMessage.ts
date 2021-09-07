import { PongEventsEnum } from "../../enum/PongEventsEnum"

export default interface PongMessage {
    type: PongEventsEnum
    uuid: string
}
