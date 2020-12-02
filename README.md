# Openwhisk Action Builder
> Library and Commandline tool support for building and deploying OpenWhisk actions.

## Status
[![GitHub license](https://img.shields.io/github/license/adobe/openwhisk-action-builder.svg)](https://github.com/adobe/openwhisk-action-builder/blob/main/LICENSE.txt)
[![GitHub issues](https://img.shields.io/github/issues/adobe/openwhisk-action-builder.svg)](https://github.com/adobe/openwhisk-action-builder/issues)
[![CircleCI](https://img.shields.io/circleci/project/github/adobe/openwhisk-action-builder.svg)](https://circleci.com/gh/adobe/openwhisk-action-builder)
[![codecov](https://img.shields.io/codecov/c/github/adobe/openwhisk-action-builder.svg)](https://codecov.io/gh/adobe/openwhisk-action-builder)
[![LGTM Code Quality Grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/adobe/openwhisk-action-builder.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/adobe/openwhisk-action-builder)

## Setup

1. Add this wrapper as dev dependency:
    ```console
    # Add OpenWhisk wrapper as dependency 
    npm add openwhisk-action-builder
    ```

2. add a build script to your package.json:
    ```json
    "scripts": {
      "build": "./node_modules/.bin/wsk-builder"
    }
    ```

3. Build the OpenWhisk action
    ```console
    $ npm run build
    ...
    Created action: dist/my-example.zip.
    ```
4. Deploy the OpenWhisk action
    ```console
    $ wsk action update ....
    ```

The deploy parameters can be specifies in the CLI via `-p`. See below.

## CLI

The command line interface `wsk-builder` can either be invoked via `./node_modules/.bin/wsk-builder`.
you can also use npx: `npx wsk-builder` or install it globally `npm install -g openwhisk-action-builder`.

```console
$ wsk-builder --help
Operation Options
  --build              Build the deployment package    [boolean] [default: true]
  --deploy             Automatically deploy to OpenWhisk
                                                      [boolean] [default: false]
  --test               Invoke action after deployment. Can be relative url.
                                                                        [string]
  --test-params        Invoke openwhisk action after deployment with the given
                       params.                             [array] [default: []]
  --hints, --no-hints  Show additional hints for deployment
                                                       [boolean] [default: true]
  --update-package     Create or update wsk package.  [boolean] [default: false]
  --version-link, -l   Create symlinks (sequences) after deployment. "major" and
                       "minor" will create respective version links      [array]
  --linkPackage        Package name for version links                   [string]

OpenWhisk Action Options
  --name             OpenWhisk action name. Can be prefixed with package.
  --kind             Specifies the action kind.           [default: "nodejs:10"]
  --docker           Specifies a docker image.
  --params, -p       Include the given action param. can be json or env.
                                                           [array] [default: []]
  --params-file, -f  Include the given action param from a file; can be json or
                     env.                                  [array] [default: []]
  --web-export       Annotates the action as web-action[boolean] [default: true]
  --raw-http         Annotates the action as raw web-action (enforces
                     web-export=true)                 [boolean] [default: false]
  --web-secure       Annotates the action with require-whisk-auth. leave empty
                     to generate random token.                          [string]
  --timeout, -t      the timeout limit in milliseconds after which the action is
                     terminated                                 [default: 60000]

OpenWhisk Package Options
  --package.name         OpenWhisk package name.                        [string]
  --package.params       OpenWhisk package params.         [array] [default: []]
  --package.params-file  OpenWhisk package params file.    [array] [default: []]
  --package.shared       OpenWhisk package scope.     [boolean] [default: false]

Bundling Options
  --static, -s  Includes a static file into the archive    [array] [default: []]
  --entryFile   Specifies the entry file.              [default: "src/index.js"]
  --externals   Defines the externals for webpack.         [array] [default: []]

Options:
  --version      Show version number                                   [boolean]
  --verbose, -v                                       [boolean] [default: false]
  --directory    Project directory                       [string] [default: "."]
  --namespace    OpenWhisk namespace. Needs to match the namespace provided with
                 the openwhisk credentials.
  --pkgVersion   Version use in the embedded package.json.
  --modules, -m  Include a node_module as is.              [array] [default: []]
  --help         Show help                                             [boolean]
```

With no arguments,the `wsk-builder` just bundles your code into the respective `action.zip`:

### Automatically deploy to openwhisk

When given the `--deploy`, the `wskbot` will try to deploy it ot OpenWhisk using the settings from
`~/.wskprops`. Alternatively, you can also set the `WSK_NAMESPACE`, `WSK_AUTH`, `WSK_APIHOST` in your
environment or `.env` file.

```console
$ wsk-builder --deploy --no-hints
ok: created action: dist/my-example.zip.
ok: updated action tripod/my-example
```

### Automatically _test_ the deployed action

In order to quickly test the deployed action, `wsk-builder` can send a `GET` request to the action url.

```console
$ wsk-builder --deploy --no-hints --test
ok: created action: dist/my-example.zip.
ok: updated action tripod/my-example
--: requesting: https://runtime.adobe.io/api/v1/web/tripod/default/my-example ...
ok: 200
```

the `--test` argument can be a relative url, in case the request should not be made against the root url, eg:

```console
$ wsk-builder --deploy --no-hints --test=/ping
ok: created action: dist/my-example.zip.
ok: updated action tripod/my-example
--: requesting: https://runtime.adobe.io/api/v1/web/tripod/default/my-example/ping ...
ok: 200
```

### Including action parameters

Action parameters can be defined via `-p`, either as json on env string, or json or env file.

Examples:

```console
# specify as env string
wsk-builder -p MY_TOKEN=1234 -p MY_PWD=foo

# specify as json string
wsk-builder -p '{ "MY_TOKEN": 1234, "MY_PWD": "foo" }'

# specify as env file
wsk-builder -f .env

# specify as json file
wsk-builder -f params.json

# and a combination of the above
wsk-builder -f .env -f params.json -p MY_TOKEN=123

# like in curl, you can include file contents with `@` (also works in .env or .json file)
wsk-builder -p MY_TOKEN=@token.txt

```

### Specifying arguments in the `package.json`

Instead of passing all the arguments via command line, you can also specify them in the `package.json`
in the `wsk` object. eg:

```json
{
...
  "scripts": {
    "build": "./node_modules/.bin/wsk-builder -v",
    "deploy": "./node_modules/.bin/wsk-builder -v --deploy --test"
  },
  "wsk": {
    "name": "my-test-action",
    "params-file": [
      "secrets/secrets.env"
    ],
    "externals": [
      "fs-extra",
      "js-yaml",
      "dotenv",
      "bunyan",
      "bunyan-loggly",
      "bunyan-syslog",
      "bunyan-format"
    ],
    "docker": "adobe/probot-ow-nodejs8:latest"
  },
...
}
```

### Versioning your action

It can be helpful to version the action name, eg with the `@version` notation. So for example

```json
"wsk": {
  "name": "my-action@4.3.1"
}
```

In order to automatically use the version of the `package.json` use:

```json
"wsk": {
  "name": "my-action@${version}"
}
```

> **Note**: the version is internally taken from the `pkgVersion` variable, so it can be overridden with
 the `--pkgVersion` argument, in case it should be deployed differently.

#### Automatically create semantic versioning sequence actions

By using the `--version-link` (`-l`), the bulider can create action sequences _linking_ to the deployed version,
using the semantic versioning notation: `latest`, `major`, `minor`:

| Action Name | Specifier | Sequence Name |
|-------------|-----------|---------------|
| `foo@2.4.3` | `latest`  | `foo@latest`     |
| `foo@2.4.3` | `major`   | `foo@v2`         |
| `foo@2.4.3` | `minor`   | `foo@v2.4`       |

### Including static files

Adding static files, i.e. files that are not referenced from the `index.js` and detected by webpack,
can be done via the `-s` parameter. they are always put into the root directory of the archive.

Example:

```bash
# include an image
wsk-builder -s logo.png
```

If the path points to a directory, it is recursively included.

The files of static files can also be specified in the `package.json` which allows specifying the
destination filename. eg:

```json
...
  "wsk": {
    ...
    "static": [
      "config.json",
      ["assets/logo.png", "static/icon.ong"],
      ["public/", "static/"],
    ]
  }
...
```

## Using the development server

Testing an openwhisk action that was _expressified_ using [ActionUtils.expressify()](https://github.com/adobe/openwhisk-action-utils/blob/main/src/expressify.js)
can be done with the `DevelopmentServer`. Just create a `test/dev.js` file with:

```js
const { DevelopmentServer } = require('@adobe/openwhisk-action-builder');
const App = require('../src/app.js');

async function run() {
  const devServer = await new DevelopmentServer(App).init();
  return devServer.start();
}

// eslint-disable-next-line no-console
run().catch(console.error);
```

and run `node test/dev.js`.

### Using development params with the server

Sometimes it might be useful to specify action params that would be provided during deployment
but are not available during development. those can be specified by a `dev-params-file` `wsk`
property. those parameters are loaded an applied to every action call. eg:

```json
...
  "wsk": {
    ...
    "dev-params-file": ".dev-secrets.env"
  }
...
```

## Notes

### Bundling

The action is created using webpack to create bundle for the sources and then creates a zip archive
with the bundle, a `package.json`, the private key files and the `.env`.

## Contributing

If you have suggestions for how these OpenWhisk Action Utilities could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

