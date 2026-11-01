# k6 Cloud Runner

<div align="center"> 
    <a href="#"><img class="img-no-border" src="/logo.svg" alt="Logo" width="200" style="border:0"></a>
    <h1></h1>
</div>

### Welcome to the backend of K6 Cloud Runner

The only platform that runs, monitors and keeps track of your load testing.

The backend is Fastify based, using Postgres database and implementing authentication with sso.

## Enviorement Params

| Variable Name                | Description                                                                                 | Required / Default Value        |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------- |
| **DATABASE_URL**             | The URL of the postgres database including the username password and cert files (for prod). | **Required**                    |
| **CRYPTO_KEY**               | `AES-256-GCM` compatible encryption key.                                                    | **Required**                    |
| **SSO_PROVIDER_URL**         | The URL of the Single Sign-On (`SSO`).                                                      | **Required**                    |
| **SSO_CLIENT_ID**            | The client ID to use when authenticating with the `SSO` provider.                           | **Required**                    |
| **SSO_CLIENT_SECRET**        | The client secret to use when authenticating with the `SSO` provider.                       | **Required**                    |
| **SSO_REDIRECT_URI**         | The url for the sso callback.                                                               | **Required**                    |
| NODE_ENV                     | either `local` or `prod`.                                                                   | `local`                         |
| APP_NAME                     | The app's name.                                                                             | `k6-cloud-runner`               |
| APP_VERSION                  | The app's version.                                                                          | `local`                         |
| PORT                         | The app's port.                                                                             | 3000                            |
| LOGGER_LEVEL                 | The lowest log level to output.                                                             | info                            |
| CLIENT_HOME_ROUTE            | The url of the frontend.                                                                    | `http://localhost:5173/`        |
| SCRIPTS_ROUTE                | Default scripts directory                                                                   | `src/load_scripts`              |
| BRANCH_NAME                  | Default branch to pull scripts from                                                         | `main`                          |
| PROMETHEUS_URL               | Prometheus url for monitoring scripts.                                                      | `https://prometheus.k6.example.com` |
| TIME_BETWEEN_JOB_CHECKUPS_MS | How long between job's status checks.                                                       | 60000                           |

## Run Locally

```sh
git clone https://github.com/danyakir/k6r-backend.git
cd ./k6-cloud-runner
npm install
```

Add the required environment paramas (go to openshift to check them out).

Download the required prisma engines from [here](https://docs.example.com/k6r/prisma-engines).

Extract the zip and copy the `.prisma-windowns` folder to your node_modules.

run the following commands:

```sh
export PRISMA_QUERY_ENGINE_LIBRARY=node_modules/.prisma-windows/windows/query_engine.dll.node
export PRISMA_SCHEMA_ENGINE_BINARY=node_modules/.prisma-windows/windows/schema-engine.exe
export PRISMA_MIGRATION_ENGINE_BINARY=node_modules/.prisma-windows/windows/migration-engine.exe.gz.sha256

export NODE_TLS_REJECT_UNAUTHORIZED='0'

npx prisma generate

npm run dev
```

## Deploy

The gitlab ci allows you to build and deploy your version into [quay](https://registry.example.com/repository/k6r/k6-cloud-runner).

If you run the pipeline without adding a `APP_VERSION` variable it's version and image tag will be the last prod version with the pipeline ID in the format of `1.0.0-dev-2611113`, this format is meant for nonprod images.
When a version is sealed add your wanted `APP_VERSION`.

After deploying image to quay move the wanted tag (`np` or `prod`) and delete the running pod in openshift.

To see and edit deployments configuration go to our [helm charts](https://github.com/danyakir/k6r-helm-charts)

## Roadmap

Go to the list [here](https://docs.example.com/k6r/roadmap)

## Visuals

Go to the list [here](https://docs.example.com/k6r/visuals)

## Contributing

Made by **Dan Yakir**
