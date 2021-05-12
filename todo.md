# Next relesae

- --version
- help command
- Dev guide
- User guide
- Plugin devs guide
- build command
- up command
- down command

# Todo

- Need a cmd to shell in!

- Each command should document its arguments to provide help for that command.

- Need to have the application name in the creation process.

- Need "doulevo ps" to be able to find all projects in the application.

- Ask more questions for project type (e.g. nodejs-javascript-express-jest)
  - How do we know what questions to ask?
    - There has to be a project type mannifest somewhere.

- Need help/options for each sub command!

- The next plugin for Doulevo should be TypeScript!

- Be great to ask what type of licence to include.
  - This is cross plugin!!
  - Could plugins have layers?

- Better readme
  - Install / usage guide
  - Developers guides
  - Template authors guide

- Better help
  - Usage when no args / no command.

- How to download a plugin?
  - Git!
- How to download a template?
  - Git!
- Download Docker / Kubectl
  - It's actually going to be pretty hard to run Docker on Windows, it needs WSL2!
  - For the moment Docker can't be bundled.
- Mustach /  handlebars templates.
  - Inflate-template already supports this.
- Where do plugins and execuables get stored?
  - In the app data directory.
- Need a separate command to set the application.
- How does backend authentication work?
    - Can just reply on Kubectl auth for now.

- How will I hash files to know if baked in files have changed?
  - Can I get a hash from Git for a file or the whole project?
- How do I know what the baked in files are? This will be different for dev and prod.

- Use inflate-template to expand a template on disk.
  - Need to make it fast!
  - Need to support pre compiled tempates.
  - Need to document the template creation process.

## Soon

- How do I get template data into the directory and file names? (for the Java plugin)
- Want tests for the services!


## Future

- Need a clean command to kill all images and containers.
- Automatically update the plugin on up (and any other comnmand!)
- Share the npm cache directory.
- Want built in timing so I know how longer commands are taking.
- Automatically pull changes to template if it needs to be updated.
- Need to call home so I can tell if people are using it!
- Create a GUID during creation?
  - Could this be an issue for copying a project?
- How will I deploy a database?
  - Will it be a plugin?
- How do I version plugins? 
    - Could just install them to a local cache directory.
    - Shared would be better though.
- Be good to load json from file or std input that specifies values for questions. 
- Need to log verbosely to a log file in the Douleveo app data directory.
- When adding caching, need per project and per system caching. Include the content hash in the cache key. That way the cache lookup won't yield results unless the content is the same.
