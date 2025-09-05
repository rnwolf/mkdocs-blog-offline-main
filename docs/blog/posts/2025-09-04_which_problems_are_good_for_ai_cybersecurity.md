---
title: "Which problems are suitable for AI solutions?"
description: "Unpacking AI and Cybersecurity Insights from Michael Brown in interview with Daniel Messier"
date:
  created: 2025-09-05T08:00:00Z
categories: ["ai","technology"]
authors:
  - rnwolf
tags: ["ai", "cybersecurity", "machine learning"]
draft: false
slug: problems_suitable_for_ai
---

## Unpacking AI and Cybersecurity: Insights from Michael Brown

An interview exploring AI's role in cybersecurity.  Insights from Michael Brown, a principal security engineer, on AI-driven vulnerability detection and system design. Runner-up in the AI Cyber Challenge with "Buttercup".

 - **Problem Formulation**: Understanding which problems are suitable for AI solutions is crucial.
 - **Conditional Probability**: Over-reliance on AI can lead to **compounding errors**.

<!-- more -->

### Introduction

In the ever-evolving world of cybersecurity, AI and machine learning (ML) are becoming pivotal in addressing complex security challenges. Michael Brown, a principal security engineer at Trail of Bits, offers a unique perspective on how these technologies can be harnessed to tackle traditional cybersecurity problems. In this engaging conversation, we delve into the design principles behind AI systems, their implementation in cybersecurity, and the [lessons learned](https://blog.trailofbits.com/2025/08/09/trail-of-bits-buttercup-wins-2nd-place-in-aixcc-challenge/) from participating in the [AI Cyber Challenge](https://aicyberchallenge.com/).

<div class="video-wrapper">
  <iframe width="1280" height="720" src="https://www.youtube.com/embed/nvU0GbA9F9Q" frameborder="0" allowfullscreen></iframe>
</div>
<figcaption>Youtube 1:  Episode of Unsupervised Learning, I sit down with Michael Brown, Principal Security Engineer at Trail of Bits, to dive deep into the design and lessons learned from the AI Cyber Challenge (AIxCC) </figcaption>

### The Role of AI in Cybersecurity

Michael's team at Trail of Bits focuses on two main intersections of AI and security: using AI/ML technologies to address traditional cybersecurity issues and ensuring the security of AI/ML-based systems. The primary objective is to build autonomous AI-driven systems capable of identifying and patching vulnerabilities with high accuracy.

#### The AI Cyber Challenge and Buttercup

Trail of Bits participated in the AI Cyber Challenge with their tool, Buttercup, which secured second place. The competition required participants to develop a fully autonomous system to find and patch vulnerabilities in open-source software. Despite initial ambitious plans, the team had to adapt to competition rules and constraints, ultimately creating a modular system that could efficiently manage multiple tasks.

#### System Design Principles

Buttercup's design was based on several core tasks:

- **Vulnerability Detection**: Identifying vulnerabilities and proving their existence with a crashing test case.
- **Contextual Analysis**: Gathering additional information to ensure effective patching.
- **Patching**: Applying AI-driven solutions to patch identified vulnerabilities.
- **Orchestration**: Ensuring system stability and high uptime for continuous operation.

The team adopted a "best of both worlds" approach, leveraging both conventional software analysis methods and generative AI to address different subproblems within the pipeline.

### Designing Robust AI Systems

A key debate in AI system design is whether to rely heavily on the AI model or to build a robust system with AI as a supportive element. Michael advocates for the latter, where AI aids in guiding the system but does not replace traditional deterministic technologies entirely.

#### Modular Approach and Rapid Development

Given time constraints, the team opted for a **modular design**, enabling independent development and later integration of components. This modularity allowed for flexibility in strategy and the ability to test various approaches efficiently.

#### AI's Strengths and Limitations

AI excels in tightly constrained, context-rich problems. For instance, large language models (LLMs) are effective in generating patches due to their ability to internalise vast amounts of code and commit histories. However, they struggle with tasks requiring ground truth identification, such as vulnerability detection, where traditional methods like fuzzing prove more reliable.

### Lessons Learned and Future Directions

Michael's experience highlights the **importance of using AI strategically**, **focusing on areas where it offers the most value**. The competition also underscored the potential of LLMs in generating code patches and improving fuzzer performance, exceeding initial expectations.

#### Key Takeaways

- **Problem Formulation**: Understanding which problems are suitable for AI solutions is crucial. AI should be applied to problems that are descriptive rather than prescriptive.
    - Are there [sub-problems that are suited to AI?](https://youtu.be/nvU0GbA9F9Q?t=1599)
    - 1. Do you have enough data that you can use for training? Either locally or on the Internet.
    - 2. Is there a probabilistic nature to the data? ie when you plot variables of the data you can see that there is a relationship. You could draw a line that follows the dots in chart. For example the sales price of property and relationship to size of property. There need to be **common dimensions**, every house has a size.
- **Conditional Probability**: Over-reliance on AI can lead to **compounding errors**. Deterministic solutions should be employed where possible to ensure reliability.
- **Adaptation to evolving AI capabilities**: Expect AI capabilities to improve and evolve and thus you need to design a solution that can adapt.

### Conclusion

The integration of AI in cybersecurity offers exciting possibilities, but it requires careful consideration and strategic implementation. Michael Brown's insights provide valuable guidance for leveraging AI effectively in this field. As AI continues to evolve, its role in enhancing cybersecurity will undoubtedly expand, offering new tools and methodologies to combat ever-present threats.
