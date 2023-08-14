
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



## Quick Start

You can get started with a simple app by running the following in your terminal:
```
npx create-malina myapp
cd myapp
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
