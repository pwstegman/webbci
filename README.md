<p align="center"><img src="static/bcijs-logo.png" height="68px"></p>

<p align="center">Brain Computer Interfaces (BCIs) with JavaScript</p>

<p align="center">
	<a href="https://www.npmjs.com/package/bcijs"><img src="https://img.shields.io/npm/v/bcijs.svg" alt="Version"></a>
	<a href="https://www.npmjs.com/package/bcijs"><img src="https://img.shields.io/npm/dm/bcijs.svg" alt="Downloads"></a>
	<a href="https://www.jsdelivr.com/package/npm/bcijs"><img src="https://data.jsdelivr.com/v1/package/npm/bcijs/badge?style=rounded" alt="CDN"></a>
	<a href="https://github.com/pwstegman/bci.js/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/bcijs.svg" alt="License"></a>
</p>

<br>

## Changes

If one uses `welch` the results differ from python scipy welch due to constant detrend being applied there.
The same is implemented here for compatibility.

## Getting Started

Latest release is v1.8.0. You can view the release notes at [releases](https://github.com/pwstegman/bci.js/releases)

Documentation is available at [https://bci.js.org/docs/](https://bci.js.org/docs/)

**Node.js**

```bash
npm install bcijs
```

**Browser**

```html
<script src="https://cdn.jsdelivr.net/npm/bcijs@1.8.0/dist/bci.min.js"></script>
```

## Feature Overview

For a complete list of methods, see the [docs](https://bci.js.org/docs/).

| Signal Processing | Machine Learning | Data Management |
| --- | --- | --- |
| Bandpower | Feature extraction | Load and save CSVs (Node.js only) |
| Welch's method | Linear discriminant analysis | Load from EDF (Node.js only) |
| Periodogram | Confusion matrices | Epoch / window data |
| Independent component analysis | Metrics (precision, recall, F1, MCC, etc.) | Partition datasets |
| Common spatial pattern | | Array subscripting (colon notation) |
| Signal generation | | |

## Tutorials
- [EEG Motor Imagery Classification in Node.js with BCI.js](https://medium.com/@pwstegman/eeg-motor-imagery-classification-in-node-js-with-bci-js-d21f29cf165)

## Examples

More examples can be found in the [examples](https://github.com/pwstegman/bci.js/tree/master/examples) directory

### Bandpower

```javascript
const bci = require('bcijs');

// Generate 1 second of sample data at 512 Hz
// Contains 8 μV / 8 Hz and 4 μV / 17 Hz
let samplerate = 512;
let signal = bci.generateSignal([8, 4], [8, 17], samplerate, 1);

// Compute relative power in each frequency band
let bandpowers = bci.bandpower(signal, samplerate, ['alpha', 'beta'], {relative: true});

console.log(bandpowers); // [ 0.6661457715567836, 0.199999684787573 ]
```

### Epoch data

```javascript
let samples = [[1,2], [3,4], ...] // 2D array where rows are samples and columns are channels
let samplerate = 256; // 256 Hz

// Epoch data into epochs of 256 samples with a step of 64 (75% overlap)
// Then find the average alpha and beta powers in each epoch.
let powers = bci.windowApply(
	samples,
	epoch => bci.bandpower(epoch, samplerate, ['alpha', 'beta'], {average: true}),
	256,
	64
);
```

### Subscript

```javascript
const bci = require('bcijs');

// 5 samples of data from 3 channels 
let signal = [[1,2,3], [5,3,4], [4,5,6], [7,5,8], [4,4,2]];

// Select the first 3 samples from channels 1 and 3
let subset = bci.subscript(signal, '1:3', '1 3'); // [ [ 1, 3 ], [ 5, 4 ], [ 4, 6 ] ]
```

### Linear discriminant analysis

```javascript
const bci = require('bcijs');

// Training set
let class1 = [[0, 0], [1, 2], [2, 2], [1.5, 0.5]];
let class2 = [[8, 8], [9, 10], [7, 8], [9, 9]];

// Testing set
let unknownPoints = [[-1, 0], [1.5, 2],	[7, 9], [10, 12]];

// Learn an LDA classifier
let ldaParams = bci.ldaLearn(class1, class2);

// Test classifier
let predictions = bci.ldaClassify(ldaParams, unknownPoints);

console.log(predictions); // [ 0, 0, 1, 1 ]
```

Check out [https://bci.js.org/examples/lda](https://bci.js.org/examples/lda) for a visual demo of how LDA works

## Usage in the web

BCI.js can be loaded from the jsDelivr CDN with

```html
<script src="https://cdn.jsdelivr.net/npm/bcijs@1.8.0/dist/bci.min.js"></script>
```

You can also find `bci.js` and `bci.min.js` at [releases](https://github.com/pwstegman/bci.js/releases).

BCI.js methods are accessible via the global object `bci`.

If building a web distributable using a tool such as browserify or webpack, require `bcijs/browser.js` to load only methods that are browser compatible. Node.js specific methods such as networking and file system methods will not be included.

```javascript
const bci = require('bcijs/browser.js');
```

## Requiring specific methods

You can require specific methods as well. For example, if you only need fastICA, you can use

```javascript
const fastICA = require('bcijs/lib/math/fastICA.js');
```

BCI.js methods can be found in the [src/](https://github.com/pwstegman/bci.js/tree/master/src) directory.

Files are transpiled from ES6 import/export (in `src/`) to CommonJS (generated `lib/`) on `npm install`.

## Documentation

Documentation can be found at [https://bci.js.org/docs](https://bci.js.org/docs) or by viewing [api.md](https://github.com/pwstegman/bci.js/blob/master/docs/docs/api.md)

Deprecated methods can be found at [deprecated.md](https://github.com/pwstegman/bci.js/blob/master/docs/docs/deprecated.md)

## Building

See [dev.md](dev.md) for info on how to modify and build BCI.js

## Reference

BCI.js began as WebBCI, a library developed to aid in my research at the Human Technology Interaction Lab at the University of Alabama Department of Computer Science. If you use BCI.js in a published work, please reference this paper

P. Stegman, C. Crawford, and J. Gray, "WebBCI: An Electroencephalography Toolkit Built on Modern Web Technologies," in Augmented Cognition: Intelligent Technologies, 2018, pp. 212–221.

Logo uses icon from [Font Awesome](https://fontawesome.com/license/free).

## Contact

If you have a commercial use case for BCI.js and would like to discuss working together, contact me at [pwstegman@gmail.com](mailto:pwstegman@gmail.com)
