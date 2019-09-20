import { ObserverMethod } from '@ember/object/-private/types';
import {
  addListener as _addListener,
  removeListener as _removeListener
} from '@ember/object/events';

// Unfortunately the upstream types are incorrect. `ObserverMethod` makes no
// sense here.

export const addListener = <Context, Key extends keyof Context>(
  object: Context,
  key: Key,
  method: Context[Key]
) =>
  _addListener(object, key, (method as unknown) as ObserverMethod<
    Context,
    Context
  >);

export const removeListener = <Context, Key extends keyof Context>(
  object: Context,
  key: Key,
  method: Context[Key]
) =>
  _removeListener(object, key, (method as unknown) as ObserverMethod<
    Context,
    Context
  >);
