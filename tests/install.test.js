import Rbuilder from "../src";


describe("test without installation", () => {
  test("resource has api prefix when appendApiToRequest config option is ignored", () => {
    const resourceName = "resource";
    const resource = Rbuilder.make("resource").resource;
    expect(`api/${resourceName}`).toBe(resource);
  });
});

describe("installation tests", () => {
  test("app url can be set with the config option", () => {
    const url = "https://test.com";
    Rbuilder.install({ url, appendApiToRequest: true });
    const appurl = Rbuilder.make("").baseUrl;
    expect(url).toBe(appurl);
  });
  test("resource has api prefix when appendApiToRequest config option is set to true", () => {
    const url = "https://test.com";
    Rbuilder.install({ url, appendApiToRequest: true });
    const resourceName = "resource";
    const resource = Rbuilder.make("resource").resource;
    expect(`api/${resourceName}`).toBe(resource);
  });
  test("resource does not have api prefix when appendApiToRequest config option is set to false", () => {
    const url = "https://test.com";
    Rbuilder.install({ url, appendApiToRequest: false });
    const resourceName = "resource";
    const resource = Rbuilder.make("resource").resource;
    expect(`api/${resourceName}`).not.toBe(resource);
  });

  test("resource does have api prefix when make() config option is set to true", () => {
    const url = "https://test.com";
    Rbuilder.install({ url, appendApiToRequest: false });
    const resourceName = "resource";
    const resource = Rbuilder.make("resource", {
      appendApiToRequest: true,
    }).resource;
    expect(`api/${resourceName}`).toBe(resource);
  });

  test("resource does not have api prefix when make() config option is set to false", () => {
    const url = "https://test.com";
    Rbuilder.install({ url, appendApiToRequest: true });
    const resourceName = "resource";
    const resource = Rbuilder.make("resource", {
      appendApiToRequest: false,
    }).resource;
    expect(`api/${resourceName}`).not.toBe(resource);
  });
});
