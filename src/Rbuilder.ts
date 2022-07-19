import axios, { AxiosResponse } from "axios";
import { Query } from "./Query";

export interface Config {
  url: string;
  appendApiToRequest: boolean;
  onSuccess?:
    | ((
        value: AxiosResponse<any, any>
      ) => AxiosResponse<any, any> | Promise<AxiosResponse<any, any>>)
    | undefined;
  onError?: ((error: any) => any) | undefined;
}

export interface ResourceConfig {
  appendApiToRequest: boolean;
}
export interface Params {
  resourceId: null | number;
  includes: string[];
  sorts: string[];
  filters: Record<string, string | number>;
  page: number | null;
  perPage: number | null;
  limit: number | null;
  offset: number | null;
  relationship: Relationship | null;
}

interface Relationship {
  id: number;
  related: string;
}

export default class Rbuilder {
  static apiPrefix = true;
  static url = "https://jsonplaceholder.typicode.com/";
  static make(resource: string, config?: ResourceConfig) {
    if (config != undefined) {
      return config.appendApiToRequest
        ? new this(`api\${resource}`)
        : new this(resource);
    } else
      return Rbuilder.apiPrefix
        ? new this(`api\${resource}`)
        : new this(resource);
  }

  static api = axios.create({
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    withCredentials: true,
  });
  static install(config: Config) {
    Rbuilder.apiPrefix = config.appendApiToRequest;
    Rbuilder.url = config.url;
    Rbuilder.api.interceptors.response.use(config.onSuccess, config.onError);
  }

  protected constructor(resource: String) {
    this.resource = resource;
    this.baseUrl = Rbuilder.url;
    this.api = Rbuilder.api;
  }
  public baseUrl: String;
  private api = Rbuilder.api;
  private resource: String;
  public response: AxiosResponse | undefined;
  public get data() {
    return this.response?.data;
  }

  private params = {
    resourceId: null as unknown as number,
    includes: [] as string[],
    sorts: [] as string[],
    filters: {} as Record<string, string | number>,
    page: <number>(<unknown>null),
    perPage: <number>(<unknown>null),
    limit: <number>(<unknown>null),
    offset: <number>(<unknown>null),
    relationship: <Relationship>(<unknown>null),
  } as Params;

  async create(data: unknown) {
    const res = await this.api.post(this.url(), data);
    return this;
  }
  async update(id: number, data: unknown) {
    this.params.resourceId = id;
    const res = this.api.put(this.url(), data);
    return this;
  }

  async delete(id: number) {
    this.params.resourceId = id;
    const res = this.api.delete(this.url());
    return this;
  }

  page(page: number) {
    if (typeof page == "number") {
      this.params.page = page;
    }
    return this;
  }

  perPage(count: number) {
    if (typeof count == "number") {
      this.params.perPage = count;
    }
    return this;
  }

  where(column: string, value: string | number) {
    if (column === undefined || value === undefined) {
      throw new Error(
        "The where() function takes 2 arguments both of string values."
      );
    }
    this.params.filters[column] = value;
    return this;
  }
  whereIn(column: string, values: string | number[]) {
    if (!column || !values) {
      throw new Error(
        "The whereIn() function takes 2 arguments of (string, array)."
      );
    }
    if ((!column && Array.isArray(column)) || typeof column === "object") {
      throw new Error(
        "The first argument for the whereIn() function must be a string or integer."
      );
    }
    if (!Array.isArray(values)) {
      throw new Error(
        "The second argument for the whereIn() function must be an array."
      );
    }
    this.params.filters[column] = values.join(",");
    return this;
  }
  with(models: string[]) {
    if (!models.length) {
      throw new Error(`The with() function takes at least one argument.`);
    }
    this.params.includes.push(...models);

    return this;
  }
  async find(id: number) {
    this.params.resourceId = id;
    await this.get();
    return this;
  }
  async get() {
    try {
      this.response = await this.api.get(this.url());
      return this;
    } catch (error) {
      throw error;
    }
  }
  async all() {
    this.response = await this.api.get(`${this.baseUrl}/${this.resource}`);
    return this;
  }
  static async getPath(path: string) {
    return await this.api.get(`${Rbuilder.url}/${path}`);
  }
  static async postPath(path: string, data: unknown) {
    return await this.api.post(`${Rbuilder.url}/${path}`, data);
  }
  static async deletePath(path: string) {
    return await this.api.delete(`${Rbuilder.url}/${path}`);
  }
  static async putPath(path: string, data: unknown) {
    return await this.api.put(`${Rbuilder.url}/${path}`, data);
  }
  from(related: string, id: number) {
    this.params.relationship = { id, related };
    return this;
  }
  orderBy(field: string, order: "asc" | "desc") {
    const sort = order == "asc" ? `${field}` : `-${field}`;
    this.params.sorts.push(sort);
    return this;
  }
  limit(value: number) {
    if (!Number.isInteger(value)) {
      throw new Error(
        "The limit() function takes a single argument of a number."
      );
    }
    this.params.limit = value;
    return this;
  }
  offset(value: number) {
    if (!Number.isInteger(value)) {
      throw new Error(
        "The limit() function takes a single argument of a number."
      );
    }
    this.params.offset = value;
    return this;
  }

  path() {
    return this.params.relationship == null
      ? `/${this.resource}${
          this.params.resourceId ? "/" + this.params.resourceId : ""
        }`
      : `/${this.params.relationship.related}/${this.params.relationship.id}/${this.resource}`;
  }
  parsePath() {
    if (!this.resource) {
      throw new Error("Please set the resource type for your model");
    }
    return `${this.path()}?${this.parseQuery()}`;
  }
  parseQuery() {
    const query = new Query(this.params);
    return query.parse();
  }
  url() {
    const url = this.baseUrl
      ? this.baseUrl + this.parsePath()
      : this.parsePath();
    return url;
  }
}
