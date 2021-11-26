# Who's got my shoe? Serverless App

Don't you just hate it when you borrowed someone something, and they never returned it? 
You can track down those borrowers with a handy app that logs what item you lent to who. 
If you are more the Passive Agressive type, you can send the borrower an strongly worded email 
to remind them of the item they borrowed and also to inform them of the unwritten but sacred rules 
of informal borrowing. 

## Application Functions

- [x] **User Authentication**
- [x] **Create, update, delete(return) borrowed items.**
- [x] **Upload a file of the Borrowed Item**
- [x] **Displays Borrowed Items for a logged in user.**
- [x] **Sends Email to borrower[NOT FUNCTIONAL]**


### Frontend

The `client` folder contains a web application that can use the API developed in the project.
This frontend works with the serverless application.

### Backend
The `backend` folder contains a serverless application that uses the [serverless framework](https://github.com/serverless)


#### Authentication
Authentication in this application, is done through [Auth0](https://auth0.com/), Which uses asymmetrically encrypted JWT tokens.

- https://auth0.com/blog/navigating-rs256-and-jwks/


## Usage

### The Backend

#### Development

In order to run local developments, the following packages are needed:
- [serverless](https://github.com/serverless/serverless)


**Dependency Installation**

The Serverless Framework will need us to configure access to AWS. This can be accomplished by running

`serverless config credentials --provider aws --key KEY --secret SECRET`

>Where KEY and SECRET are our AWS Key and secret key. We are not deploying to AWS, but the serverless plugin needs this configuration to exist in order to work correctly.

```bash
npm install -g serverless
```

#### Deployment

To deploy an application run the following commands:

```bash
cd backend
npm install
serverless deploy -v
```

### The Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```bash
cd client
npm install
npm run start
```


This should start a development server with the React application that will interact with the serverless application.

## Best practices applied


- All resources in the application are defined in the serverless.yml file.
- Each function has its own set of permissions.
- Application has sufficient monitoring.
- HTTP requests are validated.

