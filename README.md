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
  --deploy             Automatically deploy to OpenWhisk        [default: false]
  --test               Invoke action after deployment           [default: false]
  --hints, --no-hints  Show additional hints for deployment      [default: true]

OpenWhisk Action Options
  --name             OpenWhisk action name. Can be prefixed with package.
  --kind             Specifies the action kind. eg: nodejs:10-fat  [default: ""]
  --docker           Specifies a docker image.
                                 [default: "adobe/probot-ow-nodejs8:latest"]
  --params, -p       Include the given action param. can be json or env.
                                                           [array] [default: []]
  --params-file, -f  Include the given action param from a file; can be json or
                     env.                                  [array] [default: []]

Bundling Options
  --static, -s  Includes a static file into the archive    [array] [default: []]

GitHub Options
  --github-key  Specify the GitHub private key file

Options:
  --version      Show version number                                   [boolean]
  --verbose, -v                                                 [default: false]
  --help         Show help                                             [boolean]

for more information, find our manual at
https://github.com/adobe/probot-serverless-openwhisk
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
```

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

