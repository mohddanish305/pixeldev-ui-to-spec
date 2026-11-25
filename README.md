# UI-to-Spec Factory — PixelDev

UI-to-Spec Factory turns a UI mockup into a complete coding task package: requirement spec, reference implementation, Playwright-style tests, validation evidence, and downloadable JSON.

## Simple explanation

Designer screen ka design deta hai. System us design ko padhkar bolta hai: kya banana hai, uska ready code kaisa hoga, test kaise chalega, aur design se kitna match hua.

## MVP scope

This MVP uses structured sample mockups (billing card, login form, dashboard widget, product card). Each sample has a component map similar to what a vision model would return. The generator converts that component map into:

- Requirement spec
- HTML/CSS/JS or React-style reference code
- Playwright-style tests
- Validation checks for components, accessibility, responsiveness, and action handling
- Broken-version check showing that validation catches missing UI behavior

Full version route: Gemini Vision reads an uploaded mockup image and returns the same component map; the rest of the pipeline stays unchanged.

## Demo flow

1. Choose a sample mockup.
2. Generate the task package.
3. Show spec, reference code, and tests.
4. Show validation score.
5. Run broken version check to prove the validator catches errors.
6. Download JSON package.
