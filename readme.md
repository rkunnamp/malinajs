
# Malina.js

<img align="right" width="200" height="200" src="https://github.com/malinajs/malinajs/raw/master/malinajs2.png" />

Malina.js builds your web-application to use it **without framework on frontend side**. Therefore your web-app becomes thinner and faster, and the application itself consists of **vanilla JavaScript**, look at [examples](https://malinajs.github.io/repl/). [TodoMVC example](https://malina-todomvc.surge.sh) **2.7kb** (gzipped) and [source code](https://github.com/malinajs/todomvc).

For documentation about Malinajs, please visit [our website](https://malinajs.github.io/docs/).  
Also, please join our community on [Discord](https://discord.gg/ScDhhNCk6N) or [Telegram](https://t.me/malinajs).

### tools

* [Syntax Highlighter for VS-Code](https://marketplace.visualstudio.com/items?itemName=AlexxNB.malina-js-highlight)
* **[Try Malina.js online (REPL)](https://malinajs.github.io/repl/)**

#### Articles

* [Comparision with Svelte.js](https://medium.com/@lega911/svelte-js-and-malina-js-b33c55253271)
* [Comparision with Vue 3](https://medium.com/@lega911/vue-3-vs-malina-js-abd97025ba81)
* [Passing CSS classes to child components](https://medium.com/@lega911/how-a-popular-feature-declined-by-svelte-went-live-in-malina-js-1a08fdb9dbc4)
* [Using fragments](https://medium.com/@lega911/how-fragments-can-help-in-your-web-development-5efc4d10f9da)

## The Gist

```html
<script>
  let name = 'world';
    
  function rename() {
    name = 'user';
  }
</script>

<h1>Hello {name.toUpperCase()}!</h1>
<button @click={rename}>Rename</button>
```

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>malina-app</title>
        <script defer src='app.js'></script>
        <script
  src="https://code.jquery.com/jquery-3.7.0.min.js"
  integrity="sha256-2Pmvv0kuTBOenSvLm6bvfBSSHrUJ+3A7x6P5Ebd07/g="
  crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.15.2/js/selectize.min.js" integrity="sha512-IOebNkvA/HZjMM7MxL0NYeLYEalloZ8ckak+NDtOViP7oiYzG5vn6WVXyrJDiJPhl4yRdmNAG49iuLmhkUdVsQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.13.6/underscore-min.js" integrity="sha512-2V49R8ndaagCOnwmj8QnbT1Gz/rie17UouD9Re5WxbzRVUGoftCu5IuqqtAM9+UC3fwfHCSJR1hkzNQh/2wdtg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.15.2/css/selectize.bootstrap5.min.css" integrity="sha512-Ars0BmSwpsUJnWMw+KoUKGKunT7+T8NGK0ORRKj+HT8naZzLSIQoOSIIM3oyaJljgLxFi0xImI5oZkAWEFARSA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/selectize.js/0.15.2/css/selectize.default.min.css" integrity="sha512-pTaEn+6gF1IeWv3W1+7X7eM60TFu/agjgoHmYhAfLEU8Phuf6JKiiE8YmsNC0aCgQv4192s4Vai8YZ6VNM6vyQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    </head>
    <body></body>
</html>

```

```js

import App from './App.xht';
import {mount} from 'malinajs';
mount(document.body, App);

```

## The core logic

Each component has a change detector attached.\
A change detector has an array of watchers , and a digest function.\
The watcher objects has\
  a)fn (a function that returns the value of the object that is being watched)\
  b)cb (a callback that is executed when the value of the object changes)\
  c)value (the last known values of the object that is being watched)\
  d)an optional comparator function that can be used for comparing two values and see if a change has happened\

The digest function takes each watcher object ,  runs the fn function to get the current value of the object that is being watched, and compares it with the value stored in the watcher. If the value has changed, watcher value is changed to the new value and callback is called with the new value as the param to the callback .

Taking up of each watcher, and checking for changes is done a loop, and the loop is run about 10 times (so as to take care of changes induced by callback runs) or until no changes is detected in the last loop.


---

Whenever javascript vraiables that holds a reference (as in the case of arrays or objects) are watched, the watcher value would be a deep clone of the variable (if not, change detection would fail. For eg if an array is watched, and if watcher value is a reference to the same array, any changes in the original array would be reflected in watcher value as well, and upon checking for changes, no change would be seen.)


---

All functions declared in the script tag gets added with a $$apply function automatically by the malinajs compiler.\
The $$apply function schedules the execution of digest function.\
(This can be avoided by adding the following flag)
```js
// !no-check 
```
In short, all functions check for changes to the observed objects.\
So adding  //!no-check  is necessary for side effect free functions to save some computation.


---

The compiled code of a component that displays an input box, and a div that displays the value of the input box works the following way

```js
let name = 'John';  // initial value

// Watch for changes to the 'name' variable
$watch(() => name, (newValue) => {
  // This function is the callback that gets called when 'name' changes.
  labelElement.textContent = newValue;  // Update the label with the new value.
});

// Bind the input event of the input box
inputElement.addEventListener('input', (event) => {
  name = event.target.value;  // Update the 'name' variable with the input's value.
  $apply();  // Trigger the change detection to check if 'name' has changed and update the label.
});

```

User types into inputElement.\
The input event listener updates the name variable.\
$apply() is called to trigger the change detection cycle.\
$digest runs, looping through the watchers.\
It detects that name has changed.\
The callback provided to $watch runs, updating the labelElement's text.\

---



"change detector" also holds the referance to parent and child change detectors.  So whenever 2 way bound varaiables are changed in child, child change detector can call parent change detector $$apply.


---

2 way binding of variables between a parent and child component is ensured by the way of creation of 2 watcher objects in the child.
One watcher object watches for the changes to the incoming props, and the other watches for changes to the exported props.\

In the malinajs code propFn is the name of the function that returns the incoming properties.\
current_componen.$push is the name of the function that sets the child variables using the incoming properties returned by propFn

current_component.$exportedProps is the name of the function that returns the exported properties.\
setter is the name of the function that sets the parent variables using the exported properties.

A propFn looks like
```js
() => {
          console.log("calling propFn to get params passed from parent")
          return({childArray: parentArray})
        },
```

A setter function looks like
``` js
($$_value) => {
          console.log("popogating the changes from child to parent")
          //if childArray  exists in $$_value assign it to parentArray else retain the original parentArray
          return ({childArray: parentArray = parentArray} = $$_value)
        }
```


prpFn and setter functions are passed as arguments from the parent component to child component at the time of setting up of child component (since they invlove either getting the values of parent variables or setting the values of parent variables).


---

Code explanation


makeComponent accepts an init function as argument\
it calls the init function\
init function returns an html element\
it assigns the html element to $component.dom\
and returns the $component object



init function sets up the change detector for the component\
it generates the html element corresponding to the template of the components\
it sets up event listeners\
it sets up child components\
and it finally returns the html element



For more details https://chat.openai.com/share/b4dad709-7431-47b9-a422-bea7e6b2d61b


## Quick Start

You can get started with a simple app by running the following in your terminal:
```
npm install
npm run build
npm run dev
# open http://localhost:7000/
```


Or via Docker: 
```
docker run --rm -it --user ${UID} -p 7000:7000 -v `pwd`:/app/src lega911/malina
# open http://localhost:7000/
```


Build compiler
```
npm install
npm run build
```

## License

[MIT](LICENSE)
