import {Component, computed, input} from '@angular/core';

@Component({
    selector: 'app-current-player-icon',
    templateUrl: './current.html',
})

export class CurrentPlayerIcon {
    readonly currentPlayer = input.required<number>()

    readonly fillColor = computed(() =>
        this.currentPlayer() === 1 ? '#FD6687' : '#FFD600'
    );
}
