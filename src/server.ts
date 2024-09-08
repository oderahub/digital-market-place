import express from "express"
import { getPayloadClient } from "./get-payload"
import { nextApp, nextHandler } from "./next-utls"
import { appRouter } from "./trpc"
import * as trpcExpress from "@trpc/server/adapters/express"

const app = express()
const PORT = Number(process.env.PORT) || 3000 

const createContext = ({req, res }: trpcExpress.CreateExpressContextOptions) => ({
    req, res,
})

const start = async() => { 
    const payload = await getPayloadClient ({
        initOptions: {
            express: app,
            onInit: async (cms) => {
                cms.logger.info(`Admin URL ${cms.getAdminURL()}` )
            },
        }
    }) 

     // when we get a request we forward it to trpc
     // trpc middleware

    app.use("/api/trpc", trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext 
    }))

    app.use((req, res)=> nextHandler(req, res))

    nextApp.prepare().then(()=> {
        payload.logger.info("Next.js started")

        app.listen(PORT, async () => {
            payload.logger.info(
                `Next.js App URL ${process.env.NEXT_PUBLIC_SERVER_URL}`
            )
        })
    }
    )
}

start ()