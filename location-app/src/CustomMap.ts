// Imports no longer needed when using an interface
// import { User } from "./User"
// import { Company } from "./Company"

export interface Mappable {
  location: {
    lat: number
    lng: number
  }
  markerContent(): string
}

export class CustomMap {
  // Setting this property as private means no instance can access it or call its methods when an instance is created. It can only be accessed within this class.
  private googleMap: google.maps.Map

  constructor(divId: string) {
    this.googleMap = new google.maps.Map(document.getElementById(divId), {
      zoom: 1,
      center: {
        lat: 0,
        lng: 0
      }
    })
  }

  // No interface. There is code duplication in this approach.

  // addUserMarker(user: User): void {
  //   new google.maps.Marker({
  //     map: this.googleMap,
  //     position: {
  //       lat: user.location.lat,
  //       lng: user.location.lng
  //     }
  //   })
  // }
  // addCompanyMarker(company: Company): void {
  //   new google.maps.Marker({
  //     map: this.googleMap,
  //     position: {
  //       lat: company.location.lat,
  //       lng: company.location.lng
  //     }
  //   })
  // }

  // Another approach using one function that annotates two type of users. This reduces code duplication and makes function reusable. Still not the best approach.
  // addMarker(mappable: User | Company): void {
  //   new google.maps.Marker({
  //     map: this.googleMap,
  //     position: {
  //       lat: mappable.location.lat,
  //       lng: mappable.location.lng
  //     }
  //   })
  // }

  // Best approach annotating using the interface created above. The addMarker can take in any argument so far as it satisfies/contains the properties specified in the Mappable interface. TS implicitly checks the class instance being passed in (user or company) to see if it contains the required property.
  addMarker(mappable: Mappable): void {
    const marker = new google.maps.Marker({
      map: this.googleMap,
      position: {
        lat: mappable.location.lat,
        lng: mappable.location.lng
      }
    })
    marker.addListener('click', () => {
      const infoWindow = new google.maps.InfoWindow({
        content: mappable.markerContent()
      })
      infoWindow.open(this.googleMap, marker)
    })
  }
}