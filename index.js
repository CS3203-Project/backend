import { Prisma, PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import express from 'express'

const prisma = new PrismaClient().$extends(withAccelerate())

const app = express()

app.use(express.json())

app.get('/users', async(req, res) => {
  try {
    const users = await prisma.user.findMany()
    res.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
})

app.listen(3000, () => {
  console.log('Server is running on port 3000')
})