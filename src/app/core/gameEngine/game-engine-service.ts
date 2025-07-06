import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class GameEngineService {
    readonly ROWS = 6;
    readonly COLS = 7;

    private readonly dropSound: HTMLAudioElement;
    private readonly unlockAudio: HTMLAudioElement;

    constructor() {
        this.dropSound = new Audio('/assets/audio/coin.wav');
        this.dropSound.volume = 0.4;
        this.dropSound.load();

        this.unlockAudio = new Audio('/assets/audio/silent.mp3');
        this.unlockAudio.volume = 0;
        this.unlockAudio.load();
    }

    createGrid(): number[][] {
        return Array.from({length: this.ROWS}, () => Array(this.COLS).fill(0));
    }

    getAvailableRow(grid: number[][], col: number): number {
        for (let row = this.ROWS - 1; row >= 0; row--) {
            if (grid[row][col] === 0) return row;
        }
        return -1;
    }

    isGridFull(grid: number[][]): boolean {
        return grid[0].every(cell => cell !== 0);
    }

    checkWin(grid: number[][], row: number, col: number, player: number): [number, number][] {
        const dirs = [{dx: 1, dy: 0}, {dx: 0, dy: 1}, {dx: 1, dy: 1}, {dx: 1, dy: -1}];
        for (const {dx, dy} of dirs) {
            const cells: [number, number][] = [[row, col]];

            let r = row - dy, c = col - dx;
            while (grid[r]?.[c] === player) {
                cells.unshift([r, c]);
                r -= dy;
                c -= dx;
            }

            r = row + dy;
            c = col + dx;
            while (grid[r]?.[c] === player) {
                cells.push([r, c]);
                r += dy;
                c += dx;
            }

            if (cells.length >= 4) return cells;
        }
        return [];
    }

    cloneGrid(grid: number[][]): number[][] {
        return grid.map(row => [...row]);
    }

    getValidColumns(grid: number[][]): number[] {
        return grid[0]
            .map((v, i) => (v === 0 ? i : null))
            .filter((i): i is number => i !== null);
    }

    simulateMove(grid: number[][], col: number, player: number): { grid: number[][], row: number } | null {
        const clone = this.cloneGrid(grid);
        const row = this.getAvailableRow(clone, col);
        if (row === -1) return null;
        clone[row][col] = player;
        return {grid: clone, row};
    }

    getWinnerFromGrid(grid: number[][]): number | null {
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                const player = grid[r][c];
                if (player === 0) continue;
                const win = this.checkWin(grid, r, c, player);
                if (win.length >= 4) return player;
            }
        }
        return null;
    }

    playDropSound() {
        this.dropSound.currentTime = 0;
        this.dropSound.play().catch((err) => {
            console.warn('Playback failed:', err);
        });
    }

    unlockSound() {
        this.unlockAudio.currentTime = 0;
        this.unlockAudio.play().catch((err) => {
            console.warn('Playback failed:', err);
        });
    }

    getPreferredColumnOrder(columns: number[]): number[] {
        const center = Math.floor(this.COLS / 2);
        return [...columns].sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
    }
}
