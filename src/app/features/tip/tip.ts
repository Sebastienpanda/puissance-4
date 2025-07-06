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
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {interval, Subject, takeUntil} from 'rxjs';

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

    readonly secondsLeft = signal(30);
    private readonly destroyRef = inject(DestroyRef);
    private readonly timer$ = new Subject<void>();

    ngOnChanges(changes: SimpleChanges) {
        if (changes['winner'] && this.winner() !== null) {
            this.timer$.next();
            return;
        }

        if (changes['currentPlayer']) {
            this.restartTimer();
        }
    }

    private restartTimer() {
        this.timer$.next();
        this.secondsLeft.set(30);

        interval(1000)
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                takeUntil(this.timer$),
                takeUntil(interval(31000))
            )
            .subscribe(() => {
                const next = this.secondsLeft() - 1;
                this.secondsLeft.set(next);

                if (next === 0) {
                    this.timeout.emit();
                }
            });
    }

    readonly fillColor = computed(() =>
        this.currentPlayer() === 1 ? '#FD6687' : '#FFD600'
    );

    readonly textColor = computed(() =>
        this.currentPlayer() === 1 ? '#FFF' : '#000'
    );
}
