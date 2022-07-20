import { RQbuilder } from "../src";
import MockAdapter from "axios-mock-adapter";

describe("Query builder", () => {
  beforeEach(() => {});

  test("it builds a complex query", () => {
    const builder = RQbuilder.make("users")
      .where("username", "ahmed")
      .whereIn("conversation_id", [2, 3])
      .orderBy("created_at", "desc")
      .offset(5)
      .perPage(5)
      .page(2)
      .append("search", "searchkey")
      .with(["posts", "items"])
      .limit(4);

    const query =
      "search=searchkey&include=posts,items&sort=-created_at&filter[username]=ahmed&filter[conversation_id]=2,3&page=2&perPage=5&limit=4&offset=5";

    expect(builder.parseQuery()).toEqual(query);
    expect(builder.parsePath()).toEqual(`/api/users?${query}`);
  });

  test("page() sets properly in the request", () => {
    const builder = RQbuilder.make("users").page(1);
    expect(builder.parseQuery()).toBe("page=1");
  });
  test("perPage() sets properly in the request", () => {
    const builder = RQbuilder.make("users").perPage(5);
    expect(builder.parseQuery()).toBe("perPage=5");
  });
  test("limit() sets properly in the request", () => {
    const builder = RQbuilder.make("users").limit(5);
    expect(builder.parseQuery()).toBe("limit=5");
  });
  test("offset() sets properly in the request", () => {
    const builder = RQbuilder.make("users").offset(5);
    expect(builder.parseQuery()).toBe("offset=5");
  });
  test("append() sets properly in the request", () => {
    const builder = RQbuilder.make("users").append("search", "ahmed");
    expect(builder.parseQuery()).toBe("search=ahmed");
  });
  test("where() sets properly in the request", () => {
    const builder = RQbuilder.make("users").where("role", "admin");
    expect(builder.parseQuery()).toBe("filter[role]=admin");
  });
  test("whereIn() sets properly in the request", () => {
    const builder = RQbuilder.make("users").whereIn("role", [
      "admin",
      "moderator",
    ]);
    expect(builder.parseQuery()).toBe("filter[role]=admin,moderator");
  });
  test("with() sets properly in the request", () => {
    const builder = RQbuilder.make("users").with(["posts", "likes"]);
    expect(builder.parseQuery()).toBe("include=posts,likes");
  });
  test("orderBy() sets properly in the request", () => {
    const builder = RQbuilder.make("users").orderBy("created_at", "asc");
    const builder2 = RQbuilder.make("users").orderBy("created_at", "desc");
    expect(builder.parseQuery()).toBe("sort=created_at");
    expect(builder2.parseQuery()).toBe("sort=-created_at");
  });
  test("from() sets properly in the request", () => {
    const builder = RQbuilder.make("posts").from("users", 1);
    expect(builder.parsePath()).toBe("/api/users/1/posts?");
  });
  test("from() sets properly if appendApiToRequest is set to false in the request", () => {
    const builder = RQbuilder.make("posts", { appendApiToRequest: false }).from(
      "users",
      1
    );
    expect(builder.parsePath()).toBe("/users/1/posts?");
  });
});
describe("request tests", () => {
  const url = "https://test.com";
  const axiosMock = new MockAdapter(RQbuilder.api);
  RQbuilder.install({ url, appendApiToRequest: true });
  const usersUrl = `${url}/users?`;
  const userUrl = `${url}/users/1?`;

  beforeEach(() => {
    axiosMock.reset();
  });
  it("the get() method executes a get request", async () => {
    const resData = { data: ["id"] };
    axiosMock.onGet(usersUrl).reply(200, resData);
    const builder = await RQbuilder.make("users", {
      appendApiToRequest: false,
    }).get();
    expect(builder.response?.config.method).toBe("get");
    expect(builder.data).toStrictEqual(resData);
    expect(builder.response?.config.withCredentials).toBe(true);
    expect(builder.response?.config.url).toBe(usersUrl);
  });
  it("the find() method executes a get request based on params provides", async () => {
    axiosMock.onGet(userUrl).reply(200, []);
    const builder = await RQbuilder.make("users", {
      appendApiToRequest: false,
    }).find(1);
    expect(builder.response?.config.method).toBe("get");
    expect(builder.response?.config.url).toBe(userUrl);
  });
  it("the all() method executes a get request and ignores all queries", async () => {
    const allUrl = `${url}/users`;
    axiosMock.onGet(allUrl).reply(200, { data: ["id"] });
    const builder = await RQbuilder.make("users", {
      appendApiToRequest: false,
    })
      .with(["sa"])
      .all();
    expect(builder.response?.config.method).toBe("get");
    expect(builder.response?.config.withCredentials).toBe(true);
    expect(builder.response?.config.url).toBe(allUrl);
  });
  it("the create() method makes a post request", async () => {
    axiosMock.onPost(usersUrl).reply(200, { data: ["id"] });
    const data = { name: "ds" };
    const builder = await RQbuilder.make("users", {
      appendApiToRequest: false,
    }).create(data);
    expect(builder.response?.config.url).toBe(usersUrl);
    expect(JSON.parse(builder.response?.config.data)).toStrictEqual(data);
    expect(builder.response?.config.method).toBe("post");
  });
  it("the update() makes a put request", async () => {
    axiosMock.onPut(userUrl).reply(200, { data: ["id"] });
    const data = { name: "ds" };
    const builder = await RQbuilder.make("users", {
      appendApiToRequest: false,
    }).update(1, data);
    expect(builder.response?.config.url).toBe(userUrl);
    expect(JSON.parse(builder.response?.config.data)).toStrictEqual(data);
    expect(builder.response?.config.method).toBe("put");
  });
  it("can delete() method makes a delete request", async () => {
    axiosMock.onDelete(userUrl).reply(200, { data: ["id"] });
    const builder = await RQbuilder.make("users", {
      appendApiToRequest: false,
    }).delete(1);
    expect(builder.response?.config.url).toBe(userUrl);
    expect(builder.response?.config.method).toBe("delete");
  });

  it("the getPath() method executes a get request to the path provided", async () => {
    const path = "admin/sanitize";
    const fullPath = `${url}/${path}`;
    axiosMock.onGet(fullPath).reply(200, { data: ["id"] });
    const res = await RQbuilder.getPath(path);
    expect(res.config.method).toBe("get");
    expect(res.config.withCredentials).toBe(true);
    expect(res.config.url).toBe(fullPath);
  });

  it("the postPath() method executes a post request to the path provided", async () => {
    const path = "admin/sanitize";
    const fullPath = `${url}/${path}`;
    const data = { name: "ds" };
    axiosMock.onPost(fullPath).reply(200, { data: ["id"] });
    const res = await RQbuilder.postPath(path, data);
    expect(res.config.method).toBe("post");
    expect(JSON.parse(res.config.data)).toStrictEqual(data);
    expect(res.config.url).toBe(fullPath);
  });

  it("the putPath() method executes a put request to the path provided", async () => {
    const path = "admin/sanitize";
    const fullPath = `${url}/${path}`;
    const data = { name: "ds" };
    axiosMock.onPut(fullPath).reply(200, { data: ["id"] });
    const res = await RQbuilder.putPath(path, data);
    expect(res.config.method).toBe("put");
    expect(JSON.parse(res.config.data)).toStrictEqual(data);
    expect(res.config.url).toBe(fullPath);
  });

  it("the deletePath() method executes a delete request to the path provided", async () => {
    const path = "admin/sanitize";
    const fullPath = `${url}/${path}`;
    axiosMock.onDelete(fullPath).reply(200, { data: ["id"] });
    const res = await RQbuilder.deletePath(path);
    expect(res.config.method).toBe("delete");
    expect(res.config.url).toBe(fullPath);
  });
});
