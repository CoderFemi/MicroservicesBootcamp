import mongoose from 'mongoose'
import { PasswordManager } from '../utils/password-manager'

// Describes the properties required to create a new User
interface UserAttrs {
  email: string
  password: string
}

// Describes the properties/methods that the User model has.
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc
}

// Describes the properties that a User document has (single user) created within the schema.
interface UserDoc extends mongoose.Document {
  email: string
  password: string
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
},
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id
        delete ret._id
        delete ret.password
        delete ret.__v
      }
    }
  }
)

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs)
}

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await PasswordManager.toHash(this.get('password'))
    this.set('password', hashed)
  }
  done()
})

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

export { User }