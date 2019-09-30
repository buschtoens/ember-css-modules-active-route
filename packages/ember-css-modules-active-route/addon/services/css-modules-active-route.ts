import { getOwner } from '@ember/application';
import ApplicationInstance from '@ember/application/instance';
import { assert } from '@ember/debug';
import EngineInstance from '@ember/engine/instance';
import { action, computed } from '@ember/object';
import RouteInfo from '@ember/routing/-private/route-info';
import Transition from '@ember/routing/-private/transition';
import RouterService from '@ember/routing/router-service';
import Service, { inject as service } from '@ember/service';

import {
  addListener,
  removeListener
} from 'ember-css-modules-active-route/utils/events';

type Styles = Record<string, string>;

function resolveElement(elementOrSelector: Element | string) {
  const element =
    typeof elementOrSelector === 'string'
      ? document.querySelector(elementOrSelector)
      : elementOrSelector;
  assert(
    `'${elementOrSelector}' is not an element.`,
    element instanceof Element
  );
  return element!;
}

export default class CssModulesActiveRouteService extends Service {
  private rootOwner: ApplicationInstance = (() => {
    const owner = getOwner(this);
    if (owner instanceof ApplicationInstance) return owner;

    // @warning: This relies on the implicit fact that there is only one Router
    // per application. This could potentially break. By then, we hopefully have
    // a `RouterService` inside Engines.
    // https://github.com/ember-engines/ember-engines/issues/587
    return getOwner(owner.lookup('router:main'));
  })();

  private router: RouterService & {
    routeWillChange(transition: Transition): void;
    routeDidChange(transition: Transition): void;
  } = this.rootOwner.lookup('service:router');

  private mountPoint?: string = (() => {
    const owner = getOwner(this);
    if (typeof owner.mountPoint === 'string') {
      return owner.mountPoint;
    }
  })();

  /**
   * The magic pseudo selectors are rewritten to regular class names, so that we
   * can resolve them here.
   */
  public targetElements = {
    'css-modules-active-route-app': resolveElement(this.rootOwner.rootElement),
    'css-modules-active-route-document': document.documentElement
  };

  /**
   * This map is used to keep track of the currently applied class names, so
   * that we can diff it with the new class names, without interacting with the
   * DOM.
   */
  private currentClassNames: Record<string, string[]> = {};

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
   * names from these styles, which are then applied to the corresponding target
   * elements.
   */
  @action
  private handleRouteChange(transition: Transition) {
    const routeNames = this.getRouteNamesFromRouteInfo(transition.to);
    const styles = routeNames
      .map(name => this.resolveStylesForRoute(name))
      .filter(Boolean) as Styles[];

    this.updateClassNames(styles);
  }

  /**
   * Updates all elements listed in `targetElements` with the respective class
   * names from `styles`.
   */
  updateClassNames(styles: Styles[]) {
    for (const [magicClassName, element] of Object.entries(
      this.targetElements
    )) {
      const newClassNames = this.getClassNamesFromStyles(
        styles,
        magicClassName
      );

      const oldClassNames = this.currentClassNames[magicClassName] || [];
      const staleClassNames = oldClassNames.filter(
        name => !newClassNames.includes(name)
      );
      this.currentClassNames[magicClassName] = newClassNames;

      // IE11 does not support multiple arguments, so we need to iterate.
      // https://caniuse.com/#search=classlist
      for (const name of staleClassNames) element.classList.remove(name);
      for (const name of newClassNames) element.classList.add(name);
    }
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
      if (this.mountPoint) {
        if (currentRouteInfo.name === this.mountPoint)
          routeNames.push('application');
        if (!currentRouteInfo.name.startsWith(`${this.mountPoint}.`)) break;
        routeNames.push(
          currentRouteInfo.name.slice(this.mountPoint.length + 1)
        );
        continue;
      }
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
    const owner: ApplicationInstance | EngineInstance = getOwner(this);
    const styles: Styles | undefined = owner.resolveRegistration(
      `styles:${routeName}`
    );
    return styles;
  }

  /**
   * Returns an array of class names to be applied to the root element.
   */
  private getClassNamesFromStyles(styles: Styles[], magicClassName: string) {
    return ([] as string[])
      .concat(
        // ES 5 `.flatMap()`
        ...styles
          // One class name may map to multiple class names, when using `composes`
          // for instance, so we split them up to get a flat array of single class
          // names.
          .map(classNames => (classNames[magicClassName] || '').split(' '))
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
