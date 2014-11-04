# Hosting on Google App Engine (GAE)

Deployment to [Google App Engine](https://cloud.google.com/appengine/) is done
using `gcloud` tool.

If you selected 'GAE' as a hosting option, the generator will ask for a Project
ID, which is also how you'll be able to access the published website.

What the generator does when using 'deploy to GAE' option is the following:

1. Creates a `.gcloud/properties` file with the specified Project ID.
2. Copies `app.yaml` from [H5BP GAE server-config](https://github.com/h5bp/server-configs-gae)
   to `app/app.yaml`.
3. Modifies `app/app.yaml` to use correct Project ID, the one you specified.

Whenever you want to publish a new version of the site, 
run `gulp` (the `default` task is to create a new production build), and then
`gulp deploy`.

Behind the scenes, `gulp deploy` executes `gcloud preview app deploy ./dist`.
Once deployed, the website can be accessed from `https://my-project-id.appspot.com`.
Where `my-project-id` is the Project ID you initially specified.

Note that in order to deploy to App Engine, you need to be logged in 
to Google Cloud Platform. If you receive authentication errors during deployment,
make sure to run `gcloud auth login`.

For more details about `gcloud` please refer to 
[gcloud Tool Guide](https://cloud.google.com/sdk/gcloud/).

If you want the website to be also accessible from a custom domain, please
follow [Using a Custom Domain](https://cloud.google.com/appengine/docs/domain)
documentation.
