const identity = x => x;
const getUndefined = () => {};
const getType = action => action.type;
const filter = () => true;

function createSentryMiddleware(sentry, options = {}) {
  const {
    breadcrumbDataFromAction = getUndefined,
    breadcrumbMessageFromAction = getType,
    actionTransformer = identity,
    stateTransformer = identity,
    breadcrumbCategory = "redux-action",
    filterBreadcrumbActions = filter,
    getUserContext,
    getTags,
  } = options;
  return store => {
    let lastAction;
    sentry.addGlobalEventProcessor(event => {
      const state = store.getState();
      const reduxExtra = {
        lastAction: actionTransformer(lastAction),
        state: stateTransformer(state),
      };
      event.extra = Object.assign(reduxExtra, event.extra || {});
      if (getUserContext) {
        event.user = getUserContext(state);
      }
      if (getTags) {
        event.tags = getTags(state);
      }
      return event;
    });
    return next => action => {
      if (filterBreadcrumbActions(action)) {
        sentry.addBreadcrumb({
          category: breadcrumbCategory,
          message: breadcrumbMessageFromAction(action),
          data: breadcrumbDataFromAction(action),
        });
      }
      lastAction = action;
      return next(action);
    };
  };
}

module.exports = createSentryMiddleware;
