import supertest from "supertest";
import {web} from "../src/application/web.js"
import {logger} from "../src/application/logging.js";
import { prismaClient } from "../src/application/database.js";
import {createTestUser, getTestUser, removeTestUser} from "./test-util.js";
import bcrypt from "bcrypt";

describe('POST /api/users', function () {

    afterEach(async () => {
        await removeTestUser();
    })

    it('should can register new user', async () => {
        const result = await supertest(web)
            .post('/api/users')
            .send({
                memberUsername : "Test",
                memberFullname : "Test",
                memberLevel : 1,
                memberPassword : "Test",
                memberEmail : "Test@email.com"
            });
        
        expect(result.status).toBe(200);
    })
})

describe('POST /api/users/login', function () {
    beforeEach(async () => {
        await createTestUser();
    });

    afterEach(async () => {
        await removeTestUser();
    });

    it('should can login', async () => {
        const result = await supertest(web)
            .post('/api/users/login')
            .send({
                memberUsername: "Test",
                memberPassword: "Test"
            });

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.token).toBeDefined();
        expect(result.body.data.token).not.toBe("Test");
    });

    it('should reject login if request is invalid', async () => {
        const result = await supertest(web)
            .post('/api/users/login')
            .send({
                memberUsername: "",
                memberPassword: ""
            });

        logger.info(result.body);

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject login if password is wrong', async () => {
        const result = await supertest(web)
            .post('/api/users/login')
            .send({
                memberUsername: "Test",
                memberPassword: "salah"
            });

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject login if username is wrong', async () => {
        const result = await supertest(web)
            .post('/api/users/login')
            .send({
                memberUsername: "salah",
                memberPassword: "salah"
            });

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });
});

describe('GET /api/users/current', function () {
    beforeEach(async () => {
        await createTestUser();
    });

    afterEach(async () => {
        await removeTestUser();
    });

    it('should can get current user', async () => {
        const result = await supertest(web)
            .get('/api/users/current')
            .set('Authorization', 'test');

        expect(result.status).toBe(200);
        expect(result.body.data.memberUsername).toBe('Test');
    });

    it('should reject if token is invalid', async () => {
        const result = await supertest(web)
            .get('/api/users/current')
            .set('Authorization', 'salah');

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });
});

describe('PATCH /api/users/current', function () {
    beforeEach(async () => {
        await createTestUser();
    });

    afterEach(async () => {
        await removeTestUser();
    });

    it('should can update user', async () => {
        const result = await supertest(web)
            .patch("/api/users/current")
            .set("Authorization", "test")
            .send({
                memberUsername: "Test",
                memberPassword: "rahasialagi"
            });

        expect(result.status).toBe(200);
        // expect(result.body.data.memberUsername).toBe("test");
        // expect(result.body.data.name).toBe("Eko");

        const user = await getTestUser();
        expect(await bcrypt.compare("rahasialagi", user.memberPassword)).toBe(true);
    });

    it('should can update user name', async () => {
        const result = await supertest(web)
            .patch("/api/users/current")
            .set("Authorization", "test")
            .send({
                memberUsername : "Test",
                memberFullname : "Test",
                memberLevel : 0,
                memberPassword : "Test",
                memberEmail : "Test@email.com"
            });

        expect(result.status).toBe(200);
        expect(result.body.data.memberUsername).toBe("Test");
    });

    it('should can update user password', async () => {
        const result = await supertest(web)
            .patch("/api/users/current")
            .set("Authorization", "test")
            .send({
                memberUsername : "Test",
                memberFullname : "Test",
                memberLevel : 0,
                memberPassword : "Testlagi",
                memberEmail : "Test@email.com"
            });

        expect(result.status).toBe(200);
        expect(result.body.data.memberUsername).toBe("Test");

        const user = await getTestUser();
        expect(await bcrypt.compare("Testlagi", user.memberPassword)).toBe(true);
    });

    it('should reject if request is not valid', async () => {
        const result = await supertest(web)
            .patch("/api/users/current")
            .set("Authorization", "salah")
            .send({});

        expect(result.status).toBe(401);
    });
});