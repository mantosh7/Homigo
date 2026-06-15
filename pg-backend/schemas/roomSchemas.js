const { z } = require('zod')

// Add / Update Room Schema 
const roomSchema = z.object({
  room_number: z.string().min(1, 'Room number is required'),
  room_type: z.string().min(1, 'Room type is required'),

  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
  floor: z.coerce.number().int().min(0, 'Floor must be 0 or above').optional(),
  monthly_rent: z.coerce.number().min(0, 'Rent cannot be negative')
})

module.exports = { roomSchema }