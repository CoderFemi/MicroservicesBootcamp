import faker from 'faker'
import { Mappable } from './CustomMap'

export class User implements Mappable {
  name: string
  location: {
    lat: number
    lng: number
  }
  constructor() {
    this.name = faker.name.firstName()
    this.location = {
      lat: Number(faker.address.latitude()),
      lng: Number(faker.address.longitude())
    }
  }
  markerContent(): string {
    return `<h3>User Name: ${this.name}</h3>`
  }
}