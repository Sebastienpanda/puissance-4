import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';

@Component({
    selector: "app-win",
    templateUrl: "./win.html",
    styleUrl: "./win.scss",
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class Win {
    readonly winner = input.required<number>();
    readonly final = input<boolean>(false);
    readonly finalWinner = input<number | null>(null);
    protected readonly playAgain = output<void>()

    handleClick() {
        this.playAgain.emit();
    }
}
