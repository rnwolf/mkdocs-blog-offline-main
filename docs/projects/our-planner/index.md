# Our-Planner

 * Github Code repo: [https://github.com/rnwolf/our-planner](https://github.com/rnwolf/our-planner#why-another-planning-tool)
 * Python packaging Index: [https://pypi.org/project/our-planner/](https://pypi.org/project/our-planner/)

## Introduction

I have found it useful to pysical post-it notes and wall to make and update plans with a team.
Nowadays we use online whiteboarding tools like Miro or Mural.
These tools all make it difficult to move the dependant notes or tasks around and capture and update metadata on those notes/tasks.

*Our-Planner* is a desktop application for collaboratively working on plans with your team that addresses the issues listed above. It also provides some additional features for creating and updating plans.

## Why another planning tool?

Good plans are co-created with the team that will do the work. For that digital whiteboarding tools such as Miro & Mural are very helpful to map out features and dependencies. Invariably the question is going to be asked "When will you be done?". The team will need to make some estimates of how long the individual tasks are going to take. This requires capturing data on estimates and taking into account the availability of the people required to do the work. The current crop of whiteboarding tools do not make this easy. Quickly moving around dependant tasks, with updated durations, on a timeline takes so much effort, it kills collaboration. There are many excellent commercial tools in the market that could do the job but as a consultant to large enterprises it's not practical to change the existing corporate planning and task management tooling stack. Consequently I needed; - a free application as I can't expect the corporate to buy software just for a few teams I work with - to keep all the corporate data secure in a locally run application, no cloud service here! - to link tasks to the corporate task management tool, like Jira - I needed source code to be open for inspection by corporate security professionals Thus this app is written in Python, which is the data analysts' tool of choice, and should be available in most enterprise user desktop builds. Code is hosted on Github and open for inspection, with releases distributed on PyPi for easy installation.

## Features

 - Easily create and manage tasks with durations, dependencies, and resource allocations
 - Visualise tasks in a timeline view
 - Visualise resource loading and avoid over-allocation
 - Tag-based filtering for tasks and resources
 - Multi-select tasks for bulk operations
 - Export tasks to PDF, PNG, CSV, and HTML formats
 - Select tasks for Critical Path analysis