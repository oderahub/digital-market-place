import { appRouter } from '@/trpc'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

const handler = async (req: Request) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    //@ts-expect-error context already passed from express middleware
    createContext: () => ({})
  })
}

export { handler as GET, handler as POST }
