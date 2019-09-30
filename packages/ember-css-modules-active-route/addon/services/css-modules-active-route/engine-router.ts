import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import { action, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import Evented from '@ember/object/evented';
import RouteInfo from '@ember/routing/-private/route-info';
import Transition from '@ember/routing/-private/transition';
import Service from '@ember/service';

import { getRootOwner } from 'ember-css-modules-active-route/utils/owner';

type InternalRouteInfo = {
  name: string;
  parent: null | InternalRouteInfo;
};

/**
 * This is an incomplete implementation of a would-be `RouterService` scoped to
 * engines.
 *
 * @see https://github.com/ember-engines/ember-engines/issues/587
 */
export default class EngineRouterService extends Service.extend(Evented) {
  init() {
    super.init();

    this.externalRouter.on('routeWillChange', this.onRouteWillChange);
    this.externalRouter.on('routeDidChange', this.onRouteDidChange);
  }

  destroy() {
    this.externalRouter.off('routeWillChange', this.onRouteWillChange);
    this.externalRouter.off('routeDidChange', this.onRouteDidChange);

    return super.destroy();
  }

  @action
  private onRouteWillChange(transition: Transition) {
    this.trigger('routeWillChange', this.buildInternalTransition(transition));
  }

  @action
  private onRouteDidChange(transition: Transition) {
    this.trigger('routeDidChange', this.buildInternalTransition(transition));
  }

  private engine = getOwner(this);
  private rootApplication = getRootOwner(this)!;

  @reads('engine.mountPoint')
  private mountPoint!: string;

  @computed('rootApplication')
  private get externalRouter() {
    return this.rootApplication.lookup('service:router');
  }

  private belongsToEngine(externalRouteName: string): boolean {
    return (
      externalRouteName === this.mountPoint ||
      externalRouteName.startsWith(`${this.mountPoint}.`)
    );
  }

  private getRelativeInternalRouteName(externalRouteName: string): string {
    if (externalRouteName === this.mountPoint) {
      return 'application';
    }
    assert(
      `'${externalRouteName}' is not a sub-route of '${this.mountPoint}'`,
      this.belongsToEngine(externalRouteName)
    );
    return externalRouteName.slice(this.mountPoint.length + 1);
  }

  private buildInternalTransition(transition: Transition) {
    return {
      from: transition.from && this.buildInternalRouteInfo(transition.from),
      to: this.buildInternalRouteInfo(transition.to)
    };
  }

  private buildInternalRouteInfo(
    routeInfo: RouteInfo
  ): null | InternalRouteInfo {
    if (!this.belongsToEngine(routeInfo.name)) return null;

    return {
      name: this.getRelativeInternalRouteName(routeInfo.name),
      parent: routeInfo.parent && this.buildInternalRouteInfo(routeInfo.parent)
    };
  }
}
