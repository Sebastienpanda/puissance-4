import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';

@Component({
    selector: 'app-rules',
    templateUrl: './rules.html',
    styleUrl: './rules.scss',
})
export default class RulesComponent {
    private readonly router = inject(Router);

    goHome() {
        void this.router.navigateByUrl('/');
    }
}
