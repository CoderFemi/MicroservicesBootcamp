import mongoose from 'mongoose'
import { OrderStatus } from '@closetsweep/common'
import { Order } from './order'
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'

// Describes the properties required to create a new Deal
interface DealAttrs {
  id: string
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
  version: number
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

dealSchema.set('versionKey', 'version')
dealSchema.plugin(updateIfCurrentPlugin)

// Alternative versioning solution
// dealSchema.pre('save', function (done) {
//   this.$where = {
//     version: this.get('version') - 1
//   }
//   done()
// })

dealSchema.statics.build = (attrs: DealAttrs) => {
  return new Deal({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price
  })
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