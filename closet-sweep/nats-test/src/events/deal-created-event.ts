import { Subjects } from './subjects';

export interface DealCreatedEvent {
  subject: Subjects.DealCreated;
  data: {
    id: string;
    title: string;
    price: number;
  };
}
