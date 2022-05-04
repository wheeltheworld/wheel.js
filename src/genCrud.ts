import { RequestHandler, Router } from "express";
import { readdirSync } from "fs";
import type { BaseEntity } from "typeorm";
import { isModelsDirectory } from "./utils/isModelsDirectory";
import callsite from "callsite";
import { dirname, join } from "path";
import { genCrudModule } from "./genCrudModule";

type PromiseOrNot<T> = T | Promise<T>;

export interface GenCrudSettings {
  modules: string[];
  modelsDir: string | RegExp;
}

export interface Wheel {
  isOkay: boolean;
  editables: string[];
  getables: string[];
  sortables: string[];
  hiddens: string[];
}
export declare class CrudModel extends BaseEntity {
  wheel: Wheel;
  hideHiddens(): void;
  beforeCreate?(): PromiseOrNot<void>;
  afterCreate?(): PromiseOrNot<void>;
  beforeUpdate?(): PromiseOrNot<void>;
  afterUpdate?(): PromiseOrNot<void>;
  beforeDelete?(): PromiseOrNot<void>;
  afterDelete?(): PromiseOrNot<void>;
}
export interface Module {
  name: string;
  models: typeof CrudModel[];
}

const defaultSettings: GenCrudSettings = {
  modules: [],
  modelsDir: "models",
};

export const genCrud = (options?: Partial<GenCrudSettings>): RequestHandler => {
  const settings: GenCrudSettings = {
    ...defaultSettings,
    ...options,
  };

  const router = Router();

  // we get where the function is called from
  // so we can build relative paths
  // https://stackoverflow.com/questions/18144921/how-do-i-get-the-dirname-of-the-calling-method-when-it-is-in-a-different-file-in
  const root = dirname(callsite()[1].getFileName());

  const moduleDirs = settings.modules.map((mod) => join(root, mod));

  const modules: Record<string, Module> = {};

  for (const moduleDir of moduleDirs) {
    const [name] = moduleDir.match(/[A-z]+$/) || [];
    if (!name) {
      console.warn(`invalid module dir: ${moduleDir}`);
      continue;
    }
    modules[name] = {
      name,
      models: [],
    };
    const dirs = readdirSync(`${moduleDir}`, {
      withFileTypes: true,
    }).filter((dir) => dir.isDirectory());
    for (const dir of dirs) {
      if (isModelsDirectory(dir, settings)) {
        for (const file of readdirSync(`${moduleDir}/${dir.name}`, {
          withFileTypes: true,
        }).filter((file) => file.isFile())) {
          if (file.name.match(/\.[jt]s$/)) {
            const exported = require(`${moduleDir}/${dir.name}/${file.name}`);
            for (const model of Object.values(exported) as typeof CrudModel[]) {
              if (
                model &&
                model instanceof Function &&
                model.prototype.wheel?.isOkay
              ) {
                modules[name].models.push(model as typeof CrudModel);
              }
            }
          }
        }
      }
    }
  }

  router.get(`/modules/list`, (_req, res) => {
    return res.json(
      Object.values(modules).reduce(
        (acc, mod) => ({ ...acc, [mod.name]: `/module/${mod.name}` }),
        {}
      )
    );
  });
  for (const mod of Object.values(modules)) {
    const [middleware, endpoints] = genCrudModule(mod);
    router.get(`/module/${mod.name}/list`, (_req, res) => {
      return res.json(endpoints);
    });
    router.use(`/module/${mod.name}`, middleware);
  }
  return router;
};
