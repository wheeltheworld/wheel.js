import type { RequestHandler } from "express";
import type { CrudModel } from "./genCrud";

export const listEntity =
  (model: typeof CrudModel): RequestHandler =>
  async (req, res) => {
    const limit = Number(req.query.limit) || 25;
    const offset = Number(req.query.page) * limit || 0;
    const [items, count] = await model.findAndCount({
      take: limit,
      skip: offset,
    });
    items.map((item) => item.hideHiddens());
    return res.json({
      items,
      pages: Math.ceil(count / limit),
      amount: limit,
      total: count,
      page: offset / limit,
    });
  };
