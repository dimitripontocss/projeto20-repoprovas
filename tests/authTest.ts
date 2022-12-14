import supertest from "supertest";

import app from "../src/index";
import { prisma } from "../src/databaseStrategy/database"
import { createSignUpUser, createSignInUser } from "./factories/authFactory";

export async function authTest() {
    beforeEach(async () => {
        await prisma.$executeRaw`TRUNCATE TABLE users;`;
    });

    describe("POST /signup", () => {
        it("returns 201 for valid new user", async () => {
            const body = await createSignUpUser();
    
            const result = await supertest(app).post("/signup").send(body);
            const status = result.status;
            
            expect(status).toEqual(201);
        });
    
        it("returns 422 for wrong info", async () => {
            const body = await createSignUpUser();
            body.password = "";
    
            const result = await supertest(app).post("/signup").send(body);
            const status = result.status;
            
            expect(status).toEqual(422);
        });
    
        it("returns 409 for duplicated email", async () => {
            const body = await createSignUpUser();
    
            await supertest(app).post("/signup").send(body);
            const result = await supertest(app).post("/signup").send(body);
            const status = result.status;
            
            expect(status).toEqual(409);
        });
    });
    
    describe("POST /signin", () => {
        it("returns 200 and token for valid user", async () => {
            const signUpBody = await createSignUpUser();
            
            const signInBody = {
                email: signUpBody.email,
                password: signUpBody.password
            }
    
            await supertest(app).post("/signup").send(signUpBody);
            const result = await supertest(app).post("/signin").send(signInBody);
            const status = result.status;
            const body = result.body;
    
            expect(status).toEqual(200);
            expect(body).toHaveProperty('token');        
        });
    
        it("returns 401 for invalid user", async () => {
            const body = await createSignInUser();
    
            const result = await supertest(app).post("/signin").send(body);
            const status = result.status;
    
            expect(status).toEqual(401);        
        });
    
        it("returns 422 for invalid user format", async () => {
            const body = await createSignInUser();
            body.password = "";
    
            const result = await supertest(app).post("/signin").send(body);
            const status = result.status;
    
            expect(status).toEqual(422);        
        });

        it("returns 401 for user with wrong data", async () => {
            const signUpBody = await createSignUpUser();
            
            const signInBody = {
                email: signUpBody.email,
                password: signUpBody.password+"a"
            }
    
            await supertest(app).post("/signup").send(signUpBody);
            const result = await supertest(app).post("/signin").send(signInBody);
            const status = result.status;
    
            expect(status).toEqual(401);       
        });
    });

    afterAll(async () => {
        await prisma.$executeRaw`TRUNCATE TABLE users`
        await prisma.$disconnect();
    });
}

