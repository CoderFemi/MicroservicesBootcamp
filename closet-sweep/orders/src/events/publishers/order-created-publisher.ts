import { Publisher, Subjects, OrderCreatedEvent } from '@closetsweep/common'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated   
}