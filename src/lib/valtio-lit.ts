// Valtio integration with Lit components
import { LitElement } from 'lit'
import { subscribe } from 'valtio'

/**
 * Base class for Lit components that react to Valtio state changes
 * Replaces MobX + @adobe/lit-mobx with simple Valtio subscription
 */
export class ValtioLitElement extends LitElement {
  private valtioUnsubscribes: (() => void)[] = []

  /**
   * Subscribe to Valtio proxy state changes
   */
  protected subscribeToState(proxy: any): void {
    const unsubscribe = subscribe(proxy, () => {
      this.requestUpdate()
    })
    this.valtioUnsubscribes.push(unsubscribe)
  }

  /**
   * Cleanup subscriptions when component disconnects
   */
  disconnectedCallback(): void {
    super.disconnectedCallback()
    this.valtioUnsubscribes.forEach(unsubscribe => unsubscribe())
    this.valtioUnsubscribes = []
  }

  /**
   * Render to light DOM for global CSS integration (BakeWatt pattern)
   */
  protected createRenderRoot() {
    return this // Light DOM instead of shadow DOM
  }
}