import { Message } from "node-nats-streaming"
import { Subjects, Listener, OrderCancelledEvent } from "@closetsweep/common"
import { Deal } from "../../models/deal"
import { queueGroupName } from "./queue-group-name"
import { DealUpdatedPublisher } from "../publishers/deal-updated-publisher"

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled
    queueGroupName = queueGroupName

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const deal = await Deal.findById(data.deal.id)
        if (!deal) {
            throw new Error('Deal not found')
        }
        deal.set({ orderId: undefined })
        await deal.save()

        await new DealUpdatedPublisher(this.client).publish({
            id: deal.id,
            title: deal.title,
            price: deal.price,
            userId: deal.userId,
            orderId: deal.orderId,
            version: deal.version
        })

        msg.ack()
    }
}