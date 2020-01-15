import logger from 'morgan'
import restify from 'restify'
import { Router } from 'restify-router'
import { connect } from '@/services/mongoose'
import { serverConfig, dbConfig } from '@/config' 
import routes from '@/api'

const router = new Router()
const server = restify.createServer(serverConfig.server)
const processMode =  process.env.NODE_ENV
/*
 * Server dependencies
 * */

server.use(restify.plugins.throttle(serverConfig.throttle))
server.use(logger('dev'))
server.use(restify.plugins.acceptParser(server.acceptable))
server.use(restify.plugins.bodyParser({mapParams: true, mapFiles: true, requestBodyOnGet: false}))
server.use(restify.plugins.queryParser())
server.use(restify.plugins.gzipResponse())

/*
 * Import all routes
 * */

router.add(serverConfig?.endpoint, routes)
router.applyRoutes(server)

/*
 * Connect to database
 * */
 
/* istanbul ignore next */ 
if(processMode !== 'test') {
    (async () => {
        try {
            await connect(dbConfig)
            await server.listen((serverConfig.port || 3000), () => 
                console.log('\x1b[36m',`Server ${server.name} listen in ${processMode} mode`,'\x1b[0m'))
        } catch {
            throw new Error('mongodb connection failed!')
        }
    })()
} 

/* istanbul ignore next */ 
server.on('uncaughtException', (req, res, route, err) => 
    console.error(err))

/*
 * Export for testing
 * */

export default server