import { Message } from "node-nats-streaming"
import { Subjects, Listener, DealUpdatedEvent } from "@closetsweep/common"
import { Deal } from "../../models/deal"
import { queueGroupName } from "./queue-group-name"

export class DealUpdatedListener extends Listener<DealUpdatedEvent> {
    readonly subject = Subjects.DealUpdated
    queueGroupName = queueGroupName

    // async onMessage(data: DealUpdatedEvent['data'], msg: Message) {
    //     const { id, title, price, version } = data
    //     const deal = await Deal.findOneAndUpdate(
    //         {_id: id, version: version - 1},
    //         { title, price },
    //         { new: true, useFindAndModify: false })
    //     if (!deal) {
    //         throw new Error('Deal not found')
    //     }
    //     msg.ack()
    // }
    
    async onMessage(data: DealUpdatedEvent['data'], msg: Message) {
        const { id, title, price, version } = data
        const deal = await Deal.findOne({ _id: id, version: version - 1})
        if (!deal) {
            throw new Error('Deal not found')
        }
        // deal.title = title
        // deal.price = price
        deal.set({ title, price })
        await deal.save()
        msg.ack()
    }
}