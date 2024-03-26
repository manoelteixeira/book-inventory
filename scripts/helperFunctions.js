function validateImageUrl(url) {
  const urlRegex = /^https?:\/\/.+\.(jpeg|jpg|webp|png)$/g;
  return urlRegex.test(url);
}

export default { validateImageUrl };
