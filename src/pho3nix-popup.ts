import { LitElement, html, css, property, customElement } from 'lit-element';

@customElement('pho3nix-popup')
export class Pho3nixPopup extends LitElement {
    @property({ type: String, reflect: true, attribute: true })
    title = '';

    static get styles() {
        return [
            css`
            @keyframes fade-in {
                0% {
                    opacity: 0;
                }
                100% {
                    opacity: 1;
                }
            }
            
            @keyframes fade-out {
                0% {
                    opacity: 1;
                }
                99% {
                    opacity: 0;
                }
                100% {
                    opacity: 0;
                    visibility: hidden;
                    display: none;
                }
            }
            
            @keyframes slide-in-bottom {
                0% {
                    transform: translateY(1000px);
                    opacity: 0;
                }
                100% {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            @keyframes slide-out-bottom {
                0% {
                    transform: translateY(0);
                    opacity: 1;
                }
                100% {
                    transform: translateY(1000px);
                    opacity: 0;
                }
            }
            .fade-in {
                animation: fade-in 300ms cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
                animation-fill-mode: forwards;
            }
            .fade-out {
                animation: fade-out 300ms ease-out both;
                animation-fill-mode: forwards;
            }
            .slide-in-bottom {
                animation: slide-in-bottom 300ms cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
                animation-fill-mode: forwards;
            }
            .slide-out-bottom {
                animation: slide-out-bottom 300ms cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
                animation-fill-mode: forwards;
            }
            .wrapper {
                position: absolute;
                top: 0px;
                left: 0px;
                right: 0px;
                bottom: 0px;
                background: var(--bg-color, rgba(0,0,0,0.85));
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                overflow: hidden;
            }

            .wrapper:not(.fade-out):not(.fade-in) {
                display: none;
            }

            .popup {
                min-width: 50%;
                background: var(--popup-bg-color, #fff);
                padding: 1em;
                cursor: auto;
                border-radius: .5em;
            }

            .headline {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
            }

            .headline h1 {
                margin: 0;
                font-size: 2em;
            }

            .headline a {
                font-size: 2em;
                cursor: pointer;
            }
            @media only screen and (max-width: 1280px) {
                .wrapper {
                    align-items: flex-end;
                    justify-items: stretch;
                    padding: 0em 1em;
                }
                .popup {
                    width: 100%;
                    border-radius: .5em .5em 0em 0em;
                }
            }
            `
        ];
    }

    private get wrapper(): HTMLElement | null {
        return this.renderRoot && this.renderRoot.querySelector('.wrapper');
    }
    private get popup(): HTMLElement | null {
        return this.renderRoot && this.renderRoot.querySelector('.popup');
    }

    public open() {
        this.show();
    }

    private show() {
        const { wrapper, popup } = this;
        if (wrapper && popup) {
            wrapper.classList.remove('fade-out');
            popup.classList.remove('slide-out-bottom');
            
            wrapper.classList.add('fade-in');
            popup.classList.add('slide-in-bottom');
        }
    }

    private hide() {
        const { wrapper, popup } = this;
        if (wrapper && popup) {
            wrapper.classList.remove('fade-in');
            popup.classList.remove('slide-in-bottom');

            wrapper.classList.add('fade-out');
            popup.classList.add('slide-out-bottom');
        }
    }

    public close(event?: MouseEvent) {
        if (event) {
            event.stopPropagation();
            const action: string | null = event.target && (<HTMLElement>event.target).getAttribute('data-action');
            if (action === 'close') {
                this.hide();
                this.dispatchEvent(new Event('close'));
            }
        } else {
            this.hide();
            this.dispatchEvent(new Event('close'));
        }
    }

    protected render() {
        return html`
   <div data-action="close" class="wrapper" @click=${this.close}>
    <div class="popup">
      <div class="headline">
        <h1>${this.title}</h1>
        <a data-action="close" @click=${this.close}>×</a>
      </div>
      <slot></slot>
    </div>
   </div>
   `;
    }
}
