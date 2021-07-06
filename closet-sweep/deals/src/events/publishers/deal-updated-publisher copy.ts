import { Publisher, Subjects, DealUpdatedEvent } from '@closetsweep/common'

export class DealUpdatedPublisher extends Publisher<DealUpdatedEvent> {
    readonly subject = Subjects.DealUpdated   
}