import {Injectable, signal} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class GameStateService {
    player1Score = signal(0);
    player2Score = signal(0);
    winner = signal<number | null>(null);
    finalWinner = signal<number | null>(null);

    incrementScore(player: number) {
        if (player === 1) {
            this.player1Score.set(this.player1Score() + 1);
        } else {
            this.player2Score.set(this.player2Score() + 1);
        }
    }

    setWinner(player: number) {
        this.winner.set(player);
    }

    setFinalWinner(player: number) {
        this.finalWinner.set(player);
    }

    registerTie() {
        this.winner.set(0); // match nul
    }

    reset() {
        this.player1Score.set(0);
        this.player2Score.set(0);
        this.winner.set(null);
        this.finalWinner.set(null);
    }

    clearWinner() {
        this.winner.set(null);
    }
}
