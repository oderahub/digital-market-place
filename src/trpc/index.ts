import { publicProcedure, router  } from "./trpc"

// Remeber this is just an example of our backend || router
export const appRouter = router({
    anyApiRoute : publicProcedure.query(() =>{
        return 'Hello'
    })
})

export type AppRouter = typeof appRouter