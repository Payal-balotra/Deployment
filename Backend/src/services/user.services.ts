import { prisma } from "../lib/prisma";


const createUser = async()=>{
    await prisma.user.create({
  data: {
    name: "Payal",
    email: "payal@gmail.com",
  },
})}