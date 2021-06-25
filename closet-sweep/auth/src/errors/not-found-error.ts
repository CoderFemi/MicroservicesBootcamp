import { CustomError } from "./custom-error"

export class NotFoundError extends CustomError {
  statusCode = 404
  reason = 'The requested route was not found'
  constructor() {
    super('Route not found')

    // This is necessary when extending a built-in class - Error
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
  serializeErrors() {
    return [{message: this.reason}]
  }
}