# Thoughts on Redux

## Actions describe a thing that happened

Actions with names like `"SET_USER_NAME"` are a smell. Instead, prefer names like `"USERNAME_INPUT_CHANGED"`. Your actions should be a log of _facts_ and should not have any opinions about how those facts are interperated.

## Actions and action creators are a global concern

Reduces should know about actions, but actions should not know about your reducers.

## Your state is a cache

In principle, your state could simply be an array of every action that has been dispatched, and you could derive the current value by running your reducer in your selector.

### What would this redux look like? How could you optimize it?

- Often you need to refer to some other portion of your state within your reducer. How would you do this?

##
