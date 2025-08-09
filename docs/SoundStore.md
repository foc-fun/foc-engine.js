# Sound Store & Audio Management

The Sound Store provides a comprehensive audio management system with support for sound effects, background music, haptic feedback, and configurable audio backends for cross-platform compatibility.

## Features

- **Sound Effects**: Play short audio clips with pitch shifting and volume control
- **Background Music**: Stream music with play/pause/stop controls and smooth transitions
- **Haptic Feedback**: Trigger device haptics synchronized with audio events
- **Volume Management**: Independent volume controls for sound effects and music
- **Audio Backend Abstraction**: Pluggable audio backends for web, React Native, and other platforms
- **Sound Configuration**: Configure sound libraries with metadata and settings
- **State Persistence**: Enable/disable audio categories with persistent settings

## Quick Start

### Basic Usage
```typescript
import { useSound } from 'foc-engine-js';

function GameAudio() {
  const {
    playSound,
    playMusic,
    soundEnabled,
    setSoundEnabled,
    soundVolume,
    setSoundVolume,
    setAudioBackend,
    setSoundConfigs
  } = useSound();

  // Configure your sounds first
  useEffect(() => {
    const soundConfigs = [
      { id: 'click', path: '/sounds/click.wav', volume: 0.8 },
      { id: 'explosion', path: '/sounds/explosion.wav', volume: 1.0 },
      { id: 'background-music', path: '/music/theme.mp3', loop: true },
    ];
    
    setSoundConfigs(soundConfigs);
    setAudioBackend(new WebAudioBackend()); // Your audio backend
  }, []);

  const handleButtonClick = async () => {
    await playSound('click');
  };

  const startBackgroundMusic = async () => {
    await playMusic('background-music');
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Click Me!</button>
      <button onClick={startBackgroundMusic}>Play Music</button>
      
      <div>
        <label>
          <input 
            type="checkbox" 
            checked={soundEnabled} 
            onChange={(e) => setSoundEnabled(e.target.checked)} 
          />
          Enable Sound Effects
        </label>
        
        <label>
          Volume: 
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={soundVolume}
            onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}
```

## Core Concepts

### Audio Backend System
The Sound Store uses a pluggable backend system to support different platforms:

```typescript
interface AudioBackend {
  playSound(soundId: string, volume: number, pitchShift?: number): Promise<void>;
  playMusic(musicId: string, volume: number): Promise<SoundInstance>;
  triggerHaptics(type?: string): void;
}

// Example Web Audio Backend
class WebAudioBackend implements AudioBackend {
  async playSound(soundId: string, volume: number, pitchShift?: number) {
    // Web Audio API implementation
  }
  
  async playMusic(musicId: string, volume: number) {
    // Music streaming implementation
    return musicInstance;
  }
  
  triggerHaptics(type?: string) {
    // Web Vibration API or custom implementation
  }
}

// Set your backend
const { setAudioBackend } = useSound();
setAudioBackend(new WebAudioBackend());
```

### Sound Configuration
Configure your sound library with metadata:

```typescript
interface SoundConfig {
  id: string;        // Unique identifier
  path?: string;     // File path or URL
  volume?: number;   // Default volume (0-1)
  loop?: boolean;    // Whether to loop the sound
}

const soundConfigs: SoundConfig[] = [
  { id: 'ui-click', path: '/sounds/ui/click.wav', volume: 0.6 },
  { id: 'ui-hover', path: '/sounds/ui/hover.wav', volume: 0.4 },
  { id: 'game-jump', path: '/sounds/game/jump.ogg', volume: 0.8 },
  { id: 'game-powerup', path: '/sounds/game/powerup.wav', volume: 1.0 },
  { id: 'music-menu', path: '/music/menu.mp3', loop: true },
  { id: 'music-gameplay', path: '/music/gameplay.mp3', loop: true },
];

setSoundConfigs(soundConfigs);
```

## API Reference

### useSound Hook
The main hook for accessing sound functionality:

```typescript
const {
  // State
  soundEnabled,      // boolean - Sound effects enabled
  musicEnabled,      // boolean - Background music enabled  
  hapticsEnabled,    // boolean - Haptic feedback enabled
  soundVolume,       // number - Sound effects volume (0-1)
  musicVolume,       // number - Background music volume (0-1)
  
  // Controls
  setSoundEnabled,   // (enabled: boolean) => void
  setMusicEnabled,   // (enabled: boolean) => void  
  setHapticsEnabled, // (enabled: boolean) => void
  setSoundVolume,    // (volume: number) => void
  setMusicVolume,    // (volume: number) => void
  
  // Playback
  playSound,         // (soundType: string, pitchShift?: number) => Promise<void>
  playMusic,         // (musicType: string) => Promise<void>
  stopMusic,         // () => Promise<void>
  pauseMusic,        // () => Promise<void>
  resumeMusic,       // () => Promise<void>
  triggerHaptics,    // (type?: string) => void
  
  // Configuration
  setSoundConfigs,   // (configs: SoundConfig[]) => void
  setAudioBackend,   // (backend: any) => void
} = useSound();
```

### Sound Effects
Play short audio clips with optional pitch shifting:

```typescript
const { playSound } = useSound();

// Basic sound playback
await playSound('button-click');

// With pitch shifting (useful for variations)
await playSound('coin-collect', 1.2); // 20% higher pitch
await playSound('footstep', 0.8);     // 20% lower pitch

// Pitch shifting for dynamic feedback
const playMiningSound = (progress: number) => {
  const pitchShift = 0.8 + (progress * 0.4); // 0.8 to 1.2
  playSound('mining-hit', pitchShift);
};
```

### Background Music
Manage streaming background music:

```typescript
const { playMusic, stopMusic, pauseMusic, resumeMusic, musicVolume } = useSound();

// Play background music (automatically stops previous)
await playMusic('menu-theme');
await playMusic('gameplay-theme'); // Stops menu-theme first

// Control playback
await pauseMusic();  // Pause current music
await resumeMusic(); // Resume paused music
await stopMusic();   // Stop and reset music

// Volume control affects current and future music
setMusicVolume(0.7); // Set to 70% volume
```

### Haptic Feedback
Trigger device haptic feedback:

```typescript
const { triggerHaptics } = useSound();

// Basic haptic feedback
triggerHaptics();

// Typed haptic feedback (implementation dependent)
triggerHaptics('light');   // Light vibration
triggerHaptics('medium');  // Medium vibration  
triggerHaptics('heavy');   // Heavy vibration
triggerHaptics('error');   // Error pattern
triggerHaptics('success'); // Success pattern
```

## Audio Backend Implementation

### Web Audio Backend Example
```typescript
class WebAudioBackend {
  private audioContext: AudioContext;
  private soundBuffers: Map<string, AudioBuffer> = new Map();
  private currentMusic: HTMLAudioElement | null = null;

  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  async loadSound(config: SoundConfig): Promise<void> {
    if (!config.path) return;
    
    const response = await fetch(config.path);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.soundBuffers.set(config.id, audioBuffer);
  }

  async playSound(soundId: string, volume: number, pitchShift?: number): Promise<void> {
    const buffer = this.soundBuffers.get(soundId);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    source.playbackRate.value = pitchShift || 1.0;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.start();
  }

  async playMusic(musicId: string, volume: number): Promise<SoundInstance> {
    // Stop current music
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic = null;
    }

    // Create new audio element
    const audio = new Audio();
    const config = this.getSoundConfig(musicId);
    
    audio.src = config?.path || '';
    audio.volume = volume;
    audio.loop = config?.loop || false;
    
    await audio.play();
    this.currentMusic = audio;

    return {
      id: musicId,
      play: () => audio.play(),
      pause: () => Promise.resolve(audio.pause()),
      stop: () => {
        audio.pause();
        audio.currentTime = 0;
        return Promise.resolve();
      },
      setVolume: (vol: number) => {
        audio.volume = vol;
        return Promise.resolve();
      }
    };
  }

  triggerHaptics(type?: string): void {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [50],
        medium: [100],
        heavy: [200],
        error: [100, 50, 100],
        success: [50, 25, 50, 25, 50]
      };
      
      const pattern = patterns[type as keyof typeof patterns] || [50];
      navigator.vibrate(pattern);
    }
  }
}
```

### React Native Audio Backend Example
```typescript
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

class ReactNativeAudioBackend {
  private soundObjects: Map<string, Audio.Sound> = new Map();
  private currentMusic: Audio.Sound | null = null;

  async playSound(soundId: string, volume: number, pitchShift?: number): Promise<void> {
    const config = this.getSoundConfig(soundId);
    if (!config?.path) return;

    const { sound } = await Audio.Sound.createAsync(
      { uri: config.path },
      { 
        volume,
        rate: pitchShift || 1.0,
        shouldPlay: true 
      }
    );

    // Cleanup after playing
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  }

  async playMusic(musicId: string, volume: number): Promise<SoundInstance> {
    // Stop current music
    if (this.currentMusic) {
      await this.currentMusic.stopAsync();
      await this.currentMusic.unloadAsync();
    }

    const config = this.getSoundConfig(musicId);
    if (!config?.path) throw new Error(`Music config not found: ${musicId}`);

    const { sound } = await Audio.Sound.createAsync(
      { uri: config.path },
      { 
        volume,
        isLooping: config.loop || false,
        shouldPlay: true 
      }
    );

    this.currentMusic = sound;

    return {
      id: musicId,
      play: () => sound.playAsync(),
      pause: () => sound.pauseAsync(),
      stop: () => sound.stopAsync(),
      setVolume: (vol: number) => sound.setVolumeAsync(vol)
    };
  }

  triggerHaptics(type?: string): void {
    const hapticTypes = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
      error: Haptics.NotificationFeedbackType.Error,
      success: Haptics.NotificationFeedbackType.Success
    };

    const hapticType = hapticTypes[type as keyof typeof hapticTypes];
    
    if (hapticType) {
      if (type === 'error' || type === 'success') {
        Haptics.notificationAsync(hapticType as Haptics.NotificationFeedbackType);
      } else {
        Haptics.impactAsync(hapticType as Haptics.ImpactFeedbackStyle);
      }
    } else {
      Haptics.selectionAsync(); // Default haptic
    }
  }
}
```

## Advanced Usage Patterns

### Dynamic Sound Loading
```typescript
function DynamicSoundManager() {
  const { setSoundConfigs, setAudioBackend } = useSound();
  const [loadedSounds, setLoadedSounds] = useState<string[]>([]);

  const loadSoundPack = async (packName: string) => {
    // Load sound configuration from API or file
    const response = await fetch(`/api/sounds/${packName}`);
    const soundPack = await response.json();
    
    setSoundConfigs(soundPack.sounds);
    setLoadedSounds(prev => [...prev, packName]);
  };

  const unloadSoundPack = (packName: string) => {
    // Remove sounds from configuration
    setLoadedSounds(prev => prev.filter(pack => pack !== packName));
    // Update sound configs...
  };

  return (
    <div>
      <button onClick={() => loadSoundPack('ui-sounds')}>
        Load UI Sounds
      </button>
      <button onClick={() => loadSoundPack('game-sounds')}>
        Load Game Sounds  
      </button>
      <p>Loaded: {loadedSounds.join(', ')}</p>
    </div>
  );
}
```

### Audio Settings Panel
```typescript
function AudioSettingsPanel() {
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
  } = useSound();

  const testSound = () => playSound('ui-click');

  return (
    <div className="audio-settings">
      <h3>Audio Settings</h3>
      
      <div className="setting-group">
        <label>
          <input 
            type="checkbox" 
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
          />
          Enable Sound Effects
        </label>
        
        <div className="volume-control">
          <label>Sound Volume: {Math.round(soundVolume * 100)}%</label>
          <input 
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={soundVolume}
            onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
            disabled={!soundEnabled}
          />
          <button onClick={testSound} disabled={!soundEnabled}>
            Test
          </button>
        </div>
      </div>

      <div className="setting-group">
        <label>
          <input 
            type="checkbox" 
            checked={musicEnabled}
            onChange={(e) => setMusicEnabled(e.target.checked)}
          />
          Enable Background Music
        </label>
        
        <div className="volume-control">
          <label>Music Volume: {Math.round(musicVolume * 100)}%</label>
          <input 
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={musicVolume}
            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
            disabled={!musicEnabled}
          />
        </div>
      </div>

      <div className="setting-group">
        <label>
          <input 
            type="checkbox" 
            checked={hapticsEnabled}
            onChange={(e) => setHapticsEnabled(e.target.checked)}
          />
          Enable Haptic Feedback
        </label>
      </div>
    </div>
  );
}
```

### Context-Aware Sound Management
```typescript
function useGameAudio() {
  const sound = useSound();
  const [currentContext, setCurrentContext] = useState<'menu' | 'gameplay' | 'paused'>('menu');

  useEffect(() => {
    // Switch music based on game context
    switch (currentContext) {
      case 'menu':
        sound.playMusic('menu-theme');
        break;
      case 'gameplay':
        sound.playMusic('gameplay-theme');
        break;
      case 'paused':
        sound.pauseMusic();
        break;
    }
  }, [currentContext, sound]);

  const playContextualSound = (action: string) => {
    const contextSounds = {
      menu: {
        click: 'menu-click',
        hover: 'menu-hover',
        select: 'menu-select'
      },
      gameplay: {
        click: 'game-click',
        action: 'game-action',
        success: 'game-success'
      }
    };

    const soundId = contextSounds[currentContext]?.[action as keyof typeof contextSounds[typeof currentContext]];
    if (soundId) {
      sound.playSound(soundId);
    }
  };

  return {
    ...sound,
    currentContext,
    setCurrentContext,
    playContextualSound,
  };
}
```

### Sound Pool Management
```typescript
function useSoundPool(maxInstances = 5) {
  const { playSound: basePlPlaySound, soundEnabled } = useSound();
  const [playingInstances, setPlayingInstances] = useState<Map<string, number>>(new Map());

  const playSound = async (soundId: string, pitchShift?: number) => {
    if (!soundEnabled) return;

    const currentInstances = playingInstances.get(soundId) || 0;
    if (currentInstances >= maxInstances) {
      console.warn(`Sound pool limit reached for ${soundId}`);
      return;
    }

    // Track instance
    setPlayingInstances(prev => 
      new Map(prev).set(soundId, currentInstances + 1)
    );

    try {
      await basePlPlaySound(soundId, pitchShift);
    } finally {
      // Release instance after a delay (estimate sound duration)
      setTimeout(() => {
        setPlayingInstances(prev => {
          const newMap = new Map(prev);
          const count = newMap.get(soundId) || 1;
          if (count <= 1) {
            newMap.delete(soundId);
          } else {
            newMap.set(soundId, count - 1);
          }
          return newMap;
        });
      }, 2000); // Adjust based on typical sound length
    }
  };

  return {
    playSound,
    getInstanceCount: (soundId: string) => playingInstances.get(soundId) || 0,
    getTotalInstances: () => Array.from(playingInstances.values()).reduce((sum, count) => sum + count, 0),
  };
}
```

## Integration with Observers

The Sound Store works seamlessly with the Observer pattern for event-driven audio:

```typescript
import { SoundObserver } from 'foc-engine-js';

function setupGameAudio() {
  const { setAudioBackend, setSoundConfigs } = useSound();
  const eventManager = useEventManager();

  // Setup audio backend and sounds
  setAudioBackend(new WebAudioBackend());
  setSoundConfigs(gameSoundConfigs);

  // Create sound observer
  const soundObserver = new SoundObserver(
    async (soundType: string, pitchShift?: number) => {
      // This will be called by the observer
      await playSound(soundType, pitchShift);
    },
    {
      enablePitchVariation: true,
      maxBlockFullAttempts: 3
    }
  );

  // Register observer to respond to game events
  useEffect(() => {
    const observerId = eventManager.registerObserver(soundObserver);
    return () => eventManager.unregisterObserver(observerId);
  }, [eventManager]);
}
```

## Best Practices

### 1. Audio Backend Setup
```typescript
// Initialize once at app startup
useEffect(() => {
  const initAudio = async () => {
    const backend = new WebAudioBackend();
    await backend.init(); // Load initial sounds
    setAudioBackend(backend);
  };
  
  initAudio();
}, []);
```

### 2. Sound Configuration Organization  
```typescript
// Organize sounds by category
const soundConfig = {
  ui: [
    { id: 'ui-click', path: '/sounds/ui/click.wav' },
    { id: 'ui-hover', path: '/sounds/ui/hover.wav' },
  ],
  game: [
    { id: 'player-jump', path: '/sounds/game/jump.ogg' },
    { id: 'enemy-hit', path: '/sounds/game/hit.wav' },
  ],
  music: [
    { id: 'menu-theme', path: '/music/menu.mp3', loop: true },
    { id: 'game-theme', path: '/music/game.mp3', loop: true },
  ]
};

const allSounds = [...soundConfig.ui, ...soundConfig.game, ...soundConfig.music];
```

### 3. Performance Optimization
```typescript
// Preload critical sounds
useEffect(() => {
  const criticalSounds = ['ui-click', 'game-jump', 'error-sound'];
  criticalSounds.forEach(soundId => {
    // Preload implementation depends on your backend
    audioBackend.preload(soundId);
  });
}, []);

// Use sound pooling for frequently played sounds
const { playSound } = useSoundPool(3); // Max 3 simultaneous instances
```

### 4. Error Handling
```typescript
const safePlaySound = async (soundId: string) => {
  try {
    await playSound(soundId);
  } catch (error) {
    console.error(`Failed to play sound ${soundId}:`, error);
    // Optionally show user notification or fallback
  }
};
```

### 5. Accessibility Considerations
```typescript
function AccessibleAudioControls() {
  const { soundEnabled, setSoundEnabled } = useSound();
  
  return (
    <button 
      onClick={() => setSoundEnabled(!soundEnabled)}
      aria-label={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
      className="audio-toggle"
    >
      {soundEnabled ? '🔊' : '🔇'}
    </button>
  );
}
```

This Sound Store provides a robust, flexible audio system that can adapt to any application's needs while maintaining consistent behavior across different platforms.