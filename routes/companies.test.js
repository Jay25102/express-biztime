process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testCompanies;

beforeEach(async function() {
    let result = await db.query(
        `INSERT INTO companies
        (code, name, description)
        VALUES ('sony', 'Sony Electronics', 'various electronics')
        RETURNING code, name, description`
    );
    testCompanies = result.rows[0];
});

afterEach(async function() {
    await db.query(
        `DELETE FROM companies`
    );
});

describe("read functions", function() {
    test("Get /companies", async function() {
        const response = await request(app).get("/companies");
        expect(response.statusCode).toEqual(200);
        expect(response.body.companies[0]).toEqual({
                "code": "sony",
                "name": "Sony Electronics"
                
        });
    });

    test("Get /:code for company and invoices", async function() {
        const response = await request(app).get("/companies/sony");
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            "company": {
                "code": "sony",
                "name": "Sony Electronics",
                "description": "various electronics",
                "invoices": []
            }
        });
    });
});

describe("Create functions", function() {
    test("post to /companies", async function() {
        const response = await request(app).post("/companies").send({
            "name": "Somename",
            "description": "something"
        });
        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual({
            "company": {
                "code": "somename",
                "name": "Somename",
                "description": "something"
            }
        });
    });
});

describe("Update functions", function() {
    test("put to /:code", async function() {
        const response = await request(app).put("/companies/sony")
        .send({
            "name": "Sony Music",
            "description": "music distributor"
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            "company": {
                "code": "sony",
                "name": "Sony Music",
                "description": "music distributor"
            }
        });
    });

    test("send wrong info to /:code", async function() {
        const response = await request(app).put("/companies/test")
        .send({
            "name": "Sony Music",
            "description": "music distributor"
        });
        expect(response.statusCode).toEqual(404);
    });
});

describe("Delete functions", function() {
    test("delete company using /:code", async function() {
        const response = await request(app)
        .delete("/companies/sony");
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            "status": "deleted"
        });
    });
});

afterAll(async function() {
    await db.end();
});