import { Publisher, Subjects, PaymentCreatedEvent } from '@closetsweep/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated   
}