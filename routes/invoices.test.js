process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let testInvoices;

beforeEach(async function() {
    let companiesSample = await db.query(
        `INSERT INTO companies
        (code, name, description)
        VALUES ('walgreens', 'Walgreens', 'pharmacy')
        RETURNING code, name, description`
    );

    let result = await db.query(
        `INSERT INTO invoices 
        (comp_code, amt, paid, paid_date)
        VALUES ('walgreens', 100, false, null),
        ('walgreens', 300, true, '2018-01-01')
        RETURNING id, comp_code, amt, paid, paid_date`
    );
    testInvoices = result.rows[0];
});

afterEach(async function() {
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM invoices`);
});

describe("get functions", function() {
    test("get /invoices", async function() {
        let response = await request(app).get("/invoices");
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            "invoices": [
                {
                    "comp_code": "walgreens",
                    "id": expect.any(Number),
                },
                {
                    "comp_code": "walgreens",
                    "id": expect.any(Number),
                }
            ]
        })
    });

    test("get /:id", async function() {
        let response = await request(app)
        .get(`/invoices/${testInvoices.id}`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            "invoice": {
                "id": expect.any(Number),
                "amt": 100,
                "paid": false,
                "add_date": expect.any(String),
                "paid_date": null,
                "company": {
                    "name": "Walgreens",
                    "description": "pharmacy"
                }
            }
        })
    });
});

describe("post functions", function() {
    test("post to /invoices", async function() {
        let response = await request(app).post("/invoices")
        .send({
            "comp_code": "walgreens",
            "amt": 555
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            invoice: {
              id: expect.any(Number),
              comp_code: 'walgreens',
              amt: 555,
              paid: false,
              add_date: expect.any(String),
              paid_date: null
            }
          });
    });
});

describe("Put functions", function() {
    test("put to /invoice/:id", async function() {
        let response = await request(app)
        .put(`/invoices/${testInvoices.id}`).send({
            "amt": 770,
            "paid": false
        });
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            invoice: {
              id: expect.any(Number),
              comp_code: 'walgreens',
              amt: 770,
              paid: false,
              add_date: expect.any(String),
              paid_date: null
            }
        });
    });
});

describe("delete functions", function() {
    test("delete to /invoices/:id", async function() {
        let response = await request(app)
        .delete(`/invoices/${testInvoices.id}`);
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({"status": "deleted"});
    });
});

afterAll(async function() {
    await db.end();
});