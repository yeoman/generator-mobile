# Hosting on GitHub Pages

As described on [GitHub Pages docs](https://pages.github.com/) you can host
a static website directly from a GitHub repository.

This is done by pushing content to either `master` branch (for user or 
organization website) or `gh-pages` branch (for a project website).

If you selected 'GitHub' as a hosting option while running the generator,
here's what it would do:

1. Initialize a git repository in the `dist` subdirectory and make
   an empty commit to either `master` or `gh-pages` branch.
2. Add remote git URL pointing to GitHub, where the website will be published to.
3. Optionally create a `CNAME` file in the `app` directory if you're using
   a custom domain, i.e. the website URL is different from `*.github.io`.
4. Initialize a git repository in the root folder, 
   the one you ran `yo mobile` from. Let's call it 'the outer repo'.
5. Add `dist` 'subrepo', created in step 1, to the staging area with 
   `git add dist/`. It is important to include forward slash in the end.
6. Create first commit of the outer repo (in the root folder)
   to the `master` branch.

What happens is git considers `dist` as a regular directory, which allows
you to effectively keep both the development files of the website AND the build 
under versioning control (git), without using `git submodule` or `subtree` plugin.

Whenever you want to publish changes to the website, create a new build with
`gulp` (the `default` task is to create a production build), 
and then `gulp deploy`.

Behind the scenes, `gulp deploy` simply executes `git push` from the `dist`
directory.
