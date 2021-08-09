import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import cors from 'cors'
import {
    graphqlHTTP
} from 'express-graphql'

import sequelize from './config/database.js'
import User from './models/user.js'
import Post from './models/post.js'
import graphQLSchema from './graphql/schema.js'
import graphQLResolvers from './graphql/resolver.js'
import auth from './middleware/auth.js'

import expressPlayground from 'graphql-playground-middleware-express'
const graphQLPlayground = expressPlayground.default

dotenv.config()

const app = express()

const PORT = process.env.PORT
const ENV = process.env.APP_ENV

if (ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(cors())
app.use(auth);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

Post.belongsTo(User, {
    constraints: true,
    onDelete: 'CASCADE'
});
User.hasMany(Post);

sequelize
    .sync()
    .then(result => {
        app.use(
            '/graphql',
            graphqlHTTP({
                schema: graphQLSchema,
                rootValue: graphQLResolvers,
                graphiql: false,
                customFormatErrorFn(err) {
                    if (!err.originalError) {
                        return error
                    }
        
                    const data = err.originalError.data
                    const message = err.message || 'An error occurred.'
                    const code = err.originalError.code || 500
                    return {
                        message,
                        status: code,
                        data
                    }
                }
            }),
        )
        app.get('/playground', graphQLPlayground({
            endpoint: '/graphql'
        }))
        
        app.listen(PORT, console.log(`Server running in ${ENV} mode on port ${PORT}`))
    })
    .catch(err => {
        console.log(err);
    });