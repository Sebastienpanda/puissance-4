import {Component} from '@angular/core';
import {PlayerVsCpuIcon} from '@features/home/components/icons/playersvscpu/playersvscpu';
import {PlayerVsPlayersIcon} from '@features/home/components/icons/playersvsplayers/playersvsplayers';
import {RouterLink} from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: './home.html',
    styleUrl: './home.scss',
    imports: [
        PlayerVsCpuIcon,
        PlayerVsPlayersIcon,
        RouterLink
    ]
})

export default class HomeComponent {

}
