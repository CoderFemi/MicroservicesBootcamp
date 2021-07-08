import { Message } from "node-nats-streaming"
import { Subjects, Listener, DealCreatedEvent } from "@closetsweep/common"
import { Deal } from "../../models/deal"
import { queueGroupName } from "./queue-group-name"

export class DealCreatedListener extends Listener<DealCreatedEvent> {
    readonly subject = Subjects.DealCreated
    queueGroupName = queueGroupName

    async onMessage(data: DealCreatedEvent['data'], msg: Message) {
        const { id, title, price } = data
        const deal = Deal.build({
            id,
            title,
            price
        })
        await deal.save()
        msg.ack()
    }
}