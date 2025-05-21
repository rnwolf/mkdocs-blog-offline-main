---
title: "Marimo Notebook"
description: "Marimo a reactive Python notebook to explore data and build apps."
date:
  created: 2025-05-21T10:55:00Z
categories: ["technology","performance","ai"]
authors:
  - rnwolf
tags: [ "python"]
draft: false
slug: marimo_notebook
---

# Marimo Notebook

[Marimo](https://marimo.io) a reactive Python notebook to explore data and build apps..
<!-- more -->
This video gives an overview of marimo.

<div class="video-wrapper">
  <iframe width="1280" height="720" src="https://www.youtube.com/embed/3N6lInzq5MI" frameborder="0" allowfullscreen></iframe>
</div>

## Analyzing data is a superpower

Spreadsheets where the killer app for the Personal Computer.

Jupyter Notebooks where the killer app for data exploration and put Python on the map as the tool of choice for data analysts. Jupyter Notebooks unfortunately have some limitations based on design choices from the early days.

Marimo has re-imagined what notebooks should have been.

## Marimo for interactive content on a static website

It is possible to embed Marimo notebook exports into MKDocs pages.
These exports are [WASM applications](https://en.wikipedia.org/wiki/WebAssembly) that can be used to provide embeded interactive applications.

Export the notebook with: `marimo export html-wasm ./marimo/hello_world.py -o ./docs/marimo-demo`

Then load into an iframe in a MkDocs page as follows:

!!! Note

    You must use the full url when this is published.

```html
<iframe
src="https://www.rnwolf.net/marimo/marimo-demo/index.html?embed=true"
width="100%"
height="700"
frameborder="0"
></iframe>
```

Resulting in an app that can run in the browser:

<iframe
src="https://www.rnwolf.net/marimo/marimo-demo/index.html?embed=true"
width="100%"
height="700"
frameborder="0"
></iframe>

## In Summary

If you use analyze data, use spreadsheets or Jupyter notes books then you ow it to yourself to have a look at [Marimo](https://marimo.io).