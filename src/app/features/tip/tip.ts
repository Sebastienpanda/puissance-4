import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    inject,
    input,
    OnChanges,
    output,
    signal,
    SimpleChanges
} from '@angular/core';
import {GameTimerService} from '@core/gameTimer/game-timer-service';

@Component({
    selector: 'app-player-turn',
    templateUrl: './tip.html',
    styleUrl: './tip.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class Tip implements OnChanges {
    readonly currentPlayer = input.required<number>()
    readonly winner = input.required<number>();
    readonly timeout = output<void>();
    private readonly timer = inject(GameTimerService);
    private readonly destroyRef = inject(DestroyRef);
    readonly secondsLeft = signal(30);

    ngOnChanges(changes: SimpleChanges) {
        if (changes['winner'] && this.winner() !== null) {
            this.timer.clear();
            return;
        }

        if (changes['currentPlayer']) {
            this.restartTimer();
        }
    }

    private restartTimer() {
        this.secondsLeft.set(30);

        this.timer.start(
            30,
            (remaining) => {
                this.secondsLeft.set(remaining);
            },
            () => {
                this.timeout.emit();
            }
        );
    }

    readonly fillColor = computed(() =>
        this.currentPlayer() === 1 ? '#FD6687' : '#FFD600'
    );

    readonly textColor = computed(() =>
        this.currentPlayer() === 1 ? '#FFF' : '#000'
    );
}
