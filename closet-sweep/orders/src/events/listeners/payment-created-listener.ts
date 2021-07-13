import { Message } from "node-nats-streaming"
import { Subjects, Listener, PaymentCreatedEvent, OrderStatus } from "@closetsweep/common"
import { Order } from "../../models/order"
import { queueGroupName } from "./queue-group-name"

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated
    queueGroupName = queueGroupName

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        
        const order = await Order.findById(data.orderId)
        if (!order) {
            throw new Error('Order not found')
        }
        order.set({ status: OrderStatus.Complete })
        await order.save() // If this is not the last stage of the order process, publish an event to ensure the new version of this updated order is communicated to other services.
        msg.ack()
    }
}