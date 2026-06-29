export const playSound = async (soundUrl: string): Promise<void> => {
  try {
    if (!soundUrl) return;
    const audio = new Audio(soundUrl);
    audio.volume = 0.5;
    await audio.play().catch((e) => {
      console.warn('Could not play sound:', e);
    });
  } catch (error) {
    console.error('Sound playback error:', error);
  }
};

export const createAudioContext = (): AudioContext => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  return audioContext;
};

export const playTone = (
  frequency: number = 440,
  duration: number = 200
): void => {
  try {
    const audioContext = createAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (error) {
    console.warn('Could not play tone:', error);
  }
};
