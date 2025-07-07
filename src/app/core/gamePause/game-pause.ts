import {Injectable, signal} from '@angular/core';

@Injectable({providedIn: 'root'})
export class GamePauseService {
    readonly isPaused = signal(false);

    pause() {
        this.isPaused.set(true);
    }

    resume() {
        this.isPaused.set(false);
    }
}
