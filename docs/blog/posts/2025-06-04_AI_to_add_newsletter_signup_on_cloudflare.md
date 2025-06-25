---
title: "New website newsletter sign-up"
description: "How I added a newsletter sign-up form to my static website blog using Claude.AI."
date:
  created: 2024-06-04T11:00:00Z
categories: ["technology"]
authors:
  - rnwolf
tags: ["mkdocs", "website", "AI", "Cloudflare", "newsletter"]
draft: true
slug: new_newsletter_sign_up_via_cloudflare_developed_with_claude_ai
---

# New Cloudflare Worker for newsletter sign-Up co-developed with Claude.AI

I recently added a newsletter sign-up form to my static website blog using Cloudflare Workers co-developed with Claude.ai.
The process was straightforward, allowing me to implement a feature in a technology that I don't have a sound understanding of. Here is what I did:
<!-- more -->
## Context

Artificial Intelligence (AI) is the new **Hotness** in the tech world and its seems set to have a profound impact on many industries. In the last decade I have worked on enterprise __digital transformation__ assignments.
In order to stay relevant, I need to keep up with the latest trends and technologies.
Last week (May 2025) Dario Amodei — CEO of Anthropic, a big player in the field of artificial intelligence [posted](https://www.axios.com/2025/05/28/ai-jobs-white-collar-unemployment-anthropic) a warning for all of us.

> :memo: (May 2025) Dario Amodei — CEO of Anthropic
AI could wipe out half of all entry-level white-collar jobs — and spike unemployment to 10-20% in the next one to five years.

To remain relevant in the [software jobs market](https://www.anthropic.com/research/impact-software-development) I need to keep up with what AI can do and how it might be able to help.

I read a lot and have shared references to the good stuff with friends and colleagues. I have frequently been asked if I had an email newsletter so that they could continue to get these interesting posts.

## The Problem

Now that I have rebuilt my [personal website](https://www.rnwolf.net/blog/2024/06/13/new_mkdocs_blog_website/), how do I best add a newsletter feature?
I could use a third-party service, but I wanted to keep the solution simple, secure and self-hosted.
Adding a newsletter sign-up form to a static website is not straightforward.

I decided to use a Cloudflare Worker to handle the newsletter sign-up form submission.
But as I had never written a Cloudflare Worker before in Typescript, the preferred language for Cloudflare Workers, I decided this was a good project for an AI coding assistant.

## The Solution

I used Claude AI to help me write the Cloudflare Worker code. I have been using AI agents to help me coding Python. Claude was doing a good job of that, so I thought I would try it for this feature.
While I don't get paid professionally to write code, one of my superpowers has been to use code to automate and help with data analysis for the teams and products I have been managing.
I do have a lot of experience in software development and have been coding since the 1980s. I did study computer science at university as part of my engineering degree.

## The Implementation

To keep things simple I used _Claude.ai_ the browser interface to interact with Claude 4. Not _Claude Code_ which is a separate product that is designed to integrate with an IDE.

From my readings I learnt that to get the best results from AI you need to provide it with a lot of context. The context can be in the form of a prompt, which is a description of the problem and or the desired outcome. Additionally, you can provide rules, examples, and constraints to guide the AI in generating the code. When the project is larger it is important to break it down into smaller tasks via a series of prompts in an implementation plan.

1.  I started by writing a prompt that requested the AI ask me questions in order to write a requirements specification.

    !!! quote "Prompt to Claude AI"
        I am hosting a MkDocs static website at cloudflare.
        I have setup a cloudflare worker to create CSP record for scripts. That is all working ok.
        I want to create a page and another cloudflare worker to allow users to signup for newsletter.  Can you help create a Design-Specification-Document for this newsletter subscription service. Please ask me questions one at a time to help crate this specification.



2.  I answered the questions and provided the information requested by Claude.

    - Use Cloudflare Workers
    - Use Cloudflare D1 database to store registration statuses
    - Newsletter will be sent by locally run python script that connects to D1 database
    - Each newsletter must contain an unsubscribe link
    - Put Cloudflare workers code in a new Github repo
    - Use Cloudflare turnstile on the front end to ensure that registrants are human

3.  I then asked Claude to incorporate the prompt cloudflare recommends for Cloudflare Workers.

    !!! quote "Prompt to Claude AI"
        Under "Additional Recommendations" I would like to incorporate how we can ensure that we use the prompt recommended for Cloudflare worker development.  See the prompt in this section of the cloudflare website https://developers.cloudflare.com/workers/get-started/prompting/#build-workers-using-a-prompt

    [Newsletter Subscription Service - Design Specification Document](https://github.com/rnwolf/rnwolf-newsletter-backend-service/blob/main/docs/newsletter_design_spec.md)

4.  I then asked Claude to write an implementation plan.

    !!! quote "Prompt to Claude AI"
        Generate a comprehensive task list including testing for each task.
        Once we have the comprehensive task list we can work on implementing each of the tasks in a controlled manner.
        What else can you recommend we do next?

5.  I then asked Claude to update the implementation plan to use TDD (Test Driven Development) approach.

    I have noticed when working with AI, it sometimes get carried away and starts to generate code without a clear plan. By asking it to generate a task list, followed by automated tests for each task, I was able to keep it focused on the requirements and the implementation plan. The automated tests make it easier to verify that the code works as expected and that has not broken any existing functionality.

    [Newsletter Subscription Service - Implementation Task List](https://github.com/rnwolf/rnwolf-newsletter-backend-service/blob/main/docs/newsletter_implementation_tasks.md)



6. I then asked Claude to document the SDLC for the project.


    !!! quote "Prompt to Claude AI"
        Before you demonstrate how we'd apply TDD to Task 2.1, I would like you to explain the SDLC that we will use.  I want to know what the development steps are from local development environment to test environment hosted in cloudflare and then finally the deployment to production environment.

        Remember that we have a versioned API url, so that breaking changes will be deployed to a new end point before we retire the old API.

        We this need to be really clear on the overall pipeline from local dev to production. What the current live multiple versions of API are, and how we go about retiring superseded endpoints.


    [Newsletter Service - SDLC Pipeline & API Versioning Strategy](https://github.com/rnwolf/rnwolf-newsletter-backend-service/blob/main/docs/newsletter_sdlc_pipeline.md)

    [Newsletter Backend Service - Repository Setup & Deployment Guide](https://github.com/rnwolf/rnwolf-newsletter-backend-service/blob/main/docs/newsletter_backend_deployment.md)

7. Now we started to implement the tasks in the implementation plan.

    I had to ask Claude for some clarity on using TDD. I got another document.

    [Task 2.1: Newsletter Subscription Worker - TDD Implementation](https://github.com/rnwolf/rnwolf-newsletter-backend-service/blob/main/docs/newsletter_subscription_tdd.md)

8. It took a couple of iterations to get the working code in all of the environments.

    Claude had generated code that assumed older version of Wrangler, the CLI used to develop Cloudflare Workers. I had to ask Claude to update the code to use the latest version of Wrangler.

    The testing was a bit tricky. I had to ask Claude to generate parametrized tests that could be used in all parts of the pipeline.

    Finally we got the code working in all environments.

    ```
    Your SDLC Pipeline is Complete
    Local Development → Tests Pass → Staging Deployment → Tests Pass → Production Ready
        ↓                ↓               ↓               ↓
    Fast Iteration   Confidence    Real Environment   Validation
    ```

9.  CORS headers are missing from your API responses

    When implementing the front end with the new backend service I found that access was blocked by the CORS policy. I had to ask Claude to add CORS headers to the API responses. This was not part of the original requirements, but it is a common requirement for APIs that are accessed from a web browser.

    Extra tests were added to the test suite to verify that the CORS headers were present in the API responses.

10. Additional debugging and logging to help with troubleshooting production issues

    I had to ask Claude to add additional debugging and logging to the code. It turned out I had not crated the database in production the first time round.

11. Enhance process to make it obvious that the user has successfully signed-up.

    It was not obvious to me that the form was submitted successfully. I had to ask Claude to update the JavaScript code to redirect the user to a Success page after a successful sign-up.

12. At this stage the conversation with Claude was getting a bit long.

    I decided to create a new conversation and ask Claude to summarize the previous conversation so that we could continue with the implementation.


### Newsletter Subscription Service - Project Summary & Status

#### Project Overview

I can see you've made significant progress on your newsletter subscription service using Claude Code AI. This is a comprehensive Cloudflare Workers-based API backend with proper TDD implementation, multi-environment deployment, and thorough documentation.

#### Current Project Status

✅ Completed Components

##### 1. Core Infrastructure

- Cloudflare Workers backend with TypeScript
- D1 database with proper schema and indexes
- Multi-environment configuration (local, staging, production)
- Comprehensive test suite using Vitest and @cloudflare/vitest-pool-workers

##### 2. API Implementation

- Newsletter subscription endpoint (/v1/newsletter/subscribe)
- Health check endpoint (/health)
- Proper CORS configuration for www.rnwolf.net
- Email validation and normalization
- Turnstile bot protection integration
- Comprehensive error handling

##### 3. Database Design

- Single table evolution approach for future API versioning
- Proper indexing for performance
- Metadata collection (IP, User-Agent, Country)
- Support for re-subscriptions

##### 4. Testing Strategy

- Multi-environment testing (local, staging, production)
- Comprehensive test coverage including CORS, validation, database operations
- TDD-driven development approach
- Integration and smoke tests

##### 5. Documentation

- Design specification document
- Implementation task list with TDD methodology
- SDLC pipeline and API versioning strategy
- Repository setup and deployment guide
- Detailed TDD demonstration

##### 6. ✅ Frontend Integration (COMPLETED)

- Task 3.1: CSP headers updated for Turnstile ✅
- Task 3.2: Newsletter JavaScript for MkDocs ✅
- Task 3.3: HTML form template ✅
- Task 3.4: MkDocs integration ✅

#### 🔄 In Progress/Next Steps

Based on your implementation tasks document, here's what appears to be the next priorities:

##### 1. Newsletter Distribution System

- Newsletter sender Python script (provided above)
- Subscriber fetcher Python script (provided above)

##### 2. Unsubscribe Functionality

- Task 2.2: Create unsubscribe worker (next major task)
- HMAC token verification
- Database update for unsubscribed users
- Confirmation page response

#### Key Architectural Decisions Made

- Single Database Evolution: Using one database schema that evolves backward-compatibly rather than separate databases per API version
- Test-Driven Development: Comprehensive TDD approach with multiple test suites
- Multi-Environment Strategy: Local, staging, and production environments with different testing strategies
- CORS-First Design: All responses include proper CORS headers for frontend integration
