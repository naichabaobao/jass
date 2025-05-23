/**
 * Used to create Error subclasses until the community moves away from ES5.
 *
 * This is because compiling from TypeScript down to ES5 has issues with subclassing Errors
 * as well as other built-in types: https://github.com/Microsoft/TypeScript/issues/12123
 *
 * @param createImpl A factory function to create the actual constructor implementation. The returned
 * function should be a named function that calls `_super` internally.
 */
export function createErrorClass<T>(createImpl: (_super: any) => any): T {
    const _super = (instance: any) => {
      Error.call(instance);
      instance.stack = new Error().stack;
    };
  
    const ctorFunc = createImpl(_super);
    ctorFunc.prototype = Object.create(Error.prototype);
    ctorFunc.prototype.constructor = ctorFunc;
    return ctorFunc;
  }
export interface ObjectUnsubscribedError extends Error {}

export interface ObjectUnsubscribedErrorCtor {
  /**
   * @deprecated Internal implementation detail. Do not construct error instances.
   * Cannot be tagged as internal: https://github.com/ReactiveX/rxjs/issues/6269
   */
  new (): ObjectUnsubscribedError;
}

/**
 * An error thrown when an action is invalid because the object has been
 * unsubscribed.
 *
 * @see {@link Subject}
 * @see {@link BehaviorSubject}
 *
 * @class ObjectUnsubscribedError
 */
export const ObjectUnsubscribedError: ObjectUnsubscribedErrorCtor = createErrorClass(
  (_super) =>
    function ObjectUnsubscribedErrorImpl(this: any) {
      _super(this);
      this.name = 'ObjectUnsubscribedError';
      this.message = 'object unsubscribed';
    }
);

/***
 * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
 */
export interface Operator<T, R> {
    call(subscriber: Subscriber<R>, source: any): TeardownLogic;
  }
  

/**
 * Handles an error on another job either with the user-configured {@link onUnhandledError},
 * or by throwing it on that new job so it can be picked up by `window.onerror`, `process.on('error')`, etc.
 *
 * This should be called whenever there is an error that is out-of-band with the subscription
 * or when an error hits a terminal boundary of the subscription and no error handler was provided.
 *
 * @param err the error to report
 */
export function reportUnhandledError(err: any) {
    timeoutProvider.setTimeout(() => {
      const { onUnhandledError } = config;
      if (onUnhandledError) {
        // Execute the user-configured error handler.
        onUnhandledError(err);
      } else {
        // Throw so it is picked up by the runtime's uncaught error mechanism.
        throw err;
      }
    });
  }

/* tslint:disable:no-empty */
export function noop() { }

/**
 * A completion object optimized for memory use and created to be the
 * same "shape" as other notifications in v8.
 * @internal
 */
export const COMPLETE_NOTIFICATION = (() => createNotification('C', undefined, undefined) as CompleteNotification)();

/**
 * Internal use only. Creates an optimized error notification that is the same "shape"
 * as other notifications.
 * @internal
 */
export function errorNotification(error: any): ErrorNotification {
  return createNotification('E', undefined, error) as any;
}

/**
 * Internal use only. Creates an optimized next notification that is the same "shape"
 * as other notifications.
 * @internal
 */
export function nextNotification<T>(value: T) {
  return createNotification('N', value, undefined) as NextNotification<T>;
}

/**
 * Ensures that all notifications created internally have the same "shape" in v8.
 *
 * TODO: This is only exported to support a crazy legacy test in `groupBy`.
 * @internal
 */
export function createNotification(kind: 'N' | 'E' | 'C', value: any, error: any) {
  return {
    kind,
    value,
    error,
  };
}

export type TimerHandle = number | ReturnType<typeof setTimeout>;

type SetTimeoutFunction = (handler: () => void, timeout?: number, ...args: any[]) => TimerHandle;
type ClearTimeoutFunction = (handle: TimerHandle) => void;

interface TimeoutProvider {
  setTimeout: SetTimeoutFunction;
  clearTimeout: ClearTimeoutFunction;
  delegate:
    | {
        setTimeout: SetTimeoutFunction;
        clearTimeout: ClearTimeoutFunction;
      }
    | undefined;
}

export const timeoutProvider: TimeoutProvider = {
  // When accessing the delegate, use the variable rather than `this` so that
  // the functions can be called without being bound to the provider.
  setTimeout(handler: () => void, timeout?: number, ...args) {
    const { delegate } = timeoutProvider;
    if (delegate?.setTimeout) {
      return delegate.setTimeout(handler, timeout, ...args);
    }
    return setTimeout(handler, timeout, ...args);
  },
  clearTimeout(handle) {
    const { delegate } = timeoutProvider;
    return (delegate?.clearTimeout || clearTimeout)(handle as any);
  },
  delegate: undefined,
};

/**
 * Represents a disposable resource, such as the execution of an Observable. A
 * Subscription has one important method, `unsubscribe`, that takes no argument
 * and just disposes the resource held by the subscription.
 *
 * Additionally, subscriptions may be grouped together through the `add()`
 * method, which will attach a child Subscription to the current Subscription.
 * When a Subscription is unsubscribed, all its children (and its grandchildren)
 * will be unsubscribed as well.
 */
export class Subscription implements SubscriptionLike {
    public static EMPTY = (() => {
      const empty = new Subscription();
      empty.closed = true;
      return empty;
    })();
  
    /**
     * A flag to indicate whether this Subscription has already been unsubscribed.
     */
    public closed = false;
  
    private _parentage: Subscription[] | Subscription | null = null;
  
    /**
     * The list of registered finalizers to execute upon unsubscription. Adding and removing from this
     * list occurs in the {@link #add} and {@link #remove} methods.
     */
    private _finalizers: Exclude<TeardownLogic, void>[] | null = null;
  
    /**
     * @param initialTeardown A function executed first as part of the finalization
     * process that is kicked off when {@link #unsubscribe} is called.
     */
    constructor(private initialTeardown?: () => void) {}
  
    /**
     * Disposes the resources held by the subscription. May, for instance, cancel
     * an ongoing Observable execution or cancel any other type of work that
     * started when the Subscription was created.
     */
    unsubscribe(): void {
      let errors: any[] | undefined;
  
      if (!this.closed) {
        this.closed = true;
  
        // Remove this from it's parents.
        const { _parentage } = this;
        if (_parentage) {
          this._parentage = null;
          if (Array.isArray(_parentage)) {
            for (const parent of _parentage) {
              parent.remove(this);
            }
          } else {
            _parentage.remove(this);
          }
        }
  
        const { initialTeardown: initialFinalizer } = this;
        if (isFunction(initialFinalizer)) {
          try {
            initialFinalizer();
          } catch (e) {
            errors = e instanceof UnsubscriptionError ? e.errors : [e];
          }
        }
  
        const { _finalizers } = this;
        if (_finalizers) {
          this._finalizers = null;
          for (const finalizer of _finalizers) {
            try {
              execFinalizer(finalizer);
            } catch (err) {
              errors = errors ?? [];
              if (err instanceof UnsubscriptionError) {
                errors = [...errors, ...err.errors];
              } else {
                errors.push(err);
              }
            }
          }
        }
  
        if (errors) {
          throw new UnsubscriptionError(errors);
        }
      }
    }
  
    /**
     * Adds a finalizer to this subscription, so that finalization will be unsubscribed/called
     * when this subscription is unsubscribed. If this subscription is already {@link #closed},
     * because it has already been unsubscribed, then whatever finalizer is passed to it
     * will automatically be executed (unless the finalizer itself is also a closed subscription).
     *
     * Closed Subscriptions cannot be added as finalizers to any subscription. Adding a closed
     * subscription to a any subscription will result in no operation. (A noop).
     *
     * Adding a subscription to itself, or adding `null` or `undefined` will not perform any
     * operation at all. (A noop).
     *
     * `Subscription` instances that are added to this instance will automatically remove themselves
     * if they are unsubscribed. Functions and {@link Unsubscribable} objects that you wish to remove
     * will need to be removed manually with {@link #remove}
     *
     * @param teardown The finalization logic to add to this subscription.
     */
    add(teardown: TeardownLogic): void {
      // Only add the finalizer if it's not undefined
      // and don't add a subscription to itself.
      if (teardown && teardown !== this) {
        if (this.closed) {
          // If this subscription is already closed,
          // execute whatever finalizer is handed to it automatically.
          execFinalizer(teardown);
        } else {
          if (teardown instanceof Subscription) {
            // We don't add closed subscriptions, and we don't add the same subscription
            // twice. Subscription unsubscribe is idempotent.
            if (teardown.closed || teardown._hasParent(this)) {
              return;
            }
            teardown._addParent(this);
          }
          (this._finalizers = this._finalizers ?? []).push(teardown);
        }
      }
    }
  
    /**
     * Checks to see if a this subscription already has a particular parent.
     * This will signal that this subscription has already been added to the parent in question.
     * @param parent the parent to check for
     */
    private _hasParent(parent: Subscription) {
      const { _parentage } = this;
      return _parentage === parent || (Array.isArray(_parentage) && _parentage.includes(parent));
    }
  
    /**
     * Adds a parent to this subscription so it can be removed from the parent if it
     * unsubscribes on it's own.
     *
     * NOTE: THIS ASSUMES THAT {@link _hasParent} HAS ALREADY BEEN CHECKED.
     * @param parent The parent subscription to add
     */
    private _addParent(parent: Subscription) {
      const { _parentage } = this;
      this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
    }
  
    /**
     * Called on a child when it is removed via {@link #remove}.
     * @param parent The parent to remove
     */
    private _removeParent(parent: Subscription) {
      const { _parentage } = this;
      if (_parentage === parent) {
        this._parentage = null;
      } else if (Array.isArray(_parentage)) {
        arrRemove(_parentage, parent);
      }
    }
  
    /**
     * Removes a finalizer from this subscription that was previously added with the {@link #add} method.
     *
     * Note that `Subscription` instances, when unsubscribed, will automatically remove themselves
     * from every other `Subscription` they have been added to. This means that using the `remove` method
     * is not a common thing and should be used thoughtfully.
     *
     * If you add the same finalizer instance of a function or an unsubscribable object to a `Subscription` instance
     * more than once, you will need to call `remove` the same number of times to remove all instances.
     *
     * All finalizer instances are removed to free up memory upon unsubscription.
     *
     * @param teardown The finalizer to remove from this subscription
     */
    remove(teardown: Exclude<TeardownLogic, void>): void {
      const { _finalizers } = this;
      _finalizers && arrRemove(_finalizers, teardown);
  
      if (teardown instanceof Subscription) {
        teardown._removeParent(this);
      }
    }
  }

/**
 * Implements the {@link Observer} interface and extends the
 * {@link Subscription} class. While the {@link Observer} is the public API for
 * consuming the values of an {@link Observable}, all Observers get converted to
 * a Subscriber, in order to provide Subscription-like capabilities such as
 * `unsubscribe`. Subscriber is a common type in RxJS, and crucial for
 * implementing operators, but it is rarely used as a public API.
 */
export class Subscriber<T> extends Subscription implements Observer<T> {
    /**
     * A static factory for a Subscriber, given a (potentially partial) definition
     * of an Observer.
     * @param next The `next` callback of an Observer.
     * @param error The `error` callback of an
     * Observer.
     * @param complete The `complete` callback of an
     * Observer.
     * @return A Subscriber wrapping the (partially defined)
     * Observer represented by the given arguments.
     * @deprecated Do not use. Will be removed in v8. There is no replacement for this
     * method, and there is no reason to be creating instances of `Subscriber` directly.
     * If you have a specific use case, please file an issue.
     */
    static create<T>(next?: (x?: T) => void, error?: (e?: any) => void, complete?: () => void): Subscriber<T> {
      return new SafeSubscriber(next, error, complete);
    }
  
    /** @deprecated Internal implementation detail, do not use directly. Will be made internal in v8. */
    protected isStopped: boolean = false;
    /** @deprecated Internal implementation detail, do not use directly. Will be made internal in v8. */
    protected destination: Subscriber<any> | Observer<any>; // this `any` is the escape hatch to erase extra type param (e.g. R)
  
    /**
     * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
     * There is no reason to directly create an instance of Subscriber. This type is exported for typings reasons.
     */
    constructor(destination?: Subscriber<any> | Observer<any>) {
      super();
      if (destination) {
        this.destination = destination;
        // Automatically chain subscriptions together here.
        // if destination is a Subscription, then it is a Subscriber.
        if (isSubscription(destination)) {
          destination.add(this);
        }
      } else {
        this.destination = EMPTY_OBSERVER;
      }
    }
  
    /**
     * The {@link Observer} callback to receive notifications of type `next` from
     * the Observable, with a value. The Observable may call this method 0 or more
     * times.
     * @param value The `next` value.
     */
    next(value: T): void {
      if (this.isStopped) {
        handleStoppedNotification(nextNotification(value), this);
      } else {
        this._next(value!);
      }
    }
  
    /**
     * The {@link Observer} callback to receive notifications of type `error` from
     * the Observable, with an attached `Error`. Notifies the Observer that
     * the Observable has experienced an error condition.
     * @param err The `error` exception.
     */
    error(err?: any): void {
      if (this.isStopped) {
        handleStoppedNotification(errorNotification(err), this);
      } else {
        this.isStopped = true;
        this._error(err);
      }
    }
  
    /**
     * The {@link Observer} callback to receive a valueless notification of type
     * `complete` from the Observable. Notifies the Observer that the Observable
     * has finished sending push-based notifications.
     */
    complete(): void {
      if (this.isStopped) {
        handleStoppedNotification(COMPLETE_NOTIFICATION, this);
      } else {
        this.isStopped = true;
        this._complete();
      }
    }
  
    unsubscribe(): void {
      if (!this.closed) {
        this.isStopped = true;
        super.unsubscribe();
        this.destination = null!;
      }
    }
  
    protected _next(value: T): void {
      this.destination.next(value);
    }
  
    protected _error(err: any): void {
      try {
        this.destination.error(err);
      } finally {
        this.unsubscribe();
      }
    }
  
    protected _complete(): void {
      try {
        this.destination.complete();
      } finally {
        this.unsubscribe();
      }
    }
  }
  
/**
 * Used to determine if an object is an Observable with a lift function.
 */
export function hasLift(source: any): source is { lift: InstanceType<typeof Observable>['lift'] } {
  return isFunction(source?.lift);
}

/**
 * Creates an `OperatorFunction`. Used to define operators throughout the library in a concise way.
 * @param init The logic to connect the liftedSource to the subscriber at the moment of subscription.
 */
export function operate<T, R>(
  init: (liftedSource: Observable<T>, subscriber: Subscriber<R>) => (() => void) | void
): OperatorFunction<T, R> {
  return (source: Observable<T>) => {
    if (hasLift(source)) {
      return source.lift(function (this: Subscriber<R>, liftedSource: Observable<T>) {
        try {
          return init(liftedSource, this);
        } catch (err) {
          this.error(err);
        }
      });
    }
    throw new TypeError('Unable to lift unknown Observable type');
  };
}
/**
 * Creates an instance of an `OperatorSubscriber`.
 * @param destination The downstream subscriber.
 * @param onNext Handles next values, only called if this subscriber is not stopped or closed. Any
 * error that occurs in this function is caught and sent to the `error` method of this subscriber.
 * @param onError Handles errors from the subscription, any errors that occur in this handler are caught
 * and send to the `destination` error handler.
 * @param onComplete Handles completion notification from the subscription. Any errors that occur in
 * this handler are sent to the `destination` error handler.
 * @param onFinalize Additional teardown logic here. This will only be called on teardown if the
 * subscriber itself is not already closed. This is called after all other teardown logic is executed.
 */
export function createOperatorSubscriber<T>(
  destination: Subscriber<any>,
  onNext?: (value: T) => void,
  onComplete?: () => void,
  onError?: (err: any) => void,
  onFinalize?: () => void
): Subscriber<T> {
  return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
}

/**
 * A generic helper for allowing operators to be created with a Subscriber and
 * use closures to capture necessary state from the operator function itself.
 */
export class OperatorSubscriber<T> extends Subscriber<T> {
  /**
   * Creates an instance of an `OperatorSubscriber`.
   * @param destination The downstream subscriber.
   * @param onNext Handles next values, only called if this subscriber is not stopped or closed. Any
   * error that occurs in this function is caught and sent to the `error` method of this subscriber.
   * @param onError Handles errors from the subscription, any errors that occur in this handler are caught
   * and send to the `destination` error handler.
   * @param onComplete Handles completion notification from the subscription. Any errors that occur in
   * this handler are sent to the `destination` error handler.
   * @param onFinalize Additional finalization logic here. This will only be called on finalization if the
   * subscriber itself is not already closed. This is called after all other finalization logic is executed.
   * @param shouldUnsubscribe An optional check to see if an unsubscribe call should truly unsubscribe.
   * NOTE: This currently **ONLY** exists to support the strange behavior of {@link groupBy}, where unsubscription
   * to the resulting observable does not actually disconnect from the source if there are active subscriptions
   * to any grouped observable. (DO NOT EXPOSE OR USE EXTERNALLY!!!)
   */
  constructor(
    destination: Subscriber<any>,
    onNext?: (value: T) => void,
    onComplete?: () => void,
    onError?: (err: any) => void,
    private onFinalize?: () => void,
    private shouldUnsubscribe?: () => boolean
  ) {
    // It's important - for performance reasons - that all of this class's
    // members are initialized and that they are always initialized in the same
    // order. This will ensure that all OperatorSubscriber instances have the
    // same hidden class in V8. This, in turn, will help keep the number of
    // hidden classes involved in property accesses within the base class as
    // low as possible. If the number of hidden classes involved exceeds four,
    // the property accesses will become megamorphic and performance penalties
    // will be incurred - i.e. inline caches won't be used.
    //
    // The reasons for ensuring all instances have the same hidden class are
    // further discussed in this blog post from Benedikt Meurer:
    // https://benediktmeurer.de/2018/03/23/impact-of-polymorphism-on-component-based-frameworks-like-react/
    super(destination);
    this._next = onNext
      ? function (this: OperatorSubscriber<T>, value: T) {
          try {
            onNext(value);
          } catch (err) {
            destination.error(err);
          }
        }
      : super._next;
    this._error = onError
      ? function (this: OperatorSubscriber<T>, err: any) {
          try {
            onError(err);
          } catch (err) {
            // Send any errors that occur down stream.
            destination.error(err);
          } finally {
            // Ensure finalization.
            this.unsubscribe();
          }
        }
      : super._error;
    this._complete = onComplete
      ? function (this: OperatorSubscriber<T>) {
          try {
            onComplete();
          } catch (err) {
            // Send any errors that occur down stream.
            destination.error(err);
          } finally {
            // Ensure finalization.
            this.unsubscribe();
          }
        }
      : super._complete;
  }

  unsubscribe() {
    if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
      const { closed } = this;
      super.unsubscribe();
      // Execute additional teardown if we have any and we didn't already do so.
      !closed && this.onFinalize?.();
    }
  }
}

type SetIntervalFunction = (handler: () => void, timeout?: number, ...args: any[]) => TimerHandle;
type ClearIntervalFunction = (handle: TimerHandle) => void;

interface IntervalProvider {
  setInterval: SetIntervalFunction;
  clearInterval: ClearIntervalFunction;
  delegate:
    | {
        setInterval: SetIntervalFunction;
        clearInterval: ClearIntervalFunction;
      }
    | undefined;
}

export const intervalProvider: IntervalProvider = {
  // When accessing the delegate, use the variable rather than `this` so that
  // the functions can be called without being bound to the provider.
  setInterval(handler: () => void, timeout?: number, ...args) {
    const { delegate } = intervalProvider;
    if (delegate?.setInterval) {
      return delegate.setInterval(handler, timeout, ...args);
    }
    return setInterval(handler, timeout, ...args);
  },
  clearInterval(handle) {
    const { delegate } = intervalProvider;
    return (delegate?.clearInterval || clearInterval)(handle as any);
  },
  delegate: undefined,
};

interface DateTimestampProvider extends TimestampProvider {
  delegate: TimestampProvider | undefined;
}

export const dateTimestampProvider: DateTimestampProvider = {
  now: ():number => {
    // Use the variable rather than `this` so that the function can be called
    // without being bound to the provider.
    return (dateTimestampProvider.delegate || Date).now();
  },
  delegate: undefined,
};

/**
 * An execution context and a data structure to order tasks and schedule their
 * execution. Provides a notion of (potentially virtual) time, through the
 * `now()` getter method.
 *
 * Each unit of work in a Scheduler is called an `Action`.
 *
 * ```ts
 * class Scheduler {
 *   now(): number;
 *   schedule(work, delay?, state?): Subscription;
 * }
 * ```
 *
 * @deprecated Scheduler is an internal implementation detail of RxJS, and
 * should not be used directly. Rather, create your own class and implement
 * {@link SchedulerLike}. Will be made internal in v8.
 */
export class Scheduler implements SchedulerLike {
  constructor(private schedulerActionCtor: typeof Action, public now: () => number = dateTimestampProvider.now) {}

  /**
   * Schedules a function, `work`, for execution. May happen at some point in
   * the future, according to the `delay` parameter, if specified. May be passed
   * some context object, `state`, which will be passed to the `work` function.
   *
   * The given arguments will be processed an stored as an Action object in a
   * queue of actions.
   *
   * @param work A function representing a task, or some unit of work to be
   * executed by the Scheduler.
   * @param delay Time to wait before executing the work, where the time unit is
   * implicit and defined by the Scheduler itself.
   * @param state Some contextual data that the `work` function uses when called
   * by the Scheduler.
   * @return A subscription in order to be able to unsubscribe the scheduled work.
   */
  public schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay: number = 0, state?: T): Subscription {
    return new this.schedulerActionCtor<T>(this, work).schedule(state, delay);
  }
}


/**
 * A unit of work to be executed in a `scheduler`. An action is typically
 * created from within a {@link SchedulerLike} and an RxJS user does not need to concern
 * themselves about creating and manipulating an Action.
 *
 * ```ts
 * class Action<T> extends Subscription {
 *   new (scheduler: Scheduler, work: (state?: T) => void);
 *   schedule(state?: T, delay: number = 0): Subscription;
 * }
 * ```
 */
export class Action<T> extends Subscription {
  constructor(scheduler: Scheduler, work: (this: SchedulerAction<T>, state?: T) => void) {
    super();
  }
  /**
   * Schedules this action on its parent {@link SchedulerLike} for execution. May be passed
   * some context object, `state`. May happen at some point in the future,
   * according to the `delay` parameter, if specified.
   * @param state Some contextual data that the `work` function uses when called by the
   * Scheduler.
   * @param delay Time to wait before executing the work, where the time unit is implicit
   * and defined by the Scheduler.
   * @return A subscription in order to be able to unsubscribe the scheduled work.
   */
  public schedule(state?: T, delay: number = 0): Subscription {
    return this;
  }
}

export class AsyncAction<T> extends Action<T> {
  public id: TimerHandle | undefined;
  public state?: T;
  // @ts-ignore: Property has no initializer and is not definitely assigned
  public delay: number;
  protected pending: boolean = false;

  constructor(protected scheduler: AsyncScheduler, protected work: (this: SchedulerAction<T>, state?: T) => void) {
    super(scheduler, work);
  }

  public schedule(state?: T, delay: number = 0): Subscription {
    if (this.closed) {
      return this;
    }

    // Always replace the current state with the new state.
    this.state = state;

    const id = this.id;
    const scheduler = this.scheduler;

    //
    // Important implementation note:
    //
    // Actions only execute once by default, unless rescheduled from within the
    // scheduled callback. This allows us to implement single and repeat
    // actions via the same code path, without adding API surface area, as well
    // as mimic traditional recursion but across asynchronous boundaries.
    //
    // However, JS runtimes and timers distinguish between intervals achieved by
    // serial `setTimeout` calls vs. a single `setInterval` call. An interval of
    // serial `setTimeout` calls can be individually delayed, which delays
    // scheduling the next `setTimeout`, and so on. `setInterval` attempts to
    // guarantee the interval callback will be invoked more precisely to the
    // interval period, regardless of load.
    //
    // Therefore, we use `setInterval` to schedule single and repeat actions.
    // If the action reschedules itself with the same delay, the interval is not
    // canceled. If the action doesn't reschedule, or reschedules with a
    // different delay, the interval will be canceled after scheduled callback
    // execution.
    //
    if (id != null) {
      this.id = this.recycleAsyncId(scheduler, id, delay);
    }

    // Set the pending flag indicating that this action has been scheduled, or
    // has recursively rescheduled itself.
    this.pending = true;

    this.delay = delay;
    // If this action has already an async Id, don't request a new one.
    this.id = this.id ?? this.requestAsyncId(scheduler, this.id, delay);

    return this;
  }

  protected requestAsyncId(scheduler: AsyncScheduler, _id?: TimerHandle, delay: number = 0): TimerHandle {
    return intervalProvider.setInterval(scheduler.flush.bind(scheduler, this), delay);
  }

  protected recycleAsyncId(_scheduler: AsyncScheduler, id?: TimerHandle, delay: number | null = 0): TimerHandle | undefined {
    // If this action is rescheduled with the same delay time, don't clear the interval id.
    if (delay != null && this.delay === delay && this.pending === false) {
      return id;
    }
    // Otherwise, if the action's delay time is different from the current delay,
    // or the action has been rescheduled before it's executed, clear the interval id
    if (id != null) {
      intervalProvider.clearInterval(id);
    }

    return undefined;
  }

  /**
   * Immediately executes this action and the `work` it contains.
   */
  public execute(state: T, delay: number): any {
    if (this.closed) {
      return new Error('executing a cancelled action');
    }

    this.pending = false;
    const error = this._execute(state, delay);
    if (error) {
      return error;
    } else if (this.pending === false && this.id != null) {
      // Dequeue if the action didn't reschedule itself. Don't call
      // unsubscribe(), because the action could reschedule later.
      // For example:
      // ```
      // scheduler.schedule(function doWork(counter) {
      //   /* ... I'm a busy worker bee ... */
      //   var originalAction = this;
      //   /* wait 100ms before rescheduling the action */
      //   setTimeout(function () {
      //     originalAction.schedule(counter + 1);
      //   }, 100);
      // }, 1000);
      // ```
      this.id = this.recycleAsyncId(this.scheduler, this.id, null);
    }
  }

  protected _execute(state: T, _delay: number): any {
    let errored: boolean = false;
    let errorValue: any;
    try {
      this.work(state);
    } catch (e) {
      errored = true;
      // HACK: Since code elsewhere is relying on the "truthiness" of the
      // return here, we can't have it return "" or 0 or false.
      // TODO: Clean this up when we refactor schedulers mid-version-8 or so.
      errorValue = e ? e : new Error('Scheduled action threw falsy error');
    }
    if (errored) {
      this.unsubscribe();
      return errorValue;
    }
  }

  unsubscribe() {
    if (!this.closed) {
      const { id, scheduler } = this;
      const { actions } = scheduler;

      this.work = this.state = this.scheduler = null!;
      this.pending = false;

      arrRemove(actions, this);
      if (id != null) {
        this.id = this.recycleAsyncId(scheduler, id, null);
      }

      this.delay = null!;
      super.unsubscribe();
    }
  }
}


export class AsyncScheduler extends Scheduler {
  public actions: Array<AsyncAction<any>> = [];
  /**
   * A flag to indicate whether the Scheduler is currently executing a batch of
   * queued actions.
   * @internal
   */
  public _active: boolean = false;
  /**
   * An internal ID used to track the latest asynchronous task such as those
   * coming from `setTimeout`, `setInterval`, `requestAnimationFrame`, and
   * others.
   * @internal
   */
  public _scheduled: TimerHandle | undefined;

  constructor(SchedulerAction: typeof Action, now: () => number = dateTimestampProvider.now) {
    super(SchedulerAction, now);
  }

  public flush(action: AsyncAction<any>): void {
    const { actions } = this;

    if (this._active) {
      actions.push(action);
      return;
    }

    let error: any;
    this._active = true;

    do {
      if ((error = action.execute(action.state, action.delay))) {
        break;
      }
    } while ((action = actions.shift()!)); // exhaust the scheduler queue

    this._active = false;

    if (error) {
      while ((action = actions.shift()!)) {
        action.unsubscribe();
      }
      throw error;
    }
  }
}


/**
 *
 * Async Scheduler
 *
 * <span class="informal">Schedule task as if you used setTimeout(task, duration)</span>
 *
 * `async` scheduler schedules tasks asynchronously, by putting them on the JavaScript
 * event loop queue. It is best used to delay tasks in time or to schedule tasks repeating
 * in intervals.
 *
 * If you just want to "defer" task, that is to perform it right after currently
 * executing synchronous code ends (commonly achieved by `setTimeout(deferredTask, 0)`),
 * better choice will be the {@link asapScheduler} scheduler.
 *
 * ## Examples
 * Use async scheduler to delay task
 * ```ts
 * import { asyncScheduler } from 'rxjs';
 *
 * const task = () => console.log('it works!');
 *
 * asyncScheduler.schedule(task, 2000);
 *
 * // After 2 seconds logs:
 * // "it works!"
 * ```
 *
 * Use async scheduler to repeat task in intervals
 * ```ts
 * import { asyncScheduler } from 'rxjs';
 *
 * function task(state) {
 *   console.log(state);
 *   this.schedule(state + 1, 1000); // `this` references currently executing Action,
 *                                   // which we reschedule with new state and delay
 * }
 *
 * asyncScheduler.schedule(task, 3000, 0);
 *
 * // Logs:
 * // 0 after 3s
 * // 1 after 4s
 * // 2 after 5s
 * // 3 after 6s
 * ```
 */

export const asyncScheduler = new AsyncScheduler(AsyncAction);

/**
 * @deprecated Renamed to {@link asyncScheduler}. Will be removed in v8.
 */
export const async = asyncScheduler;


/**
 * Emits a notification from the source Observable only after a particular time span
 * has passed without another source emission.
 *
 * <span class="informal">It's like {@link delay}, but passes only the most
 * recent notification from each burst of emissions.</span>
 *
 * ![](debounceTime.png)
 *
 * `debounceTime` delays notifications emitted by the source Observable, but drops
 * previous pending delayed emissions if a new notification arrives on the source
 * Observable. This operator keeps track of the most recent notification from the
 * source Observable, and emits that only when `dueTime` has passed
 * without any other notification appearing on the source Observable. If a new value
 * appears before `dueTime` silence occurs, the previous notification will be dropped
 * and will not be emitted and a new `dueTime` is scheduled.
 * If the completing event happens during `dueTime` the last cached notification
 * is emitted before the completion event is forwarded to the output observable.
 * If the error event happens during `dueTime` or after it only the error event is
 * forwarded to the output observable. The cache notification is not emitted in this case.
 *
 * This is a rate-limiting operator, because it is impossible for more than one
 * notification to be emitted in any time window of duration `dueTime`, but it is also
 * a delay-like operator since output emissions do not occur at the same time as
 * they did on the source Observable. Optionally takes a {@link SchedulerLike} for
 * managing timers.
 *
 * ## Example
 *
 * Emit the most recent click after a burst of clicks
 *
 * ```ts
 * import { fromEvent, debounceTime } from 'rxjs';
 *
 * const clicks = fromEvent(document, 'click');
 * const result = clicks.pipe(debounceTime(1000));
 * result.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link audit}
 * @see {@link auditTime}
 * @see {@link debounce}
 * @see {@link sample}
 * @see {@link sampleTime}
 * @see {@link throttle}
 * @see {@link throttleTime}
 *
 * @param dueTime The timeout duration in milliseconds (or the time unit determined
 * internally by the optional `scheduler`) for the window of time required to wait
 * for emission silence before emitting the most recent source value.
 * @param scheduler The {@link SchedulerLike} to use for managing the timers that
 * handle the timeout for each value.
 * @return A function that returns an Observable that delays the emissions of
 * the source Observable by the specified `dueTime`, and may drop some values
 * if they occur too frequently.
 */
export function debounceTime<T>(dueTime: number, scheduler: SchedulerLike = asyncScheduler): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    let activeTask: Subscription | null = null;
    let lastValue: T | null = null;
    let lastTime: number | null = null;

    const emit = () => {
      if (activeTask) {
        // We have a value! Free up memory first, then emit the value.
        activeTask.unsubscribe();
        activeTask = null;
        const value = lastValue!;
        lastValue = null;
        subscriber.next(value);
      }
    };
    function emitWhenIdle(this: SchedulerAction<unknown>) {
      // This is called `dueTime` after the first value
      // but we might have received new values during this window!

      const targetTime = lastTime! + dueTime;
      const now = scheduler.now();
      if (now < targetTime) {
        // On that case, re-schedule to the new target
        activeTask = this.schedule(undefined, targetTime - now);
        subscriber.add(activeTask);
        return;
      }

      emit();
    }

    source.subscribe(
      createOperatorSubscriber(
        subscriber,
        (value: T) => {
          lastValue = value;
          lastTime = scheduler.now();

          // Only set up a task if it's not already up
          if (!activeTask) {
            activeTask = scheduler.schedule(emitWhenIdle, dueTime);
            subscriber.add(activeTask);
          }
        },
        () => {
          // Source completed.
          // Emit any pending debounced values then complete
          emit();
          subscriber.complete();
        },
        // Pass all errors through to consumer.
        undefined,
        () => {
          // Finalization.
          lastValue = activeTask = null;
        }
      )
    );
  });
}


/** @deprecated Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8. */
export function filter<T, S extends T, A>(predicate: (this: A, value: T, index: number) => value is S, thisArg: A): OperatorFunction<T, S>;
export function filter<T, S extends T>(predicate: (value: T, index: number) => value is S): OperatorFunction<T, S>;
export function filter<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
/** @deprecated Use a closure instead of a `thisArg`. Signatures accepting a `thisArg` will be removed in v8. */
export function filter<T, A>(predicate: (this: A, value: T, index: number) => boolean, thisArg: A): MonoTypeOperatorFunction<T>;
export function filter<T>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T>;

/**
 * Filter items emitted by the source Observable by only emitting those that
 * satisfy a specified predicate.
 *
 * <span class="informal">Like
 * [Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter),
 * it only emits a value from the source if it passes a criterion function.</span>
 *
 * ![](filter.png)
 *
 * Similar to the well-known `Array.prototype.filter` method, this operator
 * takes values from the source Observable, passes them through a `predicate`
 * function and only emits those values that yielded `true`.
 *
 * ## Example
 *
 * Emit only click events whose target was a DIV element
 *
 * ```ts
 * import { fromEvent, filter } from 'rxjs';
 *
 * const div = document.createElement('div');
 * div.style.cssText = 'width: 200px; height: 200px; background: #09c;';
 * document.body.appendChild(div);
 *
 * const clicks = fromEvent(document, 'click');
 * const clicksOnDivs = clicks.pipe(filter(ev => (<HTMLElement>ev.target).tagName === 'DIV'));
 * clicksOnDivs.subscribe(x => console.log(x));
 * ```
 *
 * @see {@link distinct}
 * @see {@link distinctUntilChanged}
 * @see {@link distinctUntilKeyChanged}
 * @see {@link ignoreElements}
 * @see {@link partition}
 * @see {@link skip}
 *
 * @param predicate A function that
 * evaluates each value emitted by the source Observable. If it returns `true`,
 * the value is emitted, if `false` the value is not passed to the output
 * Observable. The `index` parameter is the number `i` for the i-th source
 * emission that has happened since the subscription, starting from the number
 * `0`.
 * @param thisArg An optional argument to determine the value of `this`
 * in the `predicate` function.
 * @return A function that returns an Observable that emits items from the
 * source Observable that satisfy the specified `predicate`.
 */
export function filter<T>(predicate: (value: T, index: number) => boolean, thisArg?: any): MonoTypeOperatorFunction<T> {
  return operate((source, subscriber) => {
    // An index passed to our predicate function on each call.
    let index = 0;

    // Subscribe to the source, all errors and completions are
    // forwarded to the consumer.
    source.subscribe(
      // Call the predicate with the appropriate `this` context,
      // if the predicate returns `true`, then send the value
      // to the consumer.
      createOperatorSubscriber(subscriber, (value) => predicate.call(thisArg, value, index++) && subscriber.next(value))
    );
  });
}

  /**
   * This bind is captured here because we want to be able to have
   * compatibility with monoid libraries that tend to use a method named
   * `bind`. In particular, a library called Monio requires this.
   */
  const _bind = Function.prototype.bind;
  
  function bind<Fn extends (...args: any[]) => any>(fn: Fn, thisArg: any): Fn {
    return _bind.call(fn, thisArg);
  }
  
  /**
   * Internal optimization only, DO NOT EXPOSE.
   * @internal
   */
  class ConsumerObserver<T> implements Observer<T> {
    constructor(private partialObserver: Partial<Observer<T>>) {}
  
    next(value: T): void {
      const { partialObserver } = this;
      if (partialObserver.next) {
        try {
          partialObserver.next(value);
        } catch (error) {
          handleUnhandledError(error);
        }
      }
    }
  
    error(err: any): void {
      const { partialObserver } = this;
      if (partialObserver.error) {
        try {
          partialObserver.error(err);
        } catch (error) {
          handleUnhandledError(error);
        }
      } else {
        handleUnhandledError(err);
      }
    }
  
    complete(): void {
      const { partialObserver } = this;
      if (partialObserver.complete) {
        try {
          partialObserver.complete();
        } catch (error) {
          handleUnhandledError(error);
        }
      }
    }
  }
  
  export class SafeSubscriber<T> extends Subscriber<T> {
    constructor(
      observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
      error?: ((e?: any) => void) | null,
      complete?: (() => void) | null
    ) {
      super();
  
      let partialObserver: Partial<Observer<T>>;
      if (isFunction(observerOrNext) || !observerOrNext) {
        // The first argument is a function, not an observer. The next
        // two arguments *could* be observers, or they could be empty.
        partialObserver = {
          next: (observerOrNext ?? undefined) as ((value: T) => void) | undefined,
          error: error ?? undefined,
          complete: complete ?? undefined,
        };
      } else {
        // The first argument is a partial observer.
        let context: any;
        if (this && config.useDeprecatedNextContext) {
          // This is a deprecated path that made `this.unsubscribe()` available in
          // next handler functions passed to subscribe. This only exists behind a flag
          // now, as it is *very* slow.
          context = Object.create(observerOrNext);
          context.unsubscribe = () => this.unsubscribe();
          partialObserver = {
            next: observerOrNext.next && bind(observerOrNext.next, context),
            error: observerOrNext.error && bind(observerOrNext.error, context),
            complete: observerOrNext.complete && bind(observerOrNext.complete, context),
          };
        } else {
          // The "normal" path. Just use the partial observer directly.
          partialObserver = observerOrNext;
        }
      }
  
      // Wrap the partial observer to ensure it's a full observer, and
      // make sure proper error handling is accounted for.
      this.destination = new ConsumerObserver(partialObserver);
    }
  }
  
  function handleUnhandledError(error: any) {
    if (config.useDeprecatedSynchronousErrorHandling) {
      captureError(error);
    } else {
      // Ideal path, we report this as an unhandled error,
      // which is thrown on a new call stack.
      reportUnhandledError(error);
    }
  }
  
  /**
   * An error handler used when no error handler was supplied
   * to the SafeSubscriber -- meaning no error handler was supplied
   * do the `subscribe` call on our observable.
   * @param err The error to handle
   */
  function defaultErrorHandler(err: any) {
    throw err;
  }
  
  /**
   * A handler for notifications that cannot be sent to a stopped subscriber.
   * @param notification The notification being sent.
   * @param subscriber The stopped subscriber.
   */
  function handleStoppedNotification(notification: ObservableNotification<any>, subscriber: Subscriber<any>) {
    const { onStoppedNotification } = config;
    onStoppedNotification && timeoutProvider.setTimeout(() => onStoppedNotification(notification, subscriber));
  }
  
  /**
   * The observer used as a stub for subscriptions where the user did not
   * pass any arguments to `subscribe`. Comes with the default error handling
   * behavior.
   */
  export const EMPTY_OBSERVER: Readonly<Observer<any>> & { closed: true } = {
    closed: true,
    next: noop,
    error: defaultErrorHandler,
    complete: noop,
  };


  
  export const EMPTY_SUBSCRIPTION = Subscription.EMPTY;
  
  export function isSubscription(value: any): value is Subscription {
    return (
      value instanceof Subscription ||
      (value && 'closed' in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe))
    );
  }
  
  function execFinalizer(finalizer: Unsubscribable | (() => void)) {
    if (isFunction(finalizer)) {
      finalizer();
    } else {
      finalizer.unsubscribe();
    }
  }
  

/**
 * Symbol.observable or a string "@@observable". Used for interop
 *
 * @deprecated We will no longer be exporting this symbol in upcoming versions of RxJS.
 * Instead polyfill and use Symbol.observable directly *or* use https://www.npmjs.com/package/symbol-observable
 */
export const observable: string | symbol = (() => (typeof Symbol === 'function' && Symbol.observable) || '@@observable')();


/**
 * This function takes one parameter and just returns it. Simply put,
 * this is like `<T>(x: T): T => x`.
 *
 * ## Examples
 *
 * This is useful in some cases when using things like `mergeMap`
 *
 * ```ts
 * import { interval, take, map, range, mergeMap, identity } from 'rxjs';
 *
 * const source$ = interval(1000).pipe(take(5));
 *
 * const result$ = source$.pipe(
 *   map(i => range(i)),
 *   mergeMap(identity) // same as mergeMap(x => x)
 * );
 *
 * result$.subscribe({
 *   next: console.log
 * });
 * ```
 *
 * Or when you want to selectively apply an operator
 *
 * ```ts
 * import { interval, take, identity } from 'rxjs';
 *
 * const shouldLimit = () => Math.random() < 0.5;
 *
 * const source$ = interval(1000);
 *
 * const result$ = source$.pipe(shouldLimit() ? take(5) : identity);
 *
 * result$.subscribe({
 *   next: console.log
 * });
 * ```
 *
 * @param x Any value that is returned by this function
 * @returns The value passed as the first parameter to this function
 */
export function identity<T>(x: T): T {
    return x;
  }
  

export function pipe(): typeof identity;
export function pipe<T, A>(fn1: UnaryFunction<T, A>): UnaryFunction<T, A>;
export function pipe<T, A, B>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>): UnaryFunction<T, B>;
export function pipe<T, A, B, C>(fn1: UnaryFunction<T, A>, fn2: UnaryFunction<A, B>, fn3: UnaryFunction<B, C>): UnaryFunction<T, C>;
export function pipe<T, A, B, C, D>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>
): UnaryFunction<T, D>;
export function pipe<T, A, B, C, D, E>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>
): UnaryFunction<T, E>;
export function pipe<T, A, B, C, D, E, F>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>
): UnaryFunction<T, F>;
export function pipe<T, A, B, C, D, E, F, G>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>
): UnaryFunction<T, G>;
export function pipe<T, A, B, C, D, E, F, G, H>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>
): UnaryFunction<T, H>;
export function pipe<T, A, B, C, D, E, F, G, H, I>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>,
  fn9: UnaryFunction<H, I>
): UnaryFunction<T, I>;
export function pipe<T, A, B, C, D, E, F, G, H, I>(
  fn1: UnaryFunction<T, A>,
  fn2: UnaryFunction<A, B>,
  fn3: UnaryFunction<B, C>,
  fn4: UnaryFunction<C, D>,
  fn5: UnaryFunction<D, E>,
  fn6: UnaryFunction<E, F>,
  fn7: UnaryFunction<F, G>,
  fn8: UnaryFunction<G, H>,
  fn9: UnaryFunction<H, I>,
  ...fns: UnaryFunction<any, any>[]
): UnaryFunction<T, unknown>;

/**
 * pipe() can be called on one or more functions, each of which can take one argument ("UnaryFunction")
 * and uses it to return a value.
 * It returns a function that takes one argument, passes it to the first UnaryFunction, and then
 * passes the result to the next one, passes that result to the next one, and so on.  
 */
export function pipe(...fns: Array<UnaryFunction<any, any>>): UnaryFunction<any, any> {
  return pipeFromArray(fns);
}

/** @internal */
export function pipeFromArray<T, R>(fns: Array<UnaryFunction<T, R>>): UnaryFunction<T, R> {
  if (fns.length === 0) {
    return identity as UnaryFunction<any, any>;
  }

  if (fns.length === 1) {
    return fns[0];
  }

  return function piped(input: T): R {
    return fns.reduce((prev: any, fn: UnaryFunction<T, R>) => fn(prev), input as any);
  };
}

/**
 * A representation of any set of values over any amount of time. This is the most basic building block
 * of RxJS.
 */
export class Observable<T> implements Subscribable<T> {
    /**
     * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
     */
    source: Observable<any> | undefined;
  
    /**
     * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
     */
    operator: Operator<any, T> | undefined;
  
    /**
     * @param subscribe The function that is called when the Observable is
     * initially subscribed to. This function is given a Subscriber, to which new values
     * can be `next`ed, or an `error` method can be called to raise an error, or
     * `complete` can be called to notify of a successful completion.
     */
    constructor(subscribe?: (this: Observable<T>, subscriber: Subscriber<T>) => TeardownLogic) {
      if (subscribe) {
        this._subscribe = subscribe;
      }
    }
  
    // HACK: Since TypeScript inherits static properties too, we have to
    // fight against TypeScript here so Subject can have a different static create signature
    /**
     * Creates a new Observable by calling the Observable constructor
     * @param subscribe the subscriber function to be passed to the Observable constructor
     * @return A new observable.
     * @deprecated Use `new Observable()` instead. Will be removed in v8.
     */
    static create: (...args: any[]) => any = <T>(subscribe?: (subscriber: Subscriber<T>) => TeardownLogic) => {
      return new Observable<T>(subscribe);
    };
  
    /**
     * Creates a new Observable, with this Observable instance as the source, and the passed
     * operator defined as the new observable's operator.
     * @param operator the operator defining the operation to take on the observable
     * @return A new observable with the Operator applied.
     * @deprecated Internal implementation detail, do not use directly. Will be made internal in v8.
     * If you have implemented an operator using `lift`, it is recommended that you create an
     * operator by simply returning `new Observable()` directly. See "Creating new operators from
     * scratch" section here: https://rxjs.dev/guide/operators
     */
    lift<R>(operator?: Operator<T, R>): Observable<R> {
      const observable = new Observable<R>();
      observable.source = this;
      observable.operator = operator;
      return observable;
    }
  
    subscribe(observerOrNext?: Partial<Observer<T>> | ((value: T) => void)): Subscription;
    /** @deprecated Instead of passing separate callback arguments, use an observer argument. Signatures taking separate callback arguments will be removed in v8. Details: https://rxjs.dev/deprecations/subscribe-arguments */
    subscribe(next?: ((value: T) => void) | null, error?: ((error: any) => void) | null, complete?: (() => void) | null): Subscription;
    /**
     * Invokes an execution of an Observable and registers Observer handlers for notifications it will emit.
     *
     * <span class="informal">Use it when you have all these Observables, but still nothing is happening.</span>
     *
     * `subscribe` is not a regular operator, but a method that calls Observable's internal `subscribe` function. It
     * might be for example a function that you passed to Observable's constructor, but most of the time it is
     * a library implementation, which defines what will be emitted by an Observable, and when it be will emitted. This means
     * that calling `subscribe` is actually the moment when Observable starts its work, not when it is created, as it is often
     * the thought.
     *
     * Apart from starting the execution of an Observable, this method allows you to listen for values
     * that an Observable emits, as well as for when it completes or errors. You can achieve this in two
     * of the following ways.
     *
     * The first way is creating an object that implements {@link Observer} interface. It should have methods
     * defined by that interface, but note that it should be just a regular JavaScript object, which you can create
     * yourself in any way you want (ES6 class, classic function constructor, object literal etc.). In particular, do
     * not attempt to use any RxJS implementation details to create Observers - you don't need them. Remember also
     * that your object does not have to implement all methods. If you find yourself creating a method that doesn't
     * do anything, you can simply omit it. Note however, if the `error` method is not provided and an error happens,
     * it will be thrown asynchronously. Errors thrown asynchronously cannot be caught using `try`/`catch`. Instead,
     * use the {@link onUnhandledError} configuration option or use a runtime handler (like `window.onerror` or
     * `process.on('error)`) to be notified of unhandled errors. Because of this, it's recommended that you provide
     * an `error` method to avoid missing thrown errors.
     *
     * The second way is to give up on Observer object altogether and simply provide callback functions in place of its methods.
     * This means you can provide three functions as arguments to `subscribe`, where the first function is equivalent
     * of a `next` method, the second of an `error` method and the third of a `complete` method. Just as in case of an Observer,
     * if you do not need to listen for something, you can omit a function by passing `undefined` or `null`,
     * since `subscribe` recognizes these functions by where they were placed in function call. When it comes
     * to the `error` function, as with an Observer, if not provided, errors emitted by an Observable will be thrown asynchronously.
     *
     * You can, however, subscribe with no parameters at all. This may be the case where you're not interested in terminal events
     * and you also handled emissions internally by using operators (e.g. using `tap`).
     *
     * Whichever style of calling `subscribe` you use, in both cases it returns a Subscription object.
     * This object allows you to call `unsubscribe` on it, which in turn will stop the work that an Observable does and will clean
     * up all resources that an Observable used. Note that cancelling a subscription will not call `complete` callback
     * provided to `subscribe` function, which is reserved for a regular completion signal that comes from an Observable.
     *
     * Remember that callbacks provided to `subscribe` are not guaranteed to be called asynchronously.
     * It is an Observable itself that decides when these functions will be called. For example {@link of}
     * by default emits all its values synchronously. Always check documentation for how given Observable
     * will behave when subscribed and if its default behavior can be modified with a `scheduler`.
     *
     * #### Examples
     *
     * Subscribe with an {@link guide/observer Observer}
     *
     * ```ts
     * import { of } from 'rxjs';
     *
     * const sumObserver = {
     *   sum: 0,
     *   next(value) {
     *     console.log('Adding: ' + value);
     *     this.sum = this.sum + value;
     *   },
     *   error() {
     *     // We actually could just remove this method,
     *     // since we do not really care about errors right now.
     *   },
     *   complete() {
     *     console.log('Sum equals: ' + this.sum);
     *   }
     * };
     *
     * of(1, 2, 3) // Synchronously emits 1, 2, 3 and then completes.
     *   .subscribe(sumObserver);
     *
     * // Logs:
     * // 'Adding: 1'
     * // 'Adding: 2'
     * // 'Adding: 3'
     * // 'Sum equals: 6'
     * ```
     *
     * Subscribe with functions ({@link deprecations/subscribe-arguments deprecated})
     *
     * ```ts
     * import { of } from 'rxjs'
     *
     * let sum = 0;
     *
     * of(1, 2, 3).subscribe(
     *   value => {
     *     console.log('Adding: ' + value);
     *     sum = sum + value;
     *   },
     *   undefined,
     *   () => console.log('Sum equals: ' + sum)
     * );
     *
     * // Logs:
     * // 'Adding: 1'
     * // 'Adding: 2'
     * // 'Adding: 3'
     * // 'Sum equals: 6'
     * ```
     *
     * Cancel a subscription
     *
     * ```ts
     * import { interval } from 'rxjs';
     *
     * const subscription = interval(1000).subscribe({
     *   next(num) {
     *     console.log(num)
     *   },
     *   complete() {
     *     // Will not be called, even when cancelling subscription.
     *     console.log('completed!');
     *   }
     * });
     *
     * setTimeout(() => {
     *   subscription.unsubscribe();
     *   console.log('unsubscribed!');
     * }, 2500);
     *
     * // Logs:
     * // 0 after 1s
     * // 1 after 2s
     * // 'unsubscribed!' after 2.5s
     * ```
     *
     * @param observerOrNext Either an {@link Observer} with some or all callback methods,
     * or the `next` handler that is called for each value emitted from the subscribed Observable.
     * @param error A handler for a terminal event resulting from an error. If no error handler is provided,
     * the error will be thrown asynchronously as unhandled.
     * @param complete A handler for a terminal event resulting from successful completion.
     * @return A subscription reference to the registered handlers.
     */
    subscribe(
      observerOrNext?: Partial<Observer<T>> | ((value: T) => void) | null,
      error?: ((error: any) => void) | null,
      complete?: (() => void) | null
    ): Subscription {
      const subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
  
      errorContext(() => {
        const { operator, source } = this;
        subscriber.add(
          operator
            ? // We're dealing with a subscription in the
              // operator chain to one of our lifted operators.
              operator.call(subscriber, source)
            : source
            ? // If `source` has a value, but `operator` does not, something that
              // had intimate knowledge of our API, like our `Subject`, must have
              // set it. We're going to just call `_subscribe` directly.
              this._subscribe(subscriber)
            : // In all other cases, we're likely wrapping a user-provided initializer
              // function, so we need to catch errors and handle them appropriately.
              this._trySubscribe(subscriber)
        );
      });
  
      return subscriber;
    }
  
    /** @internal */
    protected _trySubscribe(sink: Subscriber<T>): TeardownLogic {
      try {
        return this._subscribe(sink);
      } catch (err) {
        // We don't need to return anything in this case,
        // because it's just going to try to `add()` to a subscription
        // above.
        sink.error(err);
      }
    }
  
    /**
     * Used as a NON-CANCELLABLE means of subscribing to an observable, for use with
     * APIs that expect promises, like `async/await`. You cannot unsubscribe from this.
     *
     * **WARNING**: Only use this with observables you *know* will complete. If the source
     * observable does not complete, you will end up with a promise that is hung up, and
     * potentially all of the state of an async function hanging out in memory. To avoid
     * this situation, look into adding something like {@link timeout}, {@link take},
     * {@link takeWhile}, or {@link takeUntil} amongst others.
     *
     * #### Example
     *
     * ```ts
     * import { interval, take } from 'rxjs';
     *
     * const source$ = interval(1000).pipe(take(4));
     *
     * async function getTotal() {
     *   let total = 0;
     *
     *   await source$.forEach(value => {
     *     total += value;
     *     console.log('observable -> ' + value);
     *   });
     *
     *   return total;
     * }
     *
     * getTotal().then(
     *   total => console.log('Total: ' + total)
     * );
     *
     * // Expected:
     * // 'observable -> 0'
     * // 'observable -> 1'
     * // 'observable -> 2'
     * // 'observable -> 3'
     * // 'Total: 6'
     * ```
     *
     * @param next A handler for each value emitted by the observable.
     * @return A promise that either resolves on observable completion or
     * rejects with the handled error.
     */
    forEach(next: (value: T) => void): Promise<void>;
  
    /**
     * @param next a handler for each value emitted by the observable
     * @param promiseCtor a constructor function used to instantiate the Promise
     * @return a promise that either resolves on observable completion or
     *  rejects with the handled error
     * @deprecated Passing a Promise constructor will no longer be available
     * in upcoming versions of RxJS. This is because it adds weight to the library, for very
     * little benefit. If you need this functionality, it is recommended that you either
     * polyfill Promise, or you create an adapter to convert the returned native promise
     * to whatever promise implementation you wanted. Will be removed in v8.
     */
    forEach(next: (value: T) => void, promiseCtor: PromiseConstructorLike): Promise<void>;
  
    forEach(next: (value: T) => void, promiseCtor?: PromiseConstructorLike): Promise<void> {
      promiseCtor = getPromiseCtor(promiseCtor);
  
      return new promiseCtor<void>((resolve, reject) => {
        const subscriber = new SafeSubscriber<T>({
          next: (value) => {
            try {
              next(value);
            } catch (err) {
              reject(err);
              subscriber.unsubscribe();
            }
          },
          error: reject,
          complete: resolve,
        });
        this.subscribe(subscriber);
      }) as Promise<void>;
    }
  
    /** @internal */
    protected _subscribe(subscriber: Subscriber<any>): TeardownLogic {
      return this.source?.subscribe(subscriber);
    }
  
    /**
     * An interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
     * @return This instance of the observable.
     */
    // [Symbol_observable]() {
    //   return this;
    // }
  
    /* tslint:disable:max-line-length */
    pipe(): Observable<T>;
    pipe<A>(op1: OperatorFunction<T, A>): Observable<A>;
    pipe<A, B>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>): Observable<B>;
    pipe<A, B, C>(op1: OperatorFunction<T, A>, op2: OperatorFunction<A, B>, op3: OperatorFunction<B, C>): Observable<C>;
    pipe<A, B, C, D>(
      op1: OperatorFunction<T, A>,
      op2: OperatorFunction<A, B>,
      op3: OperatorFunction<B, C>,
      op4: OperatorFunction<C, D>
    ): Observable<D>;
    pipe<A, B, C, D, E>(
      op1: OperatorFunction<T, A>,
      op2: OperatorFunction<A, B>,
      op3: OperatorFunction<B, C>,
      op4: OperatorFunction<C, D>,
      op5: OperatorFunction<D, E>
    ): Observable<E>;
    pipe<A, B, C, D, E, F>(
      op1: OperatorFunction<T, A>,
      op2: OperatorFunction<A, B>,
      op3: OperatorFunction<B, C>,
      op4: OperatorFunction<C, D>,
      op5: OperatorFunction<D, E>,
      op6: OperatorFunction<E, F>
    ): Observable<F>;
    pipe<A, B, C, D, E, F, G>(
      op1: OperatorFunction<T, A>,
      op2: OperatorFunction<A, B>,
      op3: OperatorFunction<B, C>,
      op4: OperatorFunction<C, D>,
      op5: OperatorFunction<D, E>,
      op6: OperatorFunction<E, F>,
      op7: OperatorFunction<F, G>
    ): Observable<G>;
    pipe<A, B, C, D, E, F, G, H>(
      op1: OperatorFunction<T, A>,
      op2: OperatorFunction<A, B>,
      op3: OperatorFunction<B, C>,
      op4: OperatorFunction<C, D>,
      op5: OperatorFunction<D, E>,
      op6: OperatorFunction<E, F>,
      op7: OperatorFunction<F, G>,
      op8: OperatorFunction<G, H>
    ): Observable<H>;
    pipe<A, B, C, D, E, F, G, H, I>(
      op1: OperatorFunction<T, A>,
      op2: OperatorFunction<A, B>,
      op3: OperatorFunction<B, C>,
      op4: OperatorFunction<C, D>,
      op5: OperatorFunction<D, E>,
      op6: OperatorFunction<E, F>,
      op7: OperatorFunction<F, G>,
      op8: OperatorFunction<G, H>,
      op9: OperatorFunction<H, I>
    ): Observable<I>;
    pipe<A, B, C, D, E, F, G, H, I>(
      op1: OperatorFunction<T, A>,
      op2: OperatorFunction<A, B>,
      op3: OperatorFunction<B, C>,
      op4: OperatorFunction<C, D>,
      op5: OperatorFunction<D, E>,
      op6: OperatorFunction<E, F>,
      op7: OperatorFunction<F, G>,
      op8: OperatorFunction<G, H>,
      op9: OperatorFunction<H, I>,
      ...operations: OperatorFunction<any, any>[]
    ): Observable<unknown>;
    /* tslint:enable:max-line-length */
  
    /**
     * Used to stitch together functional operators into a chain.
     *
     * ## Example
     *
     * ```ts
     * import { interval, filter, map, scan } from 'rxjs';
     *
     * interval(1000)
     *   .pipe(
     *     filter(x => x % 2 === 0),
     *     map(x => x + x),
     *     scan((acc, x) => acc + x)
     *   )
     *   .subscribe(x => console.log(x));
     * ```
     *
     * @return The Observable result of all the operators having been called
     * in the order they were passed in.
     */
    pipe(...operations: OperatorFunction<any, any>[]): Observable<any> {
      return pipeFromArray(operations)(this);
    }
  
    /* tslint:disable:max-line-length */
    /** @deprecated Replaced with {@link firstValueFrom} and {@link lastValueFrom}. Will be removed in v8. Details: https://rxjs.dev/deprecations/to-promise */
    toPromise(): Promise<T | undefined>;
    /** @deprecated Replaced with {@link firstValueFrom} and {@link lastValueFrom}. Will be removed in v8. Details: https://rxjs.dev/deprecations/to-promise */
    toPromise(PromiseCtor: typeof Promise): Promise<T | undefined>;
    /** @deprecated Replaced with {@link firstValueFrom} and {@link lastValueFrom}. Will be removed in v8. Details: https://rxjs.dev/deprecations/to-promise */
    toPromise(PromiseCtor: PromiseConstructorLike): Promise<T | undefined>;
    /* tslint:enable:max-line-length */
  
    /**
     * Subscribe to this Observable and get a Promise resolving on
     * `complete` with the last emission (if any).
     *
     * **WARNING**: Only use this with observables you *know* will complete. If the source
     * observable does not complete, you will end up with a promise that is hung up, and
     * potentially all of the state of an async function hanging out in memory. To avoid
     * this situation, look into adding something like {@link timeout}, {@link take},
     * {@link takeWhile}, or {@link takeUntil} amongst others.
     *
     * @param [promiseCtor] a constructor function used to instantiate
     * the Promise
     * @return A Promise that resolves with the last value emit, or
     * rejects on an error. If there were no emissions, Promise
     * resolves with undefined.
     * @deprecated Replaced with {@link firstValueFrom} and {@link lastValueFrom}. Will be removed in v8. Details: https://rxjs.dev/deprecations/to-promise
     */
    toPromise(promiseCtor?: PromiseConstructorLike): Promise<T | undefined> {
      promiseCtor = getPromiseCtor(promiseCtor);
  
      return new promiseCtor((resolve, reject) => {
        let value: T | undefined;
        this.subscribe(
          (x: T) => (value = x),
          (err: any) => reject(err),
          () => resolve(value)
        );
      }) as Promise<T | undefined>;
    }
  }
  
  /**
   * Decides between a passed promise constructor from consuming code,
   * A default configured promise constructor, and the native promise
   * constructor and returns it. If nothing can be found, it will throw
   * an error.
   * @param promiseCtor The optional promise constructor to passed by consuming code
   */
  function getPromiseCtor(promiseCtor: PromiseConstructorLike | undefined) {
    return promiseCtor ?? config.Promise ?? Promise;
  }
  
  function isObserver<T>(value: any): value is Observer<T> {
    return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
  }
  
  function isSubscriber<T>(value: any): value is Subscriber<T> {
    return (value && value instanceof Subscriber) || (isObserver(value) && isSubscription(value));
  }
  
/**
 * Returns true if the object is a function.
 * @param value The value to check
 */
export function isFunction(value: any): value is (...args: any[]) => any {
    return typeof value === 'function';
  }
  

export interface UnsubscriptionError extends Error {
    readonly errors: any[];
  }
  
  export interface UnsubscriptionErrorCtor {
    /**
     * @deprecated Internal implementation detail. Do not construct error instances.
     * Cannot be tagged as internal: https://github.com/ReactiveX/rxjs/issues/6269
     */
    new (errors: any[]): UnsubscriptionError;
  }
  
  /**
   * An error thrown when one or more errors have occurred during the
   * `unsubscribe` of a {@link Subscription}.
   */
  export const UnsubscriptionError: UnsubscriptionErrorCtor = createErrorClass(
    (_super) =>
      function UnsubscriptionErrorImpl(this: any, errors: (Error | string)[]) {
        _super(this);
        this.message = errors
          ? `${errors.length} errors occurred during unsubscription:
  ${errors.map((err, i) => `${i + 1}) ${err.toString()}`).join('\n  ')}`
          : '';
        this.name = 'UnsubscriptionError';
        this.errors = errors;
      }
  );
  
/**
 * Removes an item from an array, mutating it.
 * @param arr The array to remove the item from
 * @param item The item to remove
 */
export function arrRemove<T>(arr: T[] | undefined | null, item: T) {
    if (arr) {
      const index = arr.indexOf(item);
      0 <= index && arr.splice(index, 1);
    }
  }
  

  
/**
 * Note: This will add Symbol.observable globally for all TypeScript users,
 * however, we are no longer polyfilling Symbol.observable
 */
declare global {
    interface SymbolConstructor {
      readonly observable: symbol;
    }
  }
  
  /* OPERATOR INTERFACES */
  
  /**
   * A function type interface that describes a function that accepts one parameter `T`
   * and returns another parameter `R`.
   *
   * Usually used to describe {@link OperatorFunction} - it always takes a single
   * parameter (the source Observable) and returns another Observable.
   */
  export interface UnaryFunction<T, R> {
    (source: T): R;
  }
  
  export interface OperatorFunction<T, R> extends UnaryFunction<Observable<T>, Observable<R>> {}
  
  export type FactoryOrValue<T> = T | (() => T);
  
  /**
   * A function type interface that describes a function that accepts and returns a parameter of the same type.
   *
   * Used to describe {@link OperatorFunction} with the only one type: `OperatorFunction<T, T>`.
   *
   */
  export interface MonoTypeOperatorFunction<T> extends OperatorFunction<T, T> {}
  
  /**
   * A value and the time at which it was emitted.
   *
   * Emitted by the `timestamp` operator
   *
   * @see {@link timestamp}
   */
  export interface Timestamp<T> {
    value: T;
    /**
     * The timestamp. By default, this is in epoch milliseconds.
     * Could vary based on the timestamp provider passed to the operator.
     */
    timestamp: number;
  }
  
  /**
   * A value emitted and the amount of time since the last value was emitted.
   *
   * Emitted by the `timeInterval` operator.
   *
   * @see {@link timeInterval}
   */
  export interface TimeInterval<T> {
    value: T;
  
    /**
     * The amount of time between this value's emission and the previous value's emission.
     * If this is the first emitted value, then it will be the amount of time since subscription
     * started.
     */
    interval: number;
  }
  
  /* SUBSCRIPTION INTERFACES */
  
  export interface Unsubscribable {
    unsubscribe(): void;
  }
  
  export type TeardownLogic = Subscription | Unsubscribable | (() => void) | void;
  
  export interface SubscriptionLike extends Unsubscribable {
    unsubscribe(): void;
    readonly closed: boolean;
  }
  
  /**
   * @deprecated Do not use. Most likely you want to use `ObservableInput`. Will be removed in v8.
   */
  export type SubscribableOrPromise<T> = Subscribable<T> | Subscribable<never> | PromiseLike<T> | InteropObservable<T>;
  
  /** OBSERVABLE INTERFACES */
  
  export interface Subscribable<T> {
    subscribe(observer: Partial<Observer<T>>): Unsubscribable;
  }
  
  /**
   * Valid types that can be converted to observables.
   */
  export type ObservableInput<T> =
    | Observable<T>
    | InteropObservable<T>
    | AsyncIterable<T>
    | PromiseLike<T>
    | ArrayLike<T>
    | Iterable<T>
    | ReadableStreamLike<T>;
  
  /**
   * @deprecated Renamed to {@link InteropObservable }. Will be removed in v8.
   */
  export type ObservableLike<T> = InteropObservable<T>;
  
  /**
   * An object that implements the `Symbol.observable` interface.
   */
  export interface InteropObservable<T> {
    [Symbol.observable]: () => Subscribable<T>;
  }
  
  /* NOTIFICATIONS */
  
  /**
   * A notification representing a "next" from an observable.
   * Can be used with {@link dematerialize}.
   */
  export interface NextNotification<T> {
    /** The kind of notification. Always "N" */
    kind: 'N';
    /** The value of the notification. */
    value: T;
  }
  
  /**
   * A notification representing an "error" from an observable.
   * Can be used with {@link dematerialize}.
   */
  export interface ErrorNotification {
    /** The kind of notification. Always "E" */
    kind: 'E';
    error: any;
  }
  
  /**
   * A notification representing a "completion" from an observable.
   * Can be used with {@link dematerialize}.
   */
  export interface CompleteNotification {
    kind: 'C';
  }
  
  /**
   * Valid observable notification types.
   */
  export type ObservableNotification<T> = NextNotification<T> | ErrorNotification | CompleteNotification;
  
  /* OBSERVER INTERFACES */
  
  export interface NextObserver<T> {
    closed?: boolean;
    next: (value: T) => void;
    error?: (err: any) => void;
    complete?: () => void;
  }
  
  export interface ErrorObserver<T> {
    closed?: boolean;
    next?: (value: T) => void;
    error: (err: any) => void;
    complete?: () => void;
  }
  
  export interface CompletionObserver<T> {
    closed?: boolean;
    next?: (value: T) => void;
    error?: (err: any) => void;
    complete: () => void;
  }
  
  export type PartialObserver<T> = NextObserver<T> | ErrorObserver<T> | CompletionObserver<T>;
  
  /**
   * An object interface that defines a set of callback functions a user can use to get
   * notified of any set of {@link Observable}
   * {@link guide/glossary-and-semantics#notification notification} events.
   *
   * For more info, please refer to {@link guide/observer this guide}.
   */
  export interface Observer<T> {
    /**
     * A callback function that gets called by the producer during the subscription when
     * the producer "has" the `value`. It won't be called if `error` or `complete` callback
     * functions have been called, nor after the consumer has unsubscribed.
     *
     * For more info, please refer to {@link guide/glossary-and-semantics#next this guide}.
     */
    next: (value: T) => void;
    /**
     * A callback function that gets called by the producer if and when it encountered a
     * problem of any kind. The errored value will be provided through the `err` parameter.
     * This callback can't be called more than one time, it can't be called if the
     * `complete` callback function have been called previously, nor it can't be called if
     * the consumer has unsubscribed.
     *
     * For more info, please refer to {@link guide/glossary-and-semantics#error this guide}.
     */
    error: (err: any) => void;
    /**
     * A callback function that gets called by the producer if and when it has no more
     * values to provide (by calling `next` callback function). This means that no error
     * has happened. This callback can't be called more than one time, it can't be called
     * if the `error` callback function have been called previously, nor it can't be called
     * if the consumer has unsubscribed.
     *
     * For more info, please refer to {@link guide/glossary-and-semantics#complete this guide}.
     */
    complete: () => void;
  }
  
  export interface SubjectLike<T> extends Observer<T>, Subscribable<T> {}
  
  /* SCHEDULER INTERFACES */
  
  export interface SchedulerLike extends TimestampProvider {
    schedule<T>(work: (this: SchedulerAction<T>, state: T) => void, delay: number, state: T): Subscription;
    schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay: number, state?: T): Subscription;
    schedule<T>(work: (this: SchedulerAction<T>, state?: T) => void, delay?: number, state?: T): Subscription;
  }
  
  export interface SchedulerAction<T> extends Subscription {
    schedule(state?: T, delay?: number): Subscription;
  }
  
  /**
   * This is a type that provides a method to allow RxJS to create a numeric timestamp
   */
  export interface TimestampProvider {
    /**
     * Returns a timestamp as a number.
     *
     * This is used by types like `ReplaySubject` or operators like `timestamp` to calculate
     * the amount of time passed between events.
     */
    now(): number;
  }
  
  /**
   * Extracts the type from an `ObservableInput<any>`. If you have
   * `O extends ObservableInput<any>` and you pass in `Observable<number>`, or
   * `Promise<number>`, etc, it will type as `number`.
   */
  export type ObservedValueOf<O> = O extends ObservableInput<infer T> ? T : never;
  
  /**
   * Extracts a union of element types from an `ObservableInput<any>[]`.
   * If you have `O extends ObservableInput<any>[]` and you pass in
   * `Observable<string>[]` or `Promise<string>[]` you would get
   * back a type of `string`.
   * If you pass in `[Observable<string>, Observable<number>]` you would
   * get back a type of `string | number`.
   */
  export type ObservedValueUnionFromArray<X> = X extends Array<ObservableInput<infer T>> ? T : never;
  
  /**
   * @deprecated Renamed to {@link ObservedValueUnionFromArray}. Will be removed in v8.
   */
  export type ObservedValuesFromArray<X> = ObservedValueUnionFromArray<X>;
  
  /**
   * Extracts a tuple of element types from an `ObservableInput<any>[]`.
   * If you have `O extends ObservableInput<any>[]` and you pass in
   * `[Observable<string>, Observable<number>]` you would get back a type
   * of `[string, number]`.
   */
  export type ObservedValueTupleFromArray<X> = { [K in keyof X]: ObservedValueOf<X[K]> };
  
  /**
   * Used to infer types from arguments to functions like {@link forkJoin}.
   * So that you can have `forkJoin([Observable<A>, PromiseLike<B>]): Observable<[A, B]>`
   * et al.
   */
  export type ObservableInputTuple<T> = {
    [K in keyof T]: ObservableInput<T[K]>;
  };
  
  /**
   * Constructs a new tuple with the specified type at the head.
   * If you declare `Cons<A, [B, C]>` you will get back `[A, B, C]`.
   */
  export type Cons<X, Y extends readonly any[]> = ((arg: X, ...rest: Y) => any) extends (...args: infer U) => any ? U : never;
  
  /**
   * Extracts the head of a tuple.
   * If you declare `Head<[A, B, C]>` you will get back `A`.
   */
  export type Head<X extends readonly any[]> = ((...args: X) => any) extends (arg: infer U, ...rest: any[]) => any ? U : never;
  
  /**
   * Extracts the tail of a tuple.
   * If you declare `Tail<[A, B, C]>` you will get back `[B, C]`.
   */
  export type Tail<X extends readonly any[]> = ((...args: X) => any) extends (arg: any, ...rest: infer U) => any ? U : never;
  
  /**
   * Extracts the generic value from an Array type.
   * If you have `T extends Array<any>`, and pass a `string[]` to it,
   * `ValueFromArray<T>` will return the actual type of `string`.
   */
  export type ValueFromArray<A extends readonly unknown[]> = A extends Array<infer T> ? T : never;
  
  /**
   * Gets the value type from an {@link ObservableNotification}, if possible.
   */
  export type ValueFromNotification<T> = T extends { kind: 'N' | 'E' | 'C' }
    ? T extends NextNotification<any>
      ? T extends { value: infer V }
        ? V
        : undefined
      : never
    : never;
  
  /**
   * A simple type to represent a gamut of "falsy" values... with a notable exception:
   * `NaN` is "falsy" however, it is not and cannot be typed via TypeScript. See
   * comments here: https://github.com/microsoft/TypeScript/issues/28682#issuecomment-707142417
   */
  export type Falsy = null | undefined | false | 0 | -0 | 0n | '';
  
  export type TruthyTypesOf<T> = T extends Falsy ? never : T;
  
  // We shouldn't rely on this type definition being available globally yet since it's
  // not necessarily available in every TS environment.
  interface ReadableStreamDefaultReaderLike<T> {
    // HACK: As of TS 4.2.2, The provided types for the iterator results of a `ReadableStreamDefaultReader`
    // are significantly different enough from `IteratorResult` as to cause compilation errors.
    // The type at the time is `ReadableStreamDefaultReadResult`.
    read(): PromiseLike<
      | {
          done: false;
          value: T;
        }
      | { done: true; value?: undefined }
    >;
    releaseLock(): void;
  }
  
  /**
   * The base signature RxJS will look for to identify and use
   * a [ReadableStream](https://streams.spec.whatwg.org/#rs-class)
   * as an {@link ObservableInput} source.
   */
  export interface ReadableStreamLike<T> {
    getReader(): ReadableStreamDefaultReaderLike<T>;
  }
  
  /**
   * An observable with a `connect` method that is used to create a subscription
   * to an underlying source, connecting it with all consumers via a multicast.
   */
  export interface Connectable<T> extends Observable<T> {
    /**
     * (Idempotent) Calling this method will connect the underlying source observable to all subscribed consumers
     * through an underlying {@link Subject}.
     * @returns A subscription, that when unsubscribed, will "disconnect" the source from the connector subject,
     * severing notifications to all consumers.
     */
    connect(): Subscription;
  }
  
/**
 * The {@link GlobalConfig} object for RxJS. It is used to configure things
 * like how to react on unhandled errors.
 */
export const config: GlobalConfig = {
    onUnhandledError: null,
    onStoppedNotification: null,
    Promise: undefined,
    useDeprecatedSynchronousErrorHandling: false,
    useDeprecatedNextContext: false,
  };
  
  /**
   * The global configuration object for RxJS, used to configure things
   * like how to react on unhandled errors. Accessible via {@link config}
   * object.
   */
  export interface GlobalConfig {
    /**
     * A registration point for unhandled errors from RxJS. These are errors that
     * cannot were not handled by consuming code in the usual subscription path. For
     * example, if you have this configured, and you subscribe to an observable without
     * providing an error handler, errors from that subscription will end up here. This
     * will _always_ be called asynchronously on another job in the runtime. This is because
     * we do not want errors thrown in this user-configured handler to interfere with the
     * behavior of the library.
     */
    onUnhandledError: ((err: any) => void) | null;
  
    /**
     * A registration point for notifications that cannot be sent to subscribers because they
     * have completed, errored or have been explicitly unsubscribed. By default, next, complete
     * and error notifications sent to stopped subscribers are noops. However, sometimes callers
     * might want a different behavior. For example, with sources that attempt to report errors
     * to stopped subscribers, a caller can configure RxJS to throw an unhandled error instead.
     * This will _always_ be called asynchronously on another job in the runtime. This is because
     * we do not want errors thrown in this user-configured handler to interfere with the
     * behavior of the library.
     */
    onStoppedNotification: ((notification: ObservableNotification<any>, subscriber: Subscriber<any>) => void) | null;
  
    /**
     * The promise constructor used by default for {@link Observable#toPromise toPromise} and {@link Observable#forEach forEach}
     * methods.
     *
     * @deprecated As of version 8, RxJS will no longer support this sort of injection of a
     * Promise constructor. If you need a Promise implementation other than native promises,
     * please polyfill/patch Promise as you see appropriate. Will be removed in v8.
     */
    Promise?: PromiseConstructorLike;
  
    /**
     * If true, turns on synchronous error rethrowing, which is a deprecated behavior
     * in v6 and higher. This behavior enables bad patterns like wrapping a subscribe
     * call in a try/catch block. It also enables producer interference, a nasty bug
     * where a multicast can be broken for all observers by a downstream consumer with
     * an unhandled error. DO NOT USE THIS FLAG UNLESS IT'S NEEDED TO BUY TIME
     * FOR MIGRATION REASONS.
     *
     * @deprecated As of version 8, RxJS will no longer support synchronous throwing
     * of unhandled errors. All errors will be thrown on a separate call stack to prevent bad
     * behaviors described above. Will be removed in v8.
     */
    useDeprecatedSynchronousErrorHandling: boolean;
  
    /**
     * If true, enables an as-of-yet undocumented feature from v5: The ability to access
     * `unsubscribe()` via `this` context in `next` functions created in observers passed
     * to `subscribe`.
     *
     * This is being removed because the performance was severely problematic, and it could also cause
     * issues when types other than POJOs are passed to subscribe as subscribers, as they will likely have
     * their `this` context overwritten.
     *
     * @deprecated As of version 8, RxJS will no longer support altering the
     * context of next functions provided as part of an observer to Subscribe. Instead,
     * you will have access to a subscription or a signal or token that will allow you to do things like
     * unsubscribe and test closed status. Will be removed in v8.
     */
    useDeprecatedNextContext: boolean;
  }
  
let context: { errorThrown: boolean; error: any } | null = null;

/**
 * Handles dealing with errors for super-gross mode. Creates a context, in which
 * any synchronously thrown errors will be passed to {@link captureError}. Which
 * will record the error such that it will be rethrown after the call back is complete.
 * TODO: Remove in v8
 * @param cb An immediately executed function.
 */
export function errorContext(cb: () => void) {
  if (config.useDeprecatedSynchronousErrorHandling) {
    const isRoot = !context;
    if (isRoot) {
      context = { errorThrown: false, error: null };
    }
    cb();
    if (isRoot) {
      const { errorThrown, error } = context!;
      context = null;
      if (errorThrown) {
        throw error;
      }
    }
  } else {
    // This is the general non-deprecated path for everyone that
    // isn't crazy enough to use super-gross mode (useDeprecatedSynchronousErrorHandling)
    cb();
  }
}

/**
 * Captures errors only in super-gross mode.
 * @param err the error to capture
 */
export function captureError(err: any) {
  if (config.useDeprecatedSynchronousErrorHandling && context) {
    context.errorThrown = true;
    context.error = err;
  }
}

/**
 * A Subject is a special type of Observable that allows values to be
 * multicasted to many Observers. Subjects are like EventEmitters.
 *
 * Every Subject is an Observable and an Observer. You can subscribe to a
 * Subject, and you can call next to feed values as well as error and complete.
 */
export class Subject<T> extends Observable<T> implements SubscriptionLike {
    closed = false;
  
    private currentObservers: Observer<T>[] | null = null;
  
    /** @deprecated Internal implementation detail, do not use directly. Will be made internal in v8. */
    observers: Observer<T>[] = [];
    /** @deprecated Internal implementation detail, do not use directly. Will be made internal in v8. */
    isStopped = false;
    /** @deprecated Internal implementation detail, do not use directly. Will be made internal in v8. */
    hasError = false;
    /** @deprecated Internal implementation detail, do not use directly. Will be made internal in v8. */
    thrownError: any = null;
  
    /**
     * Creates a "subject" by basically gluing an observer to an observable.
     *
     * @deprecated Recommended you do not use. Will be removed at some point in the future. Plans for replacement still under discussion.
     */
    static create: (...args: any[]) => any = <T>(destination: Observer<T>, source: Observable<T>): AnonymousSubject<T> => {
      return new AnonymousSubject<T>(destination, source);
    };
  
    constructor() {
      // NOTE: This must be here to obscure Observable's constructor.
      super();
    }
  
    /** @deprecated Internal implementation detail, do not use directly. Will be made internal in v8. */
    lift<R>(operator: Operator<T, R>): Observable<R> {
      const subject = new AnonymousSubject(this, this);
      subject.operator = operator as any;
      return subject as any;
    }
  
    /** @internal */
    protected _throwIfClosed() {
      if (this.closed) {
        throw new ObjectUnsubscribedError();
      }
    }
  
    next(value: T) {
      errorContext(() => {
        this._throwIfClosed();
        if (!this.isStopped) {
          if (!this.currentObservers) {
            this.currentObservers = Array.from(this.observers);
          }
          for (const observer of this.currentObservers) {
            observer.next(value);
          }
        }
      });
    }
  
    error(err: any) {
      errorContext(() => {
        this._throwIfClosed();
        if (!this.isStopped) {
          this.hasError = this.isStopped = true;
          this.thrownError = err;
          const { observers } = this;
          while (observers.length) {
            observers.shift()!.error(err);
          }
        }
      });
    }
  
    complete() {
      errorContext(() => {
        this._throwIfClosed();
        if (!this.isStopped) {
          this.isStopped = true;
          const { observers } = this;
          while (observers.length) {
            observers.shift()!.complete();
          }
        }
      });
    }
  
    unsubscribe() {
      this.isStopped = this.closed = true;
      this.observers = this.currentObservers = null!;
    }
  
    get observed() {
      return this.observers?.length > 0;
    }
  
    /** @internal */
    protected _trySubscribe(subscriber: Subscriber<T>): TeardownLogic {
      this._throwIfClosed();
      return super._trySubscribe(subscriber);
    }
  
    /** @internal */
    protected _subscribe(subscriber: Subscriber<T>): Subscription {
      this._throwIfClosed();
      this._checkFinalizedStatuses(subscriber);
      return this._innerSubscribe(subscriber);
    }
  
    /** @internal */
    protected _innerSubscribe(subscriber: Subscriber<any>) {
      const { hasError, isStopped, observers } = this;
      if (hasError || isStopped) {
        return EMPTY_SUBSCRIPTION;
      }
      this.currentObservers = null;
      observers.push(subscriber);
      return new Subscription(() => {
        this.currentObservers = null;
        arrRemove(observers, subscriber);
      });
    }
  
    /** @internal */
    protected _checkFinalizedStatuses(subscriber: Subscriber<any>) {
      const { hasError, thrownError, isStopped } = this;
      if (hasError) {
        subscriber.error(thrownError);
      } else if (isStopped) {
        subscriber.complete();
      }
    }
  
    /**
     * Creates a new Observable with this Subject as the source. You can do this
     * to create custom Observer-side logic of the Subject and conceal it from
     * code that uses the Observable.
     * @return Observable that this Subject casts to.
     */
    asObservable(): Observable<T> {
      const observable: any = new Observable<T>();
      observable.source = this;
      return observable;
    }
  }
  
  export class AnonymousSubject<T> extends Subject<T> {
    constructor(
      /** @deprecated Internal implementation detail, do not use directly. Will be made internal in v8. */
      public destination?: Observer<T>,
      source?: Observable<T>
    ) {
      super();
      this.source = source;
    }
  
    next(value: T) {
      this.destination?.next?.(value);
    }
  
    error(err: any) {
      this.destination?.error?.(err);
    }
  
    complete() {
      this.destination?.complete?.();
    }
  
    /** @internal */
    protected _subscribe(subscriber: Subscriber<T>): Subscription {
      return this.source?.subscribe(subscriber) ?? EMPTY_SUBSCRIPTION;
    }
  }
  
