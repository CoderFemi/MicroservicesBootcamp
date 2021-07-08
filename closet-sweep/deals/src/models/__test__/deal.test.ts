import { Deal } from '../deal'

it('implements optimistic concurrency control', async () => {
    const deal = await Deal.build({
        title: 'Rocking chair',
        price: 5,
        userId: '1234'
    })
    await deal.save()
    const firstInstance = await Deal.findById(deal.id)
    const secondInstance = await Deal.findById(deal.id)

    firstInstance!.set({price: 10})
    secondInstance!.set({ price: 15 })
    
    await firstInstance!.save()

    try {
        await secondInstance!.save()
    } catch (error) {
        expect(error).not.toBe(null)
    }
})

it('increments the version number on multiple saves', async () => {
    const deal = await Deal.build({
        title: 'Rocking chair',
        price: 5,
        userId: '1234'
    })

    await deal.save()
    expect(deal.version).toEqual(0)
    await deal.save()
    expect(deal.version).toEqual(1)
    await deal.save()
    expect(deal.version).toEqual(2)
})