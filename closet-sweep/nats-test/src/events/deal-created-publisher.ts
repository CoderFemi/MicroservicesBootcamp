import { Publisher } from './base-publisher'
import { DealCreatedEvent } from './deal-created-event'
import { Subjects } from './subjects'

export class DealCreatedPublisher extends Publisher<DealCreatedEvent> {
  readonly subject = Subjects.DealCreated
}
