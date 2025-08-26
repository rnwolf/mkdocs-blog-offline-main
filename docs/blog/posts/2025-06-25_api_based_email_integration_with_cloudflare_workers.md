---
title: "Sending Emails from Cloudflare Workers with MailChannels and JMAP"
description: "How I integrated email into my website with Cloudflare workers"
date:
  created: 2025-06-25T11:00:00Z
categories: ["technology"]
authors:
  - rnwolf
tags: ["website", "API", "Cloudflare", "newsletter", "email"]
draft: false
slug: sending_emails_from_cloudflare_workers
---

## The Problem

I currently have dozens of bots signing up to my newsletter, and it's becoming increasingly difficult to manage the influx of fake accounts. I need a solution that can help me filter out these bots and ensure that only genuine users are able to subscribe.

In the process of building the newsletter sign-up, I went down an unexpected rabbit hole involving modern email protocols.
<!-- more -->

#  Initial Requirements (Cloudflare Workers Turnstile with double opt-in via email)

In my quest to learn more about how AI can be used in web development, I decided to use some of the new tools like Claude.ai and ChatGPT to develop what seemed like a simple application.  My currently newsletter subscription form is powered by a simple GCP Cloud Function.

I decided that as I use Cloudflare Workers to host my current static website and provide some protection via "Cloudflare workers" it would be a good idea to use Workers for this experiment as well.

"Cloudflare Workers" offer several benefits, including:

- Serverless Simplicity - You don't need to manage servers, handle scaling, or worry about infrastructure.
- Cost Effectiveness - The pricing model is very competitive. The free tier is generous (100,000 requests per day)
- Developer Experience - Local development with Wrangler CLI is easy and quick
- Cloudflare Ecosystem - Integrate with other Cloudflare services like AI, workflows, queues and DNS.

## The Solution

Implementing a solution that
- uses Cloudflare Workers to and Cloudflare's Turnstile to filter out bots
- use a double opt-in process that requires users to confirm their email address

## The Issue

I thought I could use the Cloudflare Workers to send emails directly via my SMTP server, but it turns out that Cloudflare Workers do not support SMTP directly. Instead, I needed to use an API-based email service.

## The Implementation

### First Approach

When I asked Claude.ai to help me with the implementation, it suggested using a third-party email service Mailchannel. This service provides an API that can be used to send emails from Cloudflare Workers.

The MailChannels service provides 100 free emails per day.

When you use a service other than your regular emailer provider, you need to ensure that you have the necessary DNS records set up to ensure that your emails are delivered correctly and not marked as spam.

This requires setting up a Domain Lockdown record, which is a TXT record that is used to verify that you own the domain. The fact that you can create the TXT record is proof of your ownership.

This is a simple script that checks if the Domain Lockdown record is set up correctly and sends a test email using the MailChannels API.

```python
#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12"
# dependencies = ["requests", "dnspython"]
# [tool.uv]
# exclude-newer = "2025-06-06T00:00:00Z"
# ///
# scripts/test_mailchannels_send.py
import os
import requests
import json
import sys
import dns.resolver # For DNS TXT record lookup
import datetime

# --- Configuration ---
MAILCHANNEL_API_KEY = os.environ.get("MAILCHANNEL_API_KEY")
MAILCHANNEL_AUTH_ID = os.environ.get("MAILCHANNEL_AUTH_ID")

# --- Test Email Details (Customize as needed) ---
# It's best to use a sender email address that is verified with MailChannels
# and a recipient email address that you control for testing.
SENDER_EMAIL = os.environ.get("SENDER_EMAIL")
SENDER_NAME = os.environ.get("SENDER_NAME", "Newsletter Test")
RECIPIENT_EMAIL = os.environ.get("RECIPIENT_EMAIL") # Set this environment variable to your test email to yourself
TEST_SUBJECT = "MailChannels Newsletter Test Email"
datetime_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

TEST_HTML_CONTENT = f"""
<h1>MailChannels API Newsletter Test Successful!</h1>
<p>This email was sent using the MailChannels API via a Python script.</p>
<p>If you received this, your API key and basic sending configuration are working.</p>
<p>Sent: {datetime_str}</p>
"""
TEST_TEXT_CONTENT = f"""
MailChannels API Newsletter Test Successful!
This email was sent using the MailChannels API via a Python script.
If you received this, your API key and basic sending configuration are working.
Sent: {datetime_str}
"""

# Your domain configured with MailChannels for DKIM
DOMAIN_TO_CHECK = SENDER_EMAIL.split('@')[1] if '@' in SENDER_EMAIL else None  # Domain to check for lockdown record

# --- Validation ---
if not MAILCHANNEL_API_KEY:
    print("Error: MAILCHANNEL_API_KEY environment variable not set.")
    sys.exit(1)
if not RECIPIENT_EMAIL:
    print("Error: RECIPIENT_EMAIL environment variable not set. Please set it to your test recipient address.")
    sys.exit(1)
if not SENDER_EMAIL:
    print("Warning: SENDER_EMAIL is not set.")
if not DOMAIN_TO_CHECK:
     print(f"Warning: Using DOMAIN_TO_CHECK: {DOMAIN_TO_CHECK} for Domain Lockdown record check. Ensure this is your sending domain.")


# --- MailChannels API Details ---
MAILCHANNELS_API_URL = "https://api.mailchannels.net/tx/v1/send"

headers = {
    "Content-Type": "application/json",
    "x-api-key": MAILCHANNEL_API_KEY,
    "X-MailChannels-Auth-Id": MAILCHANNEL_AUTH_ID if MAILCHANNEL_AUTH_ID else None,
}

payload = {
    "personalizations": [
        {
            "to": [{"email": RECIPIENT_EMAIL}],
        }
    ],
    "from": {
        "email": SENDER_EMAIL,
        "name": SENDER_NAME
    },
    "subject": TEST_SUBJECT,
    "content": [
        {
            "type": "text/plain",
            "value": TEST_TEXT_CONTENT
        },
        {
            "type": "text/html",
            "value": TEST_HTML_CONTENT
        }
    ]
}

# --- Domain Lockdown Check ---
def check_domain_lockdown(domain: str):
    """Checks for the MailChannels Domain Lockdown TXT record."""
    record_name = f"_mailchannels.{domain}"
    print(f"\nChecking Domain Lockdown TXT record for: {record_name}...")
    try:
        answers = dns.resolver.resolve(record_name, 'TXT')
        found_valid_record = False
        for rdata in answers:
            for txt_string in rdata.strings:
                txt_value = txt_string.decode('utf-8')
                print(f"  Found TXT record: {txt_value}")
                if txt_value.lower().startswith("v=mc1"): # MailChannels records start with v=mc1
                    found_valid_record = True
                    break  # Exit inner loop
            if found_valid_record:
                break  # Exit outer loop

        if found_valid_record:
            print("  Domain Lockdown TXT record appears to be configured correctly.")
            return True
        else:
            print("  Warning: No valid MailChannels Domain Lockdown TXT record (v=mc1...) found.")
            return False
    except dns.resolver.NXDOMAIN:
        print(f"  Error: The DNS record {record_name} does not exist (NXDOMAIN). Domain Lockdown is likely not configured or misconfigured.")
        return False
    except Exception as e:
        print(f"  An error occurred during DNS lookup for Domain Lockdown record: {e}")
        return False

# --- Send Test Email ---
def send_test_email():
    """Sends a test email using the MailChannels API."""
    print(f"Attempting to send a test email to: {RECIPIENT_EMAIL} from: {SENDER_EMAIL}")
    print(f"Using MailChannels API Key (first 5 chars): {MAILCHANNEL_API_KEY[:5]}...")

    try:
        response = requests.post(MAILCHANNELS_API_URL, headers=headers, data=json.dumps(payload))

        if response.status_code == 202: # MailChannels returns 202 Accepted on success
            print("Successfully sent test email! MailChannels accepted the request.")
            print("Please check the recipient's inbox.")
        else:
            print(f"Error sending email. Status Code: {response.status_code}")
            print("Response Body:")
            try:
                print(json.dumps(response.json(), indent=2))
            except json.JSONDecodeError:
                print(response.text)
            sys.exit(1) # Exit with error code if sending failed

    except requests.exceptions.RequestException as e:
        print(f"An error occurred during the HTTP request: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        sys.exit(1)

# --- Main Execution ---
if __name__ == "__main__":
    lockdown_ok = check_domain_lockdown(DOMAIN_TO_CHECK)
    if not lockdown_ok:
        # Decide if you want to proceed with sending the test email or exit
        proceed = input("Domain Lockdown check failed. Do you want to proceed with sending the test email? (Y/N): ").strip().lower()
        if proceed != 'y':
            print("Aborting test email send.")
            sys.exit(1)
    print("Domain Lockdown check passed or skipped. Proceeding to send test email...")
    send_test_email()

```

### Final Approach via JMAP

But integrating with MailChannels introduced some complexity. The DNS TXT record and the fact that I was using an additional service.

It turns out that my email provider, Fastmail, supports [JSON Meta Application Protocol (JMAP)](https://jmap.io/). JMAP is a modern alternative to IMAP/SMTP that uses REST-like HTTP requests instead of persistent connections.
Fastmail provides [sample code](https://github.com/fastmail/JMAP-Samples) for sending emails via JMAP, which I used as a starting point for my experimentation.

When using the [TinyJMAPClient](https://raw.githubusercontent.com/fastmail/JMAP-Samples/refs/heads/main/python3/tiny_jmap_library.py) you can write a simple script to send an email using JMAP.

```python
#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12"
# dependencies = ["requests"]
# [tool.uv]
# exclude-newer = "2025-06-06T00:00:00Z"
# ///

import pprint
import os
from tiny_jmap_library import TinyJMAPClient

JMAP_HOSTNAME=os.environ.get("JMAP_HOSTNAME", "api.fastmail.com")
JMAP_USERNAME=os.environ.get("JMAP_USERNAME")
JMAP_API_TOKEN=os.environ.get("JMAP_API_TOKEN")

# Set up our client from the environment and set our account ID
client = TinyJMAPClient(
    hostname=JMAP_HOSTNAME,
    username=JMAP_USERNAME,
    token=JMAP_API_TOKEN,
)
account_id = client.get_account_id()

# Here, we're going to find our drafts mailbox, by calling Mailbox/query
query_res = client.make_jmap_call(
    {
        "using": ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
        "methodCalls": [
            [
                "Mailbox/query",
                {"accountId": account_id, "filter": {"name": "Drafts"}},
                "a",
            ]
        ],
    }
)

# Pull out the id from the list response, and make sure we got it
draft_mailbox_id = query_res["methodResponses"][0][1]["ids"][0]
assert len(draft_mailbox_id) > 0

# Great! Now we're going to set up the data for the email we're going to send.
body = """
Hi!

This email may not look like much, but I sent it with JMAP, a protocol
designed to make it easier to manage email, contacts, calendars, and more of
your digital life in general.

Pretty cool, right?

--
This email sent from my next-generation email system at Fastmail.
"""

draft = {
    "from": [{"email": "=?UTF-8?q?R=C3=BCdiger's_Newsletter?= <newsletter@rnwolf.net>"}],
    "to": [{"email": "rudi@rnwolf.net"}],
    "subject": "Hello, world!",
    "keywords": {"$draft": True},
    "mailboxIds": {draft_mailbox_id: True},
    "bodyValues": {"body": {"value": body, "charset": "utf-8"}},
    "textBody": [{"partId": "body", "type": "text/plain"}],
}

identity_id = client.get_identity_id()

# Here, we make two calls in a single request. The first is an Email/set, to
# set our draft in our drafts folder, and the second is an
# EmailSubmission/set, to actually send the mail to ourselves. This requires
# an additional capability for submission.
create_res = client.make_jmap_call(
    {
        "using": [
            "urn:ietf:params:jmap:core",
            "urn:ietf:params:jmap:mail",
            "urn:ietf:params:jmap:submission",
        ],
        "methodCalls": [
            ["Email/set", {"accountId": account_id, "create": {"draft": draft}}, "a"],
            [
                "EmailSubmission/set",
                {
                    "accountId": account_id,
                    "onSuccessDestroyEmail": ["#sendIt"],
                    "create": {
                        "sendIt": {
                            "emailId": "#draft",
                            "identityId": identity_id,
                        }
                    },
                },
                "b",
            ],
        ],
    }
)

pprint.pprint(create_res)
```


After I proved to myself that this worked I made sure to test it in with TypeScript as this is the language I use for my Cloudflare Workers.


```typescript
#!/usr/bin/env node
// bail if we don't have our ENV set:
if (!process.env.JMAP_SENDER || !process.env.JMAP_USERNAME || !process.env.JMAP_API_TOKEN) {
  console.log("Please set your JMAP_SENDER, JMAP_USERNAME, and JMAP_API_TOKEN");
  console.log("JMAP_SENDER=sendername JMAP_USERNAME=username JMAP_API_TOKEN=token node hello-world.js");

  process.exit(1);
}

const hostname = process.env.JMAP_HOSTNAME || "api.fastmail.com";
const sendername = process.env.JMAP_SENDER;
const username = process.env.JMAP_USERNAME;


console.log(`JMAP_HOSTNAME: ${hostname}`);
console.log(`JMAP_SENDER: ${sendername}`);
console.log(`JMAP_USERNAME: ${username}`);

const authUrl = `https://${hostname}/.well-known/jmap`;
const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.JMAP_API_TOKEN}`,
};

const getSession = async () => {
  const response = await fetch(authUrl, {
    method: "GET",
    headers,
  });
  return response.json();
};

const mailboxQuery = async (apiUrl, accountId) => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
      methodCalls: [
        ["Mailbox/query", { accountId, filter: { name: "Drafts" } }, "a"],
      ],
    }),
  });
  const data = await response.json();

  return await data["methodResponses"][0][1].ids[0];
};

const identityQuery = async (apiUrl, accountId) => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      using: [
        "urn:ietf:params:jmap:core",
        "urn:ietf:params:jmap:mail",
        "urn:ietf:params:jmap:submission",
      ],
      methodCalls: [["Identity/get", { accountId, ids: null }, "a"]],
    }),
  });
  const data = await response.json();

  return await data["methodResponses"][0][1].list.filter(
    (identity) => identity.email === username
  )[0].id;
};

const draftResponse = async (apiUrl, accountId, draftId, identityId) => {
  console.log(`accountId: ${accountId}`);
  console.log(`identityId: ${identityId}`);
  console.log(`draftId: ${draftId}`);

  const messageBodyText =
    "Hi! \n\n" +
    "This email may not look like much, but I sent it with JMAP, a protocol \n" +
    "designed to make it easier to manage email, contacts, calendars, and more of \n" +
    "your digital life in general. \n\n" +
    "Pretty cool, right? \n\n" +
    "-- \n" +
    "This email sent from my next-generation email system at Fastmail. \n";

  const messageBodyHtml =
    "<p>Hi!</p>" +
    "<p>This email may not look like much, but I sent it with <b>JMAP</b>, a protocol<br>" +
    "designed to make it easier to manage email, contacts, calendars, and more of<br>" +
    "your digital life in general.</p>" +
    "<p>Pretty cool, right?</p>" +
    "<hr>" +
    "<p>This email sent from my next-generation email system at Fastmail.</p>";

  const draftObject = {
    from: [{ email: sendername }],
    to: [{ email: username }],
    subject: "Hello, world!",
    keywords: { $draft: true },
    mailboxIds: { [draftId]: true },
    bodyValues: {
      textBody: { value: messageBodyText, charset: "utf-8" },
      htmlBody: { value: messageBodyHtml, charset: "utf-8" }
    },
    textBody: [{ partId: "textBody", type: "text/plain" }],
    htmlBody: [{ partId: "htmlBody", type: "text/html" }]
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      using: [
        "urn:ietf:params:jmap:core",
        "urn:ietf:params:jmap:mail",
        "urn:ietf:params:jmap:submission",
      ],
      methodCalls: [
        ["Email/set", { accountId, create: { draft: draftObject } }, "a"],
        [
          "EmailSubmission/set",
          {
            accountId,
            onSuccessDestroyEmail: ["#sendIt"],
            create: { sendIt: { emailId: "#draft", identityId } },
          },
          "b",
        ],
      ],
    }),
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
};

const run = async () => {
  const session = await getSession();
  const apiUrl = session.apiUrl;
  const accountId = session.primaryAccounts["urn:ietf:params:jmap:mail"];
  const draftId = await mailboxQuery(apiUrl, accountId);
  const identityId = await identityQuery(apiUrl, accountId);
  draftResponse(apiUrl, accountId, draftId, identityId);
};

run();

```

## Conclusion

In summary when you compare the two approaches:

 - MailChannels: 100 free emails/day, requires DNS setup, and additional costs when exceeding that
 - JMAP: Depends on email provider having JMAP support, no third-party service as its already part of the infrastructure

In my case I already use Fastmail, technically both can be used in cloudflare functions, so in order to keep the number of suppliers and costs as low as possible I decided JMAP was the better solution for me.