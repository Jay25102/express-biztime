const express = require("express");
const router = new express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get("/", async function(req, res, next) {
    try {
        results = await db.query(
            `SELECT id, comp_code
            FROM invoices
            ORDER BY id`
        );

        return res.json({"invoices": results.rows});
    }
    catch(err) {
        next(err);
    }
});

router.get("/:id", async function(req, res, next) {
    let id = req.params.id;

    try {
        let result = await db.query(
            `SELECT i.id, i.amt, i.paid, i.add_date, i.paid_date, c.name, c.description
            FROM invoices AS i
            INNER JOIN companies AS c 
            ON i.comp_code=c.code
            WHERE id=$1`, [id]
        )

        if (result.rows.length === 0) {
            throw new ExpressError("Invoice not found", 404);
        }
        else{
            let data = result.rows[0];
            let invoice = {
                id: data.id,
                amt: data.amt,
                paid: data.paid,
                add_date: data.add_date,
                paid_date: data.paid_date,
                company: {
                    code: data.comp_code,
                    name: data.name,
                    description: data.description
                }
            };

            return res.json({"invoice": invoice});
        }
    }
    catch(err) {
        next(err);
    }
});

router.post("/", async function(req, res, next) {
    let { comp_code, amt } = req.body;

    try {
        let result = db.query(
            `INSERT INTO invoices
            (comp_code, amt)
            VALUES ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [comp_code, amt]
        );

        return res.json({"invoice": result.rows[0]});
    }
    catch(err) {
        next(err);
    }
});

router.put("/:id", async function(req, res, next) {
    let id = req.params.id;
    let {amt, paid} = req.body;
    let paidDate = null;

    try {
        let result = await db.query(
            `SELECT paid
            FROM invoices
            WHERE id=$1`, [id]
        )

        if (result.rows.length === 0) {
            throw new ExpressError("Invoice does not exist", 404);
        }

        let currentPaidDate = result.rows[0].paid_date;

        if (!currentPaidDate && paid) {
            paidDate = new Date();
        }
        else if (!paid) {
            paidDate = null;
        }
        else {
            paidDate = currentPaidDate;
        }

        let newResult = await db.query(
            `UPDATE invoices
            SET amt=$1, paid=$2, paid_date=$3
            WHERE id=$4
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [amt, paid, paidDate, id]
        );

        return res.json({"invoice": newResult.rows[0]});
    }
    catch(err) {
        next(err);
    }
});

router.delete("/:id", async function(req, res, next) {
    let id = req.params.id;

    try {
        let result = await db.query(
            `DELETE from invoices
            WHERE id=$1
            RETURNING id`, [id]
        )

        if (result.rows.length === 0) {
            throw new ExpressError("Invoice does not exist", 404);
        }
        else {
            return res.json({"status": "deleted"});
        }
    }
    catch(err) {
        next(err);
    }
})

module.exports = router;