import { Message } from 'node-nats-streaming'
import { Listener, OrderCreatedEvent, Subjects } from '@closetsweep/common'
import { queueGroupName } from './queue-group-name'
import { Deal } from '../../models/deal'
import { DealUpdatedPublisher } from '../publishers/deal-updated-publisher'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated
    queueGroupName = queueGroupName
    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const deal = await Deal.findById(data.deal.id)
        if (!deal) {
            throw new Error('Ticket not found')
        }
        deal.set({ orderId: data.id })
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