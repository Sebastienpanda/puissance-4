import {Component, inject, signal} from '@angular/core';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {MenuModal} from '@features/menu-modal/menu-modal';
import {GameTimerService} from '@core/gameTimer/game-timer-service';
import {GamePauseService} from '@core/gamePause/game-pause';
import {CpuControllerService} from '@core/cpu/cpu-service';

@Component({
    selector: 'app-home',
    templateUrl: './home-layout.html',
    styleUrl: './home.scss',
    imports: [RouterOutlet, RouterLink, MenuModal],
})

export class HomeLayout {
    private readonly router = inject(Router)
    protected readonly isModalOpen = signal(false)
    private readonly timer = inject(GameTimerService);
    private readonly pauseService = inject(GamePauseService);
    private readonly cpuController = inject(CpuControllerService);

    isHome(): boolean {
        return this.router.url === '/';
    }

    openMenu() {
        this.timer.pause();
        this.pauseService.pause();
        this.cpuController.cancelCpuMove();
        this.isModalOpen.set(true);
    }

    closeMenu() {
        this.timer.resume();
        this.isModalOpen.set(false);
        this.pauseService.resume();
        this.cpuController.triggerCpuMove();
    }

    restartGame() {
        this.closeMenu();
        void this.router.navigate(['/']);
    }

    quitGame() {
        this.closeMenu();
        void this.router.navigate(['/']);
    }
}
