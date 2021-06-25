import { CustomError } from "./custom-error"

export class DatabaseError extends CustomError {
  statusCode = 500
  reason = 'Error from database'
  constructor() {
    super('Database Error')

    // This is necessary when extending a built-in class - Error
    Object.setPrototypeOf(this, DatabaseError.prototype)
  }
  serializeErrors() {
    return [{message: this.reason}]
  }
}