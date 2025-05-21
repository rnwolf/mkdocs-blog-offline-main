import marimo

__generated_with = "0.13.9"
app = marimo.App()


@app.cell
def _():
    import marimo as mo
    return (mo,)


@app.cell
def _(mo):
    name = mo.ui.text(placeholder="Enter your name", debounce=False)
    name
    return (name,)


@app.cell
def _(mo, name):
    mo.md(f"Hello, **{name.value or '__'}**!")
    return


@app.cell
def _(mo):
    slider = mo.ui.slider(1, 10)
    slider
    return (slider,)


@app.cell
def _(slider):
    slider.value * "🍃"
    return


@app.cell
def _(mo):
    mo.md(r"""And now a chart""")
    return


@app.cell
def _():
    import matplotlib.pyplot as plt
    return (plt,)


@app.cell
def _():
    import numpy as np
    return (np,)


@app.cell
def _(np, plt):
    x = np.linspace(0, slider.value, 100)
    y = np.sin(x)

    plt.figure(figsize=(8, 4))
    plt.plot(x, y)
    plt.title('Sine Wave')
    plt.xlabel('x')
    plt.ylabel('sin(x)')
    plt.grid(True)
    plt.gca()
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
