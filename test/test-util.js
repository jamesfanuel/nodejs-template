import {prismaClient} from "../src/application/database.js";
import bcrypt from "bcrypt";

export const removeTestUser = async () => {
    await prismaClient.user.deleteMany({
        where: {
            memberUsername: "Test"
        }
    })
}

export const createTestUser = async () => {
    await prismaClient.user.create({
        data: {
            memberUsername: "Test",
            memberPassword: await bcrypt.hash("Test", 10),
            memberFullname: "Test",
            memberEmail: "Test@email.com",
            token: "test"
        }
    })
}

export const getTestUser = async () => {
    return prismaClient.user.findUnique({
        where: {
            memberUsername: "Test"
        }
    });
}