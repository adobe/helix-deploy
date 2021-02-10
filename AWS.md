# AWS Specific Notes

## Number of routes and integration limit

The AWS API Gateway has limits on how many routes/integrations can be added to 1 API:

https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html#api-gateway-limits:

Resource or operation | Default quota | Can be increased
-- | -- | --
Routes per API | 300 | Yes
Integrations per API | 300 | No
Maximum integration timeout | 30 seconds | No

Using the _naive_ approach to create a route/integration pair for each deployed helix service
version will soon exhaust those limits:

```
/helix-services/foo_1.8.3/        -----> integration:1234  ----> function:my-function:1.8.3
/helix-services/foo_1.8.3/{path+} --/
```

when (sym)linking release versions, there are more routes, eg:

```
/helix-services/foo_1.8.3/ ------------> integration:1234  ----> function:my-function:1.8.3
/helix-services/foo_1.8.3/{path+} ----/
                                     /
/helix-services/foo_v1 -------------/
/helix-services/foo_v1{path+} -----/
/helix-services/foo_v1.8----------/
/helix-services/foo_v1.8{path+} -/
```

### Proxy functions

The multiplex / proxy functions are used keep the number of routes small. Those functions
forward the request to the respective function using the [invoke] api.

The is 1 function per package with the following routes

```
ANY /helix-services/{action}/{version}
ANY /helix-services/{action}/{version}/{path+}
```

There are still routes created for the released (symlnked) functions in order to keep them fast.  

```
/helix-services/{action}/{version}  ------------> integration:proxty  ----> function:proxy:1.0
/helix-services/{action}/{version}/{path+} ----/
                                     
/helix-services/foo/v1 --------------------> integration:foo ---> function:foo:1.8.1
/helix-services/foo/v1/{path+} -----------/
/helix-services/foo/v1.8 ----------------/
/helix-services/foo/v1.8/{path+} -------/
```

### Proxy functions (helix-pages)

Helix pages has some special requirement, as it is not (yet) deployed like a _normal_ service.

The routes for `helix-pages` look like:

```
ANY /{package}/{action}
ANY /{package}/{action}/{path+}
```

Note that the `package` path parameter needs to match `pages_{version}`. The pages proxy then 
[invoke]s `pages--${action}:${version}`.


### Installation

The is no automatic installation of the proxy functions (yet).


[invoke]: https://docs.aws.amazon.com/lambda/latest/dg/API_Invoke.html

