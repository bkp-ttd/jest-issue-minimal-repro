# Minimal Repro of `@nx/jest` formatting issue

This repo is a minimal reproduction of a formatting issue we're seeing with the output of
`@nx/jest`. To summarize: sometimes the output of the `summary` formatter (which is included in the
`default` formatter) wraps weirdly into many short lines. Example below.

The issue only happens with `@nx/jest` and not when using `jest` directly. It appears to
be triggered by redirecting `stdout` to a file. (Note that jest sends most output to `stderr` and so
redirecting `stdout` has very little impact on what's printed to the terminal). It also seems to
have something to do with
[this weirdness](https://github.com/jestjs/jest/blob/511ea93c409bb4949f0deba8e998916d30e67ad5/packages/jest-reporters/src/SummaryReporter.ts#L82-L91)
because when I replace that function with a single `process.stderr.write(string)` call the issue
disappears.

The main features of this minimal repro are:

- `@nx/jest`
- A failing test
- Jest is configured with a `summary` reporter with a low enough `summaryThreshold` that it actually
    prints something
- Example command using `stdout` redirection

## Example of how it should look (jest without @nx/jest)

Command:

```
yarn run_jest > ~/Desktop/test.txt
```

Output:

(Note that redirecting stdout makes this output colorless)

```
Summary of all failing tests
FAIL src/sum.test.js
  ● fail

    BKP

       6 |
       7 | test('fail', () => {
    >  8 |   throw new Error('BKP');
         |         ^
       9 | });
      10 |

      at Object.<anonymous> (src/sum.test.js:8:9)


Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 passed, 2 total
Snapshots:   0 total
Time:        0.08 s, estimated 1 s
Ran all test suites.
```

## Example of badly formatted output with @nx/jest

Command:

```
yarn run_nxjest > ~/Desktop/test.txt
```

Output:

(Note: this output had colors, implying that the underlying jest process didn't think it was being
redirected)

```
Summary of all failing tests





 
FA
IL  src/sum.test.js
  ● fail
    BKP

       6 |
       7 |
 test('fai
l',
 () =>
 {
    
>  8 |   throw 
new Err
or('BK
P');

     
    |      
   
^


       9
 | })
;
      10 |

      at Object.<anonymous> (src/sum
.test.js
:8:9)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 passed, 2 total
Snapshots:   0 total
Time:        0.073 s, estimated 1 s
Ran all test suites.
```