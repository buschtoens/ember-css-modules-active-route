import { getOwner } from '@ember/application';
import ApplicationInstance from '@ember/application/instance';
import { action } from '@ember/object';
import RouteInfo from '@ember/routing/-private/route-info';
import Transition from '@ember/routing/-private/transition';
import RouterService from '@ember/routing/router-service';
import Service, { inject as service } from '@ember/service';

import {
  addListener,
  removeListener
} from 'ember-css-modules-active-route/utils/events';

type Styles = Record<string, string>;

export default class CssModulesActiveRouteService extends Service {
  @service router!: RouterService & {
    routeWillChange(transition: Transition): void;
    routeDidChange(transition: Transition): void;
  };

  /**
   * The magic pseudo selector is rewritten to a regular class name, so that we
   * can resolve it here.
   */
  public magicClassName = 'css-modules-active-route';

  /**
   * This is the element the class names will be applied to.
   */
  public rootElement = document.documentElement;

  /**
   * This array is used to keep track of the currently applied class names, so
   * that we can diff it with the new class names, without interacting with the
   * DOM.
   */
  private currentClassNames: string[] = [];

  init() {
    super.init();

    addListener(this.router, 'routeWillChange', this.handleRouteChange);
    addListener(this.router, 'routeDidChange', this.handleRouteChange);
  }

  willDestroy() {
    super.willDestroy();

    removeListener(this.router, 'routeWillChange', this.handleRouteChange);
    removeListener(this.router, 'routeDidChange', this.handleRouteChange);
  }

  /**
   * Called when a transition begins or ends.
   *
   * Resolves the target route hierarchy into styles and then gets the class
   * names from these styles, which are then applied to the `rootElement`.
   */
  @action
  private handleRouteChange(transition: Transition) {
    const routeNames = this.getRouteNamesFromRouteInfo(transition.to);
    const styles = routeNames
      .map(name => this.resolveStylesForRoute(name))
      .filter(Boolean) as Styles[];
    const newClassNames = this.getClassNamesFromStyles(styles);

    const oldClassNames = this.currentClassNames;
    const staleClassNames = oldClassNames.filter(
      name => !newClassNames.includes(name)
    );

    // IE11 does not support multiple arguments, so we need to iterate.
    // https://caniuse.com/#search=classlist
    for (const name of staleClassNames) this.rootElement.classList.remove(name);
    for (const name of newClassNames) this.rootElement.classList.add(name);
  }

  /**
   * Returns all route names for a given `RouteInfo` object. The order is from
   * parent to child.
   *
   * @example 'foo.bar.index' => [
   *   'application',
   *   'foo',
   *   'foo.bar',
   *   'foo.bar.index'
   * ]
   */
  private getRouteNamesFromRouteInfo(routeInfo: RouteInfo) {
    const routeNames: string[] = [];
    for (
      let currentRouteInfo = routeInfo;
      currentRouteInfo.parent;
      currentRouteInfo = currentRouteInfo.parent
    ) {
      routeNames.push(currentRouteInfo.name);
    }

    // `.reverse()` so that they are ordered from parent to child
    return routeNames.reverse();
  }

  /**
   * Resolves the respective `styles.css` for a given route name.
   * Returns `undefined`, if no associated `styles.css` file exists.
   *
   * @note This method assumes that no non-default templates for routes are
   * rendered.
   * @see https://github.com/emberjs/rfcs/blob/master/text/0418-deprecate-route-render-methods.md
   */
  private resolveStylesForRoute(routeName: string) {
    const owner: ApplicationInstance = getOwner(this);
    const styles: Styles | undefined = owner.resolveRegistration(
      `styles:${routeName}`
    );
    return styles;
  }

  /**
   * Returns an array of class names to be applied to the root element.
   */
  private getClassNamesFromStyles(styles: Styles[]) {
    return ([] as string[])
      .concat(
        // ES 5 `.flatMap()`
        ...styles
          // One class name may map to multiple class names, when using `composes`
          // for instance, so we split them up to get a flat array of single class
          // names.
          .map(classNames => (classNames[this.magicClassName] || '').split(' '))
      )
      .filter(Boolean);
  }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    'css-modules-active-route': CssModulesActiveRouteService;
  }
}
