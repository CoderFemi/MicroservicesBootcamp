import { Publisher, Subjects, DealCreatedEvent } from '@closetsweep/common'

export class DealCreatedPublisher extends Publisher<DealCreatedEvent> {
    readonly subject = Subjects.DealCreated   
}