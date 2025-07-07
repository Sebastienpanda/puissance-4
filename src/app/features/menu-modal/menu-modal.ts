import {Component, output} from '@angular/core';

@Component({
    selector: 'app-menu-modal',
    templateUrl: './menu-modal.html',
    styleUrl: './menu-modal.scss',
})

export class MenuModal {
    readonly close = output<void>();
    readonly restart = output<void>();
    readonly quit = output<void>();
}
