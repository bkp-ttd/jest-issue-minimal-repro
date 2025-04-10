# Minimal Repro of `@nx/jest` formatting issue

This repo is a minimal reproduction of a formatting issue we're seeing with the output of
`@nx/jest`. To summarize: when output redirection is involved, the `summary` reporter starts
wrapping weirdly, as if something is inserting newlines at random. Example below.

The issue only happens with `@nx/jest` and not when using `jest` directly. It appears to
be triggered by redirecting `stdout` to a file. (Note that jest sends most output to `stderr` and so
redirecting `stdout` has very little impact on what's printed to the terminal). It also seems to
have something to do with
[this weirdness in SummaryReporter](https://github.com/jestjs/jest/blob/511ea93c409bb4949f0deba8e998916d30e67ad5/packages/jest-reporters/src/SummaryReporter.ts#L82-L91)
because when I replace that function with a single `process.stderr.write(string)` call the issue
disappears. However, as weird as that code is I don't think that's the bug - I believe printing one
character at a time *should* still work.

The main features of this minimal repro are:

- `@nx/jest`
- A failing test
- An example command using `stdout` redirection
- Jest is configured to use the `summary` reporter
    - By default `summary` doesn't print anything unless you have >=20 test suites. We use
        `{"summaryThreshold": 0}` to get around that limitation
    - `["default", {"summaryThreshold": 0}]` would also work, but the output is a bit more verbose
    - [Docs for Jest reporters](https://jestjs.io/docs/configuration#reporters-arraymodulename--modulename-options)

## Example of how it should look (jest without @nx/jest)

Command:

```
yarn run_jest > ~/Desktop/test.txt
```

Output:

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
Time:        0.088 s, estimated 1 s
Ran all test suites.
```

Notes:

- This output was colorless, presumably because we're redirecting `stdout`

## Example of badly formatted output with @nx/jest

Command:

```
yarn run_nxjest > ~/Desktop/test.txt
```

Output:

```
Summary of all failing tests




 FA
IL
  
src/sum.test.js
  ● fail
    BKP

    
   6 |
       7 |
 test('fail'
, () 
=> {


    >

  8 | 
  throw new Error('BKP'
);

         | 
        
^


       9 |
 });
      1
0 |


      at Obj
ect.<anonymous> (
src/
sum.test.js
:8:9)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 passed, 2 total
Snapshots:   0 total
Time:        0.081 s, estimated 1 s
Ran all test suites.
```

Notes:

- This output had colors, which I assume means that the underlying jest process didn't realize it
  was being redirected. This is neither good nor bad IMO, but might be a clue
- The output varies from run to run - the location of the inserted newlines isn't always
  consistent.

