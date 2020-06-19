# NBN
This package (abbreviated as "NBN") updates the `package.json` of your project with build information. 
You only need to add the **nbn** cli command to your build steps to have the build info updated,
and the build number incremented. 

### Unique ID
NBN also generates a unique build ID example: `node-build-number:v1.0.0-master[build:4]`
from the project name, version, build number and current branch (only supports git at this time).
This ID can be useful when you need to identify builds, it will be in the package.json of your project code. 
Displaying it in the hemader or footer of a web application in dev or testing will tell you whether a build 
you deployed is successfully running, or if something is wrong.

## Example of build metadata in package.json

    "build": {
        "unique": "node-build-number:v1.0.0-master[build:4]",
        "number": 4,
        "timestamp": "6/16/2020, 8:24:38 PM",
        "git-branch": "master",
        "git-version": "2.26.2",
        "node-version": "v14.2.0",
        "computer": "SCRAPTOP",
        "os": "Windows_NT",
        "arch": "AMD64",
        "user": "MrExampleton"
      }
      
## Incrementing the Version Number

Supposing you have a project with version 0.3.6 and build 12. The following commands will bump the version up 
as shown in the examples below.

    nbn --major
    
Version 1.0.0 build 0.
    
    nbn --minor
    
Version 0.4.0 build 0.

    nbn --rev
    
Version 0.3.7 build 0.