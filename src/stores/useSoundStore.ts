import { create } from "zustand";

export interface SoundConfig {
  id: string;
  path?: string;
  volume?: number;
  loop?: boolean;
}

export interface SoundInstance {
  id: string;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
}

interface SoundState {
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  currentMusic: SoundInstance | null;
  soundConfigs: Map<string, SoundConfig>;
  soundInstances: Map<string, SoundInstance>;
  audioBackend?: any;
  
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSoundConfigs: (configs: SoundConfig[]) => void;
  setAudioBackend: (backend: any) => void;
  
  playSound: (soundType: string, pitchShift?: number) => Promise<void>;
  playMusic: (musicType: string) => Promise<void>;
  stopMusic: () => Promise<void>;
  pauseMusic: () => Promise<void>;
  resumeMusic: () => Promise<void>;
  triggerHaptics: (type?: string) => void;
}

export const useSoundStore = create<SoundState>((set, get) => ({
  soundEnabled: true,
  musicEnabled: true,
  hapticsEnabled: true,
  soundVolume: 0.5,
  musicVolume: 0.5,
  currentMusic: null,
  soundConfigs: new Map(),
  soundInstances: new Map(),
  audioBackend: undefined,
  
  setSoundEnabled: (enabled: boolean) => {
    set({ soundEnabled: enabled });
  },
  
  setMusicEnabled: (enabled: boolean) => {
    set({ musicEnabled: enabled });
    if (!enabled) {
      get().stopMusic();
    }
  },
  
  setHapticsEnabled: (enabled: boolean) => {
    set({ hapticsEnabled: enabled });
  },
  
  setSoundVolume: (volume: number) => {
    set({ soundVolume: Math.max(0, Math.min(1, volume)) });
  },
  
  setMusicVolume: (volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    set({ musicVolume: clampedVolume });
    
    const { currentMusic } = get();
    if (currentMusic) {
      currentMusic.setVolume(clampedVolume);
    }
  },
  
  setSoundConfigs: (configs: SoundConfig[]) => {
    const configMap = new Map();
    configs.forEach(config => {
      configMap.set(config.id, config);
    });
    set({ soundConfigs: configMap });
  },
  
  setAudioBackend: (backend: any) => {
    set({ audioBackend: backend });
  },
  
  playSound: async (soundType: string, pitchShift?: number) => {
    const state = get();
    if (!state.soundEnabled || !state.audioBackend) return;
    
    const config = state.soundConfigs.get(soundType);
    if (!config) return;
    
    try {
      if (state.audioBackend.playSound) {
        await state.audioBackend.playSound(
          soundType, 
          state.soundVolume, 
          pitchShift
        );
      }
    } catch (error) {
      console.error(`Error playing sound ${soundType}:`, error);
    }
  },
  
  playMusic: async (musicType: string) => {
    const state = get();
    if (!state.musicEnabled || !state.audioBackend) return;
    
    await state.stopMusic();
    
    const config = state.soundConfigs.get(musicType);
    if (!config) return;
    
    try {
      if (state.audioBackend.playMusic) {
        const musicInstance = await state.audioBackend.playMusic(
          musicType,
          state.musicVolume
        );
        set({ currentMusic: musicInstance });
      }
    } catch (error) {
      console.error(`Error playing music ${musicType}:`, error);
    }
  },
  
  stopMusic: async () => {
    const { currentMusic } = get();
    if (currentMusic) {
      try {
        await currentMusic.stop();
        set({ currentMusic: null });
      } catch (error) {
        console.error("Error stopping music:", error);
      }
    }
  },
  
  pauseMusic: async () => {
    const { currentMusic } = get();
    if (currentMusic) {
      try {
        await currentMusic.pause();
      } catch (error) {
        console.error("Error pausing music:", error);
      }
    }
  },
  
  resumeMusic: async () => {
    const { currentMusic, musicEnabled } = get();
    if (currentMusic && musicEnabled) {
      try {
        await currentMusic.play();
      } catch (error) {
        console.error("Error resuming music:", error);
      }
    }
  },
  
  triggerHaptics: (type?: string) => {
    const state = get();
    if (!state.hapticsEnabled || !state.audioBackend) return;
    
    try {
      if (state.audioBackend.triggerHaptics) {
        state.audioBackend.triggerHaptics(type);
      }
    } catch (error) {
      console.error("Error triggering haptics:", error);
    }
  },
}));

export const useSound = () => {
  const {
    soundEnabled,
    musicEnabled,
    hapticsEnabled,
    soundVolume,
    musicVolume,
    setSoundEnabled,
    setMusicEnabled,
    setHapticsEnabled,
    setSoundVolume,
    setMusicVolume,
    playSound,
    playMusic,
    stopMusic,
    pauseMusic,
    resumeMusic,
    triggerHaptics,
    setSoundConfigs,
    setAudioBackend,
  } = useSoundStore();
  
  return {
    soundEnabled,
    musicEnabled,
    hapticsEnabled,
    soundVolume,
    musicVolume,
    setSoundEnabled,
    setMusicEnabled,
    setHapticsEnabled,
    setSoundVolume,
    setMusicVolume,
    playSound,
    playMusic,
    stopMusic,
    pauseMusic,
    resumeMusic,
    triggerHaptics,
    setSoundConfigs,
    setAudioBackend,
  };
};