export const stripe = {
    charges: {
        create: jest.fn().mockResolvedValue({}) // returns a promise that automatically resolves itself.
    }
}