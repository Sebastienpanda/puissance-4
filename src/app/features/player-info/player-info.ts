import {Component, effect, ElementRef, inject, input} from '@angular/core';

@Component({
    selector: 'app-player-info',
    templateUrl: './player-info.html',
    styleUrl: './player-info.scss',
})
export class PlayerInfo {
    readonly name = input.required<string>();
    readonly score = input.required<number>();
    readonly color = input.required<'red' | 'yellow'>();

    private previousScore: number | null = null;
    private readonly host = inject(ElementRef<HTMLElement>);

    constructor() {
        effect(() => {
            const currentScore = this.score();
            if (this.previousScore !== null && currentScore !== this.previousScore) {
                this.triggerScoreAnimation();
            }
            this.previousScore = currentScore;
        });
    }

    private triggerScoreAnimation() {
        const el = this.host?.nativeElement.querySelector('.player-info__score');
        if (!el) return;

        el.classList.remove('animate');
        void el.offsetWidth;
        el.classList.add('animate');
    }
}
