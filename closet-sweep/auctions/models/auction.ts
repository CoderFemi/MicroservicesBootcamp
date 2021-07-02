import mongoose from 'mongoose'

// Describes the properties required to create a new Auction
interface AuctionAttrs {
  title: string
  price: number
  userId: string
}

// Describes the properties/methods that the Auction model has.
interface AuctionModel extends mongoose.Model<AuctionDoc> {
  build(attrs: AuctionAttrs): AuctionDoc
}

// Describes the properties that an Auction document has (single auction) created within the schema.
interface AuctionDoc extends mongoose.Document {
  title: string
  price: number
  userId: string

}

const auctionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  userId: {
    type: String,
    required: true
  }
},
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
      }
    }
  }
)

auctionSchema.statics.build = (attrs: AuctionAttrs) => {
  return new Auction(attrs)
}

const Auction = mongoose.model<AuctionDoc, AuctionModel>('Auction', auctionSchema)

export { Auction }