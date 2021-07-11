import { Publisher, Subjects, ExpirationCompleteEvent } from '@closetsweep/common'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete
}