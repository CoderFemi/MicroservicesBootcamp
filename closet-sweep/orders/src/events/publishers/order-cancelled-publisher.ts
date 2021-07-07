import { Publisher, Subjects, OrderCancelledEvent } from '@closetsweep/common'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled   
}