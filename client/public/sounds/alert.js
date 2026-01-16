// Simple alert sound generator for browsers
class AlertSound {
  constructor() {
    this.audioContext = null;
  }

  initAudio() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  playTone(frequency, duration, type = 'sine') {
    try {
      const audioContext = this.initAudio();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  }

  playCriticalAlert() {
    // Fire alarm sound - rapid beeps
    let delay = 0;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this.playTone(800, 0.2), delay);
      setTimeout(() => this.playTone(1000, 0.2), delay + 200);
      delay += 400;
    }
  }

  playHighAlert() {
    // Warning sound - slower beeps
    let delay = 0;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.playTone(600, 0.3), delay);
      delay += 600;
    }
  }

  playMediumAlert() {
    // Caution sound - single tone
    this.playTone(400, 0.5);
  }

  playLowAlert() {
    // Info sound - soft tone
    this.playTone(300, 0.3);
  }
}

window.alertSound = new AlertSound();