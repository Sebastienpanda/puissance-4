import {Injectable} from '@angular/core';

type TickCallback = (remaining: number) => void;
type EndCallback = () => void;

@Injectable({providedIn: 'root'})
export class GameTimerService {
    private intervalId: ReturnType<typeof setInterval> | null = null;
    private remainingTime = 15;
    private isPaused = false;

    private tickCallback: TickCallback | null = null;
    private endCallback: EndCallback | null = null;

    start(duration = 15, onTick?: TickCallback, onEnd?: EndCallback): void {
        this.clear();
        this.remainingTime = duration;
        this.isPaused = false;

        if (onTick) this.tickCallback = onTick;
        if (onEnd) this.endCallback = onEnd;

        this.intervalId = setInterval(() => {
            if (!this.isPaused) {
                this.remainingTime--;
                if (this.tickCallback) {
                    this.tickCallback(this.remainingTime);
                }


                if (this.remainingTime <= 0) {
                    this.clear();
                    if (this.endCallback) {
                        this.endCallback();
                    }
                }
            }
        }, 1000);
    }

    pause(): void {
        this.isPaused = true;
    }

    resume(): void {
        this.isPaused = false;
    }

    clear(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    isRunning(): boolean {
        return this.intervalId !== null && !this.isPaused;
    }

    getRemainingTime(): number {
        return this.remainingTime;
    }
}
