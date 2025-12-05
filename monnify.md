Injected by React
Get Started
The Monnify API provides extensive access to the features available on our dashboard, enabling you to leverage them for your own application.

Create a Monnify account on https://www.monnify.com
Obtain the required API keys on the developers section of the dashboard
Please note that the Monnify API is secured through Basic Authentication or OAuth (Bearer Tokens).
Public Test Credentials
- APIKEY: MK_TEST_GC3B8XG2XX
- Secret Key: A663NRZA544DDPEM7KDN7Z8HRV6YXD8S
- Contract Code: 5867418298

Server
Server:https://sandbox.monnify.com
Sandbox


Authentication
Optional

SelectAuth Type
No authentication selected
Client Libraries

Axios
Axios Node.js
​#Copy link
This collection enables merchants to authenticate their keys for requests to the Monnify API

AuthenticationOperations
POST
/api/v1/auth/login
Show More
​#Copy link
This collection enables merchants to initiate and confirm status of transactions on the Monnify

TransactionsOperations
POST
/api/v1/merchant/transactions/init-transaction
POST
/api/v1/merchant/bank-transfer/init-payment
POST
/api/v1/merchant/cards/charge
POST
/api/v1/merchant/cards/otp/authorize
POST
/api/v1/sdk/cards/secure-3d/authorize
GET
/api/v1/transactions/search
GET
/api/v2/transactions/{transactionReference}
GET
/api/v2/merchant/transactions/query
Show More
​#Copy link
This collection enables merchants to perform all disbursement operations on the Monnify API

Please note that the usage of the TRANSFER API is only available for merchants who meet the regulatory requirements for it. Kindly contact sales@monnify.com to get access to this feature.
Transfers (Disbursement)Operations
POST
/api/v2/disbursements/single
POST
/api/v2/disbursements/batch
POST
/api/v2/disbursements/single/validate-otp
POST
/api/v2/disbursements/batch/validate-otp
POST
/api/v2/disbursements/single/resend-otp
GET
/api/v2/disbursements/single/summary
GET
/api/v2/disbursements/single/transactions
GET
/api/v2/disbursements/bulk/transactions
GET
/api/v2/disbursements/bulk/batchreference--12934/transactions
GET
/api/v2/disbursements/search-transactions
GET
/api/v2/disbursements/wallet-balance
Show More
​#Copy link
This collection enables merchants to create and manage reserved accounts for their customers

Customer Reserved AccountOperations
POST
/api/v2/bank-transfer/reserved-accounts
POST
/api/v1/bank-transfer/reserved-accounts
GET
/api/v2/bank-transfer/reserved-accounts/{accountReference}
PUT
/api/v1/bank-transfer/reserved-accounts/add-linked-accounts/{accountReference}
PUT
/api/v1/bank-transfer/reserved-accounts/update-customer-bvn/{reservedAccountReference}
PUT
/api/v1/bank-transfer/reserved-accounts/update-payment-source-filter/{accountReference}
PUT
/api/v1/bank-transfer/reserved-accounts/update-income-split-config/{accountReference}
DELETE
/api/v1/bank-transfer/reserved-accounts/reference/{accountReference}
GET
/api/v1/bank-transfer/reserved-accounts/transactions
PUT
/api/v1/bank-transfer/reserved-accounts/{accountReference}/kyc-info
Show More
​#Copy link
This collection enables merchants to create and manage direct debit mandates for their customers

Direct DebitOperations
POST
/api/v1/direct-debit/mandate/create
GET
/api/v1/direct-debit/mandate/
POST
/api/v1/direct-debit/mandate/debit
GET
/api/v1/direct-debit/mandate/debit-status
PATCH
/api/v1/direct-debit/mandate/cancel-mandate/{mandateCode}
Show More
​#Copy link
This collection enables merchants to create and manage invoices for their customers

InvoiceOperations
POST
/api/v1/invoice/create
GET
/api/v1/invoice/{invoiceReference}/details
GET
/api/v1/invoice/all
DELETE
/api/v1/invoice/{invoiceReference}/cancel
Show More
​#Copy link
This collection enables merchants to create and manage recurring payments for their customers

Recurring PaymentOperations
POST
/api/v1/merchant/cards/charge-card-token
Show More
​#Copy link
This collection enables merchants to create and manage sub accounts on an integration.

Please note that usage of this API category in live environment requires approval from your relationship manager, kindly reach out to them or contact sales@monnify.com to get approval for this feature.
Sub AccountsOperations
POST
/api/v1/sub-accounts
GET
/api/v1/sub-accounts
PUT
/api/v1/sub-accounts
DELETE
/api/v1/sub-accounts/{subAccountCode}
Show More
​#Copy link
This collection enables merchants to create and manage limit profiles for their customers

Limit ProfileOperations
POST
/api/v1/limit-profile/
GET
/api/v1/limit-profile/
PUT
/api/v1/limit-profile/FSYVVWU8UPBD
POST
/api/v1/bank-transfer/reserved-accounts/limit
PUT
/api/v1/bank-transfer/reserved-accounts/limit
Show More
​#Copy link
This collection enables merchants to Initiate and manage refunds for their customers

RefundOperations
POST
/api/v1/refunds/initiate-refund
GET
/api/v1/refunds/202100op3456
GET
/api/v1/refunds
Show More
​#Copy link
This collection enables merchants to view and manage settlements on their integration

SettlementsOperations
GET
/api/v1/transactions/find-by-settlement-reference
GET
/api/v1/settlement-detail
​#Copy link
This endpoint returns all transactions that made up a settlement.

Query Parameters
reference
Type:string
required
Example
The settlement reference

page
Type:string
Example
The current page of the record

size
Type:string
Example
The number of transactions per page

Headers
Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful transaction retrieval by settlement reference

application/json

404
Not Found

application/json
Request Example for
GET
/api/v1/transactions/find-by-settlement-reference
Selected HTTP client:Node.js Axios

Axios
Copy content
const axios = require('axios').default;

const options = {
  method: 'GET',
  url: 'https://sandbox.monnify.com/api/v1/transactions/find-by-settlement-reference',
  headers: {Authorization: 'Bearer <token>'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}

Test Request
(get /api/v1/transactions/find-by-settlement-reference)
Status:200
Status:404
Copy content
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "content": [
      {
        "transactionReference": "MNFY|28|20220718162222|066201",
        "paymentReference": "1658157741945",
        "amountPaid": "20.32",
        "totalPayable": "20.32",
        "settlementAmount": "20.00",
        "paidOn": "18/07/2022 04:23:55 PM",
        "paymentStatus": "PAID",
        "paymentDescription": "lets pay",
        "transactionHash": "218523babb5416ed29477d618c315f458d6a7e881edf9d7a7cfb5fa7a61a16857f80cb1a795ee07cdfd92f9502970cb71d59c4b21017952feacff99f17cbdb92",
        "currency": "NGN",
        "paymentMethod": "CARD",
        "product": {
          "type": "WEB_SDK",
          "reference": "1658157741945"
        },
        "cardDetails": {
          "cardType": "MasterCard",
          "last4": "9098",
          "expMonth": "07",
          "expYear": "23",
          "bin": "539941",
          "bankCode": "057",
          "bankName": "Zenith bank",
          "reusable": true,
          "countryCode": null,
          "cardToken": "MNFY_1B4B8224C4A847DE847B094AB7B979F9",
          "...": "[Additional Properties Truncated]"
        },
        "accountDetails": null,
        "accountPayments": [
          {}
        ],
        "customer": {
          "email": "test@teamapt.com",
          "name": "Marvelous Benji"
        },
        "metaData": {
          "name": "Damilare",
          "age": "45"
        }
      }
    ],
    "pageable": null,
    "last": true,
    "totalElements": 4,
    "totalPages": 1,
    "sort": null,
    "first": true,
    "numberOfElements": 4,
    "size": 20,
    "number": 0,
    "empty": false
  }
}
Successful transaction retrieval by settlement reference

​#Copy link
This endpoint returns settlement information on transactions made to your settlement account.

Query Parameters
transactionReference
Type:string
required
Example
The Monnify transaction reference of the desired transaction

Headers
Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful response

application/json

404
Not Found

application/json
Request Example for
GET
/api/v1/settlement-detail
Selected HTTP client:Node.js Axios

Axios
Copy content
const axios = require('axios').default;

const options = {
  method: 'GET',
  url: 'https://sandbox.monnify.com/api/v1/settlement-detail',
  headers: {Authorization: 'Bearer <token>'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}

Test Request
(get /api/v1/settlement-detail)
Status:200
Status:404
null
Successful response

​#Copy link
This collection enables merchants to verify the identifies of their customers

Please note that API category can only be used in Live environment. The sample responses here mirrors the expected response from the API and can be used to setup workflows in your application.
Verification APIsOperations
GET
/api/v1/disbursements/account/validate
POST
/api/v1/vas/bvn-details-match
POST
/api/v1/vas/bvn-account-match
POST
/api/v1/vas/nin-details
Show More
​#Copy link
API for integrating with the Bills Payment service. This documentation provides a detailed overview of the available endpoints, including examples for requests and responses.

By default this is not active for all Monnify Merchants, to activate, kindly reach out to integration-support@monnify.com via email, and it’ll be activated for you.
Bills Payment APIsOperations
GET
/api/v1/vas/bills-payment/biller-categories
GET
/api/v1/vas/bills-payment/billers
GET
/api/v1/vas/bills-payment/biller-products
POST
/api/v1/vas/bills-payment/vend
GET
/api/v1/vas/bills-payment/requery
POST
/api/v1/vas/bills-payment/validate-customer
Show More
​#Copy link
This collection contains endpoints for other miscellaneous operations on the Monnify platform

OthersOperations
GET
/api/v1/banks
GET
/api/v1/sdk/transactions/banks
Show More
​#Copy link
This collection enables merchants create and manage subwallets for their customers

Please note that usage of this API category in live environment requires approval from your relationship manager, kindly reach out to them or contact sales@monnify.com to get approval for this feature.
WalletOperations
POST
/api/v1/disbursements/wallet
GET
/api/v1/disbursements/wallet
GET
/api/v1/disbursements/wallet/balance
GET
/api/v1/disbursements/wallet/transactions
Show More
​#Copy link
This collection enables merchants to create and manage PayCodes for their customers

Paycode APIOperations
POST
/api/v1/paycode
GET
/api/v1/paycode
GET
/api/v1/paycode/{paycodeReference}
DELETE
/api/v1/paycode/{paycodeReference}
GET
/api/v1/paycode/{paycodeReference}/authorize
Show More



Transaction Splitting / Sub Accounts
Transaction splitting is a feature on Monnify that allows you to create subaccounts so payments could be split across different accounts. This simply means that for a single transaction, Monnify can help you share the amount paid between up to five different accounts.

This means you can specify what percentage of incoming payments should go into your default settlement account and what percentage of payments should also go into the sub-account you’ve created. You can create sub-accounts by integrating with the Monnify Create Sub-Account Endpoint


You can do the following to a sub-account once it has been created:

Delete a Sub-Account Endpoint you no longer need
Get the Sub-Accounts created
Update the details of a Sub-Account

Attaching Subaccounts to other payment API
To attach a subaccount to a payment request, simply append the subAccountCodeincomeSplitConfig object to the request parameter as shown below;

Copy
"incomeSplitConfig": [
  	{
  		"subAccountCode": {{SubaccountCode}},
  		"feePercentage": {{fee in percent}},
  		"splitPercentage": {{split in percent}},
  		"feeBearer": {{true or false}}
  	}
  ]
You can see sample usage example on the Reserved Account API section.

Creating a Sub Account on Monnify UI
Please send an email to integration-support@monnify.comto have the Sub Account UI enabled for you. Once enabled, you will see the Sub Account Tab under your Collections menu.



To Create a Sub Account, click on Create New and fill in the necessary details


Rate this page
How would you rate your experience?

★
★
★
★
★


Settlements
Settlement is the process of Monnify crediting your wallet or bank account for payments received on your behalf (payments made by your customers). At settlement time, all payments received from your customers are made available to you by crediting your wallet on Monnify and optionally moving the funds to your external bank account.

Settlement Time and How It Works
The Settlement Cycle describes the frequency of settlement, i.e how often a beneficiary is credited for payments received on her behalf.


There are two types of settlement cycles.


Instant - Each transaction received is settled to the beneficiary individually immediately after the payment is received.
Bulk Settlement - Transactions are settled to the beneficiary in bulk at the agreed settlement time (or settlement cycle.)


Default Settlement Cycles for Monnify Merchants
Payment Method	Settlement Cycle
Account Transfer	10 PM same day
Card	10 PM next working day
USSD	10 PM next working day
Phone Number	10 PM next working day


How It Works
A transaction is performed on Monnify by your customers.
Internal postings required for the transaction to be settled to merchant is done. Time of this internal posting is dependent on the settlement trigger of the payment provider powering the payment method.
At merchant’s settlement time, if internal posting required on transaction has been completed, funds are moved from settlement payable account to merchant’s wallet account number.
If merchant has external sweep enabled, funds are moved to merchant’s bank account via Atlas.

Settlement Retrieval API
You can get information about any settlement done on your behalf by Monnify. You can get information about a settlement either by using settlement reference or transaction reference. For more details on implementation, check Get Transactions By Settlement Reference API and Get Settlement Information For Transaction.


Settlement Webhook
The Settlement webhook notifies merchants via API whenever settlement has been successfully made to his settlement destination(Wallet or Bank Account). Sample payload format for the settlement notification and hash calculation is found in the Webhook section.

Rate this page
How would you rate your experience?

★
★
★
★
★
On this page
Settlements
Settlement Time and How It Works
Default Settlement Cycles for Monnify Merchants
How It Works
Settlement Retrieval API
Settlement Webhook
Rate this page
On this page
Got Questions
Monnify Tutorial Videos
Join Our Slack Community

get info
Got Questions
Reach out to us at support@monnify.com if you have any questions as regards integrating with the Monnify API.
youtube
Monnify Tutorial Videos
Check out Our Youtube channel for tutorials on how to integrate the Monnify API.
slack
Join Our Slack Community
Click here to join the Monnify Slack community.
Copyright © 2025 Monnify





Home
Monnify Collections
Recurring Payments (Card Tokenization)
Recurring Payments (Card Tokenization)
Recurring Payments is a feature on Monnify that allows you to debit a customer’s card automatically, without requiring any form of authorization. Below is a flow for a regular card transaction:

Recurring Payments
With Card Tokenization, you would be able to debit a customer’s card without requiring any input from the customer. This allows you to set up an automated system to debit your customer’s cards.


How Card Tokenization Works
The first transaction requiring customer authorization is done from your web or mobile application
You get a token linked to the card.
Save the card token.
Charge the card using the saved token.

Charge the customer’s card from your web or mobile application.
When a customer initiates a card transaction on either your web or mobile application and provides their card details, you charge their card for that initial payment to confirm the validity of the card.


Get Card Token
Once the first card transaction is successful, you get a card token by performing a re-query on the transaction using the Get Transaction Status API. When a GET request is made to the endpoint, you'd get a response with a cardDetails object in the request body, which has the cardToken field, which holds the card’s token.


Sample response from the Get Transaction Status
response.json
Expand
Copy
{
"requestSuccessful": true,
"responseMessage": "success",
"responseCode": "0",
"responseBody": {
  "transactionReference": "MNFY|85|20220121154916|000006",
  "paymentReference": "1642776556694",
  "amountPaid": "30.00",
  "totalPayable": "30.00",
  "settlementAmount": "20.00",
  "paidOn": "21/01/2022 03:49:28 PM",
  "paymentStatus": "PAID",
  "paymentDescription": "Paying for Product A",
  "currency": "NGN",
  "paymentMethod": "CARD",
  "product": {
    "type": "WEB_SDK",
    "reference": "1642776556694"
  },
  "cardDetails": {
    "cardType": "MC Scheme",
    "last4": "1608",
    "expMonth": "08",
    "expYear": "24",
    "bin": "469667",
    "bankCode": "044",
    "bankName": "Access bank",
    "reusable": true,
    "countryCode": null,
    "cardToken": "MNFY_8BA4740A8ED449E7BE404335977193AC",
    "supportsTokenization": true
  },
  "accountDetails": null,
  "accountPayments": [],
  "customer": {
    "email": "smekiluwa@teamapt.com",
    "name": "Smart Mekiliuwa"
  },
  "metaData": {
    "deviceType": "mobile",
    "ipAddress": "127.0.0.1"
  }
}
}

Store Card Token
Once you have gotten the token for the transaction, you store the token and the email address used for the transaction. It is important to save the email for the original transaction with the obtained token as this pair of information must match for subsequent automated payments using the card token.


Requery to get Card Token
Inasmuch as support for tokenisation has been enabled for your integration, you can simply call the Get Transaction Status API to get the card token associated with such card.


Charge the Card Token
When a customer selects the card for a new transaction or when you want to charge them subsequently, you make a request to the Charge Card Token API with the saved token and the customer’s email. Ensure you send the same email used for the initial transaction when making this request.


alert image
Note:
To enable this feature on your integration, kindly reach out to the Monnify integration team via integration-support@monnify.com to help activate this feature.

Sample Error Messages
Error Message	Meaning	Action
Card token has expired.	
This means that the supplied token has expired

Regenerate and supply a valid token

Invalid card token	
This means that the token supplied in the request does not exist

Check that the supplied token is correct and valid

Duplicate payment reference	
This implies that the payment reference used in the request payload has been previously used in the same environment by the merchant

Ensure that the payment reference is unique for each request

Rate this page
How would you rate your experience?

★
★
★
★
★
On this page
Recurring Payments (Card Tokenization)
How Card Tokenization Works
Charge the customer’s card from your web or mobile application.
Get Card Token
Sample response from the Get Transaction Status
Store Card Token
Requery to get Card Token
Charge the Card Token
Sample Error Messages
Rate this page
Got Questions
Monnify Tutorial Videos
Join Our Slack Community

get info
Got Questions
Reach out to us at support@monnify.com if you have any questions as regards integrating with the Monnify API.
youtube
Monnify Tutorial Videos
Check out Our Youtube channel for tutorials on how to integrate the Monnify API.
slack
Join Our Slack Community
Click here to join the Monnify Slack community.
Copyright © 2025 Monnify
instagram
facebook
icon



Accept Payments with Monnify
Learn how to receive payment from your customers using the Monnify APIs

image
alert image
Signing Up
Before you can start integrating to Monnify, you will need to create a Monnify account.
Create Account
🚀 Getting Started
One-Time Payment
Receive one-time payments from your customers using Monnify.

Customer Reserved Account
Create unique static account numbers for customers' payment.

Invoicing
Send out invoices to your customers directly using Monnify.

Offline Pay-ins
Receive cash payments from your customers offline with Monnify.

Sub Account
Split payments between multiple accounts using Monnify.

Monnify Logo
The Monnify Logo is a vital representation of our brand and must always be used to represent us when integrating our products on merchant platforms.

Logo
Plugins and SDKs
Get up and running with Monnify plugins and SDKs.


Web SDK

IOS SDK

Android SDK

Flutter SDK
List of Pricing
Payment Method and Default Customer Fees.

Accept Payments
Choose the best option for receiving payments from your customers

Payins
1.5% fee

Fee is capped at ₦2,000 per transaction.

Reserved Account
1.5% fee

Fee is capped at ₦2,000 per transaction.

Offline Payment
1% fee

Fee is capped at ₦1,000 per transaction.

Transfers / Payouts
Send money to users and businesses with tiered pricing

Amount < ₦10,000
₦10

Amount > ₦10,000 & < ₦50,000
₦20

Amount ≥ ₦50,000
₦40

Withdrawals
Simple, flat pricing for all withdrawals

Flat Fee
₦20


get info
Got Questions
Reach out to us at support@monnify.com if you have any questions as regards integrating with the Monnify API.
youtube
Monnify Tutorial Videos
Check out Our Youtube channel for tutorials on how to integrate the Monnify API.
slack
Join Our Slack Community
Click here to join the Monnify Slack community.
Copyright © 2025 Monnify
instagram
facebook
icon


Event types
Monnify supports webhooks for various events like card transactions, settlement and disbursement completion, and refunds. To implement webhooks on your Monnify integration, it is recommended to follow certain best practices such as validating transaction hash, whitelisting Monnify's IP address, checking for duplicate notifications, and processing complex logic after acknowledging receipt of the notification with a 200 HTTP status code. These practices ensure the integrity and security of the payload, prevent unauthorized requests, avoid redundant processing, and prevent time-out issues.

Monnify Webhook Events and Structure
As part of the Monnify integration, notifications are automatically sent to your system when certain actions are completed. These notifications trigger corresponding activities on your system, and you can specify URLs for certain activities on your integration. The notifications include an event-type property that indicates what action has taken place, as well as event data containing details of the event.


Supported notification event types on Monnify include


Successful Collection (for successful payments made on your account)
Sample Event Notification Structure
Expand
Copy
{
  "eventType": "SUCCESSFUL_TRANSACTION",
  "eventData": {
    "product": {
      "reference": "1636106097661",
      "type": "RESERVED_ACCOUNT"
    },
    "transactionReference": "MNFY|04|20211117112842|000170",
    "paymentReference": "MNFY|04|20211117112842|000170",
    "paidOn": "2021-11-17 11:28:42.615",
    "paymentDescription": "Adm",
    "metaData": {},
    "paymentSourceInformation": [
      {
        "bankCode": "",
        "amountPaid": 3000,
        "accountName": "Monnify Limited",
        "sessionId": "e6cV1smlpkwG38Cg6d5F9B2PRnIq5FqA",
        "accountNumber": "0065432190"
      }
    ],
    "destinationAccountInformation": {
      "bankCode": "232",
      "bankName": "Sterling bank",
      "accountNumber": "6000140770"
    },
    "amountPaid": 3000,
    "totalPayable": 3000,
    "cardDetails": {},
    "paymentMethod": "ACCOUNT_TRANSFER",
    "currency": "NGN",
    "settlementAmount": "2990.00",
    "paymentStatus": "PAID",
    "customer": {
      "name": "John Doe",
      "email": "test@tester.com"
    }
  }
}
Successful Disbursement (for disbursement transactions with a successful definite status)
Sample Event Notification Structure
Expand
Copy
{
  "eventType": "SUCCESSFUL_DISBURSEMENT",
  "eventData": {
    "amount": 10,
    "transactionReference": "MFDS|20210317032332|002431",
    "fee": 8,
    "transactionDescription": "Approved or completed successfully",
    "destinationAccountNumber": "0068687503",
    "sessionId": "090405210317032336726272971260",
    "createdOn": "17/03/2021 3:23:32 AM",
    "destinationAccountName": "DAMILARE SAMUEL OGUNNAIKE",
    "reference": "ref1615947809303",
    "destinationBankCode": "232",
    "completedOn": "17/03/2021 3:23:38 AM",
    "narration": "This is a quite long narration",
    "currency": "NGN",
    "destinationBankName": "Sterling bank",
    "status": "SUCCESS"
  }
}
Failed Disbursement (for failed disbursement transactions)
Sample Event Notification Structure
Expand
Copy
{
  "eventType": "FAILED_DISBURSEMENT",
  "eventData": {
    "amount": 17100,
    "transactionReference": "MFDS10620240708214001015343FR7PL8",
    "fee": 20,
    "transactionDescription": "You do not have sufficient balance to process this request. Please fund your account and try again.",
    "destinationAccountNumber": "8088524531",
    "sessionId": "",
    "createdOn": "08/07/2024 9:40:02 PM",
    "destinationAccountName": "MARVELOUS BENJI",
    "reference": "MF240708214000166415",
    "destinationBankCode": "305",
    "completedOn": "08/07/2024 9:40:07 PM",
    "narration": "AOlifepurse1260077196647628800Transaction",
    "currency": "NGN",
    "destinationBankName": "OPAY",
    "status": "FAILED"
  }
}
Reversed Disbursement (for reversed disbursement transactions)
Sample Event Notification Structure
Expand
Copy
{
  "eventType": "REVERSED_DISBURSEMENT",
  "eventData": {
    "transactionReference": "MFDS33920240513211815009133P47MKU",
    "reference": "662d2dcf22132ea227db164e-1715631494637",
    "narration": "Fund Transfer",
    "currency": "NGN",
    "amount": 145708,
    "status": "REVERSED",
    "fee": 8,
    "destinationAccountNumber": "8088523251",
    "destinationAccountName": "Marvelous Benji",
    "destinationBankCode": "305",
    "sessionId": "090405240513211816637369129129",
    "createdOn": "13/05/2023 9:18:16 PM",
    "completedOn": "13/05/2023 9:18:19 PM"
  }
}
Successful Refund (for successfully processed initiated refunds)
Sample Event Notification Structure
Copy
{
  "eventType": "SUCCESSFUL_REFUND",
  "eventData": {
    "merchantReason":"defective goods",
    "transactionReference":"MNFY|20190816083102|000021",
    "completedOn":"14/04/2021 4:24:05 PM",
    "refundStatus":"COMPLETED",
    "customerNote":"defects",
    "createdOn":"14/04/2021 4:23:37 PM",
    "refundReference":"ref001",
    "refundAmount":10:00
  }
}
Failed Refund (for failed initiated refunds)
Sample Event Notification Structure
Copy
{
  "eventType": "FAILED_REFUND",
  "eventData": {
    "merchantReason":"defective goods",
    "transactionReference":"MNFY|20190816083102|000021",
    "completedOn":"14/04/2021 4:24:05 PM",
    "refundStatus":"FAILED",
    "customerNote":"defects",
    "createdOn":"14/04/2021 4:23:37 PM",
    "refundReference":"ref001",
    "refundAmount":10:00
  }
} 
Settlement Completion (for successfully processed settlements to your bank account or wallet)
Sample Event Notification Structure
Expand
Copy
{
  "eventType": "SETTLEMENT",
  "eventData": {
    "amount": "1199.00",
    "settlementTime": "11/11/2021 02:29:00 PM",
    "settlementReference": "LB8HG1PNZT4ATJGZXQBY",
    "destinationAccountNumber": "6000000249",
    "destinationBankName": "Fidelity Bank",
    "destinationAccountName": "Teamapt Limited234",
    "transactionsCount": 1,
    "transactions": [
      {
        "product": {
          "reference": "2134565wda",
          "type": "2134565wda"
        },
        "transactionReference": "MNFY|26|20211111142601|000001",
        "paymentReference": "MNFY|26|20211111142601|000001",
        "paidOn": "11/11/2021 02:26:02 PM",
        "paymentDescription": "Seg",
        "accountPayments": [
          {
            "bankCode": "000014",
            "amountPaid": "1234.00",
            "accountName": "Okeke Chimezie",
            "accountNumber": "******1070"
          }
        ],
        "amountPaid": "1234.00",
        "totalPayable": "1234.00",
        "accountDetails": {
          "bankCode": "000014",
          "amountPaid": "1234.00",
          "accountName": "Okeke Chimezie",
          "accountNumber": "******1070"
        },
        "cardDetails": {},
        "paymentMethod": "ACCOUNT_TRANSFER",
        "currency": "NGN",
        "paymentStatus": "PAID",
        "customer": {
          "name": "Segun Adeponle",
          "email": "segunadeponle@gmail.com"
        }
      }
    ]
  }
}
Completed Oflline Payments
Sample Event Notification Structure
Expand
Copy
{
  "eventType": "SUCCESSFUL_TRANSACTION",
  "eventData": {
    "product": {
      "reference": "MNF-Tl9Noo0G48000890",
      "type": "OFFLINE_PAYMENT_AGENT"
    },
    "transactionReference": "MNFY|76|20230830171357|000252",
    "invoiceReference": "MNF-Tl9Noo0G48000890",
    "paymentReference": "MNF-Tl9Noo0G48000890",
    "paidOn": "30/08/2023 5:13:57 PM",
    "paymentDescription": "adron",
    "metaData":{
      "phoneNumber":"08088523241",
      "name":"Khalid"
    },
    "destinationAccountInformation": {},
    "paymentSourceInformation": {},
    "amountPaid": 15000,
    "totalPayable": 15000,
    "offlineProductInformation": {
      "amount": 15000,
      "code": "56417",
      "type": "INVOICE"
    },
    "cardDetails": {},
    "paymentMethod": "CASH",
    "currency": "NGN",
    "settlementAmount": 14990,
    "paymentStatus": "PAID",
    "customer": {
      "name": "David Customer",
      "email": "mayluv55@hotmail.co.uk"
    }
  }
}
Notification for Rejected Payments
Sample Event Notification Structure
Expand
Copy
{
  "eventType": "REJECTED_PAYMENT",
  "eventData": {
    "metaData": "{"name":"Marvelous","age":"90"}",
    "product": {
      "reference": "MNFY|PAYREF|GENERATED|1687798434397393735",
      "type": "WEB_SDK"
    },
    "amount": 100,
    "paymentSourceInformation": {
      "bankCode": "50515",
      "amountPaid": 40,
      "accountName": "MARVELOUS BENJI",
      "sessionId": "090405230626180003067844645188",
      "accountNumber": "5141901487"
    },
    "transactionReference": "MNFY|85|20230626175354|041855",
    "created_on": "2023-06-26 17:53:55.0",
    "paymentReference": "MNFY|PAYREF|GENERATED|1687798434397393735",
    "paymentRejectionInformation": {
      "bankCode": "035",
      "destinationAccountNumber": "7023576853",
      "bankName": "Wema bank",
      "rejectionReason": "UNDER_PAYMENT",
      "expectedAmount": 100
    },
    "paymentDescription": "lets pay",
    "customer": {
      "name": "Marvelous Benji",
      "email": "benji71@gmail.com"
    }
  }
}
Mandate Status Change
Sample Event Notification Structure
Expand
Copy
{
  "eventType": "MANDATE_UPDATE",
  "eventData": {
    "customerAddress": "Everywhere is an address",
    "endDate": "2024-12-31 08:00:00.0",
    "customerEmailAddress": "ogunnaike.damilare@gmail.com",
    "customerAccountName": "SAMUEL DAMILARE OGUNNAIKE",
    "customerAccountNumber": "2191406799",
    "customerAccountBankCode": "057",
    "customerName": "Damilare Ogunnaike",
    "mandateDescription": "Testing Monnify Mandate",
    "externalMandateReference": "mfy-mandate-102",
    "mandateStatus": "CANCELLED",
    "mandateAmount": 100000,
    "autoRenew": false,
    "mandateCode": "MTDD|01J3GRJH8D58B20VNX1E6GSY1N",
    "contractCode": "626689863141",
    "customerPhoneNumber": "08166189142",
    "startDate": "2024-07-24 08:00:00.0"
  }
} 
Wallet Activity Notification
Sample Event Notification Structure
Expand
Copy
 {
  "eventType": "ACCOUNT_ACTIVITY",
  "eventData": {
    "accountType": "MAIN",
    "accountName": "Test01",
    "accountNumber": "8016472829",
    "accountNuban": null,
    "activityType": "TRANSACTION",
    "amount": 100,
    "currency": "566",
    "balanceBefore": 862.68,
    "balanceAfter": 962.68,
    "reference": "MFY_WTP_TRF_2MPT61CFP_1896839989128998912_CBA_CREDIT_0_CREDIT_0",
    "narration": " MFY-WT/#/TRF|2MPT61cfp|1896839989128998912_CBA_CREDIT_0/#/2025-03-04/#/VA-6927004623/#/From-Moniepoint Microfinance Bank/#/Test User/#/5744000051",
    "activityTime": "2025-03-04 10:27:AM"
  },
  "metaData": {
    "senderAccount": "Monnify Service",
    "sourceAccountName": null,
    "sourceAccountNumber": null,
    "sourceBankCode": null,
    "sourceBankName": null
  }
} 
Low Balance Alert
Sample Event Notification Structure
Copy
{
"eventType": "LOW_BALANCE_ALERT",
"eventData": {
  "transactionTime": "2025-09-01T23:13:19Z",
  "merchantCode": "99ZYAFM0F3CY",
  "walletAccountNumber": "8023759978",
  "walletBalance": 0,
  "lowBalanceThreshold": 2000,
  "currency": "NGN",
  "description": "Your wallet balance has dropped below the configured threshold. Please fund your account."
  }
}


Transaction Hash Computation
As a security measure, Monnify computes a hash of the request body whenever it sends a notification and includes it in the request header with the key 'monnify-signature'. To ensure the notification is valid and authorized, you should also calculate the hash and compare it to the one sent by Monnify before accepting or acting on the notification.

To calculate the hash, you can use a SHA-512 encoding of your client secret key and the object of the request body. The formula is: SHA-512(client secret key + object of request body).



Javascript, PHP, Java Sample Codes:
Sample Client Key: 91MUDL9N6U3BQRXBQ2PJ9M0PW4J22M1Y

Sample Request:

Sample Event Data
Expand
Copy
{
  "eventData": {
      "product": {
          "reference": "111222333",
          "type": "OFFLINE_PAYMENT_AGENT"
      },
      "transactionReference": "MNFY|76|20211117154810|000001",
      "paymentReference": "0.01462001097368737",
      "paidOn": "17/11/2021 3:48:10 PM",
      "paymentDescription": "Mockaroo Jesse",
      "metaData": {},
      "destinationAccountInformation": {},
      "paymentSourceInformation": {},
      "amountPaid": 78000,
      "totalPayable": 78000,
      "offlineProductInformation": {
          "code": "41470",
          "type": "DYNAMIC"
      },
      "cardDetails": {},
      "paymentMethod": "CASH",
      "currency": "NGN",
      "settlementAmount": 77600,
       "paymentStatus": "PAID",
      "customer": {
          "name": "Mockaroo Jesse",
          "email": "111222333@ZZAMZ4WT4Y3E.monnify"
      }
  },
  "eventType": "SUCCESSFUL_TRANSACTION"
}
Hashed Value:

f04fb635e04d71648bd3cc7999003da6861483342c856d05ddfa9b2dafacb873b0de1d0f8f67405d0010b4348b721c49fa171d317972618debba6b638aedcd3c

Computing Hash in Nodejs
Computing Hash in Nodejs
Expand
Copy
const { sha512 } = require("js-sha512");

const DEFAULT_MERCHANT_CLIENT_SECRET = "91MUDL9N6U3BQRXBQ2PJ9M0PW4J22M1Y";

/**
* Computes the HMAC-SHA512 hash of the given request body.
* @param {string} requestBody - The stringified request body (JSON payload).
* @returns {string} - The computed hash as a hex string.
*/
const computeHash = (requestBody) => {
return sha512.hmac(DEFAULT_MERCHANT_CLIENT_SECRET, requestBody);
};

// Sample request body payload
const stringifiedRequestBody = JSON.stringify(
{
  eventData: {
    product: {
      reference: "111222333",
      type: "OFFLINE_PAYMENT_AGENT",
    },
    transactionReference: "MNFY|76|20211117154810|000001",
    paymentReference: "0.01462001097368737",
    paidOn: "17/11/2021 3:48:10 PM",
    paymentDescription: "Mockaroo Jesse",
    metaData: {},
    destinationAccountInformation: {},
    paymentSourceInformation: {},
    amountPaid: 78000,
    totalPayable: 78000,
    offlineProductInformation: {
      code: "41470",
      type: "DYNAMIC",
    },
    cardDetails: {},
    paymentMethod: "CASH",
    currency: "NGN",
    settlementAmount: 77600,
    paymentStatus: "PAID",
    customer: {
      name: "Mockaroo Jesse",
      email: "111222333@ZZAMZ4WT4Y3E.monnify",
    },
  },
  eventType: "SUCCESSFUL_TRANSACTION",
},
null,
2 // pretty-print spacing (optional)
);

const computedHash = computeHash(stringifiedRequestBody);
console.log("Computed hash:", computedHash);
Computing Hash in PHP
Computing Hash in Nodejs
Expand
Copy
<?php

class CustomTransactionHashUtil
{
  /**
   * Computes an HMAC-SHA512 hash for a given JSON string and client secret.
   *
   * @param string $stringifiedData The stringified JSON payload.
   * @param string $clientSecret    The merchant client secret.
   *
   * @return string The computed HMAC-SHA512 hash.
   */
  public static function computeSHA512TransactionHash(string $stringifiedData, string $clientSecret): string
  {
      return hash_hmac('sha512', $stringifiedData, $clientSecret);
  }
}

$DEFAULT_MERCHANT_CLIENT_SECRET = '91MUDL9N6U3BQRXBQ2PJ9M0PW4J22M1Y';

// Build the payload as an array (safer and more readable)
$payload = [
  "eventData" => [
      "product" => [
          "reference" => "111222333",
          "type" => "OFFLINE_PAYMENT_AGENT",
      ],
      "transactionReference" => "MNFY|76|20211117154810|000001",
      "paymentReference" => "0.01462001097368737",
      "paidOn" => "17/11/2021 3:48:10 PM",
      "paymentDescription" => "Mockaroo Jesse",
      "metaData" => new stdClass(),
      "destinationAccountInformation" => new stdClass(),
      "paymentSourceInformation" => new stdClass(),
      "amountPaid" => 78000,
      "totalPayable" => 78000,
      "offlineProductInformation" => [
          "code" => "41470",
          "type" => "DYNAMIC",
      ],
      "cardDetails" => new stdClass(),
      "paymentMethod" => "CASH",
      "currency" => "NGN",
      "settlementAmount" => 77600,
      "paymentStatus" => "PAID",
      "customer" => [
          "name" => "Mockaroo Jesse",
          "email" => "111222333@ZZAMZ4WT4Y3E.monnify",
      ],
  ],
  "eventType" => "SUCCESSFUL_TRANSACTION",
];

// Convert payload to JSON (stringified body)
$stringifiedData = json_encode($payload, JSON_UNESCAPED_SLASHES);

// Compute hash
$computedHash = CustomTransactionHashUtil::computeSHA512TransactionHash(
  $stringifiedData,
  $DEFAULT_MERCHANT_CLIENT_SECRET
);

echo "Computed Hash: " . $computedHash . PHP_EOL;
Computing Hash in Java
Computing Hash in Java
Expand
Copy
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SignatureException;
import java.util.Formatter;

public class TransactionHashUtil {

  private static final String HMAC_SHA512 = "HmacSHA512";

  /**
   * Converts a byte array to a lowercase hex string.
   *
   * @param bytes The byte array to convert.
   * @return The hex string.
   */
  private static String toHexString(byte[] bytes) {
      try (Formatter formatter = new Formatter()) {
          for (byte b : bytes) {
              formatter.format("%02x", b);
          }
          return formatter.toString();
      }
  }

  /**
   * Computes an HMAC-SHA512 hash for the given payload using the merchant client secret.
   *
   * @param data                 The stringified JSON payload.
   * @param merchantClientSecret The merchant client secret.
   * @return The computed HMAC-SHA512 hash as a lowercase hex string.
   *
   * @throws SignatureException       If signature computation fails.
   * @throws NoSuchAlgorithmException If HmacSHA512 algorithm is not available.
   * @throws InvalidKeyException      If the provided key is invalid.
   */
  public static String computeHMAC512TransactionHash(String data, String merchantClientSecret)
          throws SignatureException, NoSuchAlgorithmException, InvalidKeyException {

      SecretKeySpec secretKeySpec = new SecretKeySpec(
              merchantClientSecret.getBytes(StandardCharsets.UTF_8),
              HMAC_SHA512
      );

      Mac mac = Mac.getInstance(HMAC_SHA512);
      mac.init(secretKeySpec);

      byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
      return toHexString(rawHmac);
  }

  // Example usage
  public static void main(String[] args) {
      String clientSecret = "91MUDL9N6U3BQRXBQ2PJ9M0PW4J22M1Y";
      String requestBody = "{"eventData":{"product":{"reference":"111222333","type":"OFFLINE_PAYMENT_AGENT"},"transactionReference":"MNFY|76|20211117154810|000001","paymentReference":"0.01462001097368737","paidOn":"17/11/2021 3:48:10 PM","paymentDescription":"Mockaroo Jesse","metaData":{},"destinationAccountInformation":{},"paymentSourceInformation":{},"amountPaid":78000,"totalPayable":78000,"offlineProductInformation":{"code":"41470","type":"DYNAMIC"},"cardDetails":{},"paymentMethod":"CASH","currency":"NGN","settlementAmount":77600,"paymentStatus":"PAID","customer":{"name":"Mockaroo Jesse","email":"111222333@ZZAMZ4WT4Y3E.monnify"}},"eventType":"SUCCESSFUL_TRANSACTION"}";

      try {
          String hash = computeHMAC512TransactionHash(requestBody, clientSecret);
          System.out.println("Computed Hash: " + hash);
      } catch (Exception e) {
          e.printStackTrace();
      }
  }
}

Rate this page
How would you rate your experience?

★
★
★
★
★
On this page
Event types
Monnify Webhook Events and Structure
Transaction Hash Computation
Javascript, PHP, Java Sample Codes:
Computing Hash in Nodejs
Computing Hash in PHP
Computing Hash in Java
Rate this page
Got Questions
Monnify Tutorial Videos
Join Our Slack Community

get info
Got Questions
Reach out to us at support@monnify.com if you have any questions as regards integrating with the Monnify API.
youtube
Monnify Tutorial Videos
Check out Our Youtube channel for tutorials on how to integrate the Monnify API.
slack
Join Our Slack Community
Click here to join the Monnify Slack community.
Copyright © 2025 Monnify
instagram
facebook
icon



Home
Webhooks
Webhooks
Webhooks is an API concept that enables applications to automatically communicate with each other without constant polling. Monnify integration sends notifications to a URL on the merchants’ server when specific events such as when payments are being received or when settlements are made to your account, allowing further actions such as sending an email or providing value to the user.

Configuring webhooks on Monnify UI
Scroll down to the Developer page on the left navigation menu and then proceed to the Webhook URLs section to input your URL’s i.e Transaction Completion, Refund Completion, Disbursement and Settlement. Once you've pasted your webhook details click save and you are good to go!


Below is a sample image on how to input your urls on the monnify dashboard



Monnify supports webhooks for various events like card transactions, settlement and disbursement completion, and refunds.

To implement webhooks on your Monnify integration, it is recommended to follow certain best practices such as validating transaction hash, whitelisting Monnify's IP address, checking for duplicate notifications, and processing complex logic after acknowledging receipt of the notification with a 200 HTTP status code. These practices ensure the integrity and security of the payload, prevent unauthorized requests, avoid redundant processing, and prevent time-out issues.


Monnify Webhook Events and Structure
As part of the Monnify integration, notifications are automatically sent to your system when certain actions are completed. These notifications trigger corresponding activities on your system, and you can specify URLs for certain activities on your integration.


The notifications include an event-type property that indicates what action has taken place, as well as event data containing details of the event.


Supported notification event types on Monnify include:


Successful Collection (for successful payments made on your account).
Successful Disbursement (for disbursement transactions with a successful definite status).

Failed Disbursement (for failed disbursement transactions).
Reversed Disbursement (for reversed disbursement transactions).
Successful Refund (for successfully processed initiated refunds).
Failed Refund (for failed initiated refunds).
Settlement Completion (for successfully processed settlements to your bank account or wallet).

Mandate Status Change (This is sent when the status of a mandate changes from PENDING to FAILED or CANCELLED or ACTIVATED etc).

Wallet activity notification (For notifying merchants of credits and debits to their Main or SubWallets).


Structure and Sample
A typical event notification structure is of the format:

Copy
{
  "eventType": "type_of_event",
  "eventData": {
    "prop1": "value1",
    "prop2": "value2"
  }
}

Transaction Hash Computation
As a security measure, Monnify computes a hash of the request body whenever it sends a notification and includes it in the request header with the key 'monnify-signature'. To ensure the notification is valid and authorized, you should also calculate the hash and compare it to the one sent by Monnify before accepting or acting on the notification.


To calculate the hash, you can use a SHA-512 encoding of your client secret key and the object of the request body. The formula is: SHA-512(client secret key + object of request body).


Sample Examples:
Sample Client Key: 91MUDL9N6U3BQRXBQ2PJ9M0PW4J22M1Y

Sample Request:

Expand
Copy
{
  "eventData": {
    "product": {
      "reference": "111222333",
      "type": "OFFLINE_PAYMENT_AGENT"
    },
    "transactionReference": "MNFY|76|20211117154810|000001",
    "paymentReference": "0.01462001097368737",
    "paidOn": "17/11/2021 3:48:10 PM",
    "paymentDescription": "Mockaroo Jesse",
    "metaData": {},
    "destinationAccountInformation": {},
    "paymentSourceInformation": {},
    "amountPaid": 78000,
    "totalPayable": 78000,
    "offlineProductInformation": {
      "code": "41470",
      "type": "DYNAMIC"
    },
    "cardDetails": {},
    "paymentMethod": "CASH",
    "currency": "NGN",
    "settlementAmount": 77600,
    "paymentStatus": "PAID",
    "customer": {
      "name": "Mockaroo Jesse",
      "email": "111222333@ZZAMZ4WT4Y3E.monnify"
    }
  },
  "eventType": "SUCCESSFUL_TRANSACTION"
}
Hashed Value:

f04fb635e04d71648bd3cc7999003da6861483342c856d05ddfa9b2dafacb87 3b0de1d0f8f67405d0010b4348b721c49fa171d317972618debba6b638aedcd3c


Computing Hash in Nodejs
Expand
Copy
const { sha512 } = require("js-sha512");

const DEFAULT_MERCHANT_CLIENT_SECRET = "91MUDL9N6U3BQRXBQ2PJ9M0PW4J22M1Y";

const computeHash = (requestBody) => {
const result = sha512.hmac(DEFAULT_MERCHANT_CLIENT_SECRET, requestBody);
return result;
};

const stringifiedRequestBody = JSON.stringify({
eventData: {
  product: {
    reference: "111222333",
    type: "OFFLINE_PAYMENT_AGENT",
  },
  transactionReference: "MNFY|76|20211117154810|000001",
  paymentReference: "0.01462001097368737",
  paidOn: "17/11/2021 3:48:10 PM",
  paymentDescription: "Mockaroo Jesse",
  metaData: {},
  destinationAccountInformation: {},
  paymentSourceInformation: {},
  amountPaid: 78000,
  totalPayable: 78000,
  offlineProductInformation: {
    code: "41470",
    type: "DYNAMIC",
  },
  cardDetails: {},
  paymentMethod: "CASH",
  currency: "NGN",
  settlementAmount: 77600,
  paymentStatus: "PAID",
  customer: {
    name: "Mockaroo Jesse",
    email: "111222333@ZZAMZ4WT4Y3E.monnify",
  },
},
eventType: "SUCCESSFUL_TRANSACTION",
});

const computedHash = computeHash(stringifiedRequestBody);
console.log("Computed hash:", computedHash);


Computing Hash in PHP
Expand
Copy
<?php

class CustomTransactionHashUtil
{
  public static function computeSHA512TransactionHash($stringifiedData, $clientSecret)
  {
      return hash_hmac('sha512', $stringifiedData, $clientSecret);
  }
}

$DEFAULT_MERCHANT_CLIENT_SECRET = '91MUDL9N6U3BQRXBQ2PJ9M0PW4J22M1Y';

$data = json_encode([
  "eventData" => [
      "product" => [
          "reference" => "111222333",
          "type" => "OFFLINE_PAYMENT_AGENT",
      ],
      "transactionReference" => "MNFY|76|20211117154810|000001",
      "paymentReference" => "0.01462001097368737",
      "paidOn" => "17/11/2021 3:48:10 PM",
      "paymentDescription" => "Mockaroo Jesse",
      "metaData" => new stdClass(),
      "destinationAccountInformation" => new stdClass(),
      "paymentSourceInformation" => new stdClass(),
      "amountPaid" => 78000,
      "totalPayable" => 78000,
      "offlineProductInformation" => [
          "code" => "41470",
          "type" => "DYNAMIC",
      ],
      "cardDetails" => new stdClass(),
      "paymentMethod" => "CASH",
      "currency" => "NGN",
      "settlementAmount" => 77600,
      "paymentStatus" => "PAID",
      "customer" => [
          "name" => "Mockaroo Jesse",
          "email" => "111222333@ZZAMZ4WT4Y3E.monnify",
      ],
  ],
  "eventType" => "SUCCESSFUL_TRANSACTION",
], JSON_UNESCAPED_SLASHES);

$computedHash = CustomTransactionHashUtil::computeSHA512TransactionHash(
  $data,
  $DEFAULT_MERCHANT_CLIENT_SECRET
);

echo $computedHash;


Computing Hash in Java
Expand
Copy
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SignatureException;
import java.util.Formatter;

public class TransactionHashUtil {

  private static final String HMAC_SHA512 = "HmacSHA512";

  private static String toHexString(byte[] bytes) {
      try (Formatter formatter = new Formatter()) {
          for (byte b : bytes) {
              formatter.format("%02x", b);
          }
          return formatter.toString();
      }
  }

  /**
   * Computes an HMAC-SHA512 hash for the given data using the merchant client secret.
   *
   * @param data                 The stringified JSON payload
   * @param merchantClientSecret The merchant's client secret key
   * @return The computed HMAC-SHA512 hash as a lowercase hex string
   * @throws SignatureException       If the signature computation fails
   * @throws NoSuchAlgorithmException If HmacSHA512 is not available
   * @throws InvalidKeyException      If the provided key is invalid
   */
  public static String computeHMAC512TransactionHash(String data, String merchantClientSecret)
          throws SignatureException, NoSuchAlgorithmException, InvalidKeyException {

      SecretKeySpec secretKeySpec = new SecretKeySpec(merchantClientSecret.getBytes(), HMAC_SHA512);
      Mac mac = Mac.getInstance(HMAC_SHA512);
      mac.init(secretKeySpec);

      byte[] rawHmac = mac.doFinal(data.getBytes());
      return toHexString(rawHmac);
  }
}

Best Practices
It’s highly recommended you do the following when processing webhook notifications from us.

Transaction Hash Validation: This is applicable by default on our transaction notification webhook. A hash of some properties in the request payload is computed, and you can validate this on your server by computing the same hash and comparing outputs.
Whitelist Monnify's webhook IP address: To prevent requests from un-authorized origins, you can whitelist our IP address and only honor requests from this IP. Webhook notifications from Monnify will come from the following IP addresses - 35.242.133.146.
Check for duplicate notifications: It’s important to keep track of all notifications you’ve received. When a new notification is received, always check that this has not been processed before giving value so as not to give double value to customers. A resend of already processed notification can happen if we do not get a 200 HTTP Status code, or in the case of a request time out.
Process Complex Logic After Responding to Monnify: If your application will perform complex or time consuming logic with received notifications, this might lead to a time out between Monnify and your system, hence leading to a resend. For this reason, it’s recommended you immediately acknowledge receipt of the notification by returning a 200 HTTP Status code, and then perform your long processing activities.
Rate this page
How would you rate your experience?

★
★
★
★
★
On this page
Webhooks
Configuring webhooks on Monnify UI
Monnify Webhook Events and Structure
Structure and Sample
Transaction Hash Computation
Sample Examples:
Computing Hash in Nodejs
Computing Hash in PHP
Computing Hash in Java
Best Practices
Rate this page
On this page
Got Questions
Monnify Tutorial Videos
Join Our Slack Community

get info
Got Questions
Reach out to us at support@monnify.com if you have any questions as regards integrating with the Monnify API.
youtube
Monnify Tutorial Videos
Check out Our Youtube channel for tutorials on how to integrate the Monnify API.
slack
Join Our Slack Community
Click here to join the Monnify Slack community.
Copyright © 2025 Monnify
instagram
facebook
icon
