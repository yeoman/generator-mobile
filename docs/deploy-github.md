# Hosting on GitHub Pages

As described on [GitHub Pages docs](https://pages.github.com/) you can host
a static website directly from a GitHub repository.

This is done by pushing content to either `master` branch (for user or 
organization website) or `gh-pages` branch (for a project website).

If you selected 'GitHub' as a hosting option while running the generator,
here's what it will do:

1. Initialize a git repository in the `dist` subdirectory and make
   an empty commit to either `master` or `gh-pages` branch.
2. Add remote git URL pointing to GitHub, where the website will be published to.
3. Optionally create a `CNAME` file in the `app` directory if you're using
   a custom domain, i.e. the website URL is different from `*.github.io`.
4. Initialize a git repository in the root folder, 
   the one you ran `yo mobile` from. Let's call it 'the outer repo'.

Note that [.gitignore](https://github.com/google/web-starter-kit/blob/master/.gitignore)
of the Web Starter Kit already contains `dist` directory. This allows you
to keep development files and production builds in separate repositories.

Whenever you want to publish changes to the website, simply run `gulp deploy`.

Behind the scenes, `gulp deploy` executes `git push -u origin <branch>`
from the `dist` directory, where `<branch>` is either master or gh-pages.
