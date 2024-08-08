import { prismaClient } from "../application/database.js";
import { ResponseError } from "../error/response-error.js";
import {
    getUserValidation,
    loginUserValidation,
    registerUserValidation,
    updateUserValidation
} from "../validation/user-validation.js";
import { validate } from "../validation/validation.js"
import bcrypt from "bcrypt";
import {v4 as uuid} from "uuid";


const register = async (request) => {

    const user = validate(registerUserValidation, request);

    const countUser = await prismaClient.user.count({
        where: {
            memberUsername: user.memberUsername
        }
    });

    if (countUser === 1) {
        throw new ResponseError(400, "Username already exists");
    }

    user.memberPassword = await bcrypt.hash(user.memberPassword, 10);

    return prismaClient.user.create({
        data: user,
        select: {
            memberId: true,
            memberUsername: true,
            memberFullname: true,
            memberLevel: true,
            memberPassword: true,
            memberActiveStatus: true,
            memberEmail: true,
            token: true,
        }
    })

}

const login = async (request) => {
    const loginRequest = validate(loginUserValidation, request);

    const user = await prismaClient.user.findUnique({
        where: {
            memberUsername: loginRequest.memberUsername
        },
        select: {
            memberUsername: true,
            memberPassword: true
        }
    });

    if (!user) {
        throw new ResponseError(401, "Username or password wrong");
    }

    const isPasswordValid = await bcrypt.compare(loginRequest.memberPassword, user.memberPassword);
    if (!isPasswordValid) {
        throw new ResponseError(401, "Username or password wrong");
    }

    const token = uuid().toString()
    return prismaClient.user.update({
        data: {
            token: token
        },
        where: {
            memberUsername: user.memberUsername
        },
        select: {
            token: true
        }
    });
}

const get = async (username) => {
    username = validate(getUserValidation, username);

    const user = await prismaClient.user.findUnique({
        where: {
            memberUsername: username
        },
        select: {
            memberUsername: true,
            memberFullname: true,
            memberLevel: true,
            memberPassword: true,
            memberEmail: true,
        }
    });

    if (!user) {
        throw new ResponseError(404, "user is not found");
    }

    return user;
}

const update = async (request) => {
    const user = validate(updateUserValidation, request);

    const totalUserInDatabase = await prismaClient.user.count({
        where: {
            memberUsername: user.memberUsername
        }
    });

    if (totalUserInDatabase !== 1) {
        throw new ResponseError(404, "user is not found");
    }

    const data = {};
    if (user.memberUsername) {
        data.memberUsername = user.memberUsername;
    }
    if (user.memberPassword) {
        data.memberPassword = await bcrypt.hash(user.memberPassword, 10);
    }
    if (user.memberFullname) {
        data.memberFullname = user.memberFullname
    }
    if (user.memberLevel) {
        data.memberLevel = user.memberLevel
    }
    if (user.memberEmail) {
        data.memberEmail = user.memberEmail
    }

    return prismaClient.user.update({
        where: {
            memberUsername: user.memberUsername
        },
        data: data,
        select: {
            memberUsername: true,
            memberFullname: true,
            memberLevel: true,
            memberPassword: true,
            memberEmail: true,
        }
    })
}

const logout = async (username) => {
    username = validate(getUserValidation, username);

    const user = await prismaClient.user.findUnique({
        where: {
            memberUsername: username
        }
    });

    if (!user) {
        throw new ResponseError(404, "user is not found");
    }

    return prismaClient.user.update({
        where: {
            memberUsername: username
        },
        data: {
            token: null
        },
        select: {
            memberUsername: true,
            memberFullname: true,
            memberLevel: true,
            memberPassword: true,
            memberEmail: true,
        }
    })
}

export default {
    register,
    login,
    get,
    update,
    logout
}