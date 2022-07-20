<p align="center">
  <a href="https://app.codecov.io/gh/trikss/rqbuilder">
    <img src="https://codecov.io/gh/robsontenorio/vue-api-query/branch/master/graph/badge.svg" />
  </a>
    <a href="https://actions-badge.atrox.dev/trikss/rqbuilder/goto?ref=main"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Ftrikss%2Frqbuilder%2Fbadge%3Fref%3Dmain&style=flat" /></a>
  <a href="https://www.npmjs.com/package/rqbuilder">
  <img alt="preview badge" src="https://img.shields.io/npm/dw/rqbuilder">
  </a>
  <a href="https://github.com/trikss/rqbuilder/blob/master/LICENSE">
  <img alt="GitHub" src="https://img.shields.io/github/license/trikss/rqbuilder">
  </a>     
</p>

# RQbuilder

Rapidly and elegantly build urls and requests for for your rest api without complications. RQbuilder follows the [JSON API SPEC](https://jsonapi.org/format) for query parameter names. if you use laravel it works well with [spatie/laravel-query-builder](https://github.com/spatie/laravel-query-builder)

## Installation

### pnpm

```js
pnpm i rqbuilder
```

### npm

```js
npm i rqbuilder
```

### yarn

```js
yarn add rqbuilder
```

## Basic usage

Make a http request by calling the functions you need in a simple and elegant way:

```js
// Import
import { RQbuilder } from "../src";

//if /api/** is needed to access the url set appendApiToRequest to true
RQbuilder.install({ url: "https://test.com", appendApiToRequest: true });

// /api/users/?include=posts,items&sort=-created_at&filter[username]=ahmed&filter[conversation_id]=2,3&page=2&
const builder = await RQbuilder.make("users") // the resource you're selecting
  .where("username", "ahmed") //filters users by username
  .whereIn("conversation_id", [2, 3]) //multiple matching filter values
  .orderBy("created_at", "desc") //orders in descending order
  .page(2) //for pagination. fetches the 2nd page
  .with(["posts", "items"]) //include the relationships
  .get();

//.get() will return an instance of Rqbuilder. the response is stored in .response property. you can also access the response data with the .data property
const response = builder.response;
const data = builder.data;

//to access the data direclty you can
const data = (await RQbuilder.make("posts").get).data;
```

## Available instance Methods

### url()

generates the url

```js
//url() will return the generated url without sending the request
const url = RQbuilder.make("posts").url();
```

### where()

filters based on a field. the first field is the field to search for, the second field is the value to be filtered

```js
// /users?filter[name]=Bob
const url = RQbuilder.make("users").where("name", "Bob").url(); //.url() will return the generated url without sending the request, .get() will send the request;
```

### whereIn()

multiple matching filter values. the first field is the field to search for, the second field is an array of filter values

```js
// /users?filter[name]=bob,jerry
const url = RQbuilder.make("users").whereIn("name", ["bob", "jerry"]).url(); // or .get();
```

### with()

includes a relationship

```js
// /users?include=posts,comments
const url = RQbuilder.make("users").with(["posts", "comments"]).url(); // or .get();
```

### appends()

add a key value pair to the request

```js
// /users?search=ahmed
const url = RQbuilder.make("users").append("search", "ahmed").url(); // or .get();
```

### limit()

limit the number of items to fetch

```js
// /users?limit=5
const url = RQbuilder.make("users").limit(5).url(); // or .get();
```

### limit() | offset()

limits the amount of resource (limit) and skips a given number of resource (offset)

```js
// /users?offset=2&limit=5
const url = RQbuilder.make("users").limit(5).offset(2).url(); // or .get();
```

### page() | perPage()

sets the page and perPage queries: _this is not included in [spatie/laravel-query-builder](https://github.com/spatie/laravel-query-builder). perPage is also not included in [JSON API SPEC](https://jsonapi.org/format/).you could optionaly program your api to accept such query_

```js
// /users?page=4&perPage=10
const url = RQbuilder.make("users").page(4).perPage(10).url(); // or .get();
```

### orderBy()

orders the collection in either ascending order or descending order. the first parameter is the field to order. the second field is the sort method, 'asc' for ascending and 'desc' for descending order

```js
// /users?sort=-name,age
const url = RQbuilder.make("users").orderBy("created_at", "asc").url(); // or .get();
```

### from()

used to fetch the resource of a particular model e.g to fetch the posts of a particular user. GET /users/{userID}/posts.

```js
// /users/1/posts?
const url = RQbuilder.make("posts").from("users", 1).url(); // or .get();
```

### find()

executes the query of when fetching a single resource. the parameter could be either be the slug or id of the resource

```js
// /users/1
const builder = await RQbuilder.make("users").find(1); // the find() method executes a get request based on params provides
```

### all()

sends the request to get all the resources without constraints

```js
// /users
const builder = await RQbuilder.make("users").limit(5).all(); // the all() method executes a get request and ignores all queries. in the above example the limit query parameter will be ignored
```

### create()

generates and executes the request for creating a resource

```js
// POST /users  name=ahmed&email=ahrmerd@gmail.com
const builder = await RQbuilder.make('users').create({ name: ahmed, email: ahrmerd@gmail.com });
```

### update()

sends a PUT request to the request endpoint

```js
// PUT /users/1  name=ahmed&email=ahrmerd@gmail.com
const builder = await RQbuilder.make('users').update(1, { name: ahmed, email: ahrmerd@gmail.com });
```

### delete()

sends a delete request to the request endpoint

```js
// DELETE /users/1
const builder = await RQbuilder.make("users").delete(1);
```

## Static Methods

### getPath()

executes a get request to the path provided

```js
// GET admin/sanitize
const res = await RQbuilder.getPath("admin/sanitize");
```

### postPath()

executes a post request to the path provided

```js
// POST admin/sanitize
const res = await RQbuilder.postPath("admin/sanitize");
```

### putPath()

executes a put request to the path provided

```js
// PUT admin/sanitize
const res = await RQbuilder.putPath("admin/sanitize");
```

### deletePath()

executes a put request to the path provided

```js
// DELETE admin/sanitize
const res = await RQbuilder.deletePath("admin/sanitize");
```

### make()

the make commad is used to create and instance of RQbuilder. the make commad requires the name of the resource. an optional config can be passed which can be set to overide the default setting of prepending /api to the baseUrl

```js
// /api/users
const builder = RQbuilder.make("users" {appendApiToRequest: true});

// /users
const builder2 = RQbuilder.make("users" {appendApiToRequest: false});
```

# Contact

Twitter [@ahhmadii](https://twitter.com/ahhmadii)

[Email](mailto:ahmedmahmood208@gmail.com)
