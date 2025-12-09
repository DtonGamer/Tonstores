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
Show More
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
​#Copy link
This endpoint validates a Customer's NUBAN Account.

Query Parameters
accountNumber
Type:string
required
The account number to be validated.

bankCode
Type:string
required
The bank code of the required account number.

Headers
Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful account validation

application/json

404
Not Found

application/json
Request Example for
GET
/api/v1/disbursements/account/validate
Selected HTTP client:Node.js Axios

Axios
Copy content
const axios = require('axios').default;

const options = {
  method: 'GET',
  url: 'https://sandbox.monnify.com/api/v1/disbursements/account/validate',
  headers: {Authorization: 'Bearer <token>'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}

Test Request
(get /api/v1/disbursements/account/validate)
Status:200
Status:404
Copy content
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "accountNumber": "0123456789",
    "accountName": "Damilare Ogunnaike",
    "bankCode": "057"
  }
}
Successful account validation

​#Copy link
This endpoint verifies the BVN information of your customers.

Please note that the this API is only available on LIVE MODE at the moment. The sample responses here mirrors the expected response from the API and can be used to setup workflows in your application.
Headers
Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
required
application/json
bvn
Type:string
required
Example
The user's bvn

name
Type:string
required
Example
The user’s name

dateOfBirth
Type:string
required
Example
The user’s date of birth

mobileNo
Type:string
required
Example
The user's mobile number

Responses

99
Invalid BVN provided

application/json

200
Successful BVN verification

application/json
Request Example for
POST
/api/v1/vas/bvn-details-match
Selected HTTP client:Node.js Axios

Axios
Copy content
const axios = require('axios').default;

const options = {
  method: 'POST',
  url: 'https://sandbox.monnify.com/api/v1/vas/bvn-details-match',
  headers: {Authorization: 'Bearer <token>', 'Content-Type': 'application/json'},
  data: {
    bvn: '22222222226',
    name: 'OLATUNDE JOSIAH OGUNBOYEJO',
    dateOfBirth: '27-Apr-1993',
    mobileNo: '08142223149'
  }
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}

Test Request
(post /api/v1/vas/bvn-details-match)
Status:200
Status:99
Copy content
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "bvn": "22228945899",
    "name": {
      "matchStatus": "FULL_MATCH",
      "matchPercentage": 100
    },
    "dateOfBirth": "NO_MATCH",
    "mobileNo": "FULL_MATCH"
  }
}
Successful BVN verification

​#Copy link
This endpoint verifies that the Bank verification number and the account number supplied by a user match the BVN and account number linked to that account.

Please note that the this API is only available on LIVE MODE at the moment. The sample responses here mirrors the expected response from the API and can be used to setup workflows in your application.
Headers
Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
required
application/json
bankCode
Type:string
required
Example
The user’s bank code

accountNumber
Type:string
required
Example
The user's account number

bvn
Type:string
required
Example
The user’s bvn

Responses

99
Invalid BVN or account provided

application/json

200
Successful BVN and account match

application/json
Request Example for
POST
/api/v1/vas/bvn-account-match
Selected HTTP client:Node.js Axios

Axios
Copy content
const axios = require('axios').default;

const options = {
  method: 'POST',
  url: 'https://sandbox.monnify.com/api/v1/vas/bvn-account-match',
  headers: {Authorization: 'Bearer <token>', 'Content-Type': 'application/json'},
  data: {bankCode: '057', accountNumber: '2191802645', bvn: '22222222226'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}

Test Request
(post /api/v1/vas/bvn-account-match)
Status:200
Status:99
Copy content
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "bvn": "22222222226",
    "accountNumber": "0103284175",
    "accountName": "OLATUNDE JOSIAH OGUNBOYEJO",
    "matchStatus": "FULL_MATCH",
    "matchPercentage": 100
  }
}
Successful BVN and account match

​#Copy link
This endpoint verifies the supplied NIN of the customer.

Please note that the this API is only available on LIVE MODE at the moment. The sample responses here mirrors the expected response from the API and can be used to setup workflows in your application.
Headers
Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
required
application/json
nin
Type:string
required
Example
The customer’s NIN number

Responses

200
Successful NIN verification

application/json

400
NIN not found

application/json
Request Example for
POST
/api/v1/vas/nin-details
Selected HTTP client:Node.js Axios

Axios
Copy content
const axios = require('axios').default;

const options = {
  method: 'POST',
  url: 'https://sandbox.monnify.com/api/v1/vas/nin-details',
  headers: {Authorization: 'Bearer <token>', 'Content-Type': 'application/json'},
  data: {nin: '94646622685'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}

Test Request
(post /api/v1/vas/nin-details)
Status:200
Status:400
Copy content
{
  "requestSuccessful": true,
  "responseMessage": "success",
  "responseCode": "0",
  "responseBody": {
    "nin": "91919191913",
    "lastName": "WILES",
    "firstName": "BENJAMIN",
    "middleName": "CHUKS",
    "dateOfBirth": "1996-10-08",
    "gender": "OTHER",
    "mobileNumber": "2348107248890"
  }
}
Successful NIN verification

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
​#Copy link
The endpoint allows merchant create paycodes via API.

Headers
Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Body
required
application/json
beneficiaryName
Type:string
required
Example
The customer's name

amount
Type:number
Format:float
required
Example
The amount to be withdrawn

paycodeReference
Type:string
required
Example
A unique reference generated by the merchant

expiryDate
Type:string
required
Example
The expiry date for the paycode. The format is:YYYY-MM-DD HH:MM:SS

clientId
Type:string
required
Example
The merchant's APIKey

Responses

200
Successful paycode creation

application/json

400
Bad Request

application/json
Request Example for
POST
/api/v1/paycode
Selected HTTP client:Node.js Axios

Axios
Copy content
const axios = require('axios').default;

const options = {
  method: 'POST',
  url: 'https://sandbox.monnify.com/api/v1/paycode',
  headers: {Authorization: 'Bearer <token>', 'Content-Type': 'application/json'},
  data: {
    beneficiaryName: 'Marvelous Benji',
    amount: 30,
    paycodeReference: 'ur749o04jhke993u93o',
    expiryDate: '2023-10-18 19:00:26',
    clientId: 'MK_PROD_GFVLE0PZTQ'
  }
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}

Test Request
(post /api/v1/paycode)
Status:200
Status:400
Copy content
{
  "responseMessage": "success",
  "responseCode": "M00",
  "responseBody": {
    "paycode": "11467409",
    "transactionReference": "MFY-39A78F78E6C341759ACA344297A8CF70",
    "paycodeReference": "ghehdekdkefkefjekjfejj",
    "beneficiaryName": "Marvelous Benji",
    "amount": 50,
    "fee": 100,
    "transactionStatus": "PENDING",
    "expiryDate": "2023-02-19 11:00:26",
    "createdOn": "2023-02-16T12:32:01.591+0000",
    "createdBy": "MK_PROD_WTZLS10MX6",
    "modifiedBy": "MK_PROD_WTZLS10MX6"
  }
}
Successful paycode creation

​#Copy link
This endpoint returns a history of generated Paycodes over a period of time using some search criteria.

Query Parameters
transactionReference
Type:string
The Monnify transactionReference.

beneficiaryName
Type:string
The customer name.

transactionStatus
Type:string
The status of the paycode.

from
Type:integer
A unix timestamp for the start date being considered.

to
Type:integer
A unix timestamp for the end date being considered.

Headers
Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful paycode history retrieval

application/json
Request Example for
GET
/api/v1/paycode
Selected HTTP client:Node.js Axios

Axios
Copy content
const axios = require('axios').default;

const options = {
  method: 'GET',
  url: 'https://sandbox.monnify.com/api/v1/paycode',
  headers: {Authorization: 'Bearer <token>7'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}

Test Request
(get /api/v1/paycode)
Status:200
Copy content
{
  "responseMessage": "success",
  "responseCode": "M00",
  "responseBody": {
    "content": [
      {
        "paycode": "11467409",
        "transactionReference": "MFY-39A78F78E6C341759ACA344297A8CF70",
        "paycodeReference": "ghehdekdkefkefjekjfejj",
        "beneficiaryName": "Marvelous Benji",
        "amount": 50,
        "fee": 100,
        "transactionStatus": "PENDING",
        "expiryDate": "2023-02-19 11:00:26",
        "createdOn": "2023-02-16T12:32:01.591+0000",
        "createdBy": "MK_PROD_WTZLS10MX6",
        "modifiedBy": "MK_PROD_WTZLS10MX6"
      }
    ],
    "pageable": {
      "sort": {
        "sorted": true,
        "unsorted": false,
        "empty": false
      },
      "pageSize": 10,
      "pageNumber": 0,
      "offset": 0,
      "unpaged": false,
      "paged": true
    },
    "last": true,
    "totalPages": 1,
    "totalElements": 1,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    },
    "first": true,
    "numberOfElements": 1,
    "size": 50,
    "number": 0,
    "empty": false
  }
}
Successful paycode history retrieval

​#Copy link
This endpoint returns paycode information for a given paycode reference.

Path Parameters
paycodeReference
Type:string
required
The unique reference for the paycode.

Headers
Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful paycode retrieval

application/json

404
Not Found

application/json
Request Example for
GET
/api/v1/paycode/{paycodeReference}
Selected HTTP client:Node.js Axios

Axios
Copy content
const axios = require('axios').default;

const options = {
  method: 'GET',
  url: 'https://sandbox.monnify.com/api/v1/paycode/',
  headers: {Authorization: 'Bearer <token>7'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}

Test Request
(get /api/v1/paycode/{paycodeReference})
Status:200
Status:404
Copy content
{
  "responseMessage": "success",
  "responseCode": "M00",
  "responseBody": {
    "paycode": "11467409",
    "transactionReference": "MFY-39A78F78E6C341759ACA344297A8CF70",
    "paycodeReference": "ghehdekdkefkefjekjfejj",
    "beneficiaryName": "Marvelous Benji",
    "amount": 50,
    "fee": 100,
    "transactionStatus": "PENDING",
    "expiryDate": "2023-02-19 11:00:26",
    "createdOn": "2023-02-16T12:32:01.591+0000",
    "createdBy": "MK_PROD_WTZLS10MX6",
    "modifiedBy": "MK_PROD_WTZLS10MX6"
  }
}
Successful paycode retrieval

​#Copy link
This endpoint cancels or invalidates a generated Paycode.

Path Parameters
paycodeReference
Type:string
required
The unique reference for the paycode.

Headers
Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful paycode deletion/cancellation

application/json

404
Not Found

application/json
Request Example for
DELETE
/api/v1/paycode/{paycodeReference}
Selected HTTP client:Node.js Axios

Axios
Copy content
const axios = require('axios').default;

const options = {
  method: 'DELETE',
  url: 'https://sandbox.monnify.com/api/v1/paycode/',
  headers: {Authorization: 'Bearer <token>7'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}

Test Request
(delete /api/v1/paycode/{paycodeReference})
Status:200
Status:404
Copy content
{
  "responseMessage": "success",
  "responseCode": "M00",
  "responseBody": {
    "paycode": "11467409",
    "transactionReference": "MFY-39A78F78E6C341759ACA344297A8CF70",
    "paycodeReference": "ghehdekdkefkefjekjfejj",
    "beneficiaryName": "Marvelous Benji",
    "amount": 50,
    "fee": 100,
    "transactionStatus": "PENDING",
    "expiryDate": "2023-02-19 11:00:26",
    "createdOn": "2023-02-16T12:32:01.591+0000",
    "createdBy": "MK_PROD_WTZLS10MX6",
    "modifiedBy": "MK_PROD_WTZLS10MX6"
  }
}
Successful paycode deletion/cancellation

​#Copy link
This endpoint is used to get an unmasked paycode information.

Path Parameters
paycodeReference
Type:string
required
The unique reference for the paycode.

Headers
Authorization
Type:string
required
Example
This endpoint requires a valid JWT authorization token. Use the Authentication endpoint to generate one.

Responses

200
Successful clear paycode retrieval

application/json

404
Not Found

application/json
Request Example for
GET
/api/v1/paycode/{paycodeReference}/authorize
Selected HTTP client:Node.js Axios

Axios
Copy content
const axios = require('axios').default;

const options = {
  method: 'GET',
  url: 'https://sandbox.monnify.com/api/v1/paycode/authorize',
  headers: {Authorization: 'Bearer <token>7'}
};

try {
  const { data } = await axios.request(options);
  console.log(data);
} catch (error) {
  console.error(error);
}

Test Request
(get /api/v1/paycode/{paycodeReference}/authorize)
Status:200
Status:404
Copy content
{
  "responseMessage": "success",
  "responseCode": "M00",
  "responseBody": {
    "paycode": "11467409",
    "transactionReference": "MFY-39A78F78E6C341759ACA344297A8CF70",
    "paycodeReference": "ghehdekdkefkefjekjfejj",
    "beneficiaryName": "Marvelous Benji",
    "amount": 50,
    "fee": 100,
    "transactionStatus": "PENDING",
    "expiryDate": "2023-02-19 11:00:26",
    "createdOn": "2023-02-16T12:32:01.591+0000",
    "createdBy": "MK_PROD_WTZLS10MX6",
    "modifiedBy": "MK_PROD_WTZLS10MX6"
  }
}
Successful clear paycode retrieval