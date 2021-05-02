# Todo

- Better readme
  - Install / usage guide
  - Developers guides
  - Template authors guide

- Better help
  - Usage when no args

- Do the first release of the exe!

- Need some kind of DI!!
  - Inject the progress bar thingy...
  - Inject paths.
  - Logger (verbose logging)

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

- How will I hash files to know if baked in files have changed?
- How do I know what the baked in files are? This will be different for dev and prod.

- Use inflate-template to expand a template on disk.
  - Need to make it fast!
  - Need to support pre compiled tempates.
  - Need to document the template creation process.

- Need to make my own simple package manager module.
  - NO. Git is perfectly suited for this.
  - Need to be able to grab a package from the internet by URL.
  - Unzip / untar a package.
  - Need to be able to cache a package locally.
  - Is there a package manager I can simply reuse?
    - Is npm included in my node.js-based executable?
  - https://medium.com/@sdboyer/so-you-want-to-write-a-package-manager-4ae9c17d9527


- a simple package manager
    don't have package directory locally
        if don't have zip file
            download zip file from url
              - https://www.npmjs.com/package/nodejs-file-downloader
              - https://www.npmjs.com/package/turbo-downloader
        
        unpack zip file
        - https://npm.io/search/keyword:unzip
        - https://npm.io/package/decompress
    - All I need is Git!!

# Plugins

- doulevo create

    - Python template
    - JS Template


- doulevo up

    - Docker build
      - Python
      - Node.js
      - etc


- doulevo deploy

    - Kubernetes deploy
      - Python
      - Node.js
      - etc