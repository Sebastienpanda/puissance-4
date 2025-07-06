import {Component, computed, inject, signal} from '@angular/core';
import {GameBoard} from '@features/game-board/game-board';
import {PlayerInfo} from '@features/player-info/player-info';
import {DifficultyModal} from '@features/difficulty-modal/difficulty-modal';
import {GameStateService} from '@core/gameScore/game-state-service';
import {GameEngineService} from '@core/gameEngine/game-engine-service';

@Component({
    selector: 'app-players-vs-cpu',
    templateUrl: './players-vs-cpu.html',
    styleUrl: './players-vs-cpu.scss',
    imports: [GameBoard, PlayerInfo, DifficultyModal],
})
export default class PlayersVsCpu {
    private readonly gameState = inject(GameStateService);
    private readonly game = inject(GameEngineService);

    difficulty = signal<'easy' | 'medium' | 'hard' | null>(null);
    badMoves = signal<Set<number>>(new Set());

    readonly grid = signal(this.game.createGrid());
    readonly currentPlayer = signal(1);
    readonly lastPlayedColumn = signal<number | null>(null);
    readonly winningCells = signal<[number, number][]>([]);

    onChooseDifficulty(level: 'easy' | 'medium' | 'hard') {
        this.difficulty.set(level);
        this.badMoves.set(new Set());
        this.gameState.reset();
        this.game.unlockSound()
    }

    get player1Score() {
        return this.gameState.player1Score();
    }

    get player2Score() {
        return this.gameState.player2Score();
    }

    get winner() {
        return this.gameState.winner();
    }

    get finalWinner() {
        return this.gameState.finalWinner();
    }

    lastPlayer(): number {
        return this.currentPlayer() === 1 ? 2 : 1;
    }

    handleClick(_: number, col: number) {
        if (this.difficulty() === null || this.currentPlayer() !== 1 || this.winner !== null) return;
        const played = this.placeToken(col, 1);

        if (played && this.currentPlayer() === 2 && this.winner === null) {
            setTimeout(() => this.cpuMove(), 0);
        }
    }

    resetGame() {
        this.grid.set(this.game.createGrid());
        this.winningCells.set([]);
        this.lastPlayedColumn.set(null);
        this.badMoves.set(new Set());

        const isFinal = this.finalWinner !== null;

        if (isFinal) {
            this.gameState.reset();
            this.difficulty.set(null);
            this.currentPlayer.set(1);
        } else {
            this.gameState.clearWinner();
            const next = this.currentPlayer() === 1 ? 2 : 1;
            this.currentPlayer.set(next);

            if (next === 2) this.cpuMove();
        }
    }

    handleTimeout() {
        if (this.difficulty() === null || this.winner !== null) return;
        const col = this.getRandomMove();
        if (this.currentPlayer() === 1) this.handleClick(0, col);
        else this.cpuMove();
    }

    placeToken(col: number, player: number): boolean {
        const next = this.game.cloneGrid(this.grid());
        const row = this.game.getAvailableRow(next, col);
        if (row === -1) return false;

        next[row][col] = player;
        this.grid.set(next);
        this.lastPlayedColumn.set(col);
        this.game.playDropSound();

        const win = this.game.checkWin(next, row, col, player);
        if (win.length > 0) {
            this.winningCells.set(win);
            this.gameState.setWinner(player);
            this.gameState.incrementScore(player);

            if (
                (player === 1 && this.player1Score === 3) ||
                (player === 2 && this.player2Score === 3)
            ) {
                this.gameState.setFinalWinner(player);
            }

            if (player === 2 && this.difficulty() === 'medium') {
                this.rememberBadMoveIfNeeded(player, col);
            }

            return true;
        }

        if (this.game.isGridFull(next)) {
            this.gameState.setWinner(0);
            return true;
        }

        this.currentPlayer.set(player === 1 ? 2 : 1);
        return true;
    }

    private rememberBadMoveIfNeeded(player: number, col: number) {
        if (
            player === 2 &&
            this.difficulty() === 'medium' &&
            this.player1Score > this.player2Score
        ) {
            const updated = new Set(this.badMoves());
            updated.add(col);
            this.badMoves.set(updated);
        }
    }

    cpuMove() {
        if (this.difficulty() === null || this.winner !== null) return;

        const level = this.difficulty();
        let col = 0;

        if (level === 'easy') col = this.getRandomMove();
        else if (level === 'medium') col = this.getMediumMove();
        else col = this.getBestMinimaxMove(this.getAdaptiveDepth());

        setTimeout(() => this.placeToken(col, 2), 2000);
    }

    getRandomMove(): number {
        const valid = this.game.getValidColumns(this.grid());
        return valid[Math.floor(Math.random() * valid.length)];
    }

    getMediumMove(): number {
        const valid = this.game.getValidColumns(this.grid()).filter(c => !this.badMoves().has(c));

        for (const col of valid) {
            const sim = this.game.simulateMove(this.grid(), col, 2);
            if (sim && this.game.checkWin(sim.grid, sim.row, col, 2).length >= 4) return col;
        }

        for (const col of valid) {
            const sim = this.game.simulateMove(this.grid(), col, 1);
            if (sim && this.game.checkWin(sim.grid, sim.row, col, 1).length >= 4) return col;
        }

        return this.getRandomMove();
    }

    getBestMinimaxMove(depth: number): number {
        let bestScore = -Infinity;
        let bestCol = this.game.getValidColumns(this.grid())[0];

        for (const col of this.game.getPreferredColumnOrder(this.game.getValidColumns(this.grid()))) {
            const sim = this.game.simulateMove(this.grid(), col, 2);
            if (!sim) continue;
            const score = this.minimax(sim.grid, depth - 1, false, -Infinity, Infinity);
            if (score > bestScore) {
                bestScore = score;
                bestCol = col;
            }
        }

        return bestCol;
    }

    getAdaptiveDepth(): number {
        const filled = this.grid().flat().filter(x => x !== 0).length;
        if (filled < 14) return 6;
        if (filled < 28) return 5;
        return 4;
    }

    minimax(grid: number[][], depth: number, maximizing: boolean, alpha: number, beta: number): number {
        const winner = this.game.getWinnerFromGrid(grid);
        if (depth === 0 || winner !== null) {
            return this.evaluateTerminalState(winner, grid);
        }

        const validCols = this.game.getPreferredColumnOrder(this.game.getValidColumns(grid));
        return maximizing
            ? this.maximize(grid, validCols, depth, alpha, beta)
            : this.minimize(grid, validCols, depth, alpha, beta);
    }

    private evaluateTerminalState(winner: number | null, grid: number[][]): number {
        if (winner === 2) return 100000;
        if (winner === 1) return -100000;
        return this.evaluatePosition(grid, 2);
    }

    private maximize(grid: number[][], validCols: number[], depth: number, alpha: number, beta: number): number {
        let maxEval = -Infinity;
        for (const col of validCols) {
            const sim = this.game.simulateMove(grid, col, 2);
            if (!sim) continue;

            const evalScore = this.minimax(sim.grid, depth - 1, false, alpha, beta);
            maxEval = Math.max(maxEval, evalScore);
            alpha = Math.max(alpha, evalScore);

            if (beta <= alpha) break;
        }
        return maxEval;
    }

    private minimize(grid: number[][], validCols: number[], depth: number, alpha: number, beta: number): number {
        let minEval = Infinity;
        for (const col of validCols) {
            const sim = this.game.simulateMove(grid, col, 1);
            if (!sim) continue;

            const evalScore = this.minimax(sim.grid, depth - 1, true, alpha, beta);
            minEval = Math.min(minEval, evalScore);
            beta = Math.min(beta, evalScore);

            if (beta <= alpha) break;
        }
        return minEval;
    }

    evaluatePosition(grid: number[][], player: number): number {
        let score = 0;
        const centerCol = Math.floor(this.game.COLS / 2);
        const centerCount = grid.map(r => r[centerCol]).filter(p => p === player).length;
        score += centerCount * 3;

        const dirs = [{dx: 1, dy: 0}, {dx: 0, dy: 1}, {dx: 1, dy: 1}, {dx: 1, dy: -1}];
        for (let r = 0; r < this.game.ROWS; r++) {
            for (let c = 0; c < this.game.COLS; c++) {
                for (const {dx, dy} of dirs) {
                    const window: number[] = [];
                    for (let i = 0; i < 4; i++) {
                        const rr = r + i * dy;
                        const cc = c + i * dx;
                        if (grid[rr]?.[cc] !== undefined) window.push(grid[rr][cc]);
                    }
                    score += this.evaluateWindow(window, player);
                }
            }
        }
        return score;
    }

    evaluateWindow(window: number[], player: number): number {
        const opp = player === 1 ? 2 : 1;
        const count = (val: number) => window.filter(p => p === val).length;

        if (count(player) === 4) return 100;
        if (count(player) === 3 && count(0) === 1) return 10;
        if (count(player) === 2 && count(0) === 2) return 5;
        if (count(opp) === 3 && count(0) === 1) return -80;
        return 0;
    }

    readonly markerPosition = computed(() => {
        const col = this.lastPlayedColumn();
        if (col === null) return -9999;
        const cellWidth = 80;
        const gap = 8;
        const total = cellWidth + gap;
        return 12 + col * total + (cellWidth - 38) / 2;
    });

    readonly isWinningCell = (r: number, c: number) =>
        this.winningCells().some(([row, col]) => row === r && col === c);
}
