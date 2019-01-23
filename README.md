# Openwhisk Action Builder
> Library and Commandline tool support for building and deploying OpenWhisk actions. 

## Status
[![GitHub license](https://img.shields.io/github/license/tripodsan/openwhisk-action-builder.svg)](https://github.com/tripodsan/openwhisk-action-builder/blob/master/LICENSE.txt)
[![GitHub issues](https://img.shields.io/github/issues/tripodsan/openwhisk-action-builder.svg)](https://github.com/tripodsan/openwhisk-action-builder/issues)
[![CircleCI](https://img.shields.io/circleci/project/github/tripodsan/openwhisk-action-builder.svg)](https://circleci.com/gh/tripodsan/openwhisk-action-builder)
[![codecov](https://img.shields.io/codecov/c/github/tripodsan/openwhisk-action-builder.svg)](https://codecov.io/gh/tripodsan/openwhisk-action-builder)
[![Greenkeeper badge](https://badges.greenkeeper.io/tripodsan/openwhisk-action-builder.svg)](https://greenkeeper.io/)
[![LGTM Code Quality Grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/tripodsan/openwhisk-action-builder.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/tripodsan/openwhisk-action-builder)

## Setup

1. Add this wrapper as dev dependency:
    ```sh
    # Add OpenWhisk wrapper as dependency 
    npm add openwhisk-action-builder
    ```

2. todo: create cli.js
3. todo: reference in package.json
4. Build the OpenWhisk action
    ```sh
    $ ./node_modules/.bin/wskbot
    ...
    Created action: dist/probot-openwhisk-example.zip.
    ```
5. Deploy the OpenWhisk action
    ```sh
    $ wsk action update probot-openwhisk-example --docker tripodsan/probot-ow-nodejs8:latest --web raw dist/probot-openwhisk-example.zip
    ```

The deploy parameters can be specifies in the CLI via `-p`. See below.

## CLI

The command line interface `wskbot` can either be invoked via `./node_modules/.bin/wskbot`. 
you can also use npx: `npx wskbot` or install it globally `npm install -g openwhisk-action-builder`.

```
$ wskbot --help
Options:
  --version            Show version number                             [boolean]
  --verbose, -v                                                 [default: false]
  --deploy             Automatically deploy to OpenWhisk        [default: false]
  --test               Invoke action after deployment           [default: false]
  --hints, --no-hints  Show action and github app settings       [default: true]
  --static, -s         Includes a static file into the archive
                                                           [array] [default: []]
  --params, -p         Include the given action param. Can be a file or a
                       string; can be json or env.         [array] [default: []]
  --help               Show help                                       [boolean]

for more information, find our manual at
https://github.com/tripodsan/openwhisk-action-builder
```

With no arguments,the `wskbot` just bundles your code into the respective `action.zip`:

```
$ wskbot
ok: created action: dist/probot-openwhisk-example.zip.
Deploy to openwhisk the following command or specify --deploy on the commandline:
$ wsk action update probot-openwhisk-example --docker tripodsan/probot-ow-nodejs8:latest --web raw dist/probot-openwhisk-example.zip

Githup App Settings:
Homepage URL: https://adobeioruntime.net/api/v1/web/tripod/default/probot-openwhisk-example/probot
 Webhook URL: https://adobeioruntime.net/api/v1/web/tripod/default/probot-openwhisk-example
```

### Automatically deploy to openwhisk

When given the `--deploy`, the `wskbot` will try to deploy it ot OpenWhisk using the settings from
`~/.wskprops`. Alternatively, you can also set the `WSK_NAMESPACE`, `WSK_AUTH`, `WSK_APIHOST` in your
environment or `.env` file.

```
$ wskbot --deploy --no-hints
ok: created action: dist/probot-openwhisk-example.zip.
ok: updated action tripod/probot-openwhisk-example
```  

### Automatically _test_ the deployed action

In order to quickly test the deployed action, `wskbot` can send a `GET` request to the action url.

```
$ wskbot --deploy --no-hints --test
ok: created action: dist/probot-openwhisk-example.zip.
ok: updated action tripod/probot-openwhisk-example
--: requesting: https://runtime.adobe.io/api/v1/web/tripod/default/probot-openwhisk-example ...
ok: 200
```

..or sometimes:

```
$ wskbot --deploy --no-hints --test
ok: created action: dist/probot-openwhisk-example.zip.
ok: updated action tripod/probot-openwhisk-example
--: requesting: https://runtime.adobe.io/api/v1/web/tripod/default/probot-openwhisk-example ...
error:  400 - "{\n  \"error\": \"Response is not valid 'message/http'.\",\n  \"code\": \"av6qzDTHdgd5dfg7WOynEjbVnTdE5JhnB4c\"\n}"
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
wskbot -s logo.png
```
 
## Notes

### Bundling

The action is created using webpack to create bundle for the sources and then creates a zip archive
with the bundle, a `package.json`, the private key files and the `.env`.

## Contributing

If you have suggestions for how this OpenWhisk probot wrapper could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

