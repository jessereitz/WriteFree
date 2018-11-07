# WriteFree
_A clutter-free embeddable text editor._

WriteFree is a simple and clutter-free embeddable rich text editor. Drawing its design from [Medium's beautiful editor](https://medium.com), WriteFree allows you to offer users a beautiful and immersive writing experience in any environment or setting.

WriteFree is meant to provide a clutter-free, easier to use and understand alternative to traditional rich text editors.

## Use
*Head to the [WriteFree Docs](https://jessereitz.github.io/WriteFree) for complete documentation.*

### Quickstart

Grab WriteFree from the jsDelivr CDN:
```html
<script crossorigin src="https://cdn.jsdelivr.net/npm/writefree@1.2.12/build/js/writefree.min.js" type="text/javascript"></script>
```

Create a container for WriteFree:
```html
<div id="wfCtn"></div>
```

Initialize WriteFree, passing in the container:
```JavaScript
const wf = WriteFree(document.getElementById('wfCtn'));
```

That's it! Keep in mind that WriteFree will inherit all styles from your site. Be sure to style heading, link, paragraph, and div tags accordingly.
