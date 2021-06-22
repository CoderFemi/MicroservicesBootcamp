import faker from 'faker'
import { Mappable } from './CustomMap'

export class Company implements Mappable {
  companyName: string
  catchPhrase: string
  location: {
    lat: number
    lng: number
  }
  constructor() {
    this.companyName = faker.company.companyName()
    this.catchPhrase = faker.company.catchPhrase()
    this.location = {
      lat: Number(faker.address.latitude()),
      lng: Number(faker.address.longitude())
    }
  }
  markerContent(): string {
    return `
    <div>
      <h3>Company Name: ${this.companyName}</h3>
      <h5>Catch Phrase: ${this.catchPhrase}</h5>
    </div>
    `
  }
}