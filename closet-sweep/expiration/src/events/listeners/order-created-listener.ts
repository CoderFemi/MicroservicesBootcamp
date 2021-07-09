import { Message } from 'node-nats-streaming'
import { Listener, OrderCreatedEvent, Subjects } from '@closetsweep/common'
import { queueGroupName } from './queue-group-name'
// import { Deal } from '../../models/deal'
// import { DealUpdatedPublisher } from '../publishers/deal-updated-publisher'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated
    queueGroupName = queueGroupName
    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
     

        msg.ack()
    }
}