<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Architecture Choice

- With reference to clean architecture, NestJS as a fundamentally modular framework stands out to enable separation of concern. This is chosen for adaption of SOLID principle including SRP and DIP for better scale in large project

- It can be troublesome and seems redundant in small scale project hence this is only a showcase of what I can achieved and should be designed with MVC instead if the project scale stay this small

- Clean Architecture aims for 4 different section including Presentation, Infrastructure, Application & Domain. While the separation of these layers are not explicitly stated, it will be classified in the next section.

- In addition to that, I implemented CQRS pattern for further separation of concern and atomicity for each request. (Split into Commands/Queries)

- User-related entities and interface are put under shared instead of user itself to prevent circular dependency

- This architecture is preferred for large scale project as it is easy to test and debug thanks to its Dependency Injection (DIP) nature. Also, by enforcing CQRS we implying Single Responsibility Principle (SRP) to minimise coupling. The strict dependency flow ensure the code will not become tightly coupled and will remain maintainable as the system grows in complexity.

## Architecture Layer
I did some modification to the original Clean Architecture. Instead of forming a general layer, they are divided into modules and each module have their own (up to 4) layers that adhere to Clean Architecture.

1. Presentation Layer (Api) - *.controller.ts 
(Entry point for external API request, doesn't know the detail but know who to delegate the task with and the results)

2. Application Layer - *.command.ts || *.query.ts || *.handler.ts
(Define business logic, use ICommandHandler and IRepository, but the technical details of how data is stored/retrieved is abstracted away)
**Also there are Command & Query which act as DTO for now that defines the contract of what should be input and outputted**

3. Infrastructure Layer - *.respository.ts || .service.ts
(Implement the interfaces defined by Domain Layer, acts as adapter to the external tool and framework)

4. Domain Layer - *.entity.ts || *.interface.ts
(Defines what operations it needs on its entities.)

**There are warnings of controller referencing error in domain layer, which in this case is perfectly fine since ErrorType is straightforward and cannot be indirectly reference to through Application Layer. It doesn't violate Clean Architecture too as it only discourage dependency from inner layer to outer layer.**

Please reference to *dependency-graph.svg* to have a brief idea of how this is constructed.

## Design Rationale
Security is the priority when constructing this backend and I have put most of the time into it. Excluding the login and createUser endpoint which requires public access, all of the other endpoint requires some sort of authentication (which means it is safely guarded).

All of the password and dynamic code stored will be handled by bcrypt to hash and salt it, so that database will never store explicit password to increase safety.

Between the process of login by password and double verification of dynamic code, user haven't officially authenticated but the endpoint should not be publicly accessed to prevent dynamic code brute-forcing from unknown identity. Hence I introduced a preAuthToken which will be passed along from the response after successful login by password. Only user with the given preAuthToken can access to dynamic code submission endpoint.

For the verification, since it is signed by user id and user name, as long as JWT_SECRET doesn't leak it would be fine. The expiration of this token is set to 1 hours and JWT will acknowledge expired token as invalid token. Within this 1 hour, user will not need to login again as login() function will check if session is still valid first.

## Tech Stack

- NestJS as framework
- Typescript as Language
- Prisma as ORM
- SQLite as Database

## Current Alternative Solution

- use a fixed 32 bytes random generated hexadecimal secret key instead of public key and private key in .key file format

- Uniqueness is enforced in nearly all details in User for now. If there were enough time, I would transition out the uniqueness of username and phone number and replace it with composite primary key (id)

- I have merged the idea of Dtos and commands into one for now. Technically Dtos is the main focus of the decorator while commands just accpet input of different Dto types.

## Project setup

```bash
$ npm install
```

Remember to attach the .env file
Run 
```bash
$ npx depcruise src --config .dependency-cruiser.js
```
to check the dependency violation throughout the codebase

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
