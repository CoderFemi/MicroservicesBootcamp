import mongoose from 'mongoose'
import { OrderStatus } from '@closetsweep/common'
import { Order } from './order'

// Describes the properties required to create a new Deal
interface DealAttrs {
  title: string
  price: number
}

// Describes the properties/methods that the Deal model has.
interface DealModel extends mongoose.Model<DealDoc> {
  build(attrs: DealAttrs): DealDoc
}

// Describes the properties that an Deal document has (single Deal) created within the schema.
export interface DealDoc extends mongoose.Document {
  title: string
  price: number
  isReserved(): Promise<boolean>
}

const dealSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
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

dealSchema.statics.build = (attrs: DealAttrs) => {
  return new Deal(attrs)
}
dealSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    deal: this as any,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete
      ]
    }
  })
  return !!existingOrder
}

const Deal = mongoose.model<DealDoc, DealModel>('Deal', dealSchema)

export { Deal }