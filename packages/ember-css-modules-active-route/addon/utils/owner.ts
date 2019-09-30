import { getOwner } from '@ember/application';
import ApplicationInstance from '@ember/application/instance';

export const getRootOwner = (
  object: any
): ApplicationInstance & { rootElement: string } | undefined => {
  const owner = getOwner(object);
  if (owner instanceof ApplicationInstance)
    return owner as ApplicationInstance & { rootElement: string };

  // @warning: This relies on the implicit fact that there is only one Router
  // per application. This could potentially break. By then, we hopefully have
  // a `RouterService` inside Engines.
  // https://github.com/ember-engines/ember-engines/issues/587
  return getOwner(owner.lookup('router:main'));
};
