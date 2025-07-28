import { Prisma, PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import express from 'express'
import userRoutes from './routes/user.route.js'

const prisma = new PrismaClient().$extends(withAccelerate())

const app = express()

app.use(express.json())
app.use('/api/users', userRoutes)



app.listen(3000, () => {
  console.log('Server is running on port 3000')
})