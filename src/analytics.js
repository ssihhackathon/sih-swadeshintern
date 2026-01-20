export const pageview = (url) => {
  if (window.gtag) {
    window.gtag('config', 'G-H17Z6W4ZLP', {
      page_path: url,
    });
  }
};