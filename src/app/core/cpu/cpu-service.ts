import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class CpuControllerService {
    private cancelCallback: (() => void) | null = null;
    private triggerCallback: (() => void) | null = null;
    private isCpuMoveScheduled = false;

    register(cancel: () => void, trigger: () => void) {
        this.cancelCallback = cancel;
        this.triggerCallback = trigger;
    }

    cancelCpuMove() {
        this.isCpuMoveScheduled = false;
        this.cancelCallback?.();
    }

    triggerCpuMove() {
        if (!this.isCpuMoveScheduled) {
            this.isCpuMoveScheduled = true;
            this.triggerCallback?.();
        }
    }

    clear() {
        this.cancelCallback = null;
        this.triggerCallback = null;
        this.isCpuMoveScheduled = false;
    }
}
