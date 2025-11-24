# AD - Expo React Native Style Guide

- [Project Level](#project-level)
- [Folder Structure](#folder-structure)
- [Components](#components)
- [Modern JavaScript](#modern-javascript)
- [ESLint and Prettier](#eslint-and-prettier)
  - [Editor Integration](#editor-integration)
- [Formatting](#formatting)
  - [Prettier](#prettier)
  - [Comments](#comments)
  - [Imports](#imports)
- [Naming](#naming)
  - [Classes, functions, and variables](#classes--functions--and-variables)
  - [Async functions](#async-functions)
  - [Private variables](#private-variables)
  - [Boolean names](#boolean-names)
- [Declarations](#declarations)
  - [let and const](#let-and-const)
- [Examples](#examples)
- [Babel](#babel)

This guide explains style guidelines for writing JavaScript for AD projects using Expo. It prioritizes readability for the team and also is meant to simplify small decisions when writing code. Most of this guide applies widely across the Expo repository but sometimes writing JavaScript differs between React, the web, and Node.

# Project Level

Keypoints

- Use TypeScript
- Avoid "magic" values (e.g. do not bury a value 42 in the code, especially not in multiple places, instead define it as a contant, possibly in a global/constants.ts file, and give it a meaningful name e.g. HHGTTG_DEEP_THOUGHTS_ANSWER_TO_THE_ULTIMATE_QUESTION_OF_LIFE_THE_UNIVERSE_AND_EVERYTHING)
- **ICON USAGE - CRITICAL**:
  - **NEVER** use string literals for icon names (e.g., "mail-check", "chevron-left")
  - **ALWAYS** use IconName enum from configuration (e.g., IconName.VerifyEmail)
  - If an icon doesn't exist in IconName enum, STOP and request it to be added
  - Do NOT proceed with string literals as a temporary solution
- **NO TODO COMMENTS - CRITICAL**:
  - **NEVER** leave TODO comments in code without explicit user permission
  - **NEVER** mark development as complete with outstanding TODOs
  - If functionality cannot be implemented, ask for permission before adding TODO
  - Provide clear justification why code cannot be implemented immediately
  - All functionality must be fully implemented or explicitly deferred with user approval
- Use Expo Router, with the main app entry point defined in package.json as: "main": "expo-router/entry"
- **NAVIGATION RULES - CRITICAL**:
  - **TOP NAVIGATION**: MUST use Expo Stack component exclusively - NO custom back buttons
  - **BOTTOM NAVIGATION**: MUST use Expo Tabs component exclusively - NO custom tab implementations
  - **IMPORTANT**: IGNORE top navigation bars shown in Figma designs - Stack handles this automatically
  - **NEVER** implement custom back buttons (TouchableOpacity with chevron icons, etc.)
  - Let Stack navigation handle all header bars, back buttons, and navigation gestures
  - Configure Stack.Screen options for titles, headerShown, etc. instead of custom implementations
- Where practical use Expo components
- Use expo-video DO NOT use expo-av
- **FIGMA DESIGN COMPLIANCE**: Figma design is the single source of truth for ALL visual implementations EXCEPT navigation bars - MUST use MCP tools before any visual implementation
- **MANDATORY FIGMA VERIFICATION**: All visual components MUST be verified against Figma using get_code, get_image, and get_variable_defs MCP tools

# Folder structure

Top level folders
/app for the source code for the screens
/assets for images, icons, videos, fonts etc.
/components for visual components
/contexts for application contexts
/global for global values such as constants, colors, and some high level style settings
/hooks for hooks
/lib for libraries to access 3rd parties, e.g. supabase
/types for TypeScript type definitions
/utils for developer utilities

# Components

The JSX/TSX in the screens should be made as simple as is practical using named components that are imported.

The project uses "Sh" as the prefix to all its visual components

E.g. a component "ShLogo" to display the application logo would have files in the components folder as follows:

/components/index.ts containing the line: export _ from "./ShLogo"
/components/ShLogo/index.ts containing the line: export _ from "./ShLogo"
/components/ShLogo/ShLogo.tsx the code for the components

and optionally:
/components/ShLogo/styles.ts non-trivial style settings local to ShLogo
/components/ShLogo/hooks.ts non-trivila code logic local to ShLogo
/components/ShLogo/ShLogo.test.tsx for ShLogo specific tests

The aim of this file arrangement is for clear separation of UI structure, styling, and code logic.

A similar approach may be taken with screens.

# Modern JavaScript

We generally use modern JavaScript on Expo, which means stable versions of the ES20xx specification with a few extensions, like JSX. We stay near the leading edge but away from the bleeding edge.

# ESLint and Prettier

ESLint reports errors and warnings for several style guidelines. Generally, the Expo ESLint configuration will report an error when it detects something that will prevent the code from working and a warning when it detects a style or formatting nit. The Expo configuration is written leniently and you should almost never have to use `/* eslint-disable */` comments. If you find yourself wanting to disable it, tell @ide so we can adjust the ESLint configuration to always be on.

ESLint also uses Prettier, a code formatter, to check code formatting and to reformat code automatically; with Expo’s configuration, running ESLint runs Prettier too.

ESLint has a `--fix` flag that tells it to fix errors and warnings when it can. Not all errors and warnings are automatically fixable but several are, including those reported by Prettier.

## Editor Integration

AD projects use **VS Code** as the editor

The editor should be configured to use ESLint, it will use Prettier as well, with this plugin:

- **VS Code:** https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint

# Formatting

## Prettier

We use Prettier with Expo-specific settings for most of our code formatting. These settings are in `.prettierrc` in the Expo repository. Most small decisions about how to format code disappear with Prettier so we think less about formatting when writing and reviewing code.

Sometimes Prettier makes code hard enough to read that we don’t want Prettier to format it. Add a `// prettier-ignore` comment above the expression whose formatting you want to preserve and let Prettier format the rest of the file.

```js
// prettier-ignore
let matrix = [
  -c,  1,  1,
    1, -c,  1,
    1,  1, -c,
];
```

If you would like Prettier to ignore the entire file rather than only a portion of it, add the file path to the `.prettierignore` file in the Expo repository.

Since Prettier formats entire files (except ignored lines), we need to keep our files “pretty” so that the next person who runs Prettier on a file reformats only the lines they’re changing in their commit. We’ll talk more about Prettier later in this document.

## Comments

Use `// line` comments in most places. Use `/** block */` comments above classes, methods, and other structures and use `/* inline block */` comments in the middle of lines:

```js
// CORRECT
/**
 * Gets the latest version of Android that's been released. This is a version
 * string like 7.1 instead of the code name Nougat.
 */
function getLatestAndroidVersion() {
  // Keep this logic in sync with Google's versioning scheme
  return maxBy(
    getAndroidVersions(/* includePrereleases */ false),
    linearizeSemver
  );
}
```

Remove commented-out code before pushing it to GitHub.

## Imports

(Note: we don’t programmatically sort nor check the order of imports since there currently isn’t a linter plugin for these choices. This section is meant to be read as light guidance and not for code reviewers to spend much attention on.)

Group and sort `import` statements and `require()` calls in this order:

1. `import` statements before `require()` calls
1. JavaScript hoists `import` statements; write the code to reflect that
1. Unassigned imports (`import 'side-effect'`) before assigned imports (`import React from 'react'`)
1. Unassigned imports almost always have side effects, which we usually want to apply earlier in the program’s lifetime.
1. External modules and Node.js built-in modules (`path`, `react`) before aliased internal modules (`www/module`) before relative modules (`../a/b`, `./c`)

```js
// CORRECT
import 'side-effect';

import invariant from 'invariant';
import Expo, { Audio } from 'expo';
import path from 'path';

import HomeScreen from '../screens/HomeScreen';
import Colors from '../style/Colors';
import calculateViewport from '../style/calculateViewport';
import LoginButton './LoginButton';

const assert = require('assert');
```

Within each group, sort the statements by the names of the imported modules, not their assigned variables. Use ASCII order: uppercase before lowercase before scoped modules.

```js
// CORRECT
import Z from 'Z';
import b from 'x';
import a from 'y';
import p from '@scope/package';
```

Write default imports before namespace imports before named imports:

```js
// CORRECT
import a, * as b, { c } from 'module';
```

## React and JSX

When writing React components, place your declarations and static methods near the top, followed by the constructor and lifecycle methods, followed by the render method and methods it calls, and other methods.

Use Prettier to format JSX.

```jsx
// CORRECT
type Props = {
  title: string,
  onPress?: event => void,
};

type State = {
  isPressed: boolean,
};

class Button extends React.Component {
  props: Props;
  state: State = {
    isPressed: true,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      ...this.state,
      bounce: new Animated.Value(1),
    };
  }

  componentWillUnmount() {
    if (this.state.animation) {
      this.state.animation.stop();
    }
  }

  render() {
    return (
      <Animated.View
        onPress={this._handlePress}
        style={{ transform: [{ scale: this.state.bounce }] }}>
        <Text>
          {this.props.title}
        </Text>
      </Animated.View>
    );
  }

  _handlePress = event => {
    this._bounce();
    if (this.props.onPress) {
      this.props.onPress(event);
    }
  };

  _bounce() {
    this.setState(state => {
      state.bounce.setValue(0);
      let animation = Animated.spring(state.bounce, { toValue: 1 });
      animation.start(({ finished }) => {
        if (finished) {
          this.setState(() => ({ animation: null }));
        }
      });
      return { animation };
    });
  }
}
```

# Naming

Prioritize the reader when naming things. Choosing a greppable name tends to have a lot of benefits since it’s easier to find how the thing with the name is used, easier to rename and refactor, and is less context-sensitive.

```js
class TestPipeline {
  // PREFERRED
  runTests() { ... }

  // DISFAVORED
  run() { ... }
}

// "runTests" is a lot easier to grep for than "run". It also plainly communicates
// more about what it does without being too wordy.
```

## Classes, functions, and variables

Use camel case for all names. Capitalize the names of classes and constructor functions. Start other names with lowercase.

```js
// CORRECT
class Aquarium {
  filterWater() {...}
}

function Fish() {...}
Object.assign(Fish.prototype, ...);

function populateAquarium(aquarium, school) {...}
```

```js
// INCORRECT
class house {
  CloseWindows() {...}
}

function EstimatePrice(house) {...}
```

## Async functions

Name async functions and other functions that return promises with “Async” at the end if they may complete asynchronously. This communicates that the function does work (often I/O) asynchronously and we need to await its result.

```js
// CORRECT
async function fetchAccountAsync(accountId: ID): Promise<Account> { ... }
```

It doesn’t matter how the function creates a promise for its asynchronous work. If the function isn’t defined with the `async` keyword but still looks like an async function from its call site, use the same naming convention.

```js
// CORRECT
function readSettingsFileAsync(): Promise<string> {
  return Promise((resolve, reject) => {
    fs.readFile('settings.txt', 'utf8', ...);
  });
}
```

However, if a function does synchronous work but still returns a promise, it might make sense to omit the “Async” suffix.

```jsx
// OK
function multiplexPromises(promises: Promise<*>[]): Promise<Array<* | Error>> {
  // Given an array of promises, returns a promise that resolves to an array of
  // promise results or errors. Semantically, this function doesn't do asynchronous
  // work itself and the reader sees it operates on promises that do the actual work.
}
```

## Private variables

Use an underscore to prefix instance variables that are intended to be private. This strikes a nice balance between communicating that the variable stores private data while keeping it accessible in a simple way for debugging, tests, and (sparingly) patches.

```js
// CORRECT
class Counter {
  _currentNumber = 0;
  getNextNumber() { ... }
}
```

If it helps, use this same convention on variables that are internal to a module to make it clearer to readers which variables are defined and used only within the current module.

```js
// CORRECT
export default function prettyPrintAll(values) {
  for (let value of values) {
    _prettyPrint(value);
  }
}

function _prettyPrint(value) { ... }
```

## Boolean names

If it helps, consider naming Boolean variables with “is” or a similar verb at the beginning. Sometimes the names of Boolean variables can ambiguously describe an object (or program state) or reference an object, and using verbs like “is”, “was”, and “did” help communicate the variable’s purpose.

```js
// AMBIGUOUS
console.log(history.deleted);

// CLEAR
console.log(history.isDeleted);
```

# Declarations

## `let` and `const`

Write `const` where possible and `let` when you need to reassign a variable. This is simple to explain to developers working on Expo and easy to enforce with a linter. We are optimizing for a holistic combination of code quality and the attention we spend writing and reviewing code.

When optimizing for code quality alone, it demonstrates clearer thinking to use `const` to communicate when a variable stores a constant, rather than when a variable just happens not to be reassigned at this point in the code's lifetime, and `let` otherwise.

However, when optimizing for writing and reviewing code, using `const` when possible is easy to enforce and auto-fix with a linter. This guidance is also very easy to explain to developers and streamlines code reviews since the author does not need to carefully choose between `let` and `const` depending on semantic correctness.

So, overall, we're trading an acceptable amount of code quality in exchange for reducing our attention cost by writing `const` by default and `let` when needed.

# Examples

```js
import Expo from 'expo';
import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import Log from '../log/Log';
import Colors from '../style/Colors';

export default class GreetingText extends React.PureComponent {
  static propTypes = {
    greeting: PropTypes.string.isRequired,
    ...Text.propTypes,
  };

  componentDidUpdate() {
    Log.info('The greeting was re-rendered');
  }

  render() {
    let { greeting, style, ...props } = this.props;
    return (
      <Text
        {...props}
        onPress={this._handlePress}
        style={[styles.greeting, style]}
      >
        {greeting}
      </Text>
    );
  }

  _handlePress = event => {
    alert('Congratulations!');
  };
}

const styles = StyleSheet.create({
  greeting: {
    color: Colors.energetic,
    fontSize: 30,
  },
});
```

# Babel

We use Babel to enable some of the newer JavaScript features that are sufficiently stable for us. This mostly includes transforms for features that are in a finalized version of the JavaScript standard.

We use `babel-eslint`, which allows ESLint to use the Babel parser. In practice, with newer syntax extensions, Babel produces AST nodes that ESLint can’t consume; stable linter compatibility is another feature we look for in Babel plugins.
