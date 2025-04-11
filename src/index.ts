import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { PrismaClient } from "@prisma/client"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// Initialize Prisma client
const prisma = new PrismaClient()

// Initialize Express app
const app = express()
const httpServer = createServer(app)

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],

\
