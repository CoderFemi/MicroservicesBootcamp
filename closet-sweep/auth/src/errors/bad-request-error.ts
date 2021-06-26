import { CustomError } from "./custom-error"

export class BadRequestError extends CustomError {
  statusCode = 400
  constructor(public message: string) {
    super(message)

    // This is necessary when extending a built-in class - Error
    Object.setPrototypeOf(this, BadRequestError.prototype)
  }
  serializeErrors() {
    return [{ message: this.message }]
  }
}