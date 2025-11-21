<div id="top-header" style="with:100%;height:auto;text-align:right;">
    <img src="./public/files/pr-banner-long.png">
</div>

![Project:Status](https://img.shields.io/badge/status-in%20development%20/%20built%2060%-orange?style=for-the-badge)

# SOCIAL FEED - NODEJS / NESTJS - PRISMA

This repository contains a basic example of a RESTful API service built with **NestJS / Prisma**, intended for research purposes and as a demonstration of my developer profile. It implements the core features of a minimal, custom social feed application and serves as a reference project for learning, experimentation, or as a back-end development code sample.
<br><br>


## Stack

- NodeJS 22
- NestJS 11
- Prisma 6.19
- Postgre 16.4
- MailHog 1.0
- RabbitMQ 2.4 *(only available for pro version)*
<br><br>


## Usage

The documentation is oriented to use platform repository: [Platform Nginx Nodejs-22 Postgres-16.4](https://github.com/pabloripoll/docker-platform-nginx-nodejs-22-pgsql-16.4) - Follow its documentation to set the required platforms to continue with this repository

On this project, before start copy `./.env.example` to `./.env` and configure it.

Configure the supervisord service on the Platform Repository at `/platform/nginx-nodejs-22/docker/config/supervisord/config.d/`
```bash
[program:nodejs] # service name can be customized [program:nestjs]
command=npx nest start --watch
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
autorestart=false
startretries=0
```

Then, access into the container to install required NodeJS packages
```bash
$ make apirest-ssh
```

Install project NodeJS packages with NPM
```bash
/var/www $ npm install
/var/www $ npx prisma generate
/var/www $ sudo supervisorctl restart nodejs
```

In case of needing start Nest manually
```bash
/var/www $ sudo supervisorctl stop nodejs
/var/www $ npx nest start --watch
```

Sometimes IDEs need to restart typescript server:

- VSCode `CTRL + SHIFT + P` then type: `restart TS Server`
<br><br>

## Migrations

Set .env file and the generate schema.prisma
```bash
$ npx prisma generate
```

Prisma directory structure
```
.
├── prisma
│   ├── migrations
│   │   ├── 20251001192103_create_users_table
│   │   │   └── migration.sql
│   │   ├── 20251001192254_create_...
│   │   │   └── migration.sql
│   │   .
│   │
│   └── schema.prisma
.
```

Migrate tables insto database service container
```bash
/var/www $ npx prisma migrate deploy
```

Get database schema
```bash
/var/www $ npx prisma db pull --print > prisma/schema.prisma.preview
```

Review the schema and copy to `./prisma/schema.prisma`

### Seeding

```bash
/var/www $ npx ts-node prisma/seed.ts
Starting seeds...
Seeding geo continents and regions...
  processed continent: Europe (4 regions)
  processed continent: Africa (5 regions)
  processed continent: Americas (4 regions)
  processed continent: Asia (5 regions)
  processed continent: Oceania (4 regions)
Geo seeding complete.
Geo seed complete.
```
<br><br>

## Directories Structure Design

Mixed between **Feature-Based Modular Structure** *(Vertical Slice)* and **Hexagonal Architecture** *(Ports & Adapters / Clean Architecture)*

HTTP routes/controllers in a separate package like com.restapi.http (outside com.restapi.domain) is a fine and common approach (it’s what hexagonal/ports-and-adapters and typical layered DDD recommend). Keep domain types and rules inside domain packages and make the http package an adapter (only depends on application/use-case services, not the domain implementation internals).

Suggested project layout (feature + layer separation)
```bash
.
├── dist
├── generated
├── node_modules
│   ├── migrations
│   │   ├── 20251001192103_create_users_table
│   │   │   └── migration.sql
│   │   ├── 20251001192254_create_...
│   │   │   └── migration.sql
│   │   .
│   │
│   └── schema.prisma
├── scripts
│   └── create-migrations.sh
├── src
│   ├── domain
│   │   ├── user
│   │   │   └── ...
│   │   ├── member
│   │   │   └── ...
│   │   .
│   ├── features
│   │   ├── auth
│   │   ├── utils
│   │   .
│   ├── app.controller.ts
│   ├── app.module.ts
│   └── main.ts
.
```

### Why this approach?

- Single direction of dependencies: http -> application(use-cases) -> domain -> infrastructure (adapters).
- The http package stays an adapter: it only translates HTTP to DTOs and calls use-cases. It should not contain business rules or domain entities.
- Easier testing: controllers can be unit tested by mocking services; domain logic can be tested in isolation.
- Clear separation for teams: backend devs working on domain vs API wiring are separated.

### Patterns and rules to follow

- Controllers/Routes should accept/return DTOs (do not expose domain entities directly).
- Controllers depend on application/use-case interfaces (not on repositories).
- Keep mapping logic (DTO <-> domain) in a mapper class or in the application layer.
- Validation: validate incoming DTOs at the boundary (HTTP) using validators (e.g., javax validation).
- Error handling: a global exception handler maps domain exceptions to HTTP responses.
- Security: implement authentication/authorization as middleware/filters in http or infrastructure layer, not in domain.
- Versioning: put /v1/ in route paths or package names if you plan public versioning.
- Avoid CREATE TABLE IF EXISTS style workarounds for schema drift — keep DB migrations authoritative.
<br><br>

## Contributing

Contributions are very welcome! Please open issues or submit PRs for improvements, new features, or bug fixes.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'feat: Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Create a new Pull Request
<br><br>

## More in development:

![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)
<br>

## License

This project is open-sourced under the [MIT license](LICENSE).

<!-- FOOTER -->
<br>

---

<br>

- [GO TOP ⮙](#top-header)

<div style="with:100%;height:auto;text-align:right;">
    <img src="./public/files/pr-banner-long.png">
</div>