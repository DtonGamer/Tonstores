# Paystack Integration Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [API Basics](#api-basics)
3. [Supported Currencies](#supported-currencies)
4. [Transaction Flow](#transaction-flow)
5. [Platform-Specific Implementations](#platform-specific-implementations)
   - [JavaScript/Node.js](#javascriptnodejs)
   - [React](#react)
   - [Android (Kotlin/Java)](#android-kotlinjava)
   - [iOS (Swift)](#ios-swift)
   - [Flutter](#flutter)
   - [Python](#python)
6. [Security Best Practices](#security-best-practices)
7. [Key Endpoints](#key-endpoints)

## Introduction

Paystack is a payment platform that enables businesses to accept payments from cards, bank accounts, and mobile money, facilitate transfers, and verify customer identities through its API. This documentation provides comprehensive guidance on integrating Paystack into your applications across various platforms.

## API Basics

### HTTP Methods
- **POST**: Creates a new resource on the server
- **GET**: Retrieves a representation of a resource
- **PUT**: Updates an existing resource or creates it if it doesn't exist
- **DELETE**: Deletes a specified resource

### Request and Response Format
Both request body data and response data are formatted as JSON. The Content-Type for responses will always be `application/json`.

Universal response format:
```json
{
  "status": "[boolean]",
  "message": "[string]",
  "data": "[object]"
}
```

- **status** (boolean): Indicates if the request was successful
- **message** (string): A summary of the response status. Contains error descriptions if applicable
- **data** (object): Contains the results of the request. Can be an object or an array

### Meta Object
The `meta` key provides context for the `data` key, especially for paginated results:
```json
{
  "meta": {
    "total": "[number]",
    "skipped": "[number]",
    "perPage": "[number]",
    "page": "[number]",
    "pageCount": "[number]"
  }
}
```

## Supported Currencies

Paystack uses ISO 4217 format for currency codes. Amounts must be sent in the currency's subunit (e.g., multiply by 100).

| Currency Code | Subunit   | Description         |
|---------------|-----------|---------------------|
| NGN           | Kobo      | Nigerian Naira      |
| USD           | Cent      | US Dollar           |
| GHS           | Pesewa    | Ghanaian Cedi       |
| ZAR           | Cent      | South African Rand  |
| KES           | Cent      | Kenyan Shilling     |
| XOF           | -         | West African CFA Franc |

**Note**: For XOF, multiply the amount by 100, even though there is no subunit. Fractional parts will be ignored.

### Sample Request (Amount Formatting)
To send an amount of NGN 100:
```json
{
  "amount": 10000,  // 100 * 100
  "currency": "NGN"
}
```

## Transaction Flow

The Paystack transaction flow involves several steps:

1. **Initialize Transaction**: Create a transaction on your server to obtain an `access_code` and `authorization_url`
2. **Launch Payment UI**: Use the `access_code` to launch the payment interface
3. **Verify Payment**: Use webhooks (`charge.success` event) or check transaction status to confirm payment

### Initialize Transaction (Server Side)

**Method**: POST  
**Endpoint**: https://api.paystack.co/transaction/initialize

**Headers**:
- `Authorization`: `Bearer YOUR_SECRET_KEY`
- `Content-Type`: `application/json`

**Request Body**:
- `email` (string, required): The email address of the customer
- `amount` (string, required): The amount to charge in the smallest currency unit (e.g., kobo for NGN)
- `metadata` (object, optional): Additional data to be stored with the transaction

**Request Example**:
```json
{
  "email": "customer@email.com", 
  "amount": "500000",
  "metadata": {
    "custom_fields": [
      {
        "display_name": "description",
        "variable_name": "description",
        "value": "Funding Wallet"
      }
    ]
  }
}
```

**Response Example**:
```json
{
  "status": true,
  "message": "Authorization URL created",
  "data": {
    "authorization_url": "https://checkout.paystack.com/nkdks46nymizns7",
    "access_code": "nkdks46nymizns7",
    "reference": "nms6uvr1pl"
  }
}
```

### Handle Payment Response Statuses

When you call the Create Charge API endpoint, the response contains a `data.status` which tells you what the next step in the process. Depending on the value in the `data.status`, you may need to prompt the user for an input as indicated in the response message (like OTP or pin or date of birth), or display an action that the user needs to complete on their device - like scanning a QR code or dialling a USSD code or redirecting to a 3DSecure page. So you follow the prompt on the `data.status` until there is no more user input required, then you listen for events via webhooks.

- **`pending`**: Transaction is being processed. Call Check pending charge at least 10 seconds after getting this status to check status.
- **`timeout`**: Transaction has failed. You may start a new charge after showing `data.message` to the user.
- **`success`**: Transaction is successful. You can now provide value.
- **`send_birthday`**: Customer's birthday is needed to complete the transaction. Show `data.display_text` to the user with an input that accepts the birthdate and submit to the Submit Birthday API endpoint with reference and birthday.
- **`send_otp`**: Paystack needs OTP from the customer to complete the transaction. Show `data.display_text` to the user with an input that accepts OTP and submit the OTP to the Submit OTP API endpoint with reference and otp.
- **`failed`**: Transaction failed. No remedy for this, start a new charge after showing `data.message` to the user.

## Platform-Specific Implementations

### JavaScript/Node.js

#### Installation
```bash
npm install paystack-sdk
# or
yarn add paystack-sdk
```

#### Initialization
```javascript
// JavaScript
const Paystack = require('paystack-sdk');
const paystack = new Paystack("secret_key");

// TypeScript
import Paystack from 'paystack-sdk'
const paystack = new Paystack("secret_key");
```

#### Example Usage
```javascript
// Create a subscription plan
import { Paystack } from 'paystack-sdk';

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);

const plan = await paystack.plan.create({
  name: 'Premium Monthly Subscription',
  amount: 50000, // 500 NGN in kobo
  interval: 'monthly', // 'daily', 'weekly', 'monthly', 'annually'
  description: 'Access to premium features',
  currency: 'NGN',
  invoice_limit: 12, // Number of invoices to send
  send_invoices: true,
  send_sms: true
});

if (plan.status) {
  console.log('Plan created successfully');
  console.log('Plan code:', plan.data.plan_code);
  console.log('Plan ID:', plan.data.id);
  console.log('Amount:', plan.data.amount / 100, plan.data.currency);
  console.log('Interval:', plan.data.interval);
}
```

### React

#### Installation
```bash
npm install react-paystack --save
# or
yarn add react-paystack
```

#### Implementation Options

There are three ways to implement Paystack in React:

##### Option 1: Using `usePaystackPayment` Hook
```javascript
import React from 'react';
import { usePaystackPayment } from 'react-paystack';

const config = {
    reference: (new Date()).getTime().toString(),
    email: "user@example.com",
    amount: 20000, // Amount is in the country's lowest currency. E.g Kobo, so 20000 kobo = N200
    publicKey: 'pk_test_dsdfghuytfd2345678gvxxxxxxxxxx',
};

const onSuccess = (reference) => {
  // Implementation for whatever you want to do with reference and after success call.
  console.log(reference);
};

const onClose = () => {
  // Implementation for whatever you want to do when the Paystack dialog closed.
  console.log('closed')
}

const PaystackHookExample = () => {
    const initializePayment = usePaystackPayment(config);
    return (
      <div>
          <button onClick={() => {
              initializePayment(onSuccess, onClose)
          }}>Paystack Hooks Implementation</button>
      </div>
    );
};
```

##### Option 2: Using `PaystackConsumer` Component
```javascript
import React from 'react';
import { PaystackConsumer } from 'react-paystack';
  
const config = {
    reference: (new Date()).getTime().toString(),
    email: "user@example.com",
    amount: 20000, // Amount is in the country's lowest currency. E.g Kobo, so 20000 kobo = N200
    publicKey: 'pk_test_dsdfghuytfd2345678gvxxxxxxxxxx',
};

const handleSuccess = (reference) => {
  console.log(reference);
};

const handleClose = () => {
  console.log('closed')
};

function App() {
  const componentProps = {
      ...config,
      text: 'Paystack Button Implementation',
      onSuccess: (reference) => handleSuccess(reference),
      onClose: handleClose
  };

  return (
    <div className="App">
      <PaystackConsumer {...componentProps} >
        {({initializePayment}) => <button onClick={() => initializePayment(handleSuccess, handleClose)}>Paystack Consumer Implementation</button>}
      </PaystackConsumer>
    </div>
  );
}
```

##### Option 3: Using `PaystackButton` Component
```javascript
import React from 'react';
import { PaystackButton } from 'react-paystack';

const config = {
  reference: (new Date()).getTime().toString(),
  email: "user@example.com",
  amount: 20000, // Amount is in the country's lowest currency. E.g Kobo, so 20000 kobo = N200
  publicKey: 'pk_test_dsdfghuytfd2345678gvxxxxxxxxxx',
};

function App() {
  const handlePaystackSuccessAction = (reference) => {
    console.log(reference);
  };

  const handlePaystackCloseAction = () => {
    console.log('closed')
  };

  const componentProps = {
      ...config,
      text: 'Paystack Button Implementation',
      onSuccess: (reference) => handlePaystackSuccessAction(reference),
      onClose: handlePaystackCloseAction,
  };

  return (
    <div className="App">
      <PaystackButton {...componentProps} />
    </div>
  );
}
```

### Android (Kotlin/Java)

#### Installation
Add the following dependency to your `build.gradle` file:
```gradle
implementation 'com.paystack.android:paystack-ui:0.0.9'
```

#### Kotlin Implementation
```kotlin
import com.paystack.android.core.Paystack
import com.paystack.android.ui.paymentsheet.PaymentSheet
import com.paystack.android.ui.paymentsheet.PaymentSheetResult

class MainActivity : AppCompatActivity() {
    private lateinit var paymentSheet: PaymentSheet

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        Paystack.builder()
            .setPublicKey("pk_test_xxxx")
            .build()
        paymentSheet = PaymentSheet(this, ::paymentComplete)
    }

    private fun makePayment() {
        // Pass access_code from transaction initialize call
        paymentSheet.launch("br6cgmvflhn3qtd")
    }

    private fun paymentComplete(paymentSheetResult: PaymentSheetResult) {
        val message = when (paymentSheetResult) {
            PaymentSheetResult.Cancelled -> "Cancelled"
            is PaymentSheetResult.Failed -> {
                Log.e("Something went wrong", paymentSheetResult.error.message.orEmpty(), paymentSheetResult.error)
                paymentSheetResult.error.message ?: "Failed"
            }
            is PaymentSheetResult.Completed -> {
                // Returns the transaction reference PaymentCompletionDetails(reference={TransactionRef})
                Log.d("Payment successful", paymentSheetResult.paymentCompletionDetails.toString())
                "Successful"
            }
        }
    }
}
```

### iOS (Swift)

#### Installation
1. Open your Xcode project
2. Navigate to `File > Add Package Dependencies…`
3. Paste the Paystack SDK repository URL into the search box and follow the prompts

#### SwiftUI Implementation
```swift
import SwiftUI
import PaystackCore
import PaystackUI

struct PaymentView: View {
    let paystack = try? PaystackBuilder
            .newInstance
            .setKey("pk_domain_xxxxxxxx")
            .build()

    var body: some View {
        VStack(spacing: 8) {
            Text("Make Payment")

            paystack?.chargeUIButton(accessCode: "0peioxfhpn", onComplete: paymentDone) {
                Text("Initiate Payment")
            }
        }
        .padding()
    }

    func paymentDone(_ result: TransactionResult) {
        // Handle transaction result
        print(result)
    }
}
```

#### UIKit Implementation
```swift
import UIKit
import PaystackCore
import PaystackUI

// In your ViewController:

func initializePaystack() {
    do {
        let paystack = try PaystackBuilder
            .newInstance
            .setKey("pk_domain_xxxxxxxx") // Replace with your actual public key
            .build()
        
        // Now you can use the paystack instance to initiate payments
        // For example, to present a charge button:
        // paystack.chargeUIButton(...) 
    } catch {
        print("Error initializing Paystack: \(error)")
    }
}

@IBAction func payButtonTapped(_ sender: Any) {
    paystack?.presentChargeUI(on: self,
                              accessCode: "0peioxfhpn",
                              onComplete: paymentDone)
}
```

### Flutter

#### Installation
Add to pubspec: `flutter pub get paystack_flutter_sdk`

#### Implementation
```dart
import 'package:paystack_flutter_sdk/paystack_flutter_sdk.dart';
import 'dart:developer';

final _publicKey = "pk_domain_xxxxxx";
final _accessCode = "67joTry7t1jz2o";
final _paystack = Paystack();

initialize(String publicKey) async {
  try {
    final response = await _paystack.initialize(publicKey, true);
    if (response) {
      log("Successfully initialised the SDK");
    } else {
      log("Unable to initialise the SDK");
    }
  } on PlatformException catch (e) {
    log(e.message!);
  }
}

launch() async {
  String reference = "";
  try {
    final response = await _paystack.launch(_accessCode);
    if (response.status == "success") {
      reference = response.reference;
      log(reference);
    } else if(response.status == "cancelled") {
      log(response.message);
    } else {
      log(response.message);
    }
  } on PlatformException catch (e) {
    log(e.message!);
  }

  setState(() {
    _reference = reference;
  });
}
```

### Python

#### Installation
```bash
pip install paystack-sdk
```

#### Implementation
```python
import paystack
from pprint import pprint

# Set your API key based on domain (test or live mode)
paystack.api_key = 'sk_domain_xxxxxxxx'

# Example: List customers
response = paystack.Customer.list()
pprint(response)

# Example: Submit OTP to complete a charge
otp = '123456'  # Customer's OTP
reference = 'your_transaction_reference'  # The reference of the ongoing transaction

response = paystack.Charge.submit_otp(otp, reference)
pprint(response)
```

## Security Best Practices

1. **Never expose secret keys on the client side**: Secret keys should only be used on your server
2. **Use webhooks to verify payment status**: Always use `charge.success` webhook event before delivering value
3. **Server-side transaction initialization**: The `transaction.initialize` endpoint should only be called from your server with your secret key
4. **Validate input**: Always validate amounts, emails, and other input parameters
5. **Handle errors gracefully**: Implement proper error handling for all Paystack operations

## Key Endpoints

### Transaction Endpoints
- **POST /transaction/initialize** - Initialize a transaction
- **GET /transaction/verify/:reference** - Verify transaction status
- **GET /transaction/:id** - Get specific transaction details

### Customer Endpoints
- **GET /customer** - List customers
- **POST /customer** - Create a customer

### Plan Endpoints
- **POST /plan** - Create a plan for recurring payments
- **GET /plan** - List plans

### Product Endpoints
- **POST /product** - Create a product
- **GET /product** - List products

### Subaccount Endpoints
- **POST /subaccount** - Create a subaccount
- **GET /subaccount/:id_or_code** - Retrieve a specific subaccount

### Settlement Endpoints
- **GET /settlement** - Retrieve list of settlements
- **GET /settlement/:id/transactions** - Fetch settlement transactions

### Terminal Endpoints
- **GET /terminal** - List all terminals
- **GET /terminal/:terminal_id** - Retrieve specific terminal details

### Dispute Endpoints
- **GET /dispute/:id/upload_url** - Generate pre-signed URL for evidence upload

### Subscription Endpoints
- **POST /subscription** - Create a subscription
- **GET /subscription/:id_or_code** - Fetch specific subscription