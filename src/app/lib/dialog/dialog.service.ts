/**
 * dialog.service
 */

import {
    ComponentRef,
    Inject,
    Injectable,
    InjectionToken,
    Injector,
    Optional,
    SkipSelf,
    TemplateRef
} from '@angular/core';
import { Location } from '@angular/common';
import { H2TDialogConfig, H2TDialogConfigInterface } from './dialog-config.class';
import { H2TDialogRef } from './dialog-ref.class';
import { H2TDialogContainerComponent } from './dialog-container.component';
import { extendObject } from '../utils';
import { defer, Observable, Subject } from 'rxjs';
import { startWith } from 'rxjs/operators';
import {
    Overlay,
    OverlayConfig,
    OverlayContainer,
    OverlayRef,
    ScrollStrategy
} from '@angular/cdk/overlay';
import {
    ComponentPortal,
    ComponentType,
    PortalInjector
} from '@angular/cdk/portal';

export const H2T_DIALOG_DATA = new InjectionToken<any>('H2TDialogData');

/**
 * Injection token that determines the scroll handling while the dialog is open.
 * */
export const H2T_DIALOG_SCROLL_STRATEGY = new InjectionToken<
    () => ScrollStrategy
>('h2t-dialog-scroll-strategy');

export function H2T_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY(
    overlay: Overlay
): () => ScrollStrategy {
    const fn = () => overlay.scrollStrategies.block();
    return fn;
}

/** @docs-private */
export const H2T_DIALOG_SCROLL_STRATEGY_PROVIDER = {
    provide: H2T_DIALOG_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: H2T_DIALOG_SCROLL_STRATEGY_PROVIDER_FACTORY
};

/**
 * Injection token that can be used to specify default dialog options.
 * */
export const H2T_DIALOG_DEFAULT_OPTIONS = new InjectionToken<H2TDialogConfig>(
    'h2t-dialog-default-options'
);

@Injectable()
export class H2TDialogService {
    private ariaHiddenElements = new Map<Element, string | null>();

    private _openDialogsAtThisLevel: H2TDialogRef<any>[] = [];
    private _afterOpenAtThisLevel = new Subject<H2TDialogRef<any>>();
    private _afterAllClosedAtThisLevel = new Subject<void>();

    /** Keeps track of the currently-open dialogs. */
    get openDialogs(): H2TDialogRef<any>[] {
        return this.parentDialog
            ? this.parentDialog.openDialogs
            : this._openDialogsAtThisLevel;
    }

    /** Stream that emits when a dialog has been opened. */
    get afterOpen(): Subject<H2TDialogRef<any>> {
        return this.parentDialog
            ? this.parentDialog.afterOpen
            : this._afterOpenAtThisLevel;
    }

    get _afterAllClosed(): any {
        const parent = this.parentDialog;
        return parent
            ? parent._afterAllClosed
            : this._afterAllClosedAtThisLevel;
    }

    /**
     * Stream that emits when all open dialog have finished closing.
     * Will emit on subscribe if there are no open dialogs to begin with.
     */

    afterAllClosed: Observable<{}> = defer(
        () =>
            this._openDialogsAtThisLevel.length
                ? this._afterAllClosed
                : this._afterAllClosed.pipe(startWith(undefined))
    );

    private readonly scrollStrategy: () => ScrollStrategy;

    constructor(
        private overlay: Overlay,
        private injector: Injector,
        @Optional() private location: Location,
        @Inject(H2T_DIALOG_SCROLL_STRATEGY) scrollStrategy: any,
        @Optional()
        @Inject(H2T_DIALOG_DEFAULT_OPTIONS)
        private defaultOptions: H2TDialogConfigInterface,
        @Optional()
        @SkipSelf()
        private parentDialog: H2TDialogService,
        private overlayContainer: OverlayContainer
    ) {
        this.scrollStrategy = scrollStrategy;
        if (!parentDialog && location) {
            location.subscribe(() => this.closeAll());
        }
    }

    public open<T>(
        componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
        config?: H2TDialogConfigInterface
    ): H2TDialogRef<any> {
        config = applyConfigDefaults(config, this.defaultOptions);

        if (config.id && this.getDialogById(config.id)) {
            throw Error(
                `Dialog with id "${
                    config.id
                }" exists already. The dialog id must be unique.`
            );
        }

        const overlayRef = this.createOverlay(config);
        const dialogContainer = this.attachDialogContainer(overlayRef, config);
        const dialogRef = this.attachDialogContent<T>(
            componentOrTemplateRef,
            dialogContainer,
            overlayRef,
            config
        );

        if (!this.openDialogs.length) {
            this.hideNonDialogContentFromAssistiveTechnology();
        }

        this.openDialogs.push(dialogRef);
        dialogRef
            .afterClosed()
            .subscribe(() => this.removeOpenDialog(dialogRef));
        this.afterOpen.next(dialogRef);
        return dialogRef;
    }

    /**
     * Closes all of the currently-open dialogs.
     */
    public closeAll(): void {
        let i = this.openDialogs.length;

        while (i--) {
            this.openDialogs[i].close();
        }
    }

    /**
     * Finds an open dialog by its id.
     * @param id ID to use when looking up the dialog.
     */
    public getDialogById(id: string): H2TDialogRef<any> | undefined {
        return this.openDialogs.find(dialog => dialog.id === id);
    }

    private attachDialogContent<T>(
        componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
        dialogContainer: H2TDialogContainerComponent,
        overlayRef: OverlayRef,
        config: H2TDialogConfigInterface
    ) {
        const dialogRef = new H2TDialogRef<T>(
            overlayRef,
            dialogContainer,
            config.id,
            this.location
        );

        if (config.hasBackdrop) {
            overlayRef.backdropClick().subscribe(() => {
                if (!dialogRef.disableClose) {
                    dialogRef.close();
                }
            });
        }

        if (componentOrTemplateRef instanceof TemplateRef) {
        } else {
            const injector = this.createInjector<T>(
                config,
                dialogRef,
                dialogContainer
            );
            const contentRef = dialogContainer.attachComponentPortal(
                new ComponentPortal(componentOrTemplateRef, undefined, injector)
            );
            dialogRef.componentInstance = contentRef.instance;
        }

        dialogRef
            .updateSize(config.width, config.height)
            .updatePosition(config.position);

        return dialogRef;
    }

    private createInjector<T>(
        config: H2TDialogConfigInterface,
        dialogRef: H2TDialogRef<T>,
        dialogContainer: H2TDialogContainerComponent
    ) {
        const userInjector =
            config &&
            config.viewContainerRef &&
            config.viewContainerRef.injector;
        const injectionTokens = new WeakMap();

        injectionTokens.set(H2TDialogRef, dialogRef);
        injectionTokens.set(H2TDialogContainerComponent, dialogContainer);
        injectionTokens.set(H2T_DIALOG_DATA, config.data);

        return new PortalInjector(
            userInjector || this.injector,
            injectionTokens
        );
    }

    private createOverlay(config: H2TDialogConfigInterface): OverlayRef {
        const overlayConfig = this.getOverlayConfig(config);
        return this.overlay.create(overlayConfig);
    }

    private attachDialogContainer(
        overlayRef: OverlayRef,
        config: H2TDialogConfigInterface
    ): H2TDialogContainerComponent {
        const containerPortal = new ComponentPortal(
            H2TDialogContainerComponent,
            config.viewContainerRef
        );
        const containerRef: ComponentRef<
            H2TDialogContainerComponent
        > = overlayRef.attach(containerPortal);
        containerRef.instance.setConfig(config);

        return containerRef.instance;
    }

    private getOverlayConfig(dialogConfig: H2TDialogConfigInterface): OverlayConfig {
        const state = new OverlayConfig({
            positionStrategy: this.overlay.position().global(),
            scrollStrategy:
                dialogConfig.scrollStrategy || this.scrollStrategy(),
            panelClass: dialogConfig.paneClass,
            hasBackdrop: dialogConfig.hasBackdrop,
            minWidth: dialogConfig.minWidth,
            minHeight: dialogConfig.minHeight,
            maxWidth: dialogConfig.maxWidth,
            maxHeight: dialogConfig.maxHeight
        });

        if (dialogConfig.backdropClass) {
            state.backdropClass = dialogConfig.backdropClass;
        }

        return state;
    }

    private removeOpenDialog(dialogRef: H2TDialogRef<any>): void {
        const index = this._openDialogsAtThisLevel.indexOf(dialogRef);

        if (index > -1) {
            this.openDialogs.splice(index, 1);
            // If all the dialogs were closed, remove/restore the `aria-hidden`
            // to a the siblings and emit to the `afterAllClosed` stream.
            if (!this.openDialogs.length) {
                this.ariaHiddenElements.forEach((previousValue, element) => {
                    if (previousValue) {
                        element.setAttribute('aria-hidden', previousValue);
                    } else {
                        element.removeAttribute('aria-hidden');
                    }
                });

                this.ariaHiddenElements.clear();
                this._afterAllClosed.next();
            }
        }
    }

    /**
     * Hides all of the content that isn't an overlay from assistive technology.
     */
    private hideNonDialogContentFromAssistiveTechnology() {
        const overlayContainer = this.overlayContainer.getContainerElement();

        // Ensure that the overlay container is attached to the DOM.
        if (overlayContainer.parentElement) {
            const siblings = overlayContainer.parentElement.children;

            for (let i = siblings.length - 1; i > -1; i--) {
                const sibling = siblings[i];

                if (
                    sibling !== overlayContainer &&
                    sibling.nodeName !== 'SCRIPT' &&
                    sibling.nodeName !== 'STYLE' &&
                    !sibling.hasAttribute('aria-live')
                ) {
                    this.ariaHiddenElements.set(
                        sibling,
                        sibling.getAttribute('aria-hidden')
                    );
                    sibling.setAttribute('aria-hidden', 'true');
                }
            }
        }
    }
}

/**
 * Applies default options to the dialog config.
 * @param config Config to be modified.
 * @param defaultOptions Default config setting
 * @returns The new configuration object.
 */
function applyConfigDefaults(
    config?: H2TDialogConfigInterface,
    defaultOptions?: H2TDialogConfigInterface
): H2TDialogConfig {
    return extendObject(new H2TDialogConfig(), config, defaultOptions);
}
