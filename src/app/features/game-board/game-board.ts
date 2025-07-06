import {Component, input, output} from '@angular/core';
import {Grid} from '@features/grid/grid';
import {CurrentPlayerIcon} from '@features/current/current';
import {Win} from '@features/win/win';
import {Tip} from '@features/tip/tip';

@Component({
    selector: 'app-game-board',
    templateUrl: './game-board.html',
    styleUrl: './game-board.scss',
    imports: [
        Grid,
        CurrentPlayerIcon,
        Win,
        Tip
    ]
})

export class GameBoard {
    readonly grid = input.required<number[][]>();
    readonly currentPlayer = input.required<number>();
    readonly lastPlayer = input.required<number | null>();
    readonly lastPlayedColumn = input.required<number | null>();
    readonly winner = input.required<number | null>();
    readonly markerPosition = input.required<number>();
    readonly isWinningCell = input.required<(row: number, col: number) => boolean>();
    readonly finalWinner = input<number | null>();

    readonly cellClick = output<{ row: number; col: number }>();
    readonly timeout = output<void>();
    readonly playAgain = output<void>();

    onCellClick(e: { row: number; col: number }) {
        this.cellClick.emit(e);
    }

    onTimeout() {
        this.timeout.emit();
    }

    onPlayAgain() {
        this.playAgain.emit();
    }
}
