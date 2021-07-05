import { Message } from 'node-nats-streaming'
import { Listener } from './base-listener'
import { DealCreatedEvent } from './deal-created-event'
import { Subjects } from './subjects'

export class DealCreatedListener extends Listener<DealCreatedEvent> {
  readonly subject = Subjects.DealCreated
  queueGroupName = 'deals-service'

  onMessage(data: DealCreatedEvent['data'], msg: Message) {
    console.log('Event data!', data)

    console.log(data.id)
    console.log(data.title)
    console.log(data.price)

    msg.ack()
  }
}
