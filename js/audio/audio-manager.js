import { clamp } from "../utils/math.js";

const NOTE_FREQUENCIES = Object.freeze({
  collect: [520, 690],
  special: [620, 830, 1040],
  remains: [430, 570],
  boostStart: [180, 290],
  boostStop: [290, 180],
  elimination: [330, 520, 780],
  death: [250, 155, 95],
  ui: [420],
  achievement: [523.25, 659.25, 783.99, 1046.50],
  coins: [659.25, 783.99],
  challenge: [440, 659.25, 880],
  purchase: [392, 523.25, 659.25],
  levelUp: [392, 523.25, 659.25, 783.99, 1046.50],
  season: [329.63, 440, 659.25, 880],
  weekly: [293.66, 440, 587.33, 880],
  title: [523.25, 698.46, 1046.50],
});

export class AudioManager {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.musicGain = null;

    this.settings = {
      muted: false,
      masterVolume: 0.82,
      sfxVolume: 0.88,
      musicVolume: 0.34,
    };

    this.musicTimer = null;
    this.musicStep = 0;
    this.started = false;
  }

  applySettings(settings) {
    this.settings = {
      muted: Boolean(settings.muted),
      masterVolume: clamp(
        Number(settings.masterVolume) || 0,
        0,
        1
      ),
      sfxVolume: clamp(
        Number(settings.sfxVolume) || 0,
        0,
        1
      ),
      musicVolume: clamp(
        Number(settings.musicVolume) || 0,
        0,
        1
      ),
    };

    this.updateGainValues();
  }

  async ensureStarted() {
    if (!this.context) {
      const AudioContextClass =
        window.AudioContext ??
        window.webkitAudioContext;

      if (!AudioContextClass) {
        return false;
      }

      this.context = new AudioContextClass();

      this.masterGain =
        this.context.createGain();
      this.sfxGain =
        this.context.createGain();
      this.musicGain =
        this.context.createGain();

      this.sfxGain.connect(
        this.masterGain
      );
      this.musicGain.connect(
        this.masterGain
      );
      this.masterGain.connect(
        this.context.destination
      );

      this.updateGainValues();
    }

    if (this.context.state === "suspended") {
      await this.context.resume();
    }

    this.started = true;
    return true;
  }

  updateGainValues() {
    if (
      !this.masterGain ||
      !this.sfxGain ||
      !this.musicGain
    ) {
      return;
    }

    const now =
      this.context?.currentTime ?? 0;

    this.masterGain.gain.setTargetAtTime(
      this.settings.muted
        ? 0
        : this.settings.masterVolume,
      now,
      0.025
    );

    this.sfxGain.gain.setTargetAtTime(
      this.settings.sfxVolume,
      now,
      0.025
    );

    this.musicGain.gain.setTargetAtTime(
      this.settings.musicVolume,
      now,
      0.05
    );
  }

  playEvent(type, intensity = 1) {
    const notes = NOTE_FREQUENCIES[type];

    if (!notes || this.settings.muted) {
      return;
    }

    void this.ensureStarted().then((started) => {
      if (!started) {
        return;
      }

      const baseTime =
        this.context.currentTime;

      notes.forEach((frequency, index) => {
        this.playTone({
          frequency,
          startTime:
            baseTime + index * 0.055,
          duration:
            type === "death" ? 0.18 : 0.10,
          volume:
            0.055 *
            clamp(intensity, 0.2, 1.4),
          destination: this.sfxGain,
          waveform:
            type === "boostStart" ||
            type === "boostStop"
              ? "sawtooth"
              : "sine",
        });
      });
    });
  }

  playUI() {
    this.playEvent("ui", 0.55);
  }

  startMusic() {
    if (this.musicTimer) {
      return;
    }

    void this.ensureStarted().then((started) => {
      if (!started || this.musicTimer) {
        return;
      }

      this.scheduleMusicStep();

      this.musicTimer = window.setInterval(
        () => this.scheduleMusicStep(),
        780
      );
    });
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  async stopAll() {
    this.stopMusic();

    if (
      this.context &&
      this.context.state === "running"
    ) {
      try {
        await this.context.suspend();
      } catch {
        // O navegador pode recusar a suspensão durante o fechamento.
      }
    }
  }

  scheduleMusicStep() {
    if (
      !this.context ||
      this.settings.muted ||
      this.settings.musicVolume <= 0
    ) {
      return;
    }

    const bassLine = [
      110,
      110,
      130.81,
      98,
      110,
      146.83,
      130.81,
      98,
    ];

    const frequency =
      bassLine[
        this.musicStep % bassLine.length
      ];

    const now =
      this.context.currentTime;

    this.playTone({
      frequency,
      startTime: now,
      duration: 0.38,
      volume: 0.028,
      destination: this.musicGain,
      waveform: "triangle",
    });

    if (this.musicStep % 2 === 0) {
      this.playTone({
        frequency: frequency * 2,
        startTime: now + 0.08,
        duration: 0.16,
        volume: 0.012,
        destination: this.musicGain,
        waveform: "sine",
      });
    }

    this.musicStep += 1;
  }

  playTone({
    frequency,
    startTime,
    duration,
    volume,
    destination,
    waveform = "sine",
  }) {
    const oscillator =
      this.context.createOscillator();

    const gain =
      this.context.createGain();

    oscillator.type = waveform;

    oscillator.frequency.setValueAtTime(
      frequency,
      startTime
    );

    gain.gain.setValueAtTime(
      0.0001,
      startTime
    );

    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0002, volume),
      startTime + 0.012
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      startTime + duration
    );

    oscillator.connect(gain);
    gain.connect(destination);

    oscillator.start(startTime);
    oscillator.stop(
      startTime + duration + 0.02
    );
  }
}
