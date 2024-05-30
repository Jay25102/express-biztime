const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async function(req, res, next) {
    try {
        const results = await db.query(
            `SELECT code, name FROM COMPANIES
            ORDER BY name`
        );

        return res.json({"companies" : results.rows})
    }
    catch(err) {
        return next(err);
    }
});

router.get("/:code", async function(req, res, next) {
    let code = req.params.code;
    try {
        const compResults = await db.query(
            `SELECT code, name, description
            FROM companies
            WHERE code=$1`, [code]
        );

        const invResult = await db.query(
            `SELECT id
            FROM invoices
            WHERE comp_code=$1`, [code]
        );

        if (compResults.rows.length === 0) {
            throw new ExpressError("Company does not exist", 404);
        }
        else {
            const company = compResults.rows[0];
            const invoices = invResult.rows;

            company.invoices = invoices.map(inv => inv.id);

            return res.json({"company": company});
        }
    }
    catch(err) {
        return next(err);
    }
});

router.post("/", async function(req, res, next) {
    let {code, name, description } = req.body;

    try {
        const result = await db.query(
            `INSERT INTO companies
            (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`, 
            [code, name, description]
        );

        return res.status(201).json({"company": result.rows[0]});
    }
    catch(err) {
        next(err);
    }
});

router.put("/:code", async function(req, res, next) {
    let code = req.params.code;
    let { name, description } = req.body;

    try {
        const result = await db.query(
            `UPDATE companies
            SET name=$1, description=$2
            WHERE code=$3
            RETURNING code, name, description`,
            [name, description, code]
        );
        if (result.rows.length === 0) {
            throw new ExpressError("Company does not exist", 404);
        }
        else {
            return res.json({"company": result.rows[0]});
        }
    }
    catch(err) {
        next(err);
    }
});

router.delete("/:code", async function(req, res, params) {
    let code = req.params.code;

    try {
        let result = await db.query(
            `DELETE from companies
            WHERE code=$1
            RETURNING code`, [code]
        );

        if (result.rows.length === 0) {
            throw new ExpressError("Company does not exist", 404);
        }
        else {
            return res.json({status: "deleted"})
        }
    }
    catch(err) {
        next(err);
    }
});

module.exports = router;