import {Component, input, output} from '@angular/core';

@Component({
    selector: 'app-grid',
    templateUrl: './grid.html',
    styleUrl: './grid.scss',
})

export class Grid {
    readonly grid = input.required<number[][]>();
    readonly isWinningCell = input.required<(row: number, col: number) => boolean>();

    readonly cellClick = output<{ row: number; col: number }>();
}
