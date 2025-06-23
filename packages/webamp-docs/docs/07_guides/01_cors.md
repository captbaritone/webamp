# Cross Original Resource Sharing (CORS)

One of the most common issues when using Webamp is related to Cross-Origin Resource Sharing (CORS).

:::tip
**TL;DR** Any skin or audio file you are tying to use with Webamp generally needs to be hosted on the same domain as the page that's rendering Webamp.
:::

CORS is a browser security feature which prevents code running on a website on one domain from reading content on other domains. For example, it prevents `webamp.org` from making a request to `your-bank.com/my-balance.html`, where you are already logged in, and reading your account balance.

Unfortunately this means that when Webamp is running on `site-a.com` and requests skins or audio file hosted on `site-b.com` Webamp cannot read the contents of those files unless `site-b.com` has explicitly opted into allowed it. Webamp needs to be able to read the contents of the skin files in order to render them, and it needs to be able to read the raw bytes of the audio files in order to render the visualizer and read ID3 tags.

This means, your skins and audio tracks must either be served from the same domain as your HTML file, or the server that's serving them must be configured to actively include permissive CORS HTTP headers.

You can learn more about CORS in the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

## Testing

If you want to test if the issue you are facing is being caused by CORS you can try swapping out your skin or audio file URL for one of the following in files which _are_ served with permissive CORs headers. If that fixes your issue, you are likely facing an issue caused by CORS:

- **Audio File**: `https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82cfe0e37286dbbe0666072dc3190a83bc/mp3/llama-2.91.mp3`
- **Skin File**: `https://archive.org/cors/winampskin_Zelda_Amp/Zelda-Amp.wsz`
