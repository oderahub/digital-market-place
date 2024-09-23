//make sure the user can on filter by feilds we allow to guild against abuse of our API

import { z } from 'zod'

export const QueryValidator = z.object({
  category: z.string().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  limit: z.number().optional()
})

export type TQueryValidator = z.infer<typeof QueryValidator>
