import type { RequestHandler } from "express";
import type { BaseEntity } from "typeorm";
import type { CrudModel } from "./genCrud";
import { getFields } from "./getFields";

export const createEntity =
  (model: typeof CrudModel): RequestHandler =>
  async (req, res) => {
    const fields = getFields(model, "editables");
    const entity = model.create();
    for (const field of fields) {
      const value = req.body[field.name];
      if (typeof value !== field.type) {
        res.status(400).send(`invalid field ${field.name}`);
        return;
      }
      entity[field.name as keyof BaseEntity] = value;
    }

    await entity.beforeCreate?.();
    await entity.save();
    await entity.afterCreate?.();
    entity.hideHiddens();

    return res.json(entity);
  };
