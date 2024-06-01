const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async function(req, res, next) {
    try {
        const results = await db.query(`
            SELECT code, industry
            FROM industries
        `);

        return res.json({"industries" : results.rows})
    }
    catch(err) {
        return next(err);
    }
});

router.post("/", async function(req, res, next) {
    let { code, industry } = req.body;
    try {
        const results = await db.query(`
            INSERT INTO industries
            (code, industry)
            VALUES ($1, $2)
            RETURNING code, industry
        `, [code, industry]);
        return res.json({"industry": results.rows});
    }
    catch(err) {
        return next(err);
    }
});

router.post("/associate", async function(req, res, next) {
    let { company_code, industry_code } = req.body;
    try {
        const results = await db.query(`
            INSERT INTO companies_industries
            (company_code, industry_code)
            VALUES ($1, $2)
            RETURNING company_code, industry_code
        `, [company_code, industry_code]);
        return res.json({"industry": results.rows});
    }
    catch(err) {
        return next(err);
    }
});

module.exports = router;