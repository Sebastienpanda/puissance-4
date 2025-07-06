import {Component, output} from '@angular/core';

@Component({
    selector: 'app-difficulty-modal',
    templateUrl: './difficulty-modal.html',
    styleUrl: './difficulty-modal.scss',
})
export class DifficultyModal {
    readonly choose = output<'easy' | 'medium' | 'hard'>();

    handleClick(level: 'easy' | 'medium' | 'hard') {
        this.choose.emit(level);
    }
}
