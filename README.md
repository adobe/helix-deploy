# Openwhisk Action Builder
> Library and Commandline tool support for building and deploying OpenWhisk actions. 

## Status
[![GitHub license](https://img.shields.io/github/license/adobe/openwhisk-action-builder.svg)](https://github.com/adobe/openwhisk-action-builder/blob/master/LICENSE.txt)
[![GitHub issues](https://img.shields.io/github/issues/adobe/openwhisk-action-builder.svg)](https://github.com/adobe/openwhisk-action-builder/issues)
[![CircleCI](https://img.shields.io/circleci/project/github/adobe/openwhisk-action-builder.svg)](https://circleci.com/gh/adobe/openwhisk-action-builder)
[![codecov](https://img.shields.io/codecov/c/github/adobe/openwhisk-action-builder.svg)](https://codecov.io/gh/adobe/openwhisk-action-builder)
[![Greenkeeper badge](https://badges.greenkeeper.io/adobe/openwhisk-action-builder.svg)](https://greenkeeper.io/)
[![LGTM Code Quality Grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/adobe/openwhisk-action-builder.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/adobe/openwhisk-action-builder)

## Setup

1. Add this wrapper as dev dependency:
    ```sh
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
    ```sh
    $ npm run build
    ...
    Created action: dist/my-example.zip.
    ```
4. Deploy the OpenWhisk action
    ```sh
    $ wsk action update ....
    ```

The deploy parameters can be specifies in the CLI via `-p`. See below.

## CLI

The command line interface `wsk-builder` can either be invoked via `./node_modules/.bin/wsk-builder`. 
you can also use npx: `npx wsk-builder` or install it globally `npm install -g openwhisk-action-builder`.

```
$ wsk-builder --help
Operation Options
  --build              Build the deployment package    [boolean] [default: true]
  --deploy             Automatically deploy to OpenWhisk
                                                      [boolean] [default: false]
  --test               Invoke action after deployment [boolean] [default: false]
  --hints, --no-hints  Show additional hints for deployment
                                                       [boolean] [default: true]
  --update-package     Create or update wsk package.  [boolean] [default: false]

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
  --timeout, -t      the timeout LIMIT in milliseconds after which the action is
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
  --pkgVersion   Version use in the embedded package.json.
  --modules, -m  Include a node_module as is.              [array] [default: []]
  --help         Show help                                             [boolean]
```

With no arguments,the `wsk-builder` just bundles your code into the respective `action.zip`:

### Automatically deploy to openwhisk

When given the `--deploy`, the `wskbot` will try to deploy it ot OpenWhisk using the settings from
`~/.wskprops`. Alternatively, you can also set the `WSK_NAMESPACE`, `WSK_AUTH`, `WSK_APIHOST` in your
environment or `.env` file.

```
$ wsk-builder --deploy --no-hints
ok: created action: dist/my-example.zip.
ok: updated action tripod/my-example
```  

### Automatically _test_ the deployed action

In order to quickly test the deployed action, `wsk-builder` can send a `GET` request to the action url.

```
$ wsk-builder --deploy --no-hints --test
ok: created action: dist/my-example.zip.
ok: updated action tripod/my-example
--: requesting: https://runtime.adobe.io/api/v1/web/tripod/default/my-example ...
ok: 200
```

the `--test` argument can be a relative url, in case the request should not be made against the root url, eg:

```
$ wsk-builder --deploy --no-hints --test=/ping
ok: created action: dist/my-example.zip.
ok: updated action tripod/my-example
--: requesting: https://runtime.adobe.io/api/v1/web/tripod/default/my-example/ping ...
ok: 200
```

### Including action parameters

Action parameters can be defined via `-p`, either as json on env string, or json or env file.

Examples:

```bash
# specify as env string
wskbot -p MY_TOKEN=1234 -p MY_PWD=foo

# specify as json string
wskbot -p '{ "MY_TOKEN": 1234, "MY_PWD": "foo" }'

# specify as env file
wskbot -p .env

# specify as json file
wskbot -p params.json

# and a combination of the above
wskbot -p .env -p params.json -p MY_TOKEN=123

# like in curl, you can include file contents with `@` (also works in .env or .json file)
wskbot -p MY_TOKEN=@token.txt

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

### Including static files

Adding static files, i.e. files that are not referenced from the `index.js` and detected by webpack,
can be done via the `-s` parameter. they are always put into the root directory of the archive.

Example:

```bash
# include an image
wsk-builder -s logo.png
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
 
## Notes

### Bundling

The action is created using webpack to create bundle for the sources and then creates a zip archive
with the bundle, a `package.json`, the private key files and the `.env`.

## Contributing

If you have suggestions for how this OpenWhisk probot wrapper could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

