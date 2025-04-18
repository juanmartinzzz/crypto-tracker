const alerts = {
  alertMinimumIntervalSeconds: 10 * 60,
  isAbleToTriggerAlert: () => {
    const lastAlertTimestampString = localStorage.getItem('lastAlertTimestamp');
    if (!lastAlertTimestampString) {
      return true;
    }

    const lastAlertTimestamp = parseInt(lastAlertTimestampString);
    const timeSinceLastAlert = (Date.now() - lastAlertTimestamp) / 1000;

    return timeSinceLastAlert > alerts.alertMinimumIntervalSeconds;
  },
  createCustomCurve: (amount) => {
    const length = 100 * 2;
    const curve = new Float32Array(length);
    for (let i = 0; i < length; i++) {
      const x = (i - length / 2) / (length / 2);
      curve[i] = Math.tanh(x * amount); // Example: Soft clipping
    }
    return curve;
  },
  createOscillator: ({audioContext}) => {
    const oscillator = audioContext.createOscillator();
    // oscillator.type = 'triangle'; // Super smooth and pleasant sound

    const real = new Float32Array([0, 0.9, 0.2, 0.3, 0.1]); // Sine wave + some harmonics
    const imag = new Float32Array([0, 3, 0, 0, 0]); // No quadrature components

    const customWave = audioContext.createPeriodicWave(real, imag);
    oscillator.setPeriodicWave(customWave);

    const distortion = audioContext.createWaveShaper();
    distortion.curve = alerts.createCustomCurve(0.1);
    oscillator.connect(distortion);
    distortion.connect(audioContext.destination);

    return oscillator;
  },
  playChords: ({chords}) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    chords.forEach(({startAt, durationSeconds, chord}) => {
      const oscillator = alerts.createOscillator({audioContext});

      chord.forEach(frequency => {
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startAt);
      });
      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime); // Lower volume
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start(audioContext.currentTime + startAt);
      oscillator.stop(audioContext.currentTime + startAt + durationSeconds);
    });
  },
  triggerAlert: () => {
    if (!alerts.isAbleToTriggerAlert()) {
      return;
    }

    const chords = [
      {startAt: 0, durationSeconds: 0.1, chord: [261.63, 293.66, 329.63]}, // C4, D4, E4
      {startAt: 0.1, durationSeconds: 0.4, chord: [329.63, 349.23, 392.00]}, // E4, F4, G4
      {startAt: 0.9, durationSeconds: 0.3, chord: [392.00, 440.00, 493.88]}, // G4, A4, B4
    ];

    alerts.playChords({chords});
    localStorage.setItem('lastAlertTimestamp', Date.now());
  },
};

export default alerts;