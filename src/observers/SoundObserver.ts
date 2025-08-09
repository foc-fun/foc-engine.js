import { Observer, EventType } from "../stores/useEventManager";

export interface SoundObserverConfig {
  enablePitchVariation?: boolean;
  maxBlockFullAttempts?: number;
}

export class SoundObserver implements Observer {
  private playSound: (soundType: string, pitchShift?: number) => Promise<void>;
  private blockFullAttempts: number = 0;
  private config: SoundObserverConfig;

  constructor(
    playSoundEffect: (soundType: string, pitchShift?: number) => Promise<void>,
    config: SoundObserverConfig = {}
  ) {
    this.playSound = playSoundEffect;
    this.config = {
      enablePitchVariation: true,
      maxBlockFullAttempts: 3,
      ...config
    };
  }

  setConfig(config: Partial<SoundObserverConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private calculatePitchShift(value: number, min: number = 0.25, max: number = 1): number {
    if (!this.config.enablePitchVariation) return 1;
    return Math.min(Math.max(value, min), max);
  }

  async onNotify(eventType: EventType, data?: any): Promise<void> {
    switch (eventType) {
      case "TxAdded": {
        const blockProgress = data?.progress || 0;
        const fee = data?.tx?.fee || 0;
        const feeDigits = fee.toString().length;
        const feeScaler = Math.min(feeDigits / 7, 1);
        
        const pitchShift = this.calculatePitchShift(
          blockProgress * 0.375 + feeScaler * 0.375 + 0.25,
          0.25,
          1
        );
        
        await this.playSound(eventType, pitchShift);
        this.blockFullAttempts = 0;
        break;
      }
      
      case "MineClicked": {
        if (!data?.counter || !data?.difficulty) {
          await this.playSound(eventType);
          break;
        }
        
        const progress = data.counter / data.difficulty;
        const pitchShift = this.calculatePitchShift(
          progress > 0.35 ? progress + 0.25 : 0.25,
          0.25,
          1
        );
        
        await this.playSound(eventType, pitchShift);
        break;
      }
      
      case "BlockFull": {
        this.blockFullAttempts++;
        if (this.blockFullAttempts >= (this.config.maxBlockFullAttempts || 3)) {
          await this.playSound(eventType);
          this.blockFullAttempts = 0;
        }
        break;
      }
      
      case "ItemPurchased":
      case "UpgradePurchased":
      case "AutomationPurchased": {
        this.blockFullAttempts = 0;
        await this.playSound(eventType);
        break;
      }
      
      default: {
        await this.playSound(eventType);
        break;
      }
    }
  }
}