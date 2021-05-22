# Next relesae

- --version
- help command
- Dev guide
- User guide
- Plugin devs guide
- build command
- up command
- down command

# Key idea

- Infrastructure by convention

# Todo

- Could store the docker and kube files in the .doulevo dir. This could be the basis for gitops?

- I'm so close to an actual doulevo tech demo!
- DL video. How to make a template.
  
- The next plugin for Doulevo should be TypeScript!

- Better readme
  - Install / usage guide
  - Developers guides
  - Template authors guide

- Download Docker / Kubectl
  - It's actually going to be pretty hard to run Docker on Windows, it needs WSL2!
  - For the moment Docker can't be bundled.
- Where do plugins and execuables get stored?
  - In the app data directory.
- Need a separate command to set the application.
- How does backend authentication work?
    - Can just reply on Kubectl auth for now.

- How will I hash files to know if baked in files have changed?
  - Can I get a hash from Git for a file or the whole project?
    - Listing 2.8 in gitops book has example of using git to make a version number
  - Ask git if working copy has changed?
  - Probably too inflexible to have the CD pipeine built into the product backend. But I can still use GitOps! Just use the Git container registry!
- How do I know what the baked in files are? This will be different for dev and prod.

- Use inflate-template to expand a template on disk.
  - Need to make it fast!
  - Need to support pre compiled tempates.
  - Need to document the template creation process.

- Could doulevo use something like minikube? Could I run docker build on minikube?
- BuildKit cli could be really useful with a local Kubcluster. Could use this with minikube! Then do away with Docker!!

## To look at

- Stern!
- Argo
- Tekton
- Flux
- Backstage
- Porter: https://porter.sh/ (bundle the application?)
- https://github.com/porter-dev/porter
- BuildKit (build in Kubernetes, maybe don't need to install Docker?) https://github.com/vmware-tanzu/buildkit-cli-for-kubectl
- https://microk8s.io/ (small Kubernetes, could work for local testing)
  - This is too hard.
  - Just going to rely on Docker and WSL2, Docker is needed anyway to build and push!
- Flux https://fluxcd.io/ https://github.com/fluxcd/flux (git ops)
- Keptn https://keptn.sh/ (git ops / cd?)
- https://brigade.sh/
- https://www.telepresence.io/ (could be useful for connecting local services to a cluster)
- https://kudo.dev/ (could make an operator for Doulevo?)
- https://buildpacks.io/ (build any kind of project? could allow me to suport many project types out of the box)

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
- Need a command to open the DL dashboard!
- Could have plugins for doulevo for public docker images like mongo and redis
- Could Doulevo be a package manager for Kubernetes? (could it just build on helm?)