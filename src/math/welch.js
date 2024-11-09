import { periodogram } from './periodogram';
import { windowApply } from '../data/windowApply';
import { nextpow2 } from './nextpow2';

const d_mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
/**
 * Detrend : linear
 * Uses the least square function to detrend data
 */
function d_linear(y, fs) {
    let x = [];
    /**
     * Create x values for y from fs
     */
    y.forEach((value, index) => { x.push(index * fs); });
    /** * Calculate Average x_avg and Average y_avg of x and y values */
    const x_avg = d_mean(x);
    const y_avg = d_mean(y);
    /**
     * Calculate the summ of every (x[i] - x_avg)*(y[i] - y_avg)
     * and calculate the summ of every (x[i] - x_avg)^2
     * summ_1 divided by summ_2 will calculate k
     */
    let summ_1 = 0, summ_2 = 0;
    for (let i = 0; i < x.length; i++) {
        summ_1 += (x[i] - x_avg) * (y[i] - y_avg);
        summ_2 += (x[i] - x_avg) * (x[i] - x_avg);
    }
    const k = summ_1 / summ_2;
    const d = y_avg - k * x_avg;
    let detrend_y = [];
    y.forEach((y_value, index) => detrend_y.push(y_value - (k * x[index] + d)));
    return detrend_y;
}

/**
 * Detrend : constant
 * Calculates the mean of function and subtracts it
 */
function d_constant(x) {
    const _mean = d_mean(x);
    x = x.map((i) => i - _mean);
    return x;
}


/**
 * Welch's method<br>
 * Computes overlapping modified periodograms and averages them together
 * @memberof module:bcijs
 * @function
 * @name welch
 * @param {number[]} signal - The input signal
 * @param {number} sample_rate - The sample rate
 * @param {object} options 
 * @param {number} [options.segmentLength=256] - How long each segment should be in samples
 * @param {number} [options.overlapLength=null] - Amount of overlap between segments in samples. Defaults to floor(segmentLength / 2).
 * @param {string|number[]} [options.window='hann'] - Window function to apply, either 'hann', 'rectangular', or an array for a custom window. Default is 'hann'.
 * @param {number} [options.fftSize=Math.pow(2, bci.nextpow2(signal.length))] - Size of the fft to be used. Should be a power of 2.
 * @param {string} [options.detrend='constant'] - Detrend to apply.
 * @returns {object} PSD object with keys {estimates: PSD estimates in units of X^2/Hz, frequencies: corresponding frequencies in Hz}
 */
export function welch(signal, sample_rate, options) {
    let { segmentLength, overlapLength, fftSize, window, detrend, verbose } = Object.assign({
        segmentLength: 256,
        overlapLength: null,
        window: 'hann',
        fftSize: null,
        detrend: 'constant',
        verbose: true
    }, options);

    if(overlapLength === null) overlapLength = Math.floor(segmentLength / 2);
    if(fftSize === null) fftSize = 2**nextpow2(segmentLength);
    
    let step = segmentLength - overlapLength;

    if(step <= 0) throw new Error('Invalid overlap, must be less than segmentLength');

    // detrend added
    if (detrend == 'constant') {
      signal = d_constant(signal);
    }

    let PSDs = windowApply(signal, epoch => {
        return periodogram(epoch, sample_rate, {fftSize: fftSize, window: window});
    }, segmentLength, step, false);

    if(PSDs.length == 0) throw new Error('Unable to calculate any PSD estimates');
    if(PSDs.length == 1) {
        if(verbose) {
            console.warn('Not enough data to compute more than one segment, returning single modified periodogram.');
        }
        return PSDs[0];
    }

    // Compute average PSD
    let num_estimates = PSDs[0].estimates.length;
    let avg = new Array(num_estimates).fill(0);
    for(let p = 0; p < PSDs.length; p++) {
        for(let i = 0; i < num_estimates; i++) {
            avg[i] += PSDs[p].estimates[i];
        }
    }
    for(let i = 0; i < num_estimates; i++) {
        avg[i] = avg[i] / PSDs.length;
    }

    return {
        estimates: avg,
        frequencies: PSDs[0].frequencies
    };
}
