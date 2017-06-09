# PayPal / Amazon Pay IPN listener with Node Express / Firebase / Heroku / React
---
### This is an example repo for deploying an express server to Heroku to serve as a listener for IPN messages from PayPal or Amazon Pay, and send a follow-up email to your customers upon successful purchase. It also logs purchases to a firebase database, and provides a basic front end for viewing transaction history (authenticated via Firebase Authentication using the Google account sign-in-method).

The primary components of the backend system are:
* [Node Express](https://expressjs.com/)
* [Firebase database](https://firebase.google.com/)
* [Heroku](https://heroku.com/)
* [Postmark](https://postmarkapp.com/) *and/or* [Amazon SES](https://aws.amazon.com/documentation/ses/) for outbound email (both implemented in this project)

Also, a no-frills front end set up to display transaction history has been included, using:
* [Create React App](https://github.com/facebookincubator/create-react-app)
* [Firebase authentication](https://firebase.google.com/docs/auth/)

***Caveat***: unless you already have an outgoing email solution in place, whether you use Amazon SES, or Postmark for your outbound email, there is an account verification period prior to being able to send e-mails anywhere other than your confirmed test email. It should range no more than 2-3 days.

## PAS sign-ups
* Heroku
  * Create new account, if needed.
  * Create New App at https://dashboard.heroku.com/apps
  * Deployment guidelines listed below.
* Firebase
  * Add project at https://console.firebase.google.com
  * Further instructions listed below.
* (Postmark, or Amazon SES can be replaced if you already have an outgoing email service, but that will require additional configuration within the repo. NOTE: **you do not need Postmark *and* Amazon SES, but hooks are provided for both, so you can decide which one you want to sign up for and configure**)
* Postmark
  * Sign up at: https://postmarkapp.com
* Amazon SES
  * Sign up at: https://aws.amazon.com/ses

## Local Install
* Clone repo locally
* `cd` into repo folder
* `npm install` (installs project dependencies)

## Configure .env files
Added to `.gitignore`, the .env file allows you to save and access your environmental variables locally, via `process.env`, without committing them to source code. The environmental variables will be added to your heroku server via cli, or web ui.

First: `$ npm run setup` inside project repo (initializes .env file).

Then fill in .env entries (values should be inside quotation marks, as in `SAMPLE_KEY='sample-value'`)

> ### *You will have to upload the same key:value pairs to your Heroku instance, which can be done via the ui or the cli.
> #### Cli example: `$ heroku config:set 'POSTMARK_API_TOKEN=1a2-b3c-4d5-e6f'`

* postmark email client
 * `POSTMARK_API_TOKEN`, available at https://account.postmarkapp.com/servers/[your-server-number]/credentials
* aws ses settings. Not wanting to wade through Amazon AWS? You can avoid using Amazon SES by using only Postmark to send your transactional emails. I've included hooks for sending email from either in the repo, but AWS is set up as the default.
 * `AWS_ACCESS_KEY_ID`, is created via the IAM service in Amazon AWS. The complete details are beyond the scope of this README. The short story is that I recommend you create a user with "AmazonSESFullAccess" privileges, and generate a key for this user. Enter the "Access key ID" here.
 * `AWS_SECRET_ACCESS_KEY`, will be generated along with the access key above.
 * `AWS_REGION`, available from the SES console under `Identity Management > Domains > Identity ARN: arn:aws:ses:**HERE**:1234567890:identity/yourdomain.com`. Example: `us-west-2` for US West(Oregon)

* amazon pay settings, available from https://sellercentral.amazon.com/hz/me/integration/details (url may change), or `Amazon Pay > Integration > MWS Access Key`
  * `amz_merchant_id`, listed as Seller ID
  * `amz_access_key`, listed as Access Key ID
  * `amz_client_id`, listed as "Login with Amazon Account Information", Client ID
  * `amz_secret_key`, listed as Secret Access Key

* firebase service account settings, available by making new service account credentials at `firebase > settings(gear icon) > Project settings > SERVICE ACCOUNTS > GENERATE NEW PRIVATE KEY > GENERATE KEY` ...outputs a .json file with a name similar to `your-project-name-firebase-adminsdk-abdc-123456c.json`, from which you get the following:
  * `FIREBASE_TYPE`, from "type"
  * `FIREBASE_PROJECT_ID`, from "project_id"
  * `FIREBASE_PRIVATE_KEY_ID`, from "private_key_id"
  * `FIREBASE_PRIVATE_KEY`, from "private_key"
  * `FIREBASE_CLIENT_EMAIL`, from "client_email"
  * `FIREBASE_CLIENT_ID`, from "client_id"
  * `FIREBASE_DATABASE_URL`, from your firebase project ui: `settings > SERVICE ACCOUNTS` equal to https://[your-project-name].firebaseio.com

## Configure constants

* Update `const config` in `src/shared/constants.js`with the following:
  * navigate to `https://console.firebase.google.com/u/0/project/[your-project-name]/overview`
  * click `Add Firebase to your web app`.
  * copy the `config` object to the `constants.js` file.
  * fill in your `defaultFromEmail` and `defaultToEmail`

* Update `src/server/routes/ipn/ipn.js`
  * `CUSTOMER_SUBJECT`: the subject of an email sent to your customer in the case of a successful transaction.
  * `SUBJECT_FAIL`: the subject of an email sent to you in the case that something fails during order processing
  * `IPN_RECEIVED_SUCCESS`: the subject of an email sent to you with the ipn data received from PayPal
  * `IPN_RECEIVED_SUCCESS_AMAZON`: the subject of an email sent to you with the ipn data received from Amazon Pay
  * `SAMPLE_PAYPAL_PRODUCT`: the string to search for in a successful PayPal IPN notification to determine if your customer should get a success email. (After you enable IPN, your server will be pinged after every PayPal transaction, including those unrelated to your specific products)
  * `SAMPLE_AMAZON_PRODUCT`: the string to search for in a successful Amazon Pay IPN notification to determine if your customer should get a success email.

## Run locally
* `npm run server` runs the express server, which serves the latest production bundle of the client, located in `build/`
* If you make changes to the client code, output a new production bundle with `npm run build`
* If you want the express server to auto-reload on changes:
  * `npm install -g nodemon`
  * `npm run watch`
* In a separate terminal window:
  * `npm start` will start the webpack dev server, which is helpful if you are making client changes, as you will be able to observe results without reloading the browser. If your client development work requires express routes to be handled, just make sure that the server is running in a separate terminal process, and requests to the server will be proxied via the `"proxy": "http://localhost:8000"
` entry in the package.json file.

## Authentication for client UI database browser
* Under Firebase > Authentication > SIGN-IN-METHOD:
  * Enable Google
  * Authorized Domains: add "<your-site-name>.heroku.com"
* Log in with client UI with the gmail account you want to enable for being able to browse the database contents via the UI.
* Under Firebase > Authentication > USERS:
  * take note of the "User UID" of the user you wish to authenticate
* Under Firebase > Database > Rules:
  * replace default rules with:
  
```json
{
  "rules": {
    ".read": "auth != null && auth.uid === 'user-uid-you-wish-to-authenticate'",
    ".write": "auth != null",
    
    "purchases": {
      ".indexOn": ["unix_timestamp"]
    }
  }
}
```

## Deploy to Heroku
* Download and install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-command-line).
* `$ heroku login`
* create new project on heroku
* There are a couple deployment methods I will mention (they are set up via the heroku ui, under the deployment tab, after you create your new project):
  * Heroku Git:
    * `$ git remote add heroku	https://git.heroku.com/[your-heroku-project-name].git`
    * `$ git push origin heroku`
  * Track Github repo:
    * Fork this project, or push this cloned repository to a new github repo, and on the heroku ui, select the deployment option of tracking the master (or other) branch of a specified github repository.
  * there is also a Dropbox option, which I have not yet personally used.

## Testing (after deploying to Heroku)
* The [PayPal IPN simulator](https://developer.paypal.com/developer/ipnSimulator/) will send IPN notifications to a designated endpoint. You can use it to ping your deployed server at the PayPal IPN end point of your choice. The default PayPal IPN endpoint for this project is `https://[your-app-name].herokuapp.com/api/ipn/paypal`
* If you don't already have an Amazon Pay account, you can sign up for one here: https://pay.amazon.com
* There are separate Amazon Pay production and sandbox views. This project's default endpoint for the Amazon sandbox IPN test is: `https://[your-app-name].herokuapp.com/api/ipn/amazon/sandbox` and the Amazon production IPN endpoint, per this project's default settings is: `https://[your-app-name].herokuapp.com/api/ipn/amazon`
* You will have to create an Amazon sandbox account, which compared to many things in the AWS universe, is *relatively* easy.
* For sandbox testing of making a purchase from an Amazon buy-it-now-button, you also create buttons in the Amazon Pay sandbox view.
---
### That's it!!
#### Simple!
##### (just kidding)
