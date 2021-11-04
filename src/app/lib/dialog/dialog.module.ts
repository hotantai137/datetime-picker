/**
 * dialog.module
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { H2T_DIALOG_SCROLL_STRATEGY_PROVIDER, H2TDialogService } from './dialog.service';
import { H2TDialogContainerComponent } from './dialog-container.component';

@NgModule({
    imports: [CommonModule, A11yModule, OverlayModule, PortalModule],
    exports: [],
    declarations: [
        H2TDialogContainerComponent,
    ],
    providers: [
        H2T_DIALOG_SCROLL_STRATEGY_PROVIDER,
        H2TDialogService,
    ],
    entryComponents: [
        H2TDialogContainerComponent,
    ]
})
export class H2TDialogModule {
}
