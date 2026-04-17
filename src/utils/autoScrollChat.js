const autoScrollChatObserver = function (
  scrollableEl = document.querySelector('.content-container'),
  chatContentEl = document.querySelector('.chat-content'),
) {
  console.log(scrollableEl);

  function scrollDownContent() {
    console.log('scroll');
    scrollableEl.scrollTop = scrollableEl.scrollHeight;
  }

  const observer = new ResizeObserver(scrollDownContent);
  observer.observe(chatContentEl);

  return observer;
};

export default autoScrollChatObserver;
