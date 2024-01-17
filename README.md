[iainkirkpatrick.com](http://iainkirkpatrick.com)

## todo:
- [x] fix local dev for ai worker - might need to run in [advanced mode](https://developers.cloudflare.com/pages/platform/functions/advanced-mode/) with the Module Worker syntax
- [ ] looks like you can't yet create a binding from a Pages function to a Vectorize worker either... or even a binding from a Pages function to another Pages function.
- [ ] ai-generated thoughts images derived from the content?
- [ ] change to mistral-7b?
  - [ ] change to just running against gpt-4?


## notes
- could in theory avoid needing a regular db if all data (init, static pages, thoughts) was publically accessible / hosted? store the hash of the data in vectorize, then compare to hashed public data? Not sure there's much point...